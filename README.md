# QR Studio

A private, frontend-only QR code generator built with React, TypeScript, Tailwind CSS, and shadcn-style UI components.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Build

```bash
npm run build
```

## Features

- Live QR preview in the browser
- URL, text, email, phone, SMS, Wi-Fi, vCard, event, WhatsApp, and Bitcoin QR payloads
- Custom dot, corner, color, gradient, background, margin, size, and logo settings
- PNG, SVG, JPEG, and WebP export
- Local preset saving through `localStorage`
- Scanability score with contrast and logo safety warnings

No backend is required unless dynamic QR codes, analytics, user accounts, or saved cloud projects are added later.
