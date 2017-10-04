// Set up the 2/3 different environments: development, and test--production is for Heroku
const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.PORT = 3000;
  // Use local TodoApp DB
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
  process.env.PORT = 3000;
  // Instead, use local test DB
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
