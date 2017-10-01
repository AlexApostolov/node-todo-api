const { MongoClient, ObjectID } = require('mongodb');

// Connect to the location of the DB
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    // Return logging to console so other console.log after doesn't get printed too
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // // deleteMany
  // db
  //   .collection('Todos')
  //   .deleteMany({ text: 'Eat lunch' })
  //   .then(result => {
  //     console.log(result);
  //   });
  // // deleteOne
  // db
  //   .collection('Todos')
  //   .deleteOne({ text: 'Eat lunch' })
  //   .then(result => {
  //     console.log(result);
  //   });
  // // findOneAndDelete--actually gets the document back
  // db
  //   .collection('Todos')
  //   .findOneAndDelete({ completed: false })
  //   .then(result => {
  //     console.log(result);
  //   });

  db
    .collection('Users')
    .findOneAndDelete({ _id: new ObjectID('59d10b056e5c5b25702baa12') })
    .then(result => {
      console.log(result);
    });
  db
    .collection('Users')
    .deleteMany({ name: 'Deanna Troi' })
    .then(result => {
      console.log(result);
    });
  // db.close();
});
