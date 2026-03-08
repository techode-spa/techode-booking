export interface BookingWidgetProps {
  /** URL of your /api/booking endpoint */
  apiUrl: string;
  /** Widget theme (default: "dark") */
  theme?: "dark" | "light";
  /** Primary accent color (default: "#2DBFAD") */
  accentColor?: string;
  /** Locale for labels (default: "es") */
  locale?: "es" | "en";
  /** Duration label shown to user (default: "60 min") */
  durationLabel?: string;
  /** Service options for the select field */
  services?: string[];
  /** Button text (default: "Agendar llamada") */
  buttonText?: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}

export interface BookingFormData {
  name: string;
  email: string;
  service: string;
  message: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface BookingHandlerOptions {
  /** Google Calendar ID (usually the gmail address). Optional — if omitted, email-only mode. */
  googleCalendarId?: string;
  /** Google Service Account credentials JSON string (or base64). Optional — if omitted, email-only mode. */
  googleCredentials?: string;
  /** Resend API key for confirmation emails */
  resendApiKey: string;
  /** Email to notify on new bookings */
  notifyEmail: string;
  /** Available days: 0=Sun, 1=Mon, ..., 6=Sat (default: [1,2,3,4,5]) */
  availableDays?: number[];
  /** Available hours range (default: { start: 14, end: 19 }) */
  availableHours?: { start: number; end: number };
  /** Appointment duration in minutes (default: 60) */
  duration?: number;
  /** IANA timezone (default: "America/Santiago") */
  timezone?: string;
  /** Buffer minutes between appointments (default: 15) */
  bufferMinutes?: number;
  /** Rate limit: max bookings per hour per IP (default: 5) */
  rateLimit?: number;
}

export interface BookingResponse {
  status: number;
  body: Record<string, unknown>;
}
