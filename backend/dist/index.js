"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const nft_routes_1 = __importDefault(require("./routes/nft.routes"));
const verifyCert_routes_1 = __importDefault(require("./routes/verifyCert.routes"));
const resell_routes_1 = __importDefault(require("./routes/resell.routes"));
// import { syncNFTHoldersHandler } from "./controllers/syncNFT";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://ecox.somnathcodes.site",
        "https://ecox.wedevelopers.online",
    ],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
//req logger middleware
app.use((req, res, next) => {
    // console.log("Request logged:", req.method, req.path);
    next();
});
app.get("/", (req, res) => {
    res.send("Server is running");
});
app.use("/api/user", user_routes_1.default);
app.use("/api/nft", nft_routes_1.default);
app.use("/api/emission", verifyCert_routes_1.default);
app.use("/api/resell", resell_routes_1.default);
// app.get("/api/syncNFTHolders", syncNFTHoldersHandler);
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on port ${process.env.PORT}`);
});
