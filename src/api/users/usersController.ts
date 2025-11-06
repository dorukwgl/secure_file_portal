import express from "express";
import { changePassword, disableUser, enableUser, getUser, registerUser, searchUsers } from "./usersModel";
import {authAdmin, authorize} from "../../middlewares/auth";
import SessionRequest from "../../entities/SessionRequest";
import { z } from "zod";


const users = express.Router();

users.post("/register", authAdmin, async (req, res) => {
    const {error, statusCode, data} = await registerUser(req.body);
    res.status(statusCode).json(error || data);
});

users.get("/", authAdmin, async (req, res) => {
    const {error, statusCode, data} = await searchUsers(req.query);
    res.status(statusCode).json(error || data);
});

users.get("/me", authorize, async (req: SessionRequest, res) => {
   const {error, statusCode, data} = await getUser(req.session!.userId);
   res.status(statusCode).json(error || data);
});

users.post("/disable", authAdmin, async (req, res) => {
    const {error, statusCode, data} = await disableUser(req.body.userId);
    res.status(statusCode).json(error || data);
});

users.post("/enable", authAdmin, async (req, res) => {
    const {error, statusCode, data} = await enableUser(req.body.userId);
    res.status(statusCode).json(error || data);
});

users.post("/change-password/:userId", authAdmin, async (req: SessionRequest<{userId: string}>, res) => {
    var validate = z.object({password: z.string().min(8)}).safeParse(req.body);
    if (!validate.success) {
        res.status(400).json({error: validate.error.message});
        return;
    }
    const {error, statusCode, data} = await changePassword(req.params.userId, validate.data.password);
    res.status(statusCode).json(error || data);
});

export default users;