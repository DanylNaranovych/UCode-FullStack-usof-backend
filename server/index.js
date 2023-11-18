import sessions from 'express-session';
// import { User, Post, Category, Comment, Like } from './model.js';
import sequelize from "./db.js";
import express, { json, urlencoded } from 'express';
const app = express();
import fileUpload from 'express-fileupload';



try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.');
    await sequelize.sync(/*{alter: true}*/);
} catch (error) {
    console.log(error);
    console.log(`Error. Can't connect to the database`);
    process.exit(1);
}

const PORT = 8000;

import authRouter from './controllers/auth/router.js';
import userRouter from './controllers/users/router.js';
import categoryRouter from './controllers/categories/router.js';
import commentRouter from './controllers/comments/router.js';
import postRouter from './controllers/posts/router.js';


app.use(fileUpload());

app.use(sessions({
    secret: 'securepass',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(json());
app.use(urlencoded({extended: true}));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
})

