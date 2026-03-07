# @techode/booking

Embeddable booking widget for React/Next.js projects. Powered by Google Calendar.

## Features

- Calendar-based appointment scheduling
- Google Calendar integration (availability + event creation)
- Confirmation emails via Resend
- Dark/Light theme with customizable accent color
- Bilingual (Spanish/English)
- Rate limiting and input validation
- Responsive modal design

## Installation

```bash
npm install github:techode-spa/techode-booking
```

## Quick Start

### 1. Set up Google Calendar

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Calendar API
3. Create a Service Account and download the JSON credentials
4. Share your Google Calendar with the service account email (grant "Make changes to events" permission)

### 2. Create the API route

Create `src/app/api/booking/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createBookingHandler } from "@techode/booking/api";

const handler = createBookingHandler({
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID!,
  googleCredentials: process.env.GOOGLE_CREDENTIALS!,
  resendApiKey: process.env.RESEND_API_KEY!,
  notifyEmail: "your@email.com",
  availableDays: [1, 2, 3, 4, 5], // Mon-Fri
  availableHours: { start: 14, end: 19 },
  duration: 60,
  timezone: "America/Santiago",
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ip = req.headers.get("x-forwarded-for") ?? req.ip ?? "unknown";
  const { action, ...rest } = body;
  const result = await handler({ action, body: rest, ip });
  return NextResponse.json(result.body, { status: result.status });
}
```

### 3. Add environment variables

```env
GOOGLE_CALENDAR_ID=your@gmail.com
GOOGLE_CREDENTIALS=<base64 encoded service account JSON>
RESEND_API_KEY=re_...
```

### 4. Add the widget

```tsx
import { BookingWidget } from "@techode/booking";

<BookingWidget
  apiUrl="/api/booking"
  theme="dark"
  accentColor="#2DBFAD"
  locale="es"
  durationLabel="60 min"
/>
```

## Widget Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `apiUrl` | `string` | *required* | Your `/api/booking` endpoint |
| `theme` | `"dark" \| "light"` | `"dark"` | Widget theme |
| `accentColor` | `string` | `"#2DBFAD"` | Primary color |
| `locale` | `"es" \| "en"` | `"es"` | Language |
| `durationLabel` | `string` | `"60 min"` | Duration shown to user |
| `services` | `string[]` | Auto by locale | Service options for select |
| `buttonText` | `string` | Auto by locale | Trigger button text |

## Handler Options

| Option | Type | Default | Description |
|---|---|---|---|
| `googleCalendarId` | `string` | *required* | Google Calendar ID |
| `googleCredentials` | `string` | *required* | Service account JSON (raw or base64) |
| `resendApiKey` | `string` | *required* | Resend API key |
| `notifyEmail` | `string` | *required* | Email for booking notifications |
| `availableDays` | `number[]` | `[1,2,3,4,5]` | Available days (0=Sun, 6=Sat) |
| `availableHours` | `{start, end}` | `{start:14, end:19}` | Hour range |
| `duration` | `number` | `60` | Minutes per appointment |
| `timezone` | `string` | `"America/Santiago"` | IANA timezone |
| `bufferMinutes` | `number` | `15` | Buffer between appointments |
| `rateLimit` | `number` | `5` | Max bookings per hour per IP |

## License

MIT — Built by [Techode](https://techode.dev)
