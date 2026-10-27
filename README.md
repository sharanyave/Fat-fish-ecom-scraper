# Ionic + Capacitor Product Data Extractor

A cross-platform UI demo built with **Ionic React, TypeScript, Vite, and Capacitor**. It connects to the existing Express extraction API in the parent `server` project.

This is a portfolio demonstration of Ionic's mobile-first component system and Capacitor's native app runtime. It is not an archived Fat Fish Marketing deliverable.

## What this demonstrates

- Ionic React components for a responsive, mobile-first interface
- React and TypeScript application structure
- Capacitor runtime detection using `Capacitor.getPlatform()` and `Capacitor.isNativePlatform()`
- API integration with an Express backend
- Product search/filtering and JSON export
- A demo mode that works without a live extraction request

## Prerequisites

- Node.js 20+ and npm
- For Android builds: Android Studio and Android SDK
- For iOS builds: macOS and Xcode

## Run the Ionic web preview

From this directory:

```bash
npm install
npm run dev
```

Open `http://localhost:8100`. Demo records load by default.

## Connect the backend

In another terminal, start the Express API:

```bash
cd ../server
npm install
CLIENT_ORIGIN=http://localhost:8100 npm run dev
```

The API defaults to port 3001. For a remote or deployed API, create `.env.local` in this directory:

```bash
VITE_API_BASE_URL=https://your-api-host.example
```

Restart Vite after changing environment variables. Never put secrets in `VITE_*` variables; these are bundled into the client.

## Build and package for native platforms

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

For iOS on macOS with Xcode:

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

Run `npx cap add android` and/or `npx cap add ios` only once per platform; these commands generate native project directories. After changing web code, run `npm run build` and `npx cap sync`.

## Native API integration

The app uses `Capacitor.getPlatform()` and `Capacitor.isNativePlatform()` to show the current runtime. You can extend it with Capacitor plugins such as Camera or Preferences and sync the native projects.

## Notes and limitations

- Live extraction requires the Express API to be running and reachable from the device. On a physical phone, `localhost` means the phone itself, not your development computer.
- A physical device needs a deployed HTTPS API or a reachable development-machine LAN address.
- Public page extraction must respect site terms and access restrictions. Do not bypass authentication, CAPTCHAs, paywalls, or anti-bot controls.
- The source is provided as a portfolio starter; native builds and device behavior still need to be verified in Android Studio/Xcode.
