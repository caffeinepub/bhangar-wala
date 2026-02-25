# Specification

## Summary
**Goal:** Replace the phone OTP authentication flow with Internet Identity (supporting Google, Apple, Microsoft, and passkey sign-in) across the frontend.

**Planned changes:**
- Replace the Login screen (`/login`) phone number input, country code selector, OTP fields, and terms checkbox with a single "Sign In with Internet Identity" button that triggers the Internet Identity popup via `useInternetIdentity`
- After successful login, redirect users without a profile to `/profile-setup` and returning users to `/home`
- Remove the `/otp-verification` route and page; redirect any navigation to it back to `/login`
- Update the Splash screen to determine auth state from `useInternetIdentity` instead of localStorage
- Update the Logout button on the Profile screen to call the Internet Identity `logout` method and redirect to `/login`
- Update the Layout component to guard protected routes using `useInternetIdentity` instead of localStorage
- Update the Profile Setup screen to derive the user identifier from the Internet Identity principal; make the phone field optional
- Update all query hooks in `useQueries.ts` to use the Internet Identity principal instead of a localStorage phone key for backend calls

**User-visible outcome:** Users log in via Internet Identity (Google, Apple, Microsoft, or passkey) instead of phone OTP. The app correctly handles session state, profile setup for new users, and logout entirely through Internet Identity.
