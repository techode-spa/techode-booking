import { useState, useEffect, useCallback, useMemo } from "react";
import type { BookingWidgetProps, DayAvailability, TimeSlot } from "../types";
import CalendarGrid from "./CalendarGrid";
import TimeSlots from "./TimeSlots";
import BookingForm from "./BookingForm";

type Step = "calendar" | "form" | "success" | "error";

const DEFAULT_SERVICES_ES = ["Desarrollo Web", "Aplicacion Movil", "Diseno UI/UX", "Consultoria", "Otro"];
const DEFAULT_SERVICES_EN = ["Web Development", "Mobile App", "UI/UX Design", "Consulting", "Other"];

const texts = {
  es: {
    buttonText: "Agendar llamada",
    title: "Agendar una llamada",
    selectTime: "Selecciona un horario",
    duration: "Duracion",
    loading: "Cargando disponibilidad...",
    noSlots: "No hay horarios disponibles este mes. Prueba el siguiente.",
    successTitle: "Reunion agendada",
    successMsg: "Te enviamos un email de confirmacion con los detalles.",
    errorTitle: "Error al agendar",
    back: "Volver",
    close: "Cerrar",
    newBooking: "Agendar otra",
  },
  en: {
    buttonText: "Book a call",
    title: "Book a call",
    selectTime: "Select a time",
    duration: "Duration",
    loading: "Loading availability...",
    noSlots: "No slots available this month. Try the next one.",
    successTitle: "Meeting booked",
    successMsg: "We sent you a confirmation email with the details.",
    errorTitle: "Booking error",
    back: "Back",
    close: "Close",
    newBooking: "Book another",
  },
};

