const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

const User = mongoose.model('User', UserSchema);

module.exports = { User };
