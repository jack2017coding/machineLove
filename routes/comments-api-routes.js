// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

  // GET route for getting all of the Comments
  app.get("/api/diaries", function(req, res) {
    var query = {};
    if (req.query.user_id) {
      query.userId = req.query.user_id;
    }
    
    //Filter to get only public diaries
    query.isPublic = true;

    // Here we add an "include" property to our options in our findAll query
    // We set the value to an array of the models we want to include in a left outer join
    // In this case, just db.user
    db. Comments.findAll({
      where: query,
      order: [['updatedAt', 'DESC']],
      include: [db.User]
    }).then(function(dbComments) {
      res.json(dbComments);
    });
  });

  // Get for retrieving multiple diaries from a single user
  app.get("/api/diaries/:id", function(req, res) {
    db.User.findAll({
      where: {
        id: req.params.id
      },
      include: [db.Comments],
      order: [[db.Comments, 'updatedAt', 'DESC']],
    }).then(function(dbComments) {
      res.json(dbComments);
    });
  });

  // Get for retrieving single comments from a single user
  app.get("/api/comments/:id", function(req, res) {
    db.Comments.findOne({
      where: {
        id: req.params.id
      },
      include: [db.User]
    }).then(function(dbComments) {
      res.json(dbComments);
    });
  });

  // Comments route for saving a new Comments
  app.post("/api/comments", function(req, res) {
    console.log(req.body);
    db.Comments.create(req.body).then(function(dbComments) {
      res.json(dbComments);
    });
  });

  // DELETE route for deleting Comments
  app.delete("/api/comments/:id", function(req, res) {
    db.Comments.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(dbComments) {
      res.json(dbComments);
    });
  });

  // PUT route for updating Comments
  app.put("/api/comments", function(req, res) {
    db.Comments.update(
      req.body,
      {
        where: {
          id: req.body.id
        }
      }).then(function(dbComments) {
        res.json(dbComments);
      });
  });

  //PUT to update a single comments
  app.put("/api/comments/:id", function(req, res) {
    console.log(req.body);
    db.Comments.update(
      req.body,
      {
        where: {
          id: req.params.id
        }
      }).then(function(dbComments) {
        res.json(dbComments);
      });
  });
};
