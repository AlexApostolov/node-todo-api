const { ObjectID } = require('mongodb');
const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// // Remove everything by passing empty object--different from "find" which needs nothing passed to find all
// Todo.remove({}).then(result => {
//   console.log(result);
// });

// // Todo.findOneAndRemove // You remove the first match but also get the information back
// Todo.findOneAndRemove({_id: '59d3a1a1a589a0150ef0cd55'}).then(todo => {
//   console.log(todo);
// });

// // Todo.findByIdAndRemove // Also returns the doc
// Todo.findByIdAndRemove('59d3a1a1a589a0150ef0cd55').then(todo => {
//   console.log(todo);
// });
