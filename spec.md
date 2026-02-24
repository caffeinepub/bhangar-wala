# Specification

## Summary
**Goal:** Deploy the Bhangar Wala application (backend Motoko canister and frontend React PWA) to the Internet Computer mainnet so it is publicly accessible.

**Planned changes:**
- Deploy the backend Motoko canister to the IC mainnet with all existing API methods callable.
- Deploy the frontend React PWA to the IC mainnet, accessible via a public `https://<canister-id>.icp0.io` URL.
- Ensure the PWA manifest and service worker are served correctly on the live URL.
- Verify all existing features (auth, bookings, payments, notifications, etc.) function correctly on the live deployment.

**User-visible outcome:** The Bhangar Wala app is live on the Internet Computer mainnet and accessible to the public via a live IC URL on mobile browsers.
