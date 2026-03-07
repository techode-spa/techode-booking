import type { TimeSlot } from "../types";

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  accentColor: string;
  theme: "dark" | "light";
}

export default function TimeSlots({
  slots,
  selectedTime,
  onSelectTime,
  accentColor,
  theme,
}: TimeSlotsProps) {
  const isDark = theme === "dark";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
      {slots.map((slot) => {
        const timeStr = `${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}`;
        const isSelected = selectedTime === timeStr;

        return (
          <button
            key={timeStr}
            onClick={() => slot.available && onSelectTime(timeStr)}
            disabled={!slot.available}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: isSelected ? `2px solid ${accentColor}` : `1px solid ${isDark ? "#1a1a2e" : "#ddd"}`,
              background: isSelected ? accentColor : slot.available ? (isDark ? "#0d0d1a" : "#f5f5f5") : (isDark ? "#0a0a14" : "#eee"),
              color: isSelected ? "#fff" : slot.available ? (isDark ? "#fff" : "#000") : (isDark ? "#333" : "#ccc"),
              cursor: slot.available ? "pointer" : "default",
              fontSize: 14,
              fontWeight: isSelected ? 600 : 400,
              transition: "all 0.15s ease",
              opacity: slot.available ? 1 : 0.4,
            }}
          >
            {timeStr}
          </button>
        );
      })}
    </div>
  );
}
