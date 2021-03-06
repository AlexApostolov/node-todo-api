const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, users, populateTodos, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text }) // NOTE: supertest converts object to JSON automatically
      .expect(200) // NOTE: .expect method from supertest not expect library
      .expect(res => {
        // custom expect assertions do get passed the response
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // Fetch todo equal to the text above to assert that the todo created exists
        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`) // This id is an object that needs to be converted to a string
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text); // "todo" sent from server.js
      })
      .end(done);
  });
  it('should not return todo doc created by other user', done => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`) // This id is an object that needs to be converted to a string
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 if todo not found', done => {
    let hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    // /todos/123
    request(app)
      .get('/todos/123')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId)
          .then(todo => {
            expect(todo).toBeFalsy();
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not remove a todo by another user', done => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      // Delete a todo as a different user
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId)
          .then(todo => {
            // The deletion should never have happened
            expect(todo).toBeTruthy();
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should return 404 if todo not found', done => {
    let hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', done => {
    request(app)
      .delete('/todos/123abc')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    // Grab id of first item
    let hexId = todos[0]._id.toHexString();
    // Update the text as authenticated first user, set completed to true
    let text = 'This text has been updated!';
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text,
        completed: true
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should not update the todo created by other user', done => {
    // Grab id of first item
    let hexId = todos[0]._id.toHexString();
    // Update the text authenticated as second user, set completed to true
    let text = 'This text has been updated!';
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        text,
        completed: true
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', done => {
    // Grab id of second todo item
    let hexId = todos[1]._id.toHexString();
    // Update the text, set completed to false
    let text = 'This text has been updated a 2nd time!';
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        text,
        completed: false
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return a 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', done => {
    const email = 'exampleFun@example.com';
    const password = '123mnb!';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        // Use bracket notation because of the hyphen in x-auth
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      }) // Query the DB too, instead of just passing in "done"
      .end(err => {
        if (err) {
          return done(err);
        }
        // Find a user where the email equals the email above
        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            // Expect that the password does NOT match since it has NOT been hashed
            expect(user.password).not.toBe(password);
            done();
          }) // Get a useful error message for which assertion failed & why, instead of just timing out
          .catch(e => done(e));
      });
  });
  it('should return validation errors if request invalid', done => {
    // Invalid email & password
    request(app)
      .post('/users')
      .send({ email: 'yucky', password: '123' })
      .expect(400)
      .end(done);
  });
  it('should not create user if email in use', done => {
    // Use an email already taken --> in seed data
    request(app)
      .post('/users')
      .send({ email: users[0].email, password: 'Password123!' })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    request(app)
      .post('/users/login')
      .send({ email: users[1].email, password: users[1].password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            // v1 expect library was able to parse out mongoose stuff on "user", unlike modern version
            // So use toObject mongoose method, returns raw user data without internal mongoose methods present,
            // then toMatchObject compares properties of both objects
            expect(user.toObject().tokens[1]).toMatchObject({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
            // Like other async tests, we want to catch the error if the tokens are not equal
          })
          .catch(e => done(e));
      });
  });
  it('should reject invalid login', done => {
    request(app)
      .post('/users/login')
      .send({ email: users[1].email, password: 'smellOfFailure' })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(1);
            done();
            // Like other async tests, we want to catch the error if the tokens are not equal
          })
          .catch(e => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    request(app)
      .delete('/users/me/token')
      .set({ 'x-auth': users[0].tokens[0].token })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        /* NOTE: assuming test is for one device with only an auth token, additional tokens would break test,
        in which case findByToken would be a better approach */
        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('DELETE /users/me/account', () => {
  it('should remove signed in user from database', done => {
    request(app)
      .delete('/users/me/account')
      // Sign in as second user in DB to delete second user account
      .set({ 'x-auth': users[1].tokens[0].token })
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find()
          .then(users => {
            console.log(users);
            expect(users.length).toBe(1);
            done();
          })
          .catch(e => done(e));
      });
  });
});
