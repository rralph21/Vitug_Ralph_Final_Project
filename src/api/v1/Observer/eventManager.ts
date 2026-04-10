import { Appointment, AptStatus } from "../models/aptStatus";

export type AppointmentEventType =
    | "appointmentCreated"
    | "appointmentUpdated"
    | "appointmentDeleted"
    | "appointmentStatusChanged";

export interface AppointmentEvent {
    type: AppointmentEventType;
    appointment: Appointment;
    previousAppointment?: Appointment;
    previousStatus?: AptStatus;
    occurredAt: string;
}

export interface AppointmentObserver {
    update(event: AppointmentEvent): void;
}

export interface AppointmentSubject {
    attach(observer: AppointmentObserver): void;
    detach(observer: AppointmentObserver): void;
    notify(event: AppointmentEvent): void;
}

export class EventManager implements AppointmentSubject {
    private readonly observers = new Set<AppointmentObserver>();

    public attach(observer: AppointmentObserver): void {
        this.observers.add(observer);
    }

    public detach(observer: AppointmentObserver): void {
        this.observers.delete(observer);
    }

    public notify(event: AppointmentEvent): void {
        this.observers.forEach((observer) => observer.update(event));
    }

    public emitCreated(appointment: Appointment): void {
        this.notify({
            type: "appointmentCreated",
            appointment,
            occurredAt: new Date().toISOString()
        });
    }

    public emitUpdated(appointment: Appointment, previousAppointment: Appointment): void {
        this.notify({
            type: "appointmentUpdated",
            appointment,
            previousAppointment,
            occurredAt: new Date().toISOString()
        });

        if (appointment.status !== previousAppointment.status) {
            this.notify({
                type: "appointmentStatusChanged",
                appointment,
                previousAppointment,
                previousStatus: previousAppointment.status,
                occurredAt: new Date().toISOString()
            });
        }
    }

    public emitDeleted(appointment: Appointment): void {
        this.notify({
            type: "appointmentDeleted",
            appointment,
            occurredAt: new Date().toISOString()
        });
    }
}

export const appointmentEventManager = new EventManager();
