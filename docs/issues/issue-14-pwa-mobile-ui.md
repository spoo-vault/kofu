# [DRIPS-14]: Progressive Web App (PWA) & Mobile UX Optimization

## Context & Problem
Freelancers and gig workers predominantly manage task agreements and track payment releases on mobile smartphones. Converting POKA into an installable **Progressive Web App (PWA)** with responsive layouts, push notifications for escrow funding, and offline caching improves real-world accessibility.

## Scope & Target Files
- Target files:
  - `client/public/manifest.json` (Web App Manifest)
  - `client/src/service-worker.ts` (Offline caching & push notification handler)
  - `client/vite.config.ts` (Vite PWA plugin integration)

## Acceptance Criteria
- [ ] Add `vite-plugin-pwa` with web app manifest and icons.
- [ ] Support installation on iOS and Android home screens.
- [ ] Implement push notification trigger when Sentinel releases escrow payment.
- [ ] Test mobile responsiveness across phone screen sizes (375px - 430px).

## Bounty Weight
- **Difficulty**: Good First Issue
- **Category**: Frontend / Mobile
- **Drips Allocation**: 110 Drips Points
