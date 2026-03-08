"use client";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BookingWidget: () => BookingWidget
});
module.exports = __toCommonJS(src_exports);

// src/components/BookingWidget.tsx
var import_react3 = require("react");

// src/components/CalendarGrid.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var DAYS_ES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
var DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
var MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function CalendarGrid({
  availability,
  selectedDate,
  onSelectDate,
  month,
  year,
  onChangeMonth,
  accentColor,
  theme,
  locale
}) {
  const isDark = theme === "dark";
  const days = locale === "es" ? DAYS_ES : DAYS_EN;
  const months = locale === "es" ? MONTHS_ES : MONTHS_EN;
  const availableDates = (0, import_react.useMemo)(
    () => new Set(availability.map((d) => d.date)),
    [availability]
  );
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const now = /* @__PURE__ */ new Date();
  const canGoPrev = !(month === now.getMonth() && year === now.getFullYear());
  const maxMonth = now.getMonth() + 1;
  const maxYear = maxMonth > 11 ? now.getFullYear() + 1 : now.getFullYear();
  const canGoNext = !(month === maxMonth % 12 && year === maxYear);
  function goPrev() {
    if (!canGoPrev) return;
    if (month === 0) onChangeMonth(11, year - 1);
    else onChangeMonth(month - 1, year);
  }
  function goNext() {
    if (!canGoNext) return;
    if (month === 11) onChangeMonth(0, year + 1);
    else onChangeMonth(month + 1, year);
  }
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: goPrev,
          disabled: !canGoPrev,
          style: {
            background: "none",
            border: "none",
            color: canGoPrev ? isDark ? "#fff" : "#000" : isDark ? "#333" : "#ccc",
            cursor: canGoPrev ? "pointer" : "default",
            fontSize: 20,
            padding: "4px 8px"
          },
          "aria-label": "Previous month",
          children: "\u2039"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontWeight: 600, color: isDark ? "#fff" : "#000" }, children: [
        months[month],
        " ",
        year
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: goNext,
          disabled: !canGoNext,
          style: {
            background: "none",
            border: "none",
            color: canGoNext ? isDark ? "#fff" : "#000" : isDark ? "#333" : "#ccc",
            cursor: canGoNext ? "pointer" : "default",
            fontSize: 20,
            padding: "4px 8px"
          },
          "aria-label": "Next month",
          children: "\u203A"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }, children: days.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        style: {
          textAlign: "center",
          fontSize: 12,
          fontWeight: 600,
          color: isDark ? "#8888AA" : "#666",
          padding: "4px 0"
        },
        children: d
      },
      d
    )) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }, children: cells.map((day, i) => {
      if (day === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}, `empty-${i}`);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isAvailable = availableDates.has(dateStr);
      const isSelected = selectedDate === dateStr;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: () => isAvailable && onSelectDate(dateStr),
          disabled: !isAvailable,
          style: {
            width: "100%",
            aspectRatio: "1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: isSelected ? `2px solid ${accentColor}` : "2px solid transparent",
            borderRadius: 8,
            background: isSelected ? `${accentColor}22` : "transparent",
            color: isAvailable ? isSelected ? accentColor : isDark ? "#fff" : "#000" : isDark ? "#333" : "#ccc",
            cursor: isAvailable ? "pointer" : "default",
            fontSize: 14,
            fontWeight: isSelected ? 700 : 400,
            transition: "all 0.15s ease"
          },
          children: day
        },
        dateStr
      );
    }) })
  ] });
}

// src/components/TimeSlots.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function TimeSlots({
  slots,
  selectedTime,
  onSelectTime,
  accentColor,
  theme
}) {
  const isDark = theme === "dark";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }, children: slots.map((slot) => {
    const timeStr = `${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}`;
    const isSelected = selectedTime === timeStr;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "button",
      {
        onClick: () => slot.available && onSelectTime(timeStr),
        disabled: !slot.available,
        style: {
          padding: "8px 16px",
          borderRadius: 8,
          border: isSelected ? `2px solid ${accentColor}` : `1px solid ${isDark ? "#1a1a2e" : "#ddd"}`,
          background: isSelected ? accentColor : slot.available ? isDark ? "#0d0d1a" : "#f5f5f5" : isDark ? "#0a0a14" : "#eee",
          color: isSelected ? "#fff" : slot.available ? isDark ? "#fff" : "#000" : isDark ? "#333" : "#ccc",
          cursor: slot.available ? "pointer" : "default",
          fontSize: 14,
          fontWeight: isSelected ? 600 : 400,
          transition: "all 0.15s ease",
          opacity: slot.available ? 1 : 0.4
        },
        children: timeStr
      },
      timeStr
    );
  }) });
}

