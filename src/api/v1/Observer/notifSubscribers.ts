import nodemailer, { Transporter } from "nodemailer";
import { AppointmentEvent, AppointmentObserver } from "./eventManager";

const DEFAULT_OBSERVER_EMAIL = "rralph@rrc.ca";

const parseObserverEmails = (): string[] => {
    const configuredEmails = process.env.APPOINTMENT_OBSERVER_EMAILS
        ?.split(",")
        .map((email) => email.trim())
        .filter(Boolean);

    return configuredEmails?.length
        ? configuredEmails
        : [DEFAULT_OBSERVER_EMAIL];
};

const buildTransporter = (): Transporter | null => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
};

const buildEmailSubject = (event: AppointmentEvent): string => {
    switch (event.type) {
        case "appointmentCreated":
            return `Appointment ${event.appointment.id} created`;
        case "appointmentUpdated":
            return `Appointment ${event.appointment.id} updated`;
        case "appointmentDeleted":
            return `Appointment ${event.appointment.id} deleted`;
        case "appointmentStatusChanged":
            return `Appointment ${event.appointment.id} status changed`;
        default:
            return `Appointment ${event.appointment.id} notification`;
    }
};

const buildEmailText = (event: AppointmentEvent): string => {
    const { appointment } = event;
    const changeSummary =
        event.type === "appointmentStatusChanged" && event.previousStatus
            ? `Previous status: ${event.previousStatus}\nNew status: ${appointment.status}\n`
            : "";

    const previousAppointmentSummary = event.previousAppointment
        ? `Previous values:
Clinic: ${event.previousAppointment.clinic}
Type: ${event.previousAppointment.type}
Spots: ${event.previousAppointment.spots}
Status: ${event.previousAppointment.status}
\n`
        : "";

    return `Appointment event: ${event.type}
Occurred at: ${event.occurredAt}
Appointment ID: ${appointment.id}
Clinic: ${appointment.clinic}
Type: ${appointment.type}
Spots: ${appointment.spots}
Status: ${appointment.status}
Created at: ${appointment.createdAt}

${changeSummary}${previousAppointmentSummary}`.trim();
};

export class NotificationSubscriber implements AppointmentObserver {
    private readonly recipients: string[];
    private readonly transporter: Transporter | null;
    private readonly sender: string;

    constructor(
        recipients: string[] = parseObserverEmails(),
        transporter: Transporter | null = buildTransporter(),
        sender: string = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? DEFAULT_OBSERVER_EMAIL
    ) {
        this.recipients = recipients;
        this.transporter = transporter;
        this.sender = sender;
    }

    public async update(event: AppointmentEvent): Promise<void> {
        const subject = buildEmailSubject(event);
        const text = buildEmailText(event);

        if (!this.transporter) {
            console.warn(
                `[Appointment Notification] Email transport not configured. Intended recipients: ${this.recipients.join(", ")}. Subject: ${subject}`
            );
            console.log(text);
            return;
        }

        await this.transporter.sendMail({
            from: this.sender,
            to: this.recipients.join(", "),
            subject,
            text,
        });
    }
}

export const notificationSubscriber = new NotificationSubscriber();
