const express = require('express');
const morgan = require('morgan');

// establish database connection
require('./db/mongoose');

// route handlers
const userRouter = require('./router/user');
const taskRouter = require('./router/task');

// configure application
const app = express();

app.use(morgan('dev'));
app.use(express.json());

// route handlers
app.use(userRouter);
app.use(taskRouter);

module.exports = app;