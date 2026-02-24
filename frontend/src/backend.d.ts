import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    id: Principal;
    profileImage: string;
    name: string;
    phone: string;
}
export interface SupportTicket {
    id: bigint;
    subject: string;
    userId: Principal;
    message: string;
    timestamp: bigint;
}
export interface BookingItem {
    id: bigint;
    categoryId: bigint;
    bookingId: bigint;
    estimatedWeight: number;
    finalWeight?: number;
}
export interface Rating {
    id: bigint;
    bookingId: bigint;
    userId: Principal;
    partnerId: bigint;
    comment?: string;
    stars: bigint;
}
export interface Address {
    id: bigint;
    lat?: number;
    lng?: number;
    street: string;
    city: string;
    userId: Principal;
    addressLabel: string;
    pincode: string;
}
export interface Partner {
    id: bigint;
    active: boolean;
    name: string;
    vehicle: string;
    rating: number;
    phone: string;
}
export interface Payment {
    id: bigint;
    status: PaymentStatus;
    method: PaymentMethod;
    bookingId: bigint;
    amount: number;
    transactionId?: string;
}
export interface Notification {
    id: bigint;
    title: string;
    userId: Principal;
    icon: string;
    isRead: boolean;
    message: string;
    timestamp: bigint;
}
export interface ScrapRate {
    id: bigint;
    categoryId: bigint;
    pricePerKg: number;
}
export interface Booking {
    id: bigint;
    status: BookingStatus;
    totalFinalAmount?: number;
    scheduledTime: bigint;
    userId: Principal;
    partnerId?: bigint;
    addressId: bigint;
    totalEstimatedAmount: number;
}
export interface ScrapCategory {
    id: bigint;
    name: string;
    unit: string;
    parentId?: bigint;
}
export interface ScrapRateWithCategory {
    id: bigint;
    categoryId: bigint;
    categoryName: string;
    pricePerKg: number;
}
export enum BookingStatus {
    on_the_way = "on_the_way",
    cancelled = "cancelled",
    pending = "pending",
    arrived = "arrived",
    completed = "completed",
    confirmed = "confirmed",
    partner_assigned = "partner_assigned"
}
export enum PaymentMethod {
    upi = "upi",
    cash = "cash"
}
export enum PaymentStatus {
    pending = "pending",
    completed = "completed",
    refunded = "refunded",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAddress(addressLabel: string, street: string, city: string, pincode: string, lat: number | null, lng: number | null): Promise<Address>;
    addBookingItem(bookingId: bigint, categoryId: bigint, estimatedWeight: number): Promise<BookingItem>;
    addPartner(name: string, phone: string, vehicle: string, rating: number, active: boolean): Promise<Partner>;
    addScrapCategory(name: string, parentId: bigint | null, unit: string): Promise<ScrapCategory>;
    addScrapRate(categoryId: bigint, pricePerKg: number): Promise<ScrapRate>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignPartnerToBooking(bookingId: bigint, partnerId: bigint): Promise<Booking>;
    autoAssignPartner(bookingId: bigint): Promise<Booking>;
    clearAllNotifications(): Promise<void>;
    createBooking(addressId: bigint, scheduledTime: bigint, totalEstimatedAmount: number): Promise<Booking>;
    createPayment(bookingId: bigint, amount: number, method: PaymentMethod, transactionId: string | null): Promise<Payment>;
    deleteAddress(id: bigint): Promise<void>;
    getAddressById(id: bigint): Promise<Address>;
    getAddresses(): Promise<Array<Address>>;
    getBookingById(id: bigint): Promise<Booking>;
    getBookingItems(bookingId: bigint): Promise<Array<BookingItem>>;
    getBookingPhase(status: BookingStatus): Promise<string>;
    getBookingsByAddressId(addressId: bigint): Promise<Array<Booking>>;
    getBookingsByPartnerId(partnerId: bigint): Promise<Array<Booking>>;
    getBookingsByStatus(status: BookingStatus): Promise<Array<Booking>>;
    getBookingsByUser(userId: Principal): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyBookings(): Promise<Array<Booking>>;
    getMySupportTickets(): Promise<Array<SupportTicket>>;
    getNotifications(): Promise<Array<Notification>>;
    getPartnerById(id: bigint): Promise<Partner>;
    getPartnerByPhone(phone: string): Promise<Partner | null>;
    getPartners(): Promise<Array<Partner>>;
    getPaymentByBookingId(bookingId: bigint): Promise<Payment | null>;
    getRatingByBookingId(bookingId: bigint): Promise<Rating | null>;
    getScrapCategories(): Promise<Array<ScrapCategory>>;
    getScrapCategoryById(id: bigint): Promise<ScrapCategory>;
    getScrapRateByCategoryId(categoryId: bigint): Promise<ScrapRate | null>;
    getScrapRates(): Promise<Array<ScrapRate>>;
    getScrapRatesWithCategories(): Promise<Array<ScrapRateWithCategory>>;
    getSupportTickets(): Promise<Array<SupportTicket>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAllNotificationsRead(): Promise<void>;
    partnerAcceptBooking(bookingId: bigint, partnerId: bigint): Promise<Booking>;
    partnerUpdateBookingStatus(bookingId: bigint, partnerId: bigint): Promise<Booking>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRating(bookingId: bigint, partnerId: bigint, stars: bigint, comment: string | null): Promise<Rating>;
    submitSupportTicket(subject: string, message: string): Promise<SupportTicket>;
    updateAddress(id: bigint, addressLabel: string, street: string, city: string, pincode: string, lat: number | null, lng: number | null): Promise<Address>;
    updateBookingItemFinalWeight(id: bigint, finalWeight: number): Promise<BookingItem>;
    updateBookingStatus(bookingId: bigint, newStatus: BookingStatus): Promise<Booking>;
    updatePartner(id: bigint, name: string, phone: string, vehicle: string, rating: number, active: boolean): Promise<Partner>;
    updatePaymentStatus(id: bigint, status: PaymentStatus): Promise<Payment>;
    updateScrapRate(categoryId: bigint, pricePerKg: number): Promise<ScrapRate>;
}
