import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/userRoutes";
import NFTrouter from "./routes/nftRoutes";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/user", router);
app.use("/api/nft", NFTrouter);

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