// src/components/BookingForm.tsx
var import_react2 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var labels = {
  es: {
    name: "Nombre",
    email: "Email",
    service: "Servicio",
    message: "Mensaje (opcional)",
    messagePlaceholder: "Cuentanos brevemente sobre tu proyecto, empresa o presupuesto estimado",
    selectService: "Selecciona un servicio",
    submit: "Enviar solicitud",
    submitting: "Enviando..."
  },
  en: {
    name: "Name",
    email: "Email",
    service: "Service",
    message: "Message (optional)",
    messagePlaceholder: "Tell us briefly about your project, company or estimated budget",
    selectService: "Select a service",
    submit: "Send request",
    submitting: "Sending..."
  }
};
function BookingForm({
  services,
  onSubmit,
  loading,
  accentColor,
  theme,
  locale
}) {
  const isDark = theme === "dark";
  const t = labels[locale];
  const [name, setName] = (0, import_react2.useState)("");
  const [email, setEmail] = (0, import_react2.useState)("");
  const [service, setService] = (0, import_react2.useState)("");
  const [message, setMessage] = (0, import_react2.useState)("");
  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !service) return;
    onSubmit({ name: name.trim(), email: email.trim(), service, message: message.trim() });
  }
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${isDark ? "#1a1a2e" : "#ddd"}`,
    background: isDark ? "#0d0d1a" : "#fff",
    color: isDark ? "#fff" : "#000",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box"
  };
  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: isDark ? "#8888AA" : "#666",
    marginBottom: 4
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { style: labelStyle, children: [
        t.name,
        " *"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "input",
        {
          type: "text",
          value: name,
          onChange: (e) => setName(e.target.value),
          maxLength: 100,
          required: true,
          style: inputStyle
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { style: labelStyle, children: [
        t.email,
        " *"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "input",
        {
          type: "email",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          maxLength: 254,
          required: true,
          style: inputStyle
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { style: labelStyle, children: [
        t.service,
        " *"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "select",
        {
          value: service,
          onChange: (e) => setService(e.target.value),
          required: true,
          style: {
            ...inputStyle,
            cursor: "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238888AA' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: 32
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "", children: t.selectService }),
            services.map((s) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: s, children: s }, s))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: labelStyle, children: t.message }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "textarea",
        {
          value: message,
          onChange: (e) => setMessage(e.target.value),
          maxLength: 500,
          rows: 3,
          placeholder: t.messagePlaceholder,
          style: { ...inputStyle, resize: "vertical" }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "button",
      {
        type: "submit",
        disabled: loading || !name.trim() || !email.trim() || !service,
        style: {
          padding: "12px 24px",
          borderRadius: 8,
          border: "none",
          background: loading ? isDark ? "#333" : "#ccc" : `linear-gradient(135deg, ${accentColor}, #4A5EC8)`,
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          transition: "opacity 0.15s ease",
          opacity: loading || !name.trim() || !email.trim() || !service ? 0.6 : 1
        },
        children: loading ? t.submitting : t.submit
      }
    )
  ] });
}

