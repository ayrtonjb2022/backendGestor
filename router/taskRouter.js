const {getTaskC,postTaskC,getTaskByIdC,updateStatusTasks,deleteTaskC} = require('../controller/tasksController');
const {authenticate} = require('../middleware/authMiddleware');

const express = require('express');
const Router = express();


Router.get('/tasks/', authenticate,getTaskC);
Router.post('/tasks', authenticate,postTaskC);
Router.put('/task/updata', authenticate,updateStatusTasks);
Router.delete('/task/delete/:id_tasks', authenticate,deleteTaskC);

module.exports = Router;