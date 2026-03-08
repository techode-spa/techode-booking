interface BookingHandlerOptions {
    /** Google Calendar ID (usually the gmail address). Optional — if omitted, email-only mode. */
    googleCalendarId?: string;
    /** Google Service Account credentials JSON string (or base64). Optional — if omitted, email-only mode. */
    googleCredentials?: string;
    /** Resend API key for confirmation emails */
    resendApiKey: string;
    /** Sender address for emails (default: "Techode <onboarding@resend.dev>") */
    emailFrom?: string;
    /** Email to notify on new bookings */
    notifyEmail: string;
    /** Available days: 0=Sun, 1=Mon, ..., 6=Sat (default: [1,2,3,4,5]) */
    availableDays?: number[];
    /** Available hours range (default: { start: 14, end: 19 }) */
    availableHours?: {
        start: number;
        end: number;
    };
    /** Appointment duration in minutes (default: 60) */
    duration?: number;
    /** IANA timezone (default: "America/Santiago") */
    timezone?: string;
    /** Buffer minutes between appointments (default: 15) */
    bufferMinutes?: number;
    /** Rate limit: max bookings per hour per IP (default: 5) */
    rateLimit?: number;
}
interface BookingResponse {
    status: number;
    body: Record<string, unknown>;
}

declare function createBookingHandler(options: BookingHandlerOptions): (req: {
    action: string;
    body: Record<string, unknown>;
    ip: string;
}) => Promise<BookingResponse>;

export { type BookingHandlerOptions, createBookingHandler };