// src/components/BookingWidget.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function formatReadableDate(dateStr, locale) {
  const [year, month, day] = dateStr.split("-");
  const monthsEs = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const months = locale === "es" ? monthsEs : monthsEn;
  const idx = parseInt(month, 10) - 1;
  const monthName = months[idx] || month;
  if (locale === "es") return `${parseInt(day)} de ${monthName} de ${year}`;
  return `${monthName} ${parseInt(day)}, ${year}`;
}
var DEFAULT_SERVICES_ES = ["Desarrollo Web", "Aplicacion Movil", "Diseno UI/UX", "Consultoria", "Otro"];
var DEFAULT_SERVICES_EN = ["Web Development", "Mobile App", "UI/UX Design", "Consulting", "Other"];
var texts = {
  es: {
    buttonText: "Agendar llamada",
    title: "Agendar una llamada",
    selectTime: "Selecciona un horario",
    duration: "Duracion",
    loading: "Cargando disponibilidad",
    noSlots: "No hay horarios disponibles este mes. Prueba el siguiente.",
    successTitle: "Solicitud enviada",
    successMsg: "Recibimos tu solicitud. Te confirmaremos la reunion por correo a la brevedad.",
    errorTitle: "Error al agendar",
    back: "Volver",
    close: "Cerrar",
    newBooking: "Agendar otra"
  },
  en: {
    buttonText: "Book a call",
    title: "Book a call",
    selectTime: "Select a time",
    duration: "Duration",
    loading: "Loading availability",
    noSlots: "No slots available this month. Try the next one.",
    successTitle: "Request sent",
    successMsg: "We received your request. We'll confirm the meeting by email shortly.",
    errorTitle: "Booking error",
    back: "Back",
    close: "Close",
    newBooking: "Book another"
  }
};
function Spinner({ color }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "div",
    {
      style: {
        width: 28,
        height: 28,
        border: `3px solid ${color}30`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "techode-booking-spin 0.7s linear infinite"
      }
    }
  ) });
}
function BookingWidget({
  apiUrl,
  theme = "dark",
  accentColor = "#2DBFAD",
  locale = "es",
  durationLabel = "60 min",
  services,
  buttonText
}) {
  const isDark = theme === "dark";
  const t = texts[locale];
  const serviceOptions = services || (locale === "es" ? DEFAULT_SERVICES_ES : DEFAULT_SERVICES_EN);
  const [isOpen, setIsOpen] = (0, import_react3.useState)(false);
  const [isClosing, setIsClosing] = (0, import_react3.useState)(false);
  const [step, setStep] = (0, import_react3.useState)("calendar");
  const [loadingAvailability, setLoadingAvailability] = (0, import_react3.useState)(false);
  const [loadingBooking, setLoadingBooking] = (0, import_react3.useState)(false);
  const [availability, setAvailability] = (0, import_react3.useState)([]);
  const [errorMsg, setErrorMsg] = (0, import_react3.useState)("");
  const [month, setMonth] = (0, import_react3.useState)(() => (/* @__PURE__ */ new Date()).getMonth());
  const [year, setYear] = (0, import_react3.useState)(() => (/* @__PURE__ */ new Date()).getFullYear());
  const [selectedDate, setSelectedDate] = (0, import_react3.useState)(null);
  const [selectedTime, setSelectedTime] = (0, import_react3.useState)(null);
  const selectedSlots = (0, import_react3.useMemo)(() => {
    if (!selectedDate) return [];
    const day = availability.find((d) => d.date === selectedDate);
    return day?.slots || [];
  }, [selectedDate, availability]);
  const fetchAvailability = (0, import_react3.useCallback)(async (m, y) => {
    setLoadingAvailability(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "availability", month: m, year: y })
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
  (0, import_react3.useEffect)(() => {
    if (isOpen) {
      const now = /* @__PURE__ */ new Date();
      setMonth(now.getMonth());
      setYear(now.getFullYear());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  (0, import_react3.useEffect)(() => {
    if (isOpen) {
      fetchAvailability(month, year);
    }
  }, [isOpen, month, year, fetchAvailability]);
  (0, import_react3.useEffect)(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);
  function handleChangeMonth(m, y) {
    setMonth(m);
    setYear(y);
    setSelectedDate(null);
    setSelectedTime(null);
  }
  function handleSelectDate(date) {
    setSelectedDate(date);
    setSelectedTime(null);
  }
  function handleSelectTime(time) {
    setSelectedTime(time);
    setStep("form");
  }
  async function handleBook(formData) {
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
          time: selectedTime
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStep("success");
      } else {
        setErrorMsg(data.error || "Error al agendar");
        if (res.status === 409) {
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
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setStep("calendar");
      setSelectedDate(null);
      setSelectedTime(null);
      setErrorMsg("");
    }, 200);
  }
  function handleReset() {
    setStep("calendar");
    setSelectedDate(null);
    setSelectedTime(null);
    setErrorMsg("");
    fetchAvailability(month, year);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        onClick: () => setIsOpen(true),
        style: {
          padding: "12px 24px",
          borderRadius: 8,
          border: `2px solid ${accentColor}`,
          background: "transparent",
          color: accentColor,
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontFamily: "Inter, system-ui, sans-serif"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.background = `${accentColor}15`;
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.background = "transparent";
        },
        children: buttonText || t.buttonText
      }
    ),
    isOpen && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "div",
      {
        onClick: handleClose,
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16,
          animation: isClosing ? "techode-booking-fade-out 0.2s ease forwards" : "techode-booking-fade-in 0.2s ease"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            onClick: (e) => e.stopPropagation(),
            style: {
              width: "100%",
              maxWidth: 440,
              maxHeight: "90vh",
              overflowY: "auto",
              background: isDark ? "#080812" : "#fff",
              borderRadius: 16,
              border: `1px solid ${isDark ? "#1a1a2e" : "#e0e0e0"}`,
              padding: 24,
              fontFamily: "Inter, system-ui, sans-serif",
              animation: isClosing ? "techode-booking-slide-down 0.2s ease forwards" : "techode-booking-slide-up 0.3s ease"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700, color: isDark ? "#fff" : "#000" }, children: t.title }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  "button",
                  {
                    onClick: handleClose,
                    style: {
                      background: "none",
                      border: "none",
                      color: isDark ? "#8888AA" : "#999",
                      fontSize: 24,
                      cursor: "pointer",
                      padding: "0 4px",
                      lineHeight: 1
                    },
                    "aria-label": "Close",
                    children: "\xD7"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: {
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 20,
                background: `${accentColor}15`,
                color: accentColor,
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 16
              }, children: [
                t.duration,
                ": ",
                durationLabel
              ] }),
              step === "calendar" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_jsx_runtime4.Fragment, { children: loadingAvailability ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { textAlign: "center" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Spinner, { color: accentColor }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { color: isDark ? "#8888AA" : "#999", fontSize: 14, margin: 0 }, children: t.loading })
              ] }) : availability.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { textAlign: "center", padding: "40px 0", color: isDark ? "#8888AA" : "#999" }, children: t.noSlots }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  CalendarGrid,
                  {
                    availability,
                    selectedDate,
                    onSelectDate: handleSelectDate,
                    month,
                    year,
                    onChangeMonth: handleChangeMonth,
                    accentColor,
                    theme,
                    locale
                  }
                ),
                selectedDate && selectedSlots.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { marginTop: 16 }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { fontSize: 14, fontWeight: 500, color: isDark ? "#8888AA" : "#666", margin: "0 0 8px" }, children: t.selectTime }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    TimeSlots,
                    {
                      slots: selectedSlots,
                      selectedTime,
                      onSelectTime: handleSelectTime,
                      accentColor,
                      theme
                    }
                  )
                ] })
              ] }) }),
              step === "form" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                  "button",
                  {
                    onClick: () => setStep("calendar"),
                    style: {
                      background: "none",
                      border: "none",
                      color: accentColor,
                      cursor: "pointer",
                      fontSize: 14,
                      padding: 0,
                      marginBottom: 8
                    },
                    children: [
                      "\u2190 ",
                      t.back
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: {
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: `${accentColor}10`,
                  color: isDark ? "#fff" : "#000",
                  fontSize: 14,
                  marginBottom: 8
                }, children: [
                  selectedDate ? formatReadableDate(selectedDate, locale) : selectedDate,
                  " \u2014 ",
                  selectedTime,
                  " hrs"
                ] }),
                errorMsg && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { padding: "8px 12px", borderRadius: 8, background: "#ff444420", color: "#ff6666", fontSize: 13, marginBottom: 8 }, children: errorMsg }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  BookingForm,
                  {
                    services: serviceOptions,
                    onSubmit: handleBook,
                    loading: loadingBooking,
                    accentColor,
                    theme,
                    locale
                  }
                )
              ] }),
              step === "success" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { textAlign: "center", padding: "24px 0" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 48, marginBottom: 16 }, children: "\u2713" }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { style: { color: accentColor, margin: "0 0 8px", fontSize: 18 }, children: t.successTitle }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { color: isDark ? "#8888AA" : "#666", fontSize: 14, margin: "0 0 24px" }, children: t.successMsg }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: 8, justifyContent: "center" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "button",
                    {
                      onClick: handleClose,
                      style: {
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: `1px solid ${isDark ? "#1a1a2e" : "#ddd"}`,
                        background: "transparent",
                        color: isDark ? "#fff" : "#000",
                        cursor: "pointer",
                        fontSize: 14
                      },
                      children: t.close
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "button",
                    {
                      onClick: handleReset,
                      style: {
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: accentColor,
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600
                      },
                      children: t.newBooking
                    }
                  )
                ] })
              ] }),
              step === "error" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { textAlign: "center", padding: "24px 0" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 48, marginBottom: 16 }, children: "\u2715" }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { style: { color: "#ff6666", margin: "0 0 8px", fontSize: 18 }, children: t.errorTitle }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { color: isDark ? "#8888AA" : "#666", fontSize: 14, margin: "0 0 24px" }, children: errorMsg }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  "button",
                  {
                    onClick: handleReset,
                    style: {
                      padding: "10px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: accentColor,
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600
                    },
                    children: t.back
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { textAlign: "center", marginTop: 20, fontSize: 11, color: isDark ? "#333" : "#ccc" }, children: "powered by Techode" })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("style", { children: `
        @keyframes techode-booking-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes techode-booking-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes techode-booking-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes techode-booking-slide-down {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.98); }
        }
        @keyframes techode-booking-spin {
          to { transform: rotate(360deg); }
        }
      ` })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BookingWidget
});
