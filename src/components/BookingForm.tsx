import { useState } from "react";

interface BookingFormProps {
  services: string[];
  onSubmit: (data: { name: string; email: string; service: string; message: string }) => void;
  loading: boolean;
  accentColor: string;
  secondaryColor: string;
  theme: "dark" | "light";
  locale: "es" | "en";
  customTexts?: Partial<typeof labels["es"]>;
}

const labels = {
  es: {
    name: "Nombre",
    email: "Email",
    service: "Servicio",
    message: "Mensaje (opcional)",
    messagePlaceholder: "Cuentanos brevemente sobre tu proyecto, empresa o presupuesto estimado",
    selectService: "Selecciona un servicio",
    submit: "Enviar solicitud",
    submitting: "Enviando...",
  },
  en: {
    name: "Name",
    email: "Email",
    service: "Service",
    message: "Message (optional)",
    messagePlaceholder: "Tell us briefly about your project, company or estimated budget",
    selectService: "Select a service",
    submit: "Send request",
    submitting: "Sending...",
  },
};

export default function BookingForm({
  services,
  onSubmit,
  loading,
  accentColor,
  secondaryColor,
  theme,
  locale,
  customTexts,
}: BookingFormProps) {
  const isDark = theme === "dark";
  const filtered = Object.fromEntries(
    Object.entries(customTexts ?? {}).filter(([, v]) => v !== undefined)
  );
  const t = { ...labels[locale], ...filtered };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !service) return;
    onSubmit({ name: name.trim(), email: email.trim(), service, message: message.trim() });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${isDark ? "#1a1a2e" : "#ddd"}`,
    background: isDark ? "#0d0d1a" : "#fff",
    color: isDark ? "#fff" : "#000",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: isDark ? "#8888AA" : "#666",
    marginBottom: 4,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
      <div>
        <label style={labelStyle}>{t.name} *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>{t.email} *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>{t.service} *</label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
          style={{
            ...inputStyle,
            cursor: "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238888AA' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: 32,
          }}
        >
          <option value="">{t.selectService}</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>{t.message}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={t.messagePlaceholder}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim() || !email.trim() || !service}
        style={{
          padding: "12px 24px",
          borderRadius: 8,
          border: "none",
          background: loading ? (isDark ? "#333" : "#ccc") : `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          transition: "opacity 0.15s ease",
          opacity: loading || !name.trim() || !email.trim() || !service ? 0.6 : 1,
        }}
      >
        {loading ? t.submitting : t.submit}
      </button>
    </form>
  );
}
