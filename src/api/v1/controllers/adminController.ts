import { Request, Response } from "express";
import { getFirebaseAuth } from "../../../config/firebaseConfig";
import { UserRecord } from "firebase-admin/auth";

export const setUserClaims = async (req: Request, res: Response) => {
    const userClaimsToset = req.body;
    const auth = getFirebaseAuth();

    const user: UserRecord = await auth.getUser(userClaimsToset.uid);
    
    await auth.setCustomUserClaims(userClaimsToset.uid, userClaimsToset.claims);

    res.status(200).send("Ok");
    return;
};
