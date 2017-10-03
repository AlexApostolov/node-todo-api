const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo'
  }
];

beforeEach(done => {
  // First remove all todos before running the unit test
  Todo.remove({})
    .then(() => {
      // Then seed todos from above, return it so it can be chained
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Test todo text';

    request(app)
      .post('/todos')
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
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`) // This id is an object that needs to be converted to a string
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text); // "todo" sent from server.js
      })
      .end(done);
  });
  it('should return 404 if todo not found', done => {
    let hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    // /todos/123
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});
