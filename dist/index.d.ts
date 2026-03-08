import * as react_jsx_runtime from 'react/jsx-runtime';

interface BookingWidgetTexts {
    buttonText?: string;
    title?: string;
    selectTime?: string;
    duration?: string;
    loading?: string;
    noSlots?: string;
    successTitle?: string;
    successMsg?: string;
    errorTitle?: string;
    back?: string;
    close?: string;
    newBooking?: string;
    formName?: string;
    formEmail?: string;
    formService?: string;
    formMessage?: string;
    formMessagePlaceholder?: string;
    formSelectService?: string;
    formSubmit?: string;
    formSubmitting?: string;
}
interface BookingWidgetProps {
    /** URL of your /api/booking endpoint */
    apiUrl: string;
    /** Widget theme (default: "dark") */
    theme?: "dark" | "light";
    /** Primary accent color (default: "#2DBFAD") */
    accentColor?: string;
    /** Secondary color for gradients (default: "#4A5EC8") */
    secondaryColor?: string;
    /** Locale for labels (default: "es") */
    locale?: "es" | "en";
    /** Duration label shown to user (default: "60 min") */
    durationLabel?: string;
    /** Service options for the select field */
    services?: string[];
    /** Button text (default: "Agendar llamada") */
    buttonText?: string;
    /** Override any default text in the widget */
    texts?: BookingWidgetTexts;
}
interface BookingFormData {
    name: string;
    email: string;
    service: string;
    message: string;
    date: string;
    time: string;
}

declare function BookingWidget({ apiUrl, theme, accentColor, secondaryColor, locale, durationLabel, services, buttonText, texts: customTexts, }: BookingWidgetProps): react_jsx_runtime.JSX.Element;

export { type BookingFormData, BookingWidget, type BookingWidgetProps, type BookingWidgetTexts };
