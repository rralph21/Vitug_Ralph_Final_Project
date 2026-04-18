import { Appointment } from "./aptStatus";

export const sampleAppointments: Appointment[] = [
    {
        id: 1,
        clinic: "City Medical Center",
        type: "General Checkup",
        spots: 1,
        status: "open",
        createdAt: "2025-01-10T10:00:00.000Z",
        updatedAt: "2025-01-10T10:00:00.000Z"
    },
    {
        id: 2,
        clinic: "City Medical Center",
        type: "Specialist Consultation",
        spots: 2,
        status: "open",
        createdAt: "2025-01-08T10:00:00.000Z",
        updatedAt: "2025-01-08T10:00:00.000Z"
    },
    {
        id: 3,
        clinic: "City Medical Center",
        type: "General Checkup",
        spots: 0,
        status: "delayed",
        createdAt: "2025-01-05T10:00:00.000Z",
        updatedAt: "2025-01-05T10:00:00.000Z"
    },
    {
        id: 4,
        clinic: "City Medical Center",
        type: "Specialist Consultation",
        spots: 0,
        status: "full",
        createdAt: "2025-01-03T10:00:00.000Z",
        updatedAt: "2025-01-03T10:00:00.000Z"
    }
];
