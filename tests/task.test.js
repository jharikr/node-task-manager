const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { findById } = require('../src/models/user');
const { 
    userOne, 
    userTwo, 
    taskOne, 
    setUpDatabase 
} = require('./fixtures/db');


beforeEach(setUpDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ description: 'From test'})
        .expect(201)

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
})

test('Should get all task for user one', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    
    expect(response.body.length).toEqual(2);
})

test('Should not allow user two to delete user one task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
})

// more tests at links.mead.io/extratests