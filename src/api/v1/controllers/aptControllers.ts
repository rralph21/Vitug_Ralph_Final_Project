import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../constant/httpConstants";
import { 
    getAllAptsAsync, 
    createAptAsync, 
    updateAptAsync, 
    deleteAptAsync, 
    getAptByIdAsync 
} from "../services/aptServices";


export const getAllApts = async(req: Request, res: Response): Promise<void> => {
    const apts = await getAllAptsAsync();

    // Logic to get all items
    res.status(HTTP_STATUS.OK).send(apts);
};

export const getAptById = async(req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    // Logic to get an item by ID
    const apt = await getAptByIdAsync(id);

     if (!apt) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Appointment not found" });
        return;
    }

    res.status(HTTP_STATUS.OK).json({
        message: "Appointment is collected",
        data: apt,
    });
}

export const createApt = async(req: Request, res: Response): Promise<void> => {
    // Logic to create a new item
    const newItem = await createAptAsync(req.body.item);
    res.status(HTTP_STATUS.CREATED).send(newItem);
};

export const updateApt = async(req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

     // Logic to check if the item exists before updating  

    // Logic to update an item
    const updatedItem = await updateAptAsync(id, req.body.item);
    res.status(HTTP_STATUS.OK).send(updatedItem);
};

export const deleteApt = async(req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    // Logic to delete an item
    const deletedItem = await deleteAptAsync(id);
    res.status(HTTP_STATUS.NO_CONTENT).send(deletedItem);
};