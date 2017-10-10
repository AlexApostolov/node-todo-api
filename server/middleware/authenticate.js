const { User } = require('./../models/user');

const authenticate = (req, res, next) => {
  const token = req.header('x-auth');
  User.findByToken(token)
    .then(user => {
      if (!user) {
        // For some reason there's a valid token, but a user could not be found matching the parameters specified
        return Promise.reject();
        // Now it will run the catch sending back a status of 401
      }

      // Modify the request object for a route
      req.user = user;
      req.token = token;
      next();
    })
    .catch(e => {
      // Didn't authenticate correctly
      res.status(401).send();
    });
};
module.exports = { authenticate };
