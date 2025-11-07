import {Request, Response, NextFunction} from "express";
import SessionRequest from "../entities/SessionRequest";
import prismaClient from "../utils/prismaClient";
import { EUserRoles } from "@prisma/client";


const getSession = async(req: Request) => {
    // extract authorization token
    // const sessionId = req.headers.authorization?.split(" ")[1];

    const sessionCookie: string = req.cookies.sessionId;
    if (!sessionCookie) return null;

    return prismaClient.sessions.findFirst({
        where: {
            AND: [
                {
                    session: sessionCookie
                },
                {
                    expiresAt: { gte: new Date()}
                }
            ]
        }
    });
}

const authorize = async (req: SessionRequest, res: Response, next: NextFunction) => {
   const session = await getSession(req);
    if (!session) {
        res.status(401).json({error: "please login first"});
        return;
    }

    req.session = session;
    next();
}

const authAdmin = async (req: SessionRequest, res: Response, next: NextFunction) => {
    const session = await getSession(req);
    if (!session) {
        res.status(401).json({error: "please login first"});
        return;
    }

    if (session.role !== EUserRoles.Admin) {
        res.status(401).json({error: "you are not authorized"});
        return;
    }

    req.session = session;
    next();
}

export {authorize, authAdmin};