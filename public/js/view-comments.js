
$(document).ready(function() {
  /* global moment */
// Getting references to the email and password
  var emailInput = $("#email");
  var pwdInput = $("#password");

  // commentsContainer holds all of our diaries
  var commentsContainer = $(".comments-container");



  // Click events for the edit and delete buttons
  $(document).on("click", "button.delete", handleCommentsDelete);
  $(document).on("click", "button.edit", handleCommentsEdit);
  $(document).on("click", "button.public", handleCommentsPublic);
  $(document).on("click", "button.login", handleCommentsLogin);
  $(document).on("click", "button.logout", handleCommentsLogout);
  $(document).on("click", "#addComments", handleCommentsAddComments);

  // Variable to hold our comments
  var comments;

  // The code below handles the case where we want to get comments for a specific author
  // Looks for a query param in the url for author_id
  var url = window.location.search;
  var userId;
  if (url.indexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
    getcomments(userId);
  }
  // If there's no userId we just get all comments as usual
  else {
    getcomments();
  }

  

  // This function grabs comments from the database and updates the view
  function getcomments(user) {
    userId = user || "";
    // if (userId) {
    //   userId = "/?user_id=" + userId;
    // }
    $.get("/api/diaries/" + userId, function(data) {
      console.log("diaries", data);
      diaries = data;
      
      //Only execute the 2nd condition statement if a userId was entered
      if (comments.length === 0 || (userId && comments[0].Comments.length === 0)){
        //If no user id, data is retrieved directly from the Comments table
        if (userId){
          //Update the login Message and logout button
          var logoutBtn = $("<button>");
          logoutBtn.text("Logout");
          logoutBtn.addClass("logout btn btn-info");

          $("#userWelcome").html("Welcome <strong>" + comments[0].name + "</strong>  ").append(logoutBtn);
          $("#signin").hide();

          //Display that no comments for specific user
          user = comments[0].name;
          displayEmpty(user, true);
        }else{
          //Display that no comments have been entered
          displayEmpty(user, false);
        }
      }
      else{
        initializeRows();
      }    
    });
  }

  // This function does an API call to delete comments
  function deleteComments(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/comments/" + id
    })
    .done(function() {
      getcomments(userId);
    });
  }

