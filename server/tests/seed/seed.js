const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

// Instead of generating the user ID inside users._id, generate it outside so users.tokens.token has access
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
  {
    _id: userOneId,
    email: 'alex@example.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'yoyoma@cello.com',
    password: 'userTwoPass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userTwoId, access: 'auth' }, 'abc123').toString()
      }
    ]
  }
];

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    creator: userTwoId,
    completed: true,
    completedAt: 1507073237942
  }
];

const populateTodos = done => {
  // First remove all todos before running the unit test
  Todo.remove({})
    .then(() => {
      // Then seed todos from above, return it so it can be chained
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

const populateUsers = done => {
  User.remove({})
    .then(() => {
      // Pass seed data from above, and the value returned from "save" promise is collected in variable userOne
      const userOne = new User(users[0]).save();
      const userTwo = new User(users[1]).save();

      // Use promise utility method to wait for both seeded promises above to success: pass as an array
      return Promise.all([userOne, userTwo]); // instead of .then here, return it, and tack on .then to outer function
    })
    .then(() => done());
};

module.exports = { todos, users, populateTodos, populateUsers };
