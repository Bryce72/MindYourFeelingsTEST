Mood Kiosk – No-Node Starter
================================

Run without Node:
-----------------
Option A) VS Code "Live Server" extension (no system Node needed)
  1. Open this folder in VS Code
  2. Install the Live Server extension
  3. Right-click index.html → "Open with Live Server"

Option B) Python built-in server (macOS usually has Python 3)
  1. Open Terminal in this folder
  2. Run:  python3 -m http.server 8000
  3. Open: http://localhost:8000

Kiosk mode (tablet):
--------------------
- iPad: Settings → Accessibility → Guided Access → enable. Open site → triple‑click side button → Start.
- Android: Settings → Security → Screen pinning. Or use a kiosk browser. You can also install the PWA.

Device POST without Node:
-------------------------
- In index.html, set CONFIG.SEND_TO_DEVICE = true and CONFIG.DEVICE_URL to your device.
- This uses fetch(..., { mode: 'no-cors', headers: { 'Content-Type': 'text/plain' } }) to avoid a CORS preflight.
  The response is opaque (unreadable), but the device will likely receive the payload.
- If your site is HTTPS and your device is HTTP, modern browsers may block the request.
  For HTTPS kiosk deployments, you will need a small HTTPS proxy (which requires Node/another backend).

Files:
------
- index.html         → single-page app, painting canvas, and device POST stub
- manifest.webmanifest → PWA manifest (works on localhost or HTTPS)
- sw.js              → minimal service worker for offline (works on localhost/HTTPS)
