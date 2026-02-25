import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
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
    status : TicketStatus;
  };

  public type TicketStatus = {
    #open;
    #resolved;
  };

  public type ScrapRateWithCategory = {
    id : Nat;
    categoryId : Nat;
    pricePerKg : Float;
    categoryName : Text;
  };

  public type AdminBooking = {
    booking : Booking;
    userProfile : ?UserProfile;
    partner : ?Partner;
  };

  public type ScrapShopStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type LanguageType = {
    #en;
    #hi;
    #mr;
    #gu;
    #mw;
    #other : Text;
  };

  public type ScrapShop = {
    id : Text;
    ownerName : Text;
    shopName : Text;
    phone : Text;
    email : Text;
    city : Text;
    area : Text;
    pincode : Text;
    streetAddress : Text;
    scrapCategoriesHandled : [Nat]; // Category IDs
    preferredLanguage : LanguageType;
    registrationStatus : ScrapShopStatus;
    registeredAt : Int;
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
  var scrapShops = Map.empty<Text, ScrapShop>();

  var nextAddressId : Nat = 1;
  var nextBookingId : Nat = 1;
  var nextBookingItemId : Nat = 1;
  var nextPaymentId : Nat = 1;
  var nextRatingId : Nat = 1;
  var nextNotificationId : Nat = 1;
  var nextTicketId : Nat = 1;
  var nextScrapShopId : Nat = 1;

  // ── Booking Phase & Seed Data ─────────────────────────────────────
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

  // Initialize seed data for scrap categories, rates, and partners.
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

  // ── User Profile Management ──────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    } else {
      userProfiles.get(caller);
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    } else {
      userProfiles.get(user);
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    } else {
      userProfiles.add(caller, profile);
    };
  };

  // ── Scrap Shop Management ────────────────────────────────────────

  // Register a new Scrap Shop with pending status.
  // Open to any caller (including guests/anonymous) — this is a public registration endpoint.
  public shared ({ caller }) func registerScrapShop(
    ownerName : Text,
    shopName : Text,
    phone : Text,
    email : Text,
    city : Text,
    area : Text,
    pincode : Text,
    streetAddress : Text,
    scrapCategoriesHandled : [Nat],
    rawLanguage : Text,
  ) : async ScrapShop {
    let id = nextScrapShopId.toText();
    let language : LanguageType = switch (rawLanguage) {
      case ("en") { #en };
      case ("hi") { #hi };
      case ("mr") { #mr };
      case ("gu") { #gu };
      case ("mw") { #mw };
      case (lang) { #other(lang) };
    };
    let shop : ScrapShop = {
      id;
      ownerName;
      shopName;
      phone;
      email;
      city;
      area;
      pincode;
      streetAddress;
      scrapCategoriesHandled;
      preferredLanguage = language;
      registrationStatus = #pending;
      registeredAt = Time.now();
    };
    scrapShops.add(id, shop);
    nextScrapShopId += 1;
    shop;
  };

  // Get Scrap Shop by phone number.
  // Open to any caller — used to check if a shop is already registered.
  public query ({ caller }) func getScrapShopByPhone(phone : Text) : async ?ScrapShop {
    let all = scrapShops.values().toArray();
    all.find(func(s) { s.phone == phone });
  };

  // Get all Scrap Shops — admin only.
  public query ({ caller }) func getAllScrapShops() : async [ScrapShop] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can access all scrap shops");
    } else {
      scrapShops.values().toArray();
    };
  };

  // Update Scrap Shop registration status — admin only.
  public shared ({ caller }) func updateScrapShopStatus(id : Text, status : ScrapShopStatus) : async ScrapShop {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update scrap shop status");
    };
    switch (scrapShops.get(id)) {
      case (?shop) {
        let updated : ScrapShop = { shop with registrationStatus = status };
        scrapShops.add(id, updated);
        updated;
      };
      case (null) { Runtime.trap("Scrap shop not found") };
    };
  };

  // Update Scrap Shop details — admin only.
  // Since ScrapShop records are not linked to a caller Principal, only admins
  // can update shop details to prevent unauthorized modifications.
  public shared ({ caller }) func updateScrapShop(
    id : Text,
    ownerName : Text,
    shopName : Text,
    email : Text,
    city : Text,
    area : Text,
    pincode : Text,
    streetAddress : Text,
    scrapCategoriesHandled : [Nat],
  ) : async ScrapShop {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update scrap shop details");
    } else {
      switch (scrapShops.get(id)) {
        case (null) { Runtime.trap("Scrap shop not found") };
        case (?shop) {
          let updated : ScrapShop = {
            shop with
            ownerName;
            shopName;
            email;
            city;
            area;
            pincode;
            streetAddress;
            scrapCategoriesHandled;
          };
          scrapShops.add(id, updated);
          updated;
        };
      };
    };
  };
};
