const mongoose = require('mongoose');

// Create a model for everything a todo needs to store
const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    // Mongoose already has createdAt built in
    type: Number,
    default: null
  }
});

module.exports = { Todo };
