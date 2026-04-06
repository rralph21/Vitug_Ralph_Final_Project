import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../constant/httpConstants";
import { getAllAptsAsync, createAptAsync, updateAptAsync, deleteAptAsync } from "../services/aptServices";

export const getAllApts = async(req: Request, res: Response) => {
    const apts = await getAllAptsAsync();

    // Logic to get all items
    res.status(HTTP_STATUS.OK).send(apts);
};

export const createApt = async(req: Request, res: Response) => {
    // Logic to create a new item
    const newItem = await createAptAsync(req.body.item);
    res.status(HTTP_STATUS.CREATED).send(newItem);
};

export const updateApt = async(req: Request, res: Response) => {
    // Logic to update an item
    // const updatedItem = await updateAptAsync(req.params.id, req.body.item);
    // res.status(HTTP_STATUS.OK).send(updatedItem);
};

export const deleteApt = async(req: Request, res: Response) => {
    // Logic to delete an item
    // const deletedItem = await deleteAptAsync(req.params.id);
    // res.status(HTTP_STATUS.NO_CONTENT).send(deletedItem);
};