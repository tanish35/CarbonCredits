"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOut = exports.getUserDetails = exports.getUserWallet = exports.updateUserWallet = exports.googleLogin = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Register User
exports.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, address, phone } = req.body;
    if (!email || !password || !name || !address || !phone) {
        res
            .status(400)
            .json({ message: "Please provide an email and a password" });
        return;
    }
    const userExists = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (userExists) {
        res.status(400).json({ message: "User already exists" });
        return;
    }
    const user = yield prisma_1.default.user.create({
        data: {
            email,
            password: yield bcrypt_1.default.hash(password, 10),
            name,
            address,
            phone,
        },
    });
    const exp = Date.now() + 1000 * 60 * 60 * 5;
    const token = jsonwebtoken_1.default.sign({ sub: user.id, exp }, process.env.SECRET);
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
    });
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user.id,
            email: user.email,
        },
    });
}));
// Login User
exports.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Please provide an email and a password" });
        return;
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const match = yield bcrypt_1.default.compare(password, user.password);
    if (!match) {
        res.status(400).json({ message: "Wrong password" });
        return;
    }
    const exp = Date.now() + 1000 + 60 * 60 * 24 * 30; // Token valid for 30 days
    const token = jsonwebtoken_1.default.sign({ sub: user.id, exp }, process.env.SECRET);
    res.cookie("token", token, {
        httpOnly: true, // Prevents access to the cookie from JavaScript
        sameSite: "lax",
        secure: true,
    });
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user.id,
            email: user.email,
        },
    });
}));
exports.googleLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    if (!email || !name) {
        res.status(400).json({ message: "Please provide an email" });
        return;
    }
    let user = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        user = yield prisma_1.default.user.create({
            data: {
                name,
                email,
                password: "",
            },
        });
    }
    const exp = Math.floor(Date.now() / 1000) + 60 * 60; // Token valid for 1 hour
    const token = jsonwebtoken_1.default.sign({ sub: user.id, exp }, process.env.SECRET);
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
    });
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user.id,
            email: user.email,
        },
    });
}));
// Update User Wallet
exports.updateUserWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const { wallet_address } = req.body;
    try {
        const wallet = yield prisma_1.default.wallet.upsert({
            where: {
                address: wallet_address,
            },
            update: {
                // @ts-ignore
                userId: req.user.id,
            },
            create: {
                address: wallet_address,
                // @ts-ignore
                userId: req.user.id,
            },
        });
        res.json(wallet);
    }
    catch (error) {
        console.error("Error updating or creating wallet:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.getUserWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield prisma_1.default.wallet.findMany({
        where: {
            // @ts-ignore
            userId: req.user.id,
        },
    });
    res.json(wallet);
}));
exports.getUserDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    res.json(req.user);
}));
exports.signOut = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token", { path: "/", httpOnly: true, secure: true });
    res.json({ message: "Signed out successfully" });
}));
