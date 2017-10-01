const { MongoClient, ObjectID } = require('mongodb');

// Connect to the location of the DB
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    // Return logging to console so other console.log after doesn't get printed too
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  db.close();
});
