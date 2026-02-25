# Specification

## Summary
**Goal:** Revert the authentication flow back to phone OTP login, removing Internet Identity (II) integration from all user-facing screens.

**Planned changes:**
- Restore the `/login` screen with a phone number input, country code selector (defaulting to +91), "Send OTP" button, and terms & conditions checkbox; remove the II "Sign In" button and any II-related error/retry UI
- Restore the `/otp-verification` page with 6 individual digit input boxes, a 60-second countdown timer, a "Resend OTP" button (enabled only after timer expires), a "Verify" button, and a helper hint; navigate new users to `/profile-setup` and returning users to `/home` on success; save auth session to localStorage
- Restore `/profile-setup` to read the phone number from localStorage as the user identifier and make the phone field required when calling `createUserProfile`
- Restore the `/splash` screen redirect logic to use localStorage session detection (redirect to `/home` if authenticated, `/login` if not) instead of II initialization state
- Restore the `/profile` logout action to clear localStorage and redirect to `/login` without calling any II logout method

**User-visible outcome:** Users can log in using their phone number and OTP as before, with session management handled via localStorage throughout the app.
