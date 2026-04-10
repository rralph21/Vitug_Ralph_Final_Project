import { Request, Response } from "express";
import {auth} from "../../../config/firebaseConfig";
import { UserRecord } from "firebase-admin/auth";

export const setUserClaims = async (req: Request, res: Response) => {
    let userClaimsToset = req.body

    const user: UserRecord = await auth.getUser(userClaimsToset.uid);
    
    await auth.setCustomUserClaims(userClaimsToset.uid, userClaimsToset.claims)

    res.status(200).send("Ok");
    return
};