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
    update(event: AppointmentEvent): void | Promise<void>;
}

export interface AppointmentSubject {
    attach(observer: AppointmentObserver): void;
    detach(observer: AppointmentObserver): void;
    notify(event: AppointmentEvent): Promise<void>;
}

export class EventManager implements AppointmentSubject {
    private readonly observers = new Set<AppointmentObserver>();

    public attach(observer: AppointmentObserver): void {
        this.observers.add(observer);
    }

    public detach(observer: AppointmentObserver): void {
        this.observers.delete(observer);
    }

    public async notify(event: AppointmentEvent): Promise<void> {
        await Promise.all(
            [...this.observers].map((observer) => observer.update(event))
        );
    }

    public async emitCreated(appointment: Appointment): Promise<void> {
        await this.notify({
            type: "appointmentCreated",
            appointment,
            occurredAt: new Date().toISOString(),
        });
    }

    public async emitUpdated(
        appointment: Appointment,
        previousAppointment: Appointment
    ): Promise<void> {
        await this.notify({
            type: "appointmentUpdated",
            appointment,
            previousAppointment,
            occurredAt: new Date().toISOString(),
        });

        if (appointment.status !== previousAppointment.status) {
            await this.notify({
                type: "appointmentStatusChanged",
                appointment,
                previousAppointment,
                previousStatus: previousAppointment.status,
                occurredAt: new Date().toISOString(),
            });
        }
    }

    public async emitDeleted(appointment: Appointment): Promise<void> {
        await this.notify({
            type: "appointmentDeleted",
            appointment,
            occurredAt: new Date().toISOString(),
        });
    }
}

export const appointmentEventManager = new EventManager();
