import { Appointment } from "../models/aptStatus";
import { CreateAppointmentInput } from "../models/createApt";
import { UpdateAppointmentInput } from "../models/updateApt";
import { sampleAppointments } from "../models/sampleApt";
import { HTTP_STATUS } from "src/constant/httpConstants";

export const getAllAptsAsync = (): Appointment[] => {
    // Logic to process all items from the database
    return sampleAppointments;
};

export const getAptByIdAsync = (id: number): Appointment => {
    // Logic to get an item by ID from the database
    const apt = sampleAppointments.find((apt) => apt.id === id);
    if (!apt) {
        throw new Error("Appointment not found"), HTTP_STATUS.NOT_FOUND;
    }
    return apt;
};


export const createAptAsync = (item: CreateAppointmentInput): Appointment => {
    // Logic to add a new item to the database
    const newApt: Appointment = {
        ...item,
        id: sampleAppointments.length + 1,
        createdAt: new Date().toISOString()
    };
    sampleAppointments.push(newApt);
    return newApt;
};

export const updateAptAsync = (id: number, item: UpdateAppointmentInput): Appointment => {
    // Logic to update an item in the database
    const aptIndex = sampleAppointments.findIndex((apt) => apt.id === id);
    if (aptIndex === -1) {
        throw new Error("Appointment not found"), HTTP_STATUS.NOT_FOUND;
    }
    sampleAppointments[aptIndex] = { ...sampleAppointments[aptIndex], ...item };
    return sampleAppointments[aptIndex];
};

export const deleteAptAsync = (id: number): Appointment => {
    // Logic to delete an item from the database
    const aptIndex = sampleAppointments.findIndex((apt) => apt.id === id);
    if (aptIndex === -1) {
        throw new Error("Appointment not found"), HTTP_STATUS.NOT_FOUND;
    }
    const [deletedApt] = sampleAppointments.splice(aptIndex, 1);
    return deletedApt;
};