const { MongoClient, ObjectID } = require('mongodb');

// Connect to the location of the DB
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    // Return logging to console so other console.log after doesn't get printed too
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // db
  //   .collection('Todos')
  //   .find({ _id: new ObjectID('59d106248a892a0550b8d7ae') })
  //   .toArray()
  //   .then(
  //     docs => {
  //       console.log('Todos');
  //       console.log(JSON.stringify(docs, undefined, 2));
  //     },
  //     err => {
  //       console.log('Unable to fetch todos', err);
  //     }
  //   );

  // db
  //   .collection('Todos')
  //   .find({})
  //   .count()
  //   .then(
  //     count => {
  //       console.log(`Todos count: ${count}`);
  //     },
  //     err => {
  //       console.log('Unable to fetch todos', err);
  //     }
  //   );

  db
    .collection('Users')
    .find({ location: 'Enterprise' })
    .toArray()
    .then(
      docs => {
        console.log(JSON.stringify(docs, undefined, 2));
      },
      err => {
        console.log('Unable to fetch users', err);
      }
    );

  // db.close();
});
