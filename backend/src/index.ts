import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './route/userRoutes';
import NFTrouter from './route/nftRoutes';

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
app.use('/api/nft', NFTrouter);

app.listen(3001, () => {
  console.log('Server is running on http://localhost:4000');
})