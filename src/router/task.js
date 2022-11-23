const express = require('express');
const auth = require('../middleware/auth')
const { ObjectId } = require('mongodb');
const Task = require('../models/task');

const router = new express.Router();

// fetch all tasks (pagination and filtering)
router.get('/tasks', auth, async ({ query: { completed, limit, skip, sortBy }, user } = {}, res) => {
    const match = {};
    const sort = {}
    if (completed) {
        match.completed = completed === 'true';
    }
    if (sortBy){
        const parts = sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    try {
        await user.populate({
            path: 'tasks',
            match, 
            options: {
                limit: parseInt(limit),
                skip: parseInt(skip),
                sort
            }
        });
        res.send(user.tasks);
    } catch (e) {
        res.status(500).send()
    }
 });
 
 // create as task
 router.post('/tasks', auth, async ({ body, user } = {}, res) => {
    const task = new Task({
        ...body,
        owner: user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
 });
 
 // fetch a task by id
 router.get('/tasks/:id', auth, async ({ params: { id:_id } = {}, user } = {}, res) => {
    if (!ObjectId.isValid(_id)) {
        return res.status(404).send();
    }
    try {
        const task = await Task.findOne({ _id, owner: user._id });
        if (!task){
            res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
 });
 
 // update a tasks
router.patch('/tasks/:id', auth, async ({ params: { id: _id }, body, user } = {}, res) => {
    if (!ObjectId.isValid(_id)) {
      return res.status(404).send();
    }
    const updates = Object.keys(body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const task = await Task.findOne({ _id, owner: user._id });
    
        if (!task) {
            return res.status(404).send();
        }
        updates.forEach(update => task[update] = body[update]);
        await task.save();

        res.send(task);
    } catch (e) {
      res.status(400).send(e);
    }
 });
 
 // delete a task
 router.delete('/tasks/:id', auth, async ({ params: { id: _id }, user } = {} , res) => {
    if (!ObjectId.isValid(_id)) {
        return res.status(404).send();  
    }
    try {
        const task = await Task.findOneAndDelete({ _id, owner: user._id });
        if(!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
 });

module.exports = router;