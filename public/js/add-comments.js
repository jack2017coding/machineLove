$(document).ready(function() {
  // Getting jQuery references to the post body, title and form
  var bodyInput = $("#body");
  var titleInput = $("#title");
  var isPublicInput = $("#isPublic");
  var entryForm = $("#entry");
  // Adding an event listener for when the form is submitted
  $(entryForm).on("submit", handleFormSubmit);
  // Gets the part of the url that comes after the "?" (which we have if we're updating a post)
  var url = window.location.search;
  var commentsId;
  var userId;
  var userPortion;
  var commentsPortion


  // Sets a flag for whether or not we're updating a post to be false initially
  var updating = false;

  // If we have this section in our url, we pull out the post id from the url
  // If user and comments information were passed in
  if (url.indexOf("?comments _id=") !== -1) {
    if (url.indexOf("&user_id=") !== -1){
      comments Portion = url.split("&")[0];
      userPortion = url.split("&")[1];
      commentsId = commentsPortion.split("=")[1];
      userId = userPortion.split("=")[1];
    }
     // If only comments information was passed in
    else{
      commentsId = url.split("=")[1]; 
    }
    getCommentsData( commentsId, "comments");
  }
  // Otherwise if we have an user_id in our url, use this id to save to the database as the editor of comments
  else if (url.indexOf("?user_id=") !== -1) {
    userId = url.split("=")[1];
    getCommentsData(userId, "user");
  }

  //Redirect to log in if the user was not entered
  if (!userId){
    if (commentsId){
      $("#commentsSubmit")[0].disabled = true;
    }
    else{
      window.location.href = "/login";
      $("#commentsSubmit").disabled = false;
    }
  }



  // Getting the users, and their comments
  // getUsers();

  // A function for handling what happens when the form to create a new post is submitted
  function handleFormSubmit(event) {
    event.preventDefault();
    // Wont submit the post if we are missing a body and title
    if (!titleInput.val().trim() || !bodyInput.val().trim()) {
      return;
    }
    // Constructing a newPost object to hand to the database
    var newComments = {
      title: titleInput.val().trim(),
      body: bodyInput.val().trim(),
      isPublic: isPublicInput[0].checked,
      UserId: userId
    };

    console.log(newComments);

    // If we're updating a comments run updateComments to update a comments entry
    // Otherwise run submitComments to create a whole new Comments
    if (updating) {
      newComments.id = CommentsId;
      updateComments (newComments);
    }
    else {
      submitComments (newComments);
    }
  }

  // Submits a new post and brings user to blog page upon completion
  function submitComments(comments) {
    $.post("/api/comments", comments, function() {
      window.location.href = "/view-comments?user_id=" + userId;
    });
  }


  $(document).on("click", "button.logout", handleCommentsLogout);

  // Gets comments data for the current comments if we're editing, or if we're adding to an author's existing posts
  function getCommentsData(id, type) {
    var queryUrl;
    switch (type) {
      case "comments":
        queryUrl = "/api/comments/" + id;
        updating = true;
        break;
      case "user":
        queryUrl = "/api/users/" + id;
        break;
      default:
        return;
    }


    $.get(queryUrl, function(data) {
      if (data) {
        var userName;

        //Different Get queries are run depending on whether or not we are updating or adding a new record
        if (updating){
          userName = data.User.name;
          titleInput.val(data.title);
          bodyInput.val(data.body);
          isPublicInput[0].checked = data.isPublic;
          $("#commentsSubmit")[0].textContent = "Update";
        }
        else{
          userName = data.name;
        }

        //Update the login Message and logout button
        var logoutBtn = $("<button>");
        logoutBtn.text("Logout");
        logoutBtn.addClass("logout btn btn-info");

        // If we have a comments with this id, set a flag for us to know to update the post
        // when we hit submit
        if (userId){
          $("#userWelcome").html("Welcome <strong>" + userName + "</strong>").append(logoutBtn);
          $("#signin").hide();
        }
        
        //Display comments container for data entry
        $(".hidden").removeClass("hidden");

      }
    });
  }

   // This function figures out which comments we want to edit and takes it to the appropriate url
  function handleCommentsLogout() {
    window.location.href = "/";
  };

  // Update a given Comments, bring user to the blog page when done
  function updateComments(comments) {
    $.ajax({
      method: "PUT",
      url: "/api/comments",
      data: comments
    })
    .done(function() {
      window.location.href = "/view-comments?user_id=" + userId;
    });
  }
});
