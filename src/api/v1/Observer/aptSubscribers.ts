import { AppointmentEvent, AppointmentObserver } from "./eventManager";

export class AppointmentAuditSubscriber implements AppointmentObserver {
    public readonly eventHistory: AppointmentEvent[] = [];

    public update(event: AppointmentEvent): void {
        this.eventHistory.push(event);
    }
}

export const appointmentAuditSubscriber = new AppointmentAuditSubscriber();
