import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../constant/httpConstants";

export const getAllApts = (req: Request, res: Response) => {
    // Logic to get all items
    res.status(HTTP_STATUS.OK).send("Get all items");
};

export const createApt = (req: Request, res: Response) => {
    // Logic to create a new item
    res.status(HTTP_STATUS.CREATED).send("Create a new item");
};

export const updateApt = (req: Request, res: Response) => {
    // Logic to update an item
    res.status(HTTP_STATUS.OK).send("Update an item");
};

export const deleteApt = (req: Request, res: Response) => {
    // Logic to delete an item
    res.status(HTTP_STATUS.NO_CONTENT).send("Delete an item");
};