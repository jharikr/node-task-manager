const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, badUser, setUpDatabase } = require('./fixtures/db')

// more tests at links.mead.io/extratests

beforeEach(setUpDatabase);

test('Should signup a new user', async () => {
   const response = await request(app).post('/users').send({
        name: 'Jharik',
        email: 'jharik@example.com',
        password: 'lovejharik'
    }).expect(201);

    const { body: { user: dbUser } } = response
    
    // Assert that the database was changed correctly
    const user = await User.findById(dbUser._id);
    expect(user).not.toBeNull()

    // Assertions about the response 
    expect(response.body).toMatchObject({ 
        user: {
            name: 'Jharik',
            email: 'jharik@example.com',
        },
        token: user.tokens[0].token
    });
});

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({ ...userOne })
        .expect(200);
        
    const { body: { user: dbUser } } = response
    
    // Assert that the database was changed correctly
    const user = await User.findById(dbUser._id);
    expect(response.body.token).toBe(user.tokens[1].token)
});

test('Should not login non-existing user', async () => {
    await request(app)
        .post('/users/login')
        .send({ ...badUser })
        .expect(400); 
});

test('Should get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200); 
})

test('Should not get user profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401); 
})

test('Should delete account for', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200); 

    const user = await User.findById(userOneId);
    expect(user).toBeNull()
})

test('Should delete account for', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401); 
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);
    
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    const name = 'Kae';
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ name })
        .expect(200);
    
    const { body } = response;

    const user = await User.findById(body._id);
    expect(user).not.toBeNull();
    expect(user.name).toBe(name);
})

test('Should not update invalid user fields', async () => {
    const location = 'Kae';
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ location })
        .expect(400);
})

// more tests at links.mead.io/extratests
