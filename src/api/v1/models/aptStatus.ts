export type AptStatus = "pending" | "open" | "close" | "delayed" | "cancelled";

export interface Appointment {
    id: number;
    clinic: string;
    type: string;
    spots: number;
    status: AptStatus;
    createdAt: string;
}