const express = require('express');
const app = express();
const authRout = require('./router/authRoutes');
const teamMRout = require('./router/teamMRouter');
const tasks = require('./router/taskRouter');
const userRouter = require('./router/userRouterInfo');
const notificationsRouter = require('./router/notificationsRouter');
require('dotenv').config();
const PORT = process.env.PORT || 3000;


const cors = require('cors');

app.use(cors({
  origin: [
    "https://gestor-task-bay.vercel.app",
    "http://localhost:5173"  // Aquí agregas otro origen (localhost)
  ],
  credentials: true,
}));


app.use(express.json());

app.use('/api/auth', authRout);
app.use('/api/team', teamMRout);
app.use('/api', tasks);
app.use('/api', notificationsRouter);
app.use('/api/user', userRouter);


app.listen(PORT, '0.0.0.0' ,()=> console.log("corriendo el el puerto", PORT));



// server.js



