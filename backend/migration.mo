import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Old Types (from previous version without address in Booking)
  type OldBooking = {
    id : Nat;
    userId : Principal;
    addressId : Nat;
    status : {
      #pending;
      #confirmed;
      #partner_assigned;
      #on_the_way;
      #arrived;
      #completed;
      #cancelled;
    };
    scheduledTime : Int;
    partnerId : ?Nat;
    totalEstimatedAmount : Float;
    totalFinalAmount : ?Float;
  };

  type OldActor = {
    bookings : Map.Map<Nat, OldBooking>;
  };

  // New Types (current version with address in Booking)
  type NewBooking = {
    id : Nat;
    userId : Principal;
    addressId : Nat;
    status : {
      #pending;
      #confirmed;
      #partner_assigned;
      #on_the_way;
      #arrived;
      #completed;
      #cancelled;
    };
    scheduledTime : Int;
    partnerId : ?Nat;
    totalEstimatedAmount : Float;
    totalFinalAmount : ?Float;
    address : {
      id : Nat;
      street : Text;
      city : Text;
      pincode : Text;
      addressLabel : ?Text;
      lat : ?Float;
      lng : ?Float;
    };
  };

  type NewActor = {
    bookings : Map.Map<Nat, NewBooking>;
  };

  public func run(old : OldActor) : NewActor {
    let newBookings = old.bookings.map<Nat, OldBooking, NewBooking>(
      func(_id, oldBooking) {
        {
          oldBooking with
          address = {
            id = 0;
            street = "";
            city = "";
            pincode = "";
            addressLabel = null;
            lat = null;
            lng = null;
          };
        };
      }
    );
    { bookings = newBookings };
  };
};
