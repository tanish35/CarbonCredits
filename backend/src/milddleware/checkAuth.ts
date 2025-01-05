import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
// @ts-ignore
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      console.log("4");
      res.sendStatus(401);
      return;
    }
    // @ts-ignore
    const decoded = jwt.verify(token, process.env.SECRET);
    // @ts-ignore
    if (Date.now() >= decoded.exp) {
      res.sendStatus(410);
      return;
    }
    const userId = decoded.sub;
    if (!userId) {
      console.log("3");
      res.sendStatus(401);
      return;
    }
    const user = await prisma.user.findUnique({
      where: {
        // @ts-ignore
        id: decoded.sub,
      },
    });
    if (!user) {
      console.log("2");
      res.sendStatus(401);
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("1",err);
    res.sendStatus(401);
    return;
  }
}

export default requireAuth;