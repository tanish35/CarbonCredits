import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/user.routes";
import NFTrouter from "./routes/nft.routes";
import verifyCert from "./routes/verifyCert.routes";
import resellRouter from "./routes/resell.routes";
// import { syncNFTHoldersHandler } from "./controllers/syncNFT";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://ecox.somnathcodes.site",
      "https://ecox.wedevelopers.online",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

//req logger middleware
app.use((req, res, next) => {
  // console.log("Request logged:", req.method, req.path);
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/user", router);
app.use("/api/nft", NFTrouter);
app.use("/api/emission", verifyCert);
app.use("/api/resell", resellRouter);

// app.get("/api/syncNFTHolders", syncNFTHoldersHandler);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT}`);
});
