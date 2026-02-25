# Specification

## Summary
**Goal:** Fix booking creation and address saving errors in the Bhangar Wala app so users can successfully add addresses and create scrap pickup bookings.

**Planned changes:**
- Fix the `addAddress` frontend call: correctly read userId from localStorage (plain phone number without country code), ensure required fields (street, city, pincode) are validated before submission, default address label to a valid value if unset, serialize optional lat/lng as `null` instead of undefined/empty string, and navigate to `/addresses` on success
- Fix the `createBooking` frontend call: strip '+91' prefix from userId, block progression if no addresses exist, serialize `scheduledTime` as an integer timestamp, ensure BookingItems array is non-empty with valid categoryId and positive estimatedWeight, compute `totalEstimatedAmount` as a valid Float, and navigate to `/booking-confirmation` on success
- Add proper try/catch error handling on both frontend calls with descriptive inline error messages shown to the user on failure
- Audit and fix `addAddress` and `createBooking` backend method signatures in `backend/main.mo` to accept the correct types (Text userId, Float weights, Int timestamps, `?Float` for optional lat/lng), handle edge-case inputs gracefully, and return descriptive `#err` variants instead of trapping

**User-visible outcome:** Users can successfully save a new address on the Add Address screen and complete the full Book Pickup flow without errors, with the new booking appearing on the confirmation screen.
