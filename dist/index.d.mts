import * as react_jsx_runtime from 'react/jsx-runtime';

interface BookingWidgetProps {
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
interface BookingFormData {
    name: string;
    email: string;
    service: string;
    message: string;
    date: string;
    time: string;
}

declare function BookingWidget({ apiUrl, theme, accentColor, locale, durationLabel, services, buttonText, }: BookingWidgetProps): react_jsx_runtime.JSX.Element;

export { type BookingFormData, BookingWidget, type BookingWidgetProps };
