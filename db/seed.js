module.exports = function(db) {

  db.User.create({
    name: 'Jack Bashirian',
    email: 'jack@gmail.com',
    password_hash: 'test'
  });

  db.User.create({
    name: 'Joe',
    email: 'jack@gmail.com',
    password_hash: 'test1'
  });

  db.Comments.create({
    title: 'Love Machine Love',
    body: 'Best true love ever...',
    isPublic: true,
    UserId: 1
  });

  db.Comments.create({
    title: 'Changing the Future',
    body: 'Machine Love is a Game Changer',
    isPublic: true,
    UserId: 1
  });

  db.Comments.create({
    title: 'Finally',
    body: 'There is something about the Machine Love....',
    isPublic: true,
    UserId: 2
  });
};