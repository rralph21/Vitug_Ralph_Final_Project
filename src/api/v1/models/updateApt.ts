import { AptStatus } from "./aptStatus";

export interface UpdateAppointmentInput {
    clinic?: string;
    type?: string;
    spots?: number;
    status?: AptStatus;
}