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
export interface BookingRequest {
    scheduledTime: bigint;
    address: Address;
    items: Array<BookingItemRequest>;
    totalEstimatedAmount: number;
}
export interface BookingItemRequest {
    categoryId: bigint;
    estimatedWeight: number;
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
export type ServiceError = {
    __kind__: "invalidWeight";
    invalidWeight: number;
} | {
    __kind__: "invalidAddress";
    invalidAddress: null;
} | {
    __kind__: "unauthorized";
    unauthorized: null;
} | {
    __kind__: "missingItems";
    missingItems: null;
} | {
    __kind__: "backendError";
    backendError: string;
} | {
    __kind__: "invalidCategory";
    invalidCategory: bigint;
};
export interface BookingResponse {
    bookingId: bigint;
    partnerId?: bigint;
    estimatedAmount: number;
}
export interface UserProfile {
    profileImage?: string;
    name: string;
    email?: string;
    addresses: Array<Address>;
    phoneNumber: string;
}
export interface Address {
    id: bigint;
    lat?: number;
    lng?: number;
    street: string;
    city: string;
    addressLabel?: string;
    pincode: string;
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
    createBooking(bookingRequest: BookingRequest): Promise<{
        __kind__: "error";
        error: ServiceError;
    } | {
        __kind__: "success";
        success: BookingResponse;
    }>;
    createUserProfile(userId: string, name: string, address: Address | null): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "alreadyExists";
        alreadyExists: string;
    } | {
        __kind__: "invalidId";
        invalidId: null;
    }>;
    getAllScrapShops(): Promise<Array<ScrapShop>>;
    getBookingPhase(status: BookingStatus): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getScrapShopByPhone(phone: string): Promise<ScrapShop | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfileById(_id: string): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerScrapShop(ownerName: string, shopName: string, phone: string, email: string, city: string, area: string, pincode: string, streetAddress: string, scrapCategoriesHandled: Array<bigint>, rawLanguage: string): Promise<ScrapShop>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateScrapShop(id: string, ownerName: string, shopName: string, email: string, city: string, area: string, pincode: string, streetAddress: string, scrapCategoriesHandled: Array<bigint>): Promise<ScrapShop>;
    updateScrapShopStatus(id: string, status: ScrapShopStatus): Promise<ScrapShop>;
}
