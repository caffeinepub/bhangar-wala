import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ── Access Control ──────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // ── Types ───────────────────────────────────────────────────────
  public type UserProfile = {
    id : Principal;
    phone : Text;
    name : Text;
    profileImage : Text;
  };

  public type Address = {
    id : Nat;
    userId : Principal;
    addressLabel : Text;
    street : Text;
    city : Text;
    pincode : Text;
    lat : ?Float;
    lng : ?Float;
  };

  public type ScrapCategory = {
    id : Nat;
    name : Text;
    parentId : ?Nat;
    unit : Text;
  };

  public type ScrapRate = {
    id : Nat;
    categoryId : Nat;
    pricePerKg : Float;
  };

  public type BookingStatus = {
    #pending;
    #confirmed;
    #partner_assigned;
    #on_the_way;
    #arrived;
    #completed;
    #cancelled;
  };

  public type Booking = {
    id : Nat;
    userId : Principal;
    addressId : Nat;
    status : BookingStatus;
    scheduledTime : Int;
    partnerId : ?Nat;
    totalEstimatedAmount : Float;
    totalFinalAmount : ?Float;
  };

  public type BookingItem = {
    id : Nat;
    bookingId : Nat;
    categoryId : Nat;
    estimatedWeight : Float;
    finalWeight : ?Float;
  };

  public type Partner = {
    id : Nat;
    name : Text;
    phone : Text;
    vehicle : Text;
    rating : Float;
    active : Bool;
  };

  public type PaymentStatus = {
    #pending;
    #completed;
    #failed;
    #refunded;
  };

  public type PaymentMethod = {
    #cash;
    #upi;
  };

  public type Payment = {
    id : Nat;
    bookingId : Nat;
    amount : Float;
    method : PaymentMethod;
    status : PaymentStatus;
    transactionId : ?Text;
  };

  public type Rating = {
    id : Nat;
    bookingId : Nat;
    userId : Principal;
    partnerId : Nat;
    stars : Nat;
    comment : ?Text;
  };

  public type Notification = {
    id : Nat;
    userId : Principal;
    icon : Text;
    title : Text;
    message : Text;
    timestamp : Int;
    isRead : Bool;
  };

  public type SupportTicket = {
    id : Nat;
    userId : Principal;
    subject : Text;
    message : Text;
    timestamp : Int;
  };

  public type ScrapRateWithCategory = {
    id : Nat;
    categoryId : Nat;
    pricePerKg : Float;
    categoryName : Text;
  };

  // ── State ────────────────────────────────────────────────────────
  var userProfiles = Map.empty<Principal, UserProfile>();
  var addresses = Map.empty<Nat, Address>();
  var scrapCategories = Map.empty<Nat, ScrapCategory>();
  var scrapRates = Map.empty<Nat, ScrapRate>();
  var bookings = Map.empty<Nat, Booking>();
  var bookingItems = Map.empty<Nat, BookingItem>();
  var partners = Map.empty<Nat, Partner>();
  var payments = Map.empty<Nat, Payment>();
  var ratings = Map.empty<Nat, Rating>();
  var notifications = Map.empty<Nat, Notification>();
  var supportTickets = Map.empty<Nat, SupportTicket>();

  var nextAddressId : Nat = 1;
  var nextBookingId : Nat = 1;
  var nextBookingItemId : Nat = 1;
  var nextPaymentId : Nat = 1;
  var nextRatingId : Nat = 1;
  var nextNotificationId : Nat = 1;
  var nextTicketId : Nat = 1;

  // ── Booking Phase ────────────────────────────────────────────────
  public query func getBookingPhase(status : BookingStatus) : async Text {
    switch (status) {
      case (#pending) { "pending" };
      case (#confirmed) { "confirmed" };
      case (#partner_assigned) { "partner_assigned" };
      case (#on_the_way) { "on_the_way" };
      case (#arrived) { "arrived" };
      case (#completed) { "completed" };
      case (#cancelled) { "cancelled" };
    };
  };

  // ── Seed Data ────────────────────────────────────────────────────
  scrapCategories := Map.empty<Nat, ScrapCategory>();
  scrapCategories.add(
    1,
    {
      id = 1;
      name = "Paper";
      parentId = null;
      unit = "kg";
    },
  );
  scrapCategories.add(
    2,
    {
      id = 2;
      name = "Metal";
      parentId = null;
      unit = "kg";
    },
  );
  scrapCategories.add(
    3,
    {
      id = 3;
      name = "Plastic";
      parentId = null;
      unit = "kg";
    },
  );
  scrapCategories.add(
    4,
    {
      id = 4;
      name = "Electronics";
      parentId = null;
      unit = "kg";
    },
  );
  scrapCategories.add(
    5,
    {
      id = 5;
      name = "Newspaper";
      parentId = ?1;
      unit = "kg";
    },
  );
  scrapCategories.add(
    6,
    {
      id = 6;
      name = "Cardboard";
      parentId = ?1;
      unit = "kg";
    },
  );
  scrapCategories.add(
    7,
    {
      id = 7;
      name = "Iron";
      parentId = ?2;
      unit = "kg";
    },
  );
  scrapCategories.add(
    8,
    {
      id = 8;
      name = "Copper";
      parentId = ?2;
      unit = "kg";
    },
  );
  scrapCategories.add(
    9,
    {
      id = 9;
      name = "PET Bottles";
      parentId = ?3;
      unit = "kg";
    },
  );
  scrapCategories.add(
    10,
    {
      id = 10;
      name = "Hard Plastic";
      parentId = ?3;
      unit = "kg";
    },
  );
  scrapCategories.add(
    11,
    {
      id = 11;
      name = "Mobile";
      parentId = ?4;
      unit = "kg";
    },
  );
  scrapCategories.add(
    12,
    {
      id = 12;
      name = "Laptop";
      parentId = ?4;
      unit = "kg";
    },
  );

  scrapRates := Map.empty<Nat, ScrapRate>();
  scrapRates.add(
    1,
    {
      id = 1;
      categoryId = 5;
      pricePerKg = 12.0;
    },
  );
  scrapRates.add(
    2,
    {
      id = 2;
      categoryId = 6;
      pricePerKg = 8.0;
    },
  );
  scrapRates.add(
    3,
    {
      id = 3;
      categoryId = 7;
      pricePerKg = 30.0;
    },
  );
  scrapRates.add(
    4,
    {
      id = 4;
      categoryId = 8;
      pricePerKg = 450.0;
    },
  );
  scrapRates.add(
    5,
    {
      id = 5;
      categoryId = 9;
      pricePerKg = 15.0;
    },
  );
  scrapRates.add(
    6,
    {
      id = 6;
      categoryId = 10;
      pricePerKg = 10.0;
    },
  );
  scrapRates.add(
    7,
    {
      id = 7;
      categoryId = 11;
      pricePerKg = 50.0;
    },
  );
  scrapRates.add(
    8,
    {
      id = 8;
      categoryId = 12;
      pricePerKg = 100.0;
    },
  );

  partners := Map.empty<Nat, Partner>();
  partners.add(
    1,
    {
      id = 1;
      name = "Ravi Kumar";
      phone = "+91-9876543210";
      vehicle = "Mini Truck";
      rating = 4.5;
      active = true;
    },
  );
  partners.add(
    2,
    {
      id = 2;
      name = "Suresh Singh";
      phone = "+91-9876543211";
      vehicle = "Tempo";
      rating = 4.2;
      active = true;
    },
  );
  partners.add(
    3,
    {
      id = 3;
      name = "Amit Sharma";
      phone = "+91-9876543212";
      vehicle = "Cycle Cart";
      rating = 4.8;
      active = false;
    },
  );
  partners.add(
    4,
    {
      id = 4;
      name = "Sunita Reddy";
      phone = "+91-9876543213";
      vehicle = "Mini Truck";
      rating = 4.6;
      active = true;
    },
  );
  partners.add(
    5,
    {
      id = 5;
      name = "Mohan Lal";
      phone = "+91-9876543214";
      vehicle = "Tempo";
      rating = 4.9;
      active = true;
    },
  );

  // ── User Profile ─────────────────────────────────────────────────
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Caller can view their own profile; admins can view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can save profiles");
    };
    userProfiles.add(caller, { profile with id = caller });
  };

  // ── Addresses ────────────────────────────────────────────────────
  public query ({ caller }) func getAddresses() : async [Address] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view addresses");
    };
    let all = addresses.values().toArray();
    all.filter(func(a : Address) : Bool { a.userId == caller });
  };

  public query ({ caller }) func getAddressById(id : Nat) : async Address {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view addresses");
    };
    switch (addresses.get(id)) {
      case (?addr) {
        if (addr.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own addresses");
        };
        addr;
      };
      case (null) { Runtime.trap("Address not found") };
    };
  };

  public shared ({ caller }) func addAddress(addressLabel : Text, street : Text, city : Text, pincode : Text, lat : ?Float, lng : ?Float) : async Address {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can add addresses");
    };
    let id = nextAddressId;
    nextAddressId += 1;
    let addr : Address = {
      id;
      userId = caller;
      addressLabel;
      street;
      city;
      pincode;
      lat;
      lng;
    };
    addresses.add(id, addr);
    addr;
  };

  public shared ({ caller }) func updateAddress(id : Nat, addressLabel : Text, street : Text, city : Text, pincode : Text, lat : ?Float, lng : ?Float) : async Address {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can update addresses");
    };
    switch (addresses.get(id)) {
      case (?addr) {
        if (addr.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own addresses");
        };
        let updated : Address = { addr with addressLabel; street; city; pincode; lat; lng };
        addresses.add(id, updated);
        updated;
      };
      case (null) { Runtime.trap("Address not found") };
    };
  };

  public shared ({ caller }) func deleteAddress(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can delete addresses");
    };
    switch (addresses.get(id)) {
      case (?addr) {
        if (addr.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own addresses");
        };
        addresses.remove(id);
      };
      case (null) { Runtime.trap("Address not found") };
    };
  };

  // ── Scrap Categories (public read) ───────────────────────────────
  public query func getScrapCategories() : async [ScrapCategory] {
    scrapCategories.values().toArray();
  };

  public query func getScrapCategoryById(id : Nat) : async ScrapCategory {
    switch (scrapCategories.get(id)) {
      case (?cat) { cat };
      case (null) { Runtime.trap("Category not found") };
    };
  };

  public shared ({ caller }) func addScrapCategory(name : Text, parentId : ?Nat, unit : Text) : async ScrapCategory {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add scrap categories");
    };
    let id = scrapCategories.size() + 1;
    let cat : ScrapCategory = { id; name; parentId; unit };
    scrapCategories.add(id, cat);
    cat;
  };

  // ── Scrap Rates (public read) ────────────────────────────────────
  public query func getScrapRates() : async [ScrapRate] {
    scrapRates.values().toArray();
  };

  public query func getScrapRateByCategoryId(categoryId : Nat) : async ?ScrapRate {
    let all = scrapRates.values().toArray();
    all.find(func(r : ScrapRate) : Bool { r.categoryId == categoryId });
  };

  public shared ({ caller }) func addScrapRate(categoryId : Nat, pricePerKg : Float) : async ScrapRate {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add scrap rates");
    };
    let id = scrapRates.size() + 1;
    let rate : ScrapRate = { id; categoryId; pricePerKg };
    scrapRates.add(id, rate);
    rate;
  };

  // Admin-only: update the price per kg for a given category's scrap rate
  public shared ({ caller }) func updateScrapRate(categoryId : Nat, pricePerKg : Float) : async ScrapRate {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update scrap rates");
    };
    let maybeExistingRate = scrapRates.values().toArray().find(
      func(rate : ScrapRate) : Bool { rate.categoryId == categoryId }
    );
    switch (maybeExistingRate) {
      case (?rate) {
        let updated : ScrapRate = { rate with pricePerKg };
        scrapRates.add(rate.id, updated);
        updated;
      };
      case (null) {
        Runtime.trap("Category does not have a pricing yet. Use addScrapRate instead!");
      };
    };
  };

  // Public read: returns all scrap rates joined with their category names
  public query func getScrapRatesWithCategories() : async [ScrapRateWithCategory] {
    scrapRates.values().toArray().map(
      func(rate : ScrapRate) : ScrapRateWithCategory {
        let categoryName = switch (scrapCategories.get(rate.categoryId)) {
          case (?cat) { cat.name };
          case (null) { "Unknown Category" };
        };
        {
          id = rate.id;
          categoryId = rate.categoryId;
          pricePerKg = rate.pricePerKg;
          categoryName;
        };
      }
    );
  };

  // ── Bookings ─────────────────────────────────────────────────────
  public shared ({ caller }) func createBooking(addressId : Nat, scheduledTime : Int, totalEstimatedAmount : Float) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create bookings");
    };
    // Verify the address belongs to the caller
    switch (addresses.get(addressId)) {
      case (?addr) {
        if (addr.userId != caller) {
          Runtime.trap("Unauthorized: You can only book with your own addresses");
        };
      };
      case (null) { Runtime.trap("Address not found") };
    };
    let id = nextBookingId;
    nextBookingId += 1;
    let booking : Booking = {
      id;
      userId = caller;
      addressId;
      status = #pending;
      scheduledTime;
      partnerId = null;
      totalEstimatedAmount;
      totalFinalAmount = null;
    };
    bookings.add(id, booking);
    booking;
  };

  public query ({ caller }) func getBookingById(id : Nat) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view bookings");
    };
    switch (bookings.get(id)) {
      case (?booking) {
        if (booking.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own bookings");
        };
        booking;
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  public query ({ caller }) func getBookingsByUser(userId : Principal) : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view bookings");
    };
    // Only admins can query bookings for arbitrary users; users can only query their own
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own bookings");
    };
    let all = bookings.values().toArray();
    all.filter(func(b : Booking) : Bool { b.userId == userId });
  };

  public query ({ caller }) func getMyBookings() : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view their bookings");
    };
    let all = bookings.values().toArray();
    all.filter(func(b : Booking) : Bool { b.userId == caller });
  };

  public query ({ caller }) func getBookingsByStatus(status : BookingStatus) : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can query bookings by status");
    };
    let all = bookings.values().toArray();
    all.filter(func(b : Booking) : Bool { b.status == status });
  };

  public query ({ caller }) func getBookingsByAddressId(addressId : Nat) : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view bookings");
    };
    // Verify the address belongs to the caller (or caller is admin)
    switch (addresses.get(addressId)) {
      case (?addr) {
        if (addr.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view bookings for your own addresses");
        };
      };
      case (null) { Runtime.trap("Address not found") };
    };
    let all = bookings.values().toArray();
    all.filter(func(b : Booking) : Bool { b.addressId == addressId });
  };

  public shared ({ caller }) func assignPartnerToBooking(bookingId : Nat, partnerId : Nat) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can assign partners to bookings");
    };
    switch (bookings.get(bookingId)) {
      case (?booking) {
        let updated : Booking = { booking with partnerId = ?partnerId; status = #partner_assigned };
        bookings.add(bookingId, updated);
        let notifMessage = "Partner assigned for your booking. Partner ID: " # partnerId.toText();
        _createNotification(booking.userId, "delivery", "Partner Assigned", notifMessage);
        updated;
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, newStatus : BookingStatus) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (bookings.get(bookingId)) {
      case (?booking) {
        let updated : Booking = { booking with status = newStatus };
        bookings.add(bookingId, updated);

        switch (newStatus) {
          case (#partner_assigned) {
            _createNotification(booking.userId, "delivery", "Partner Assigned", "A partner has been assigned to your booking");
          };
          case (#on_the_way) {
            _createNotification(booking.userId, "truck", "On the Way", "Your partner is on the way");
          };
          case (#arrived) {
            _createNotification(booking.userId, "truck", "Arrived", "Your partner has arrived at your location");
          };
          case (#completed) {
            _createNotification(booking.userId, "check_circle", "Completed", "Your booking is completed");
          };
          case (_) {};
        };
        updated;
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  public shared ({ caller }) func autoAssignPartner(bookingId : Nat) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can auto-assign partners");
    };
    let activePartners = partners.values().toArray().filter(func(p : Partner) : Bool { p.active });

    if (activePartners.size() == 0) {
      Runtime.trap("No active partners available");
    };

    let partner = activePartners[0];

    switch (bookings.get(bookingId)) {
      case (?booking) {
        let updated : Booking = { booking with partnerId = ?partner.id; status = #partner_assigned };
        bookings.add(bookingId, updated);
        let notifMessage = "Partner assigned for your booking. Partner ID: " # partner.id.toText();
        _createNotification(booking.userId, "delivery", "Partner Assigned", notifMessage);
        updated;
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  // ── Partner Panel Functions ──────────────────────────────────────
  // Partners are identified by their phone number stored in localStorage matched
  // against the Partners table. These functions are accessible to any authenticated
  // user; the partnerId parameter is validated against the Partners table, and
  // booking ownership by that partner is verified before any mutation.

  // Returns all bookings assigned to the given partner (identified by partnerId).
  // Any authenticated user may call this; the caller supplies their partnerId
  // which is looked up in the Partners table to confirm it exists.
  public query ({ caller }) func getBookingsByPartnerId(partnerId : Nat) : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access the partner panel");
    };
    // Verify the partner exists
    switch (partners.get(partnerId)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?_) {};
    };
    let all = bookings.values().toArray();
    all.filter(func(b : Booking) : Bool {
      switch (b.partnerId) {
        case (?pid) { pid == partnerId };
        case (null) { false };
      };
    });
  };

  // Allows a partner to accept a booking assigned to them (sets status to partner_assigned).
  // The caller must be an authenticated user and the booking must already have this
  // partnerId assigned (set by an admin via assignPartnerToBooking / autoAssignPartner).
  public shared ({ caller }) func partnerAcceptBooking(bookingId : Nat, partnerId : Nat) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access the partner panel");
    };
    // Verify the partner exists
    switch (partners.get(partnerId)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?_) {};
    };
    switch (bookings.get(bookingId)) {
      case (?booking) {
        // Verify this booking is assigned to the given partner
        switch (booking.partnerId) {
          case (?pid) {
            if (pid != partnerId) {
              Runtime.trap("Unauthorized: This booking is not assigned to you");
            };
          };
          case (null) {
            Runtime.trap("Unauthorized: This booking has no partner assigned");
          };
        };
        let updated : Booking = { booking with status = #partner_assigned };
        bookings.add(bookingId, updated);
        _createNotification(booking.userId, "delivery", "Partner Accepted", "Your partner has accepted the booking");
        updated;
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  // Allows a partner to advance the booking status through the workflow:
  // partner_assigned → on_the_way → arrived → completed
  public shared ({ caller }) func partnerUpdateBookingStatus(bookingId : Nat, partnerId : Nat) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access the partner panel");
    };
    // Verify the partner exists
    switch (partners.get(partnerId)) {
      case (null) { Runtime.trap("Partner not found") };
      case (?_) {};
    };
    switch (bookings.get(bookingId)) {
      case (?booking) {
        // Verify this booking is assigned to the given partner
        switch (booking.partnerId) {
          case (?pid) {
            if (pid != partnerId) {
              Runtime.trap("Unauthorized: This booking is not assigned to you");
            };
          };
          case (null) {
            Runtime.trap("Unauthorized: This booking has no partner assigned");
          };
        };
        // Advance status through the partner workflow
        let newStatus : BookingStatus = switch (booking.status) {
          case (#partner_assigned) { #on_the_way };
          case (#on_the_way) { #arrived };
          case (#arrived) { #completed };
          case (_) {
            Runtime.trap("Cannot advance booking status from current state");
          };
        };
        let updated : Booking = { booking with status = newStatus };
        bookings.add(bookingId, updated);
        switch (newStatus) {
          case (#on_the_way) {
            _createNotification(booking.userId, "truck", "On the Way", "Your partner is on the way");
          };
          case (#arrived) {
            _createNotification(booking.userId, "truck", "Arrived", "Your partner has arrived at your location");
          };
          case (#completed) {
            _createNotification(booking.userId, "check_circle", "Completed", "Your booking is completed");
          };
          case (_) {};
        };
        updated;
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  // ── Booking Items ────────────────────────────────────────────────
  public shared ({ caller }) func addBookingItem(bookingId : Nat, categoryId : Nat, estimatedWeight : Float) : async BookingItem {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can add booking items");
    };
    // Verify the booking belongs to the caller
    switch (bookings.get(bookingId)) {
      case (?booking) {
        if (booking.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only add items to your own bookings");
        };
      };
      case (null) { Runtime.trap("Booking not found") };
    };
    let id = nextBookingItemId;
    nextBookingItemId += 1;
    let item : BookingItem = {
      id;
      bookingId;
      categoryId;
      estimatedWeight;
      finalWeight = null;
    };
    bookingItems.add(id, item);
    item;
  };

  public query ({ caller }) func getBookingItems(bookingId : Nat) : async [BookingItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view booking items");
    };
    // Verify the booking belongs to the caller (or caller is admin)
    switch (bookings.get(bookingId)) {
      case (?booking) {
        if (booking.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view items for your own bookings");
        };
      };
      case (null) { Runtime.trap("Booking not found") };
    };
    let all = bookingItems.values().toArray();
    all.filter(func(i : BookingItem) : Bool { i.bookingId == bookingId });
  };

  public shared ({ caller }) func updateBookingItemFinalWeight(id : Nat, finalWeight : Float) : async BookingItem {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update final weights");
    };
    switch (bookingItems.get(id)) {
      case (?item) {
        let updated : BookingItem = { item with finalWeight = ?finalWeight };
        bookingItems.add(id, updated);
        updated;
      };
      case (null) { Runtime.trap("Booking item not found") };
    };
  };

  // ── Partners (public read for users) ────────────────────────────
  public query func getPartners() : async [Partner] {
    partners.values().toArray();
  };

  public query func getPartnerById(id : Nat) : async Partner {
    switch (partners.get(id)) {
      case (?partner) { partner };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  // Looks up a partner by phone number; used by the partner panel to resolve
  // the partnerId from the phone stored in localStorage.
  public query func getPartnerByPhone(phone : Text) : async ?Partner {
    let all = partners.values().toArray();
    all.find(func(p : Partner) : Bool { p.phone == phone });
  };

  public shared ({ caller }) func addPartner(name : Text, phone : Text, vehicle : Text, rating : Float, active : Bool) : async Partner {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add partners");
    };
    let id = partners.size() + 1;
    let partner : Partner = { id; name; phone; vehicle; rating; active };
    partners.add(id, partner);
    partner;
  };

  public shared ({ caller }) func updatePartner(id : Nat, name : Text, phone : Text, vehicle : Text, rating : Float, active : Bool) : async Partner {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update partners");
    };
    switch (partners.get(id)) {
      case (?_) {
        let updated : Partner = { id; name; phone; vehicle; rating; active };
        partners.add(id, updated);
        updated;
      };
      case (null) { Runtime.trap("Partner not found") };
    };
  };

  // ── Payments ─────────────────────────────────────────────────────
  public shared ({ caller }) func createPayment(bookingId : Nat, amount : Float, method : PaymentMethod, transactionId : ?Text) : async Payment {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create payments");
    };
    // Verify the booking belongs to the caller
    switch (bookings.get(bookingId)) {
      case (?booking) {
        if (booking.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only pay for your own bookings");
        };
      };
      case (null) { Runtime.trap("Booking not found") };
    };
    let id = nextPaymentId;
    nextPaymentId += 1;
    let payment : Payment = {
      id;
      bookingId;
      amount;
      method;
      status = #completed;
      transactionId;
    };
    payments.add(id, payment);
    payment;
  };

  public query ({ caller }) func getPaymentByBookingId(bookingId : Nat) : async ?Payment {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view payments");
    };
    // Verify the booking belongs to the caller (or caller is admin)
    switch (bookings.get(bookingId)) {
      case (?booking) {
        if (booking.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view payments for your own bookings");
        };
      };
      case (null) { Runtime.trap("Booking not found") };
    };
    let all = payments.values().toArray();
    all.find(func(p : Payment) : Bool { p.bookingId == bookingId });
  };

  public shared ({ caller }) func updatePaymentStatus(id : Nat, status : PaymentStatus) : async Payment {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };
    switch (payments.get(id)) {
      case (?payment) {
        let updated : Payment = { payment with status };
        payments.add(id, updated);
        updated;
      };
      case (null) { Runtime.trap("Payment not found") };
    };
  };

  // ── Ratings ──────────────────────────────────────────────────────
  public shared ({ caller }) func submitRating(bookingId : Nat, partnerId : Nat, stars : Nat, comment : ?Text) : async Rating {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can submit ratings");
    };
    // Verify the booking belongs to the caller
    switch (bookings.get(bookingId)) {
      case (?booking) {
        if (booking.userId != caller) {
          Runtime.trap("Unauthorized: You can only rate your own bookings");
        };
      };
      case (null) { Runtime.trap("Booking not found") };
    };
    let id = nextRatingId;
    nextRatingId += 1;
    let rating : Rating = { id; bookingId; userId = caller; partnerId; stars; comment };
    ratings.add(id, rating);
    rating;
  };

  public query ({ caller }) func getRatingByBookingId(bookingId : Nat) : async ?Rating {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view ratings");
    };
    // Verify the booking belongs to the caller (or caller is admin)
    switch (bookings.get(bookingId)) {
      case (?booking) {
        if (booking.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view ratings for your own bookings");
        };
      };
      case (null) { Runtime.trap("Booking not found") };
    };
    let all = ratings.values().toArray();
    all.find(func(r : Rating) : Bool { r.bookingId == bookingId });
  };

  // ── Notifications ────────────────────────────────────────────────
  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view notifications");
    };
    let all = notifications.values().toArray();
    all.filter(func(n : Notification) : Bool { n.userId == caller });
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can mark notifications as read");
    };
    for ((id, notif) in notifications.entries()) {
      if (notif.userId == caller) {
        notifications.add(id, { notif with isRead = true });
      };
    };
  };

  public shared ({ caller }) func clearAllNotifications() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can clear notifications");
    };
    for ((id, notif) in notifications.entries()) {
      if (notif.userId == caller) {
        notifications.remove(id);
      };
    };
  };

  func _createNotification(userId : Principal, icon : Text, title : Text, message : Text) {
    let id = nextNotificationId;
    nextNotificationId += 1;
    let notif : Notification = {
      id;
      userId;
      icon;
      title;
      message;
      timestamp = Time.now();
      isRead = false;
    };
    notifications.add(id, notif);
  };

  // ── Support Tickets ──────────────────────────────────────────────
  public shared ({ caller }) func submitSupportTicket(subject : Text, message : Text) : async SupportTicket {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can submit support tickets");
    };
    let id = nextTicketId;
    nextTicketId += 1;
    let ticket : SupportTicket = {
      id;
      userId = caller;
      subject;
      message;
      timestamp = Time.now();
    };
    supportTickets.add(id, ticket);
    ticket;
  };

  public query ({ caller }) func getSupportTickets() : async [SupportTicket] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all support tickets");
    };
    supportTickets.values().toArray();
  };

  public query ({ caller }) func getMySupportTickets() : async [SupportTicket] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can view their support tickets");
    };
    let all = supportTickets.values().toArray();
    all.filter(func(t : SupportTicket) : Bool { t.userId == caller });
  };
};
