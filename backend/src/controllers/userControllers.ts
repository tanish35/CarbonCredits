import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendMail from "../mail/sendMail";
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Please provide an email and a password" });
    }
    const user = await prisma.user.create({
        data: {
        email,
        password: await bcrypt.hash(password, 10),
        },

    });
    const exp = Date.now() + 1000 * 60 * 5;
    // @ts-ignore
    const token = jwt.sign({ sub: user.id, exp }, process.env.SECRET);
    const url = `${process.env.BACKEND_URL}/api/user/verify/${token}`;
    const htmlContent = `<a href="${url}">Verify using this link</a>`;
    sendMail(htmlContent, email);
    res.json(user);

});

export const resendURL = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Please provide all fields" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
});

const verifyUser = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params.token;
    if (!token) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }
    // @ts-ignore
    const { sub, exp } = jwt.verify(token, process.env.SECRET);
    // @ts-ignore
    if (exp < Date.now()) {
      res
        .status(400)
        .json({ message: "Token expired. Login to verify your email" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: {
        id: sub,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
  
    if (user.emailVerified) {
      res.status(400).json({ message: "User already verified" });
      return;
    }
    await prisma.user.update({
      where: {
        id: sub,
      },
      data: {
        emailVerified: true,
      },
    });
    res.status(200).json({ message: "User verified" });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Please provide an email and a password" });
    }
    const user = await prisma.user.findUnique({
        where: {
        email,
        },
    });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    if (!user.emailVerified) {
        res.status(400).json({ message: "Email not verified" });
        return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        res.status(400).json({ message: "Wrong password" });
        return;
    }
    const exp = Date.now() + 1000 * 60 * 5;
    // @ts-ignore
    const token = jwt.sign({ sub: user.id, exp }, process.env.SECRET);
    res.json({ token });
});


export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
        cacheStrategy:{ttl:300,swr:60}
    });
    res.json(user);
});

export const updateUserWallet = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {wallet_address} = req.body;
  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      wallet_address,
    },
  });
});

export const deleteUserWallet = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      wallet_address:null,
    },
  });
});