const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();

// Call the body parser middleware function to return JSON data to Express
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });
  todo.save().then(
    doc => {
      res.send(doc);
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});
// Run Todo model as a constructor function to create a todo instance.
// Mongoose will automatically lowercase & pluralize Todo => todos as a collection name
// var newTodo = new Todo({
//   text: 'Cook dinner'
// });

// The new todo isn't added until it's saved. Saving returns a promise.
// newTodo.save().then(
//   doc => {
//     // Get todo
//     console.log('Saved todo', doc);
//   },
//   e => {
//     console.log('Unable to save todo');
//   }
// );
