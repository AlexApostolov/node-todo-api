const mongoose = require('mongoose');

// Use built in JS Promises
mongoose.Promise = global.Promise;
// Mongoose won't continue on behind the scenes until after it has finished connecting to the DB
mongoose.connect(process.env.MONGODB_URI);

module.exports = { mongoose };
