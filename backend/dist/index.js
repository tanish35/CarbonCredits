"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const nftRoutes_1 = __importDefault(require("./routes/nftRoutes"));
const verifyCert_1 = __importDefault(require("./routes/verifyCert"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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
app.use("/api/user", userRoutes_1.default);
app.use("/api/nft", nftRoutes_1.default);
app.use("/api/emission", verifyCert_1.default);
app.listen(3001, () => {
    console.log("🚀 Server is running on http://localhost:3001");
});
