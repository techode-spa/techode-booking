import { useState, useMemo } from "react";
import type { DayAvailability } from "../types";

interface CalendarGridProps {
  availability: DayAvailability[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  month: number;
  year: number;
  onChangeMonth: (month: number, year: number) => void;
  accentColor: string;
  theme: "dark" | "light";
  locale: "es" | "en";
}

const DAYS_ES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarGrid({
  availability,
  selectedDate,
  onSelectDate,
  month,
  year,
  onChangeMonth,
  accentColor,
  theme,
  locale,
}: CalendarGridProps) {
  const isDark = theme === "dark";
  const days = locale === "es" ? DAYS_ES : DAYS_EN;
  const months = locale === "es" ? MONTHS_ES : MONTHS_EN;

  const availableDates = useMemo(
    () => new Set(availability.map((d) => d.date)),
    [availability]
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday = 0, adjust from getDay() where Sunday = 0
  const firstDayOfWeek = ((new Date(year, month, 1).getDay() + 6) % 7);

  const now = new Date();
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

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          style={{
            background: "none",
            border: "none",
            color: canGoPrev ? (isDark ? "#fff" : "#000") : (isDark ? "#333" : "#ccc"),
            cursor: canGoPrev ? "pointer" : "default",
            fontSize: 20,
            padding: "4px 8px",
          }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span style={{ fontWeight: 600, color: isDark ? "#fff" : "#000" }}>
          {months[month]} {year}
        </span>
        <button
          onClick={goNext}
          disabled={!canGoNext}
          style={{
            background: "none",
            border: "none",
            color: canGoNext ? (isDark ? "#fff" : "#000") : (isDark ? "#333" : "#ccc"),
            cursor: canGoNext ? "pointer" : "default",
            fontSize: 20,
            padding: "4px 8px",
          }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {days.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              color: isDark ? "#8888AA" : "#666",
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isAvailable = availableDates.has(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              disabled={!isAvailable}
              style={{
                width: "100%",
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: isSelected ? `2px solid ${accentColor}` : "2px solid transparent",
                borderRadius: 8,
                background: isSelected ? `${accentColor}22` : "transparent",
                color: isAvailable
                  ? isSelected
                    ? accentColor
                    : isDark ? "#fff" : "#000"
                  : isDark ? "#333" : "#ccc",
                cursor: isAvailable ? "pointer" : "default",
                fontSize: 14,
                fontWeight: isSelected ? 700 : 400,
                transition: "all 0.15s ease",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
