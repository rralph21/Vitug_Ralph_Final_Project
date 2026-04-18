import { HTTP_STATUS } from "../../../constant/httpConstants";
import { appointmentAuditSubscriber } from "../Observer/aptSubscribers";
import { appointmentEventManager } from "../Observer/eventManager";
import { notificationSubscriber } from "../Observer/notifSubscribers";
import { ServiceError } from "../errors/error";
import { Appointment } from "../models/aptStatus";
import { CreateAppointmentInput } from "../models/createApt";
import { UpdateAppointmentInput } from "../models/updateApt";
import {
    createAptRepo,
    deleteAptRepo,
    getAllAptsRepo,
    getAptByIdRepo,
    updateAptRepo,
} from "../repositories/aptRepositories";

appointmentEventManager.attach(appointmentAuditSubscriber);
appointmentEventManager.attach(notificationSubscriber);

export const getAllAptsAsync = async(): Promise<Appointment[]> => {
    return getAllAptsRepo();
};

export const getAptByIdAsync = async(id: number): Promise<Appointment> => {
    const apt = await getAptByIdRepo(id);

    if (!apt) {
        throw new ServiceError(
            "Appointment not found",
            "APPOINTMENT_NOT_FOUND",
            HTTP_STATUS.NOT_FOUND
        );
    }

    return apt;
};

export const createAptAsync = async(
    item: CreateAppointmentInput
): Promise<Appointment> => {
    const newApt = await createAptRepo(item);
    await appointmentEventManager.emitCreated(newApt);
    return newApt;
};

export const updateAptAsync = async(
    id: number,
    item: UpdateAppointmentInput
): Promise<Appointment> => {
    const previousApt = await getAptByIdRepo(id);

    if (!previousApt) {
        throw new ServiceError(
            "Appointment not found",
            "APPOINTMENT_NOT_FOUND",
            HTTP_STATUS.NOT_FOUND
        );
    }

    const updatedApt = await updateAptRepo(id, item);

    if (!updatedApt) {
        throw new ServiceError(
            "Appointment not found",
            "APPOINTMENT_NOT_FOUND",
            HTTP_STATUS.NOT_FOUND
        );
    }

    await appointmentEventManager.emitUpdated(updatedApt, previousApt);
    return updatedApt;
};

export const deleteAptAsync = async(id: number): Promise<Appointment> => {
    const deletedApt = await deleteAptRepo(id);

    if (!deletedApt) {
        throw new ServiceError(
            "Appointment not found",
            "APPOINTMENT_NOT_FOUND",
            HTTP_STATUS.NOT_FOUND
        );
    }

    await appointmentEventManager.emitDeleted(deletedApt);
    return deletedApt;
};
