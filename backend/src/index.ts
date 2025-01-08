import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/userRoutes";
import NFTrouter from "./routes/nftRoutes";
import verifyCert from "./routes/verifyCert";
import secrets from "./secrets";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);
app.use(cookieParser());

//req logger middleware
app.use((req, res, next) => {
  console.log("Request logged:", req.method, req.path);
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/user", router);
app.use("/api/nft", NFTrouter);
app.use("/api/emission", verifyCert);

app.listen(secrets.PORT, () => {
  console.log("🚀 Server is running on http://localhost:" + secrets.PORT);
});
