import {
    CollectionReference,
    DocumentData,
    Transaction,
} from "firebase-admin/firestore";
import { HTTP_STATUS } from "../../../constant/httpConstants";
import { getFirebaseDb } from "../../../config/firebaseConfig";
import { RepositoryError } from "../errors/error";
import { Appointment } from "../models/aptStatus";
import { CreateAppointmentInput } from "../models/createApt";
import { UpdateAppointmentInput } from "../models/updateApt";

const APPOINTMENTS_COLLECTION = "appointments";

const getAppointmentsCollection = (): CollectionReference<DocumentData> =>
    getFirebaseDb().collection(APPOINTMENTS_COLLECTION);

const mapAppointment = (
    data: Partial<Appointment> | undefined,
    id: number
): Appointment => {
    const resolvedUpdatedAt = data?.updatedAt ?? data?.createdAt;

    if (
        !data ||
        typeof data.clinic !== "string" ||
        typeof data.type !== "string" ||
        typeof data.spots !== "number" ||
        typeof data.status !== "string" ||
        typeof data.createdAt !== "string" ||
        typeof resolvedUpdatedAt !== "string"
    ) {
        throw new RepositoryError(
            `Appointment ${id} is missing required fields in Firestore`,
            "INVALID_APPOINTMENT_DATA"
        );
    }

    return {
        id,
        clinic: data.clinic,
        type: data.type,
        spots: data.spots,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: resolvedUpdatedAt,
    };
};

const getNextAppointmentId = async(transaction: Transaction): Promise<number> => {
    const latestAppointmentQuery = getAppointmentsCollection()
        .orderBy("id", "desc")
        .limit(1);
    const latestAppointmentSnapshot = await transaction.get(
        latestAppointmentQuery
    );

    if (latestAppointmentSnapshot.empty) {
        return 1;
    }

    const latestAppointmentData =
        latestAppointmentSnapshot.docs[0].data() as Partial<Appointment>;
    const currentMaxId = Number(latestAppointmentData.id ?? 0);

    return currentMaxId + 1;
};

export const getAllAptsRepo = async(): Promise<Appointment[]> => {
    try {
        const snapshot = await getAppointmentsCollection().orderBy("id").get();

        return snapshot.docs.map((doc) => {
            const rawData = doc.data();
            const id = Number(rawData.id ?? doc.id);
            return mapAppointment(rawData as Partial<Appointment>, id);
        });
    } catch (error: unknown) {
        throw new RepositoryError(
            error instanceof Error ? error.message : "Failed to fetch appointments",
            "APPOINTMENTS_FETCH_FAILED"
        );
    }
};

export const getAptByIdRepo = async(id: number): Promise<Appointment | null> => {
    try {
        const docRef = getAppointmentsCollection().doc(String(id));
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        return mapAppointment(snapshot.data() as Partial<Appointment>, id);
    } catch (error: unknown) {
        throw new RepositoryError(
            error instanceof Error ? error.message : "Failed to fetch appointment",
            "APPOINTMENT_FETCH_FAILED"
        );
    }
};

export const createAptRepo = async(
    item: CreateAppointmentInput
): Promise<Appointment> => {
    try {
        return await getFirebaseDb().runTransaction(async(transaction) => {
            const nextId = await getNextAppointmentId(transaction);
            const timestamp = new Date().toISOString();
            const newAppointment: Appointment = {
                ...item,
                id: nextId,
                createdAt: timestamp,
                updatedAt: timestamp,
            };

            const docRef = getAppointmentsCollection().doc(String(nextId));
            transaction.set(docRef, newAppointment);

            return newAppointment;
        });
    } catch (error: unknown) {
        throw new RepositoryError(
            error instanceof Error ? error.message : "Failed to create appointment",
            "APPOINTMENT_CREATE_FAILED"
        );
    }
};

export const updateAptRepo = async(
    id: number,
    item: UpdateAppointmentInput
): Promise<Appointment | null> => {
    try {
        return await getFirebaseDb().runTransaction(async(transaction) => {
            const docRef = getAppointmentsCollection().doc(String(id));
            const snapshot = await transaction.get(docRef);

            if (!snapshot.exists) {
                return null;
            }

            const currentAppointment = mapAppointment(
                snapshot.data() as Partial<Appointment>,
                id
            );
            const updatedAppointment: Appointment = {
                ...currentAppointment,
                ...item,
                id,
                updatedAt: new Date().toISOString(),
            };

            transaction.set(docRef, updatedAppointment);
            return updatedAppointment;
        });
    } catch (error: unknown) {
        throw new RepositoryError(
            error instanceof Error ? error.message : "Failed to update appointment",
            "APPOINTMENT_UPDATE_FAILED"
        );
    }
};

export const deleteAptRepo = async(id: number): Promise<Appointment | null> => {
    try {
        return await getFirebaseDb().runTransaction(async(transaction) => {
            const docRef = getAppointmentsCollection().doc(String(id));
            const snapshot = await transaction.get(docRef);

            if (!snapshot.exists) {
                return null;
            }

            const appointment = mapAppointment(
                snapshot.data() as Partial<Appointment>,
                id
            );
            transaction.delete(docRef);
            return appointment;
        });
    } catch (error: unknown) {
        throw new RepositoryError(
            error instanceof Error ? error.message : "Failed to delete appointment",
            "APPOINTMENT_DELETE_FAILED"
        );
    }
};
