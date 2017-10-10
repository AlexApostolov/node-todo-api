const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
// bcrypt is a one-way hashing algorithm (can't get original value back) that salts automatically
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    // Verify the email property doesn't have the same value as any of the documents in the same collection
    unique: true,
    // Instead of a custom validator function for email, use the "validator" library
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  // Use MongoDB tokens array feature to access tokens for an individual user
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

// Override the toJSON method to limit the data that comes back to the user
// when a mongoose model is converted into a JSON value
UserSchema.methods.toJSON = function() {
  const user = this;
  // toObject is a method responsible for taking your mongoose variable--i.e. user--& converting it
  // into a regular object where only the properties available on the document exist
  const userObject = user.toObject();

  // Leave off things like the password and tokens array
  return _.pick(userObject, ['_id', 'email']);
};

// UserSchema.methods is an object where you can add any instance methods you like. We'll create generateAuthToken.
// We need "this" to be bound so we cannot use an arrow function here, because "this" stores the individual document
UserSchema.methods.generateAuthToken = function() {
  // Current user object explicitly bound
  const user = this;
  // Know the purpose of the token when received--other tokens could be used for password reset etc.
  const access = 'auth';
  // Create a hash and pass a data object to be signed, and a secret to salt the hash
  const token = jwt
    // The data ObjectID is passed as a string value using toHexString MongoDB method, & 'auth' property value
    .sign({ _id: user._id.toHexString(), access }, 'abc123');
  // Get back string token with .toString(); chained on isn't necessary here because jwt.sign does that for us

  // tokens is an empty array by default, so update the local user model
  user.tokens.push({ access, token });

  // Then save the update--return it so server.js can chain on the promise.
  // A success callback function is passed returning the variable defined above
  // so later on the token can be grabbed in server.js by tacking on another .then callback
  return user.save().then(() => {
    return token;
  });
};

// .statics is an object like .methods, but everything you add to it turns into a model method
// instead of an instance method. We'll need "this" bound, so a regular function.
UserSchema.statics.findByToken = function(token) {
  // Reference to specific model: User
  const User = this;
  // If anything goes wrong, e.g. secret doesn't match, jwt.verify() will throw an error
  let decoded;
  try {
    // Has the JWT token been tampered with?
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    // Don't continue, reject since verification failed
    // return new Promise((resolve, reject) => reject()); OR SIMPLER BELOW
    return Promise.reject();
  }
  // Success case for decoding what's in the header, query the associated user if any
  return User.findOne({
    _id: decoded._id,
    // NOTE: quotes are required when you have a dot
    // Check that the user is still active and not logged out
    'tokens.token': token,
    // tokens.access is reusable, with other access values like sharable urls or email reset tokens
    'tokens.access': 'auth'
  });
};

// Mongoose document middleware (also called pre and post hooks) are functions which are passed control
// during execution of asynchronous functions. Middleware is specified on the schema level.
// Pre hook before the save event needs "this" bound and "next" provided
UserSchema.pre('save', function(next) {
  // Reference to specific user
  const user = this;

  // Check if user changed password when updating document or kept the old one
  if (user.isModified('password')) {
    // Salt the password with genSalt and 1st pass it the number of rounds to use, the higher the slower, e.g. 120
    // Slower is good, because it reduces hackers ability of brute forcing these calls
    // 2nd arg is a callback
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        // Update user document by overriding the plain text password with the hash
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