// This function does an API call to delete comments
  function changeCommentsVisbility(comments) {
    $.ajax({
      method: "PUT",
      url: "/api/comments",
      data: comments,
      url: "/api/comments/" + comments.id
    })
    .done(function() {
      getcomments(userId);
    });
  }

  // InitializeRows handles appending all of our constructed comments HTML inside commentsContainer
  function initializeRows() {
    commentsContainer.empty();
    var commentsToAdd = [];
    var commentsToDisplay = [];

    //If a user is being passed in, display only the comments entry for that user,
    if (userId){
      commentsToDisplay = comments[0].Comments.filter(function (el) {return (el.UserId === parseInt(userId))});

      //Update the login Message and logout button
      var logoutBtn = $("<button>");
      logoutBtn.text("Logout");
      logoutBtn.addClass("logout btn btn-info");

      $("#userWelcome").html("Welcome <strong>" + comments[0].name + "</strong>  ").append(logoutBtn);;
      $("#signin").hide();
    }
    //Otherwise display all the entries that have been set public   
    else{
      commentsToDisplay = comments.filter(function (el) {return (el.isPublic === true)});;
    } 

    for (var i = 0; i < commentsToDisplay.length; i++) {
        commentsToAdd.push(createNewRow(commentsToDisplay[i]));
    }
    commentsContainer.append(commentsToAdd);
  }

  // This function constructs a comments HTML
  function createNewRow(comments) {
    var formattedDate = new Date(comments.createdAt);
    formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
    var newCommentsPanel = $("<div>");
    newCommentsPanel.addClass("panel col-md- panel-default");
    var newCommentsPanelHeading = $("<div>");
    newCommentsPanelHeading.addClass("panel-heading");
    var deleteBtn = $("<button>");
    deleteBtn.addClass("delete btn btn-danger glyphicon glyphicon-remove");
    var editBtn = $("<button>");
    editBtn.addClass("edit btn btn-info glyphicon glyphicon-pencil");
    var publicBtn = $("<button>");

    //If Comments is public, change the the display appropriately
    if (comments.isPublic){
      // publicBtn.text("Make Private");
      publicBtn.addClass("public btn btn-info glyphicon glyphicon-eye-open");
    }
    else{
      publicBtn.addClass("public btn btn-info glyphicon glyphicon-eye-close");
    }
    
    var newCommentsTitle = $("<br><h3>");
    var newCommentsLink = $("<a>");
    var newCommentsDate = $("<br><small>");
    newCommentsDate.text(formattedDate);
    var newCommentsUser = $("<br><h5>");
    if (userId){
      newCommentsUser.text(comments[0].name + " - " + formattedDate);
    }
    else{
      newCommentsUser.text(comments.User.name + " - " + formattedDate); 
    }
    var newCommentsPanelBody = $("<div>");
    newCommentsPanelBody.addClass("panel-body fixed-panel");
    var newCommentsBody = $("<p>");
    newCommentsLink.text(comments.title);
    newCommentsLink.attr("href","/add- comments? comments _id=" + comments.id + "&user_id=" + userId);
    newCommentsTitle.append(newCommentsLink);
    newCommentsBody.text(comments.body);
    // newCommentsTitle.append(newCommentsDate);
    //Only Display edit buttons if the user is logged on
    if (userId){
      newCommentsPanelHeading.append(deleteBtn);
      newCommentsPanelHeading.append(editBtn);
      newCommentsPanelHeading.append(publicBtn);
    }
    newCommentsPanelHeading.append(newCommentsTitle);
    newCommentsPanelHeading.append(newCommentsUser);
    newCommentsPanelBody.append(newCommentsBody);
    newCommentsPanel.append(newCommentsPanelHeading);
    newCommentsPanel.append(newCommentsPanelBody);
    newCommentsPanel.data("Comments", comments);
    return newCommentsPanel;
  }

  // This function figures out which Comments we want to delete and then calls deleteComments
  function handleCommentsDelete() {
    var currentComments = $(this)
      .parent()
      .parent()
      .data("Comments");
    deleteComments (currentComments.id);
  }

  // This function figures out which Comments we want to edit and takes it to the appropriate url
  function handleCommentsEdit() {
    var currentComments = $(this)
      .parent()
      .parent()
      .data("Comments");
    window.location.href = "/add-comments?comments_id=" + currentComments.id + "&user_id=" + userId;
  }

  // This function figures out which Comments we want to make public and runs the updation
  function handleCommentsPublic() {
    var currentComments = $(this)
      .parent()
      .parent()
      .data("Comments");
    currentComments.isPublic = !currentComments.isPublic
    changeCommentsVisbility(currentComments);
  }

// This function allows the user to log on and review his own postings
  function handleCommentsLogin() {
    event.preventDefault();
    // Don't do anything if the name fields hasn't been filled out
    if (!emailInput.val().trim() || !pwdInput.val().trim()) {
      return;
    }
    else{
      user = "/" + emailInput.val().trim() + "/" + pwdInput.val().trim();
      $.get("/users" + user, function(data) {
        console.log(data);
        if (!data) {
          //If no user, redirect user towards the login page
          window.location.href = "/login";
        }
        else {
          window.location.href = "/view-comments/?user_id=" + data.id;
        }
      });
    }
  }

  // This function figures out which Comments we want to edit and takes it to the appropriate url
  function handleCommentsLogout() {
    window.location.href = "/";
  }

  // This function updates the add comments link if the user Id is available
  function handleCommentsAddComments () {
    if (userId){
      $(this).attr("href","/add-comments?user_id=" + userId);
    }
    else{
       $(this).attr("href","/add-comments");
    }
  }

  // This function displays a messgae when there are no comments
  function displayEmpty(id, isUserFound) {
    var query = window.location.search;
    var partial = "";
    if (id && isUserFound) {
      partial = " for you, " + id;
    }
    else if (id && !isUserFound) {
      partial = " for User #" + id;
      $("#signin").show();
    }
    commentsContainer.empty();
    var messageh2 = $("<h2>");
    messageh2.css({ "text-align": "center", "margin-top": "50px" });
    messageh2.html("No <u>public</u> comments yet" + partial + ", navigate <a href='/add-comments" + query +
    "'>here</a> in order to get started.");
    commentsContainer.append(messageh2);
  }
});
