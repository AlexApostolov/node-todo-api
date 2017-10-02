const { ObjectID } = require('mongodb');
const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

let id = '59d29cddf064babc0acef1ba';
// let badId = '59d29cddf064babc0acef1ba11';
//
// if (!ObjectID.isValid(badId)) {
//   console.log('ID not valid');
// }

// // You do not need to pass in object ids manually with mongoose, since it can take the string and convert it
// Todo.find({
//   _id: id
// }).then(todos => {
//   console.log('Todos', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then(todo => {
//   console.log('Todo', todo);
// });

// // Instead of returning null for todo when user provides a wrong ID, return a message
// Todo.findById(badId)
//   .then(todo => {
//     if (!todo) {
//       return console.log('Id not found');
//     }
//     console.log('Todo By Id', todo);
//   })
//   .catch(e => console.log(e));

User.findById('59d23ebb82eed5bc200c89ec').then(
  user => {
    if (!user) {
      return console.log('User id not found');
    }
    console.log(JSON.stringify(user, undefined, 2));
  },
  e => console.log(e)
);