export default function BookingWidget({
  apiUrl,
  theme = "dark",
  accentColor = "#2DBFAD",
  locale = "es",
  durationLabel = "60 min",
  services,
  buttonText,
}: BookingWidgetProps) {
  const isDark = theme === "dark";
  const t = texts[locale];
  const serviceOptions = services || (locale === "es" ? DEFAULT_SERVICES_ES : DEFAULT_SERVICES_EN);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("calendar");
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const selectedSlots = useMemo(() => {
    if (!selectedDate) return [];
    const day = availability.find((d) => d.date === selectedDate);
    return day?.slots || [];
  }, [selectedDate, availability]);

  const fetchAvailability = useCallback(async (m: number, y: number) => {
    setLoadingAvailability(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "availability", month: m, year: y }),
      });
      const data = await res.json();
      if (res.ok) {
        setAvailability(data.availability || []);
      } else {
        setAvailability([]);
      }
    } catch {
      setAvailability([]);
    } finally {
      setLoadingAvailability(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailability(month, year);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, month, year, fetchAvailability]);

  function handleChangeMonth(m: number, y: number) {
    setMonth(m);
    setYear(y);
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function handleSelectTime(time: string) {
    setSelectedTime(time);
    setStep("form");
  }

  async function handleBook(formData: { name: string; email: string; service: string; message: string }) {
    if (!selectedDate || !selectedTime) return;
    setLoadingBooking(true);
    setErrorMsg("");
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "book",
          ...formData,
          date: selectedDate,
          time: selectedTime,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("success");
      } else {
        setErrorMsg(data.error || "Error al agendar");
        if (res.status === 409) {
          // Slot taken — go back to calendar
          setStep("calendar");
          setSelectedTime(null);
          fetchAvailability(month, year);
        } else {
          setStep("error");
        }
      }
    } catch {
      setErrorMsg("Error de conexion. Intenta de nuevo.");
      setStep("error");
    } finally {
      setLoadingBooking(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    // Reset state after animation
    setTimeout(() => {
      setStep("calendar");
      setSelectedDate(null);
      setSelectedTime(null);
      setErrorMsg("");
    }, 300);
  }

  function handleReset() {
    setStep("calendar");
    setSelectedDate(null);
    setSelectedTime(null);
    setErrorMsg("");
    fetchAvailability(month, year);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "12px 24px",
          borderRadius: 8,
          border: `2px solid ${accentColor}`,
          background: "transparent",
          color: accentColor,
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${accentColor}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {buttonText || t.buttonText}
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
            animation: "techode-booking-fade-in 0.2s ease",
          }}
        >
          {/* Modal */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              maxHeight: "90vh",
              overflowY: "auto",
              background: isDark ? "#080812" : "#fff",
              borderRadius: 16,
              border: `1px solid ${isDark ? "#1a1a2e" : "#e0e0e0"}`,
              padding: 24,
              fontFamily: "Inter, system-ui, sans-serif",
              animation: "techode-booking-slide-up 0.3s ease",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: isDark ? "#fff" : "#000" }}>
                {t.title}
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: isDark ? "#8888AA" : "#999",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Duration badge */}
            <div style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 20,
              background: `${accentColor}15`,
              color: accentColor,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 16,
            }}>
              {t.duration}: {durationLabel}
            </div>

            {/* Step: Calendar */}
            {step === "calendar" && (
              <>
                {loadingAvailability ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: isDark ? "#8888AA" : "#999" }}>
                    {t.loading}
                  </div>
                ) : availability.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: isDark ? "#8888AA" : "#999" }}>
                    {t.noSlots}
                  </div>
                ) : (
                  <>
                    <CalendarGrid
                      availability={availability}
                      selectedDate={selectedDate}
                      onSelectDate={handleSelectDate}
                      month={month}
                      year={year}
                      onChangeMonth={handleChangeMonth}
                      accentColor={accentColor}
                      theme={theme}
                      locale={locale}
                    />
                    {selectedDate && selectedSlots.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: isDark ? "#8888AA" : "#666", margin: "0 0 8px" }}>
                          {t.selectTime}
                        </p>
                        <TimeSlots
                          slots={selectedSlots}
                          selectedTime={selectedTime}
                          onSelectTime={handleSelectTime}
                          accentColor={accentColor}
                          theme={theme}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Step: Form */}
            {step === "form" && (
              <>
                <button
                  onClick={() => setStep("calendar")}
                  style={{
                    background: "none",
                    border: "none",
                    color: accentColor,
                    cursor: "pointer",
                    fontSize: 14,
                    padding: 0,
                    marginBottom: 8,
                  }}
                >
                  ← {t.back}
                </button>
                <div style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: `${accentColor}10`,
                  color: isDark ? "#fff" : "#000",
                  fontSize: 14,
                  marginBottom: 8,
                }}>
                  {selectedDate} — {selectedTime}
                </div>
                {errorMsg && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "#ff444420", color: "#ff6666", fontSize: 13, marginBottom: 8 }}>
                    {errorMsg}
                  </div>
                )}
                <BookingForm
                  services={serviceOptions}
                  onSubmit={handleBook}
                  loading={loadingBooking}
                  accentColor={accentColor}
                  theme={theme}
                  locale={locale}
                />
              </>
            )}

            {/* Step: Success */}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <h3 style={{ color: accentColor, margin: "0 0 8px", fontSize: 18 }}>{t.successTitle}</h3>
                <p style={{ color: isDark ? "#8888AA" : "#666", fontSize: 14, margin: "0 0 24px" }}>{t.successMsg}</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 8,
                      border: `1px solid ${isDark ? "#1a1a2e" : "#ddd"}`,
                      background: "transparent",
                      color: isDark ? "#fff" : "#000",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    {t.close}
                  </button>
                  <button
                    onClick={handleReset}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: accentColor,
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {t.newBooking}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Error */}
            {step === "error" && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✕</div>
                <h3 style={{ color: "#ff6666", margin: "0 0 8px", fontSize: 18 }}>{t.errorTitle}</h3>
                <p style={{ color: isDark ? "#8888AA" : "#666", fontSize: 14, margin: "0 0 24px" }}>{errorMsg}</p>
                <button
                  onClick={handleReset}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: accentColor,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {t.back}
                </button>
              </div>
            )}

            {/* Footer */}
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: isDark ? "#333" : "#ccc" }}>
              powered by Techode
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes techode-booking-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes techode-booking-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
