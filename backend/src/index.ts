import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './route/userRoutes';

const app = express();

app.use(express.json());
app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }
))
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', router);