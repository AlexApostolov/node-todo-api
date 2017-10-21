require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

// Call the body parser middleware function to return JSON data to Express
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    // req.user provided by "authenticate"
    _creator: req.user._id
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

app.get('/todos', authenticate, (req, res) => {
  // Get todos by a particular authenticated user
  Todo.find({
    _creator: req.user._id
  }).then(
    todos => {
      res.send({ todos });
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.get('/todos/:id', authenticate, (req, res) => {
  // Pull id dynamically off of url
  const id = req.params.id;
  // Validate id
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  // findOne instead of findById, since we don't want User B--logged in--accessing a User A's todo
  // by passing an ID
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  })
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo }); // By sending it back in an object, you're future proofing for additional properties
    })
    .catch(e => {
      res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  // validate the id -> not valid? return 404
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  // Remove by _creator instead of only by ID
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  })
    .then(todo => {
      // success: if no doc, send 404, if doc, send doc back with 200
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    // error: 400 with empty body
    .catch(e => {
      res.status(400).send();
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  // The request updates are going to be stored in the body, but the user could send any property to be updated
  // Lodash's pick method allows us to select which properties the user may update
  // .pick takes an object, and then an array of properties you want to pull off if they exist
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  // Check "completed" value and use it to set "completedAt"
  // If user is setting completed to true we want to set a time stamp, if false clear time stamp
  if (_.isBoolean(body.completed) && body.completed) {
    // Set time to number of ms since 1970
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    // Remove from DB
    body.completedAt = null;
  }

  // Query to update DB with ID and set the values using a MongoDB operator
  // with the object already generated with key/values as "body" above
  // and the 3rd arg lets you tweak the options of the function to return the new object--not old.
  Todo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send();
    });
});

app.post('/users', (req, res) => {
  // Users will not be able to manipulate tokens or anything else other than email & password
  const body = _.pick(req.body, ['email', 'password']);
  // Here body is already only email and password, no need for key/value pairs
  const user = new User(body);

  user
    .save()
    // Now that user is saved, save a token to the user
    .then(() => {
      // Instead of responding with "res.send(user);" call with a chaining promise
      return user.generateAuthToken();
    })
    // Use returned generated token and send custom header, i.e. key of "x-auth" and value of "token"
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get('/users/me', authenticate, (req, res) => {
  // req.user has been modified by the "authenticate" middleware
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  // If successful, should get user back
  User.findByCredentials(body.email, body.password)
    .then(user => {
      // If no user, findByCredentials will trigger the catch case below
      // Use the reusable method generateAuthToken to create a new token--return it to keep the chain alive
      return user.generateAuthToken().then(token => {
        res.header('x-auth', token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send();
    });
});

// Private route--logged in--to delete user token for endpoint device
app.delete('/users/me/token', authenticate, (req, res) => {
  // Call instance method
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

app.delete('/users/me/account', authenticate, (req, res) => {
  // req.user & req.token provided by "authenticate"
  const user = req.user;
  const token = req.token;

  User.findOneAndRemove({ _id: user._id }).then(() => {
    res.status(200).send(`User account ${user._id} deleted.`);
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
