// Set up the 2/3 different environments: development, and test--production is for Heroku
const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  // When you require a JSON file it's automatically parsed into a JavaScript object
  const config = require('./config.json');
  // NOTE: Have to use bracket notation when accessing a property using a variable
  const envConfig = config[env];

  // Loop over the config env properties and set on process.env
  // Object.keys takes an object and return its keys as an array
  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}
