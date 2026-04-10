import { AppointmentEvent, AppointmentObserver } from "./eventManager";

export class NotificationSubscriber implements AppointmentObserver {
    public update(event: AppointmentEvent): void {
        const statusMessage =
            event.type === "appointmentStatusChanged" && event.previousStatus
                ? ` Status changed from ${event.previousStatus} to ${event.appointment.status}.`
                : "";

        console.log(
            `[Appointment Notification] ${event.type} for appointment ${event.appointment.id}.${statusMessage}`
        );
    }
}

export const notificationSubscriber = new NotificationSubscriber();
