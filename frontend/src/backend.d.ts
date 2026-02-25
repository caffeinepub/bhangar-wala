import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type LanguageType = {
    __kind__: "en";
    en: null;
} | {
    __kind__: "gu";
    gu: null;
} | {
    __kind__: "hi";
    hi: null;
} | {
    __kind__: "mr";
    mr: null;
} | {
    __kind__: "mw";
    mw: null;
} | {
    __kind__: "other";
    other: string;
};
export interface UserProfile {
    id: Principal;
    profileImage: string;
    name: string;
    phone: string;
}
export interface ScrapShop {
    id: string;
    preferredLanguage: LanguageType;
    ownerName: string;
    area: string;
    city: string;
    scrapCategoriesHandled: Array<bigint>;
    email: string;
    shopName: string;
    phone: string;
    pincode: string;
    registrationStatus: ScrapShopStatus;
    registeredAt: bigint;
    streetAddress: string;
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
export enum ScrapShopStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllScrapShops(): Promise<Array<ScrapShop>>;
    getBookingPhase(status: BookingStatus): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getScrapShopByPhone(phone: string): Promise<ScrapShop | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerScrapShop(ownerName: string, shopName: string, phone: string, email: string, city: string, area: string, pincode: string, streetAddress: string, scrapCategoriesHandled: Array<bigint>, rawLanguage: string): Promise<ScrapShop>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateScrapShop(id: string, ownerName: string, shopName: string, email: string, city: string, area: string, pincode: string, streetAddress: string, scrapCategoriesHandled: Array<bigint>): Promise<ScrapShop>;
    updateScrapShopStatus(id: string, status: ScrapShopStatus): Promise<ScrapShop>;
}
