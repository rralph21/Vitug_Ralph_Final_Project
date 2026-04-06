import { AptStatus } from "./aptStatus";

export interface CreateAppointmentInput {
    clinic: string;
    type: string;
    spots: number;
    status: AptStatus;
}
