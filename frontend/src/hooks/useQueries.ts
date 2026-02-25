import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Address, UserProfile, BookingRequest, BookingItemRequest } from '../backend';
import { BookingStatus } from '../backend';

// Re-export BookingStatus
export { BookingStatus } from '../backend';

// PaymentMethod enum (not in backend.d.ts, defined locally)
export enum PaymentMethod {
  cash = 'cash',
  upi = 'upi',
}

// TicketStatus type
export type TicketStatus = 'open' | 'resolved';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPhoneFromStorage(): string {
  const session = localStorage.getItem('bhangar_auth_session');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      const raw: string = parsed.phone || parsed.userId || '';
      return raw.replace(/^\+91/, '').trim();
    } catch {
      return '';
    }
  }
  return '';
}

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const phone = getPhoneFromStorage();
      if (!phone) return null;
      return actor.getUserProfileById(phone);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; name: string; address?: Address | null }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createUserProfile(
        params.userId,
        params.name,
        params.address ?? null
      );
      if (result.__kind__ === 'invalidId') {
        throw new Error('Invalid user ID');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Addresses ────────────────────────────────────────────────────────────────

export function useAddAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressData: {
      street: string;
      city: string;
      pincode: string;
      addressLabel?: string;
      lat?: number | null;
      lng?: number | null;
    }) => {
      if (!actor) throw new Error('Actor not available');

      const phone = getPhoneFromStorage();
      if (!phone) throw new Error('User not authenticated');

      const profile = await actor.getUserProfileById(phone);
      if (!profile) throw new Error('User profile not found');

      const existingAddresses: Address[] = profile.addresses || [];
      const maxId = existingAddresses.reduce(
        (max, a) => (Number(a.id) > max ? Number(a.id) : max),
        0
      );
      const newAddress: Address = {
        id: BigInt(maxId + 1),
        street: addressData.street,
        city: addressData.city,
        pincode: addressData.pincode,
        addressLabel: addressData.addressLabel || 'Home',
        lat: addressData.lat ?? undefined,
        lng: addressData.lng ?? undefined,
      };

      const updatedProfile: UserProfile = {
        ...profile,
        addresses: [...existingAddresses, newAddress],
      };

      await actor.saveCallerUserProfile(updatedProfile);
      return newAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
    },
  });
}

export function useUpdateAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressData: Address) => {
      if (!actor) throw new Error('Actor not available');

      const phone = getPhoneFromStorage();
      if (!phone) throw new Error('User not authenticated');

      const profile = await actor.getUserProfileById(phone);
      if (!profile) throw new Error('User profile not found');

      const updatedAddresses = profile.addresses.map((a) =>
        Number(a.id) === Number(addressData.id) ? addressData : a
      );

      const updatedProfile: UserProfile = {
        ...profile,
        addresses: updatedAddresses,
      };

      await actor.saveCallerUserProfile(updatedProfile);
      return addressData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
    },
  });
}

export function useDeleteAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: number) => {
      if (!actor) throw new Error('Actor not available');

      const phone = getPhoneFromStorage();
      if (!phone) throw new Error('User not authenticated');

      const profile = await actor.getUserProfileById(phone);
      if (!profile) throw new Error('User profile not found');

      const updatedAddresses = profile.addresses.filter(
        (a) => Number(a.id) !== addressId
      );

      const updatedProfile: UserProfile = {
        ...profile,
        addresses: updatedAddresses,
      };

      await actor.saveCallerUserProfile(updatedProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
    },
  });
}

export function useGetUserAddresses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Address[]>({
    queryKey: ['userAddresses'],
    queryFn: async () => {
      if (!actor) return [];
      const phone = getPhoneFromStorage();
      if (!phone) return [];
      const profile = await actor.getUserProfileById(phone);
      return profile?.addresses || [];
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backward compat
export const useGetAddresses = useGetUserAddresses;

export function useGetAddressById(addressId: number | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Address | null>({
    queryKey: ['address', addressId],
    queryFn: async () => {
      if (!actor || !addressId) return null;
      const phone = getPhoneFromStorage();
      if (!phone) return null;
      const profile = await actor.getUserProfileById(phone);
      const addr = profile?.addresses.find((a) => Number(a.id) === addressId);
      return addr || null;
    },
    enabled: !!actor && !actorFetching && !!addressId,
  });
}

// ── Scrap Categories & Rates ─────────────────────────────────────────────────

export interface ScrapCategory {
  id: number;
  name: string;
  parentId?: number | null;
  unit: string;
  pricePerKg?: number;
}

export interface ScrapRate {
  id: number;
  categoryId: number;
  pricePerKg: number;
}

export interface ScrapRateWithCategory {
  id: number;
  categoryId: number;
  pricePerKg: number;
  categoryName: string;
}

// Static seed data matching backend
const SCRAP_CATEGORIES: ScrapCategory[] = [
  { id: 1, name: 'Paper', parentId: null, unit: 'kg' },
  { id: 2, name: 'Metal', parentId: null, unit: 'kg' },
  { id: 3, name: 'Plastic', parentId: null, unit: 'kg' },
  { id: 4, name: 'Electronics', parentId: null, unit: 'kg' },
  { id: 5, name: 'Newspaper', parentId: 1, unit: 'kg' },
  { id: 6, name: 'Cardboard', parentId: 1, unit: 'kg' },
  { id: 7, name: 'Iron', parentId: 2, unit: 'kg' },
  { id: 8, name: 'Copper', parentId: 2, unit: 'kg' },
  { id: 9, name: 'PET Bottles', parentId: 3, unit: 'kg' },
  { id: 10, name: 'Hard Plastic', parentId: 3, unit: 'kg' },
  { id: 11, name: 'Mobile', parentId: 4, unit: 'kg' },
  { id: 12, name: 'Laptop', parentId: 4, unit: 'kg' },
];

const SCRAP_RATES: ScrapRate[] = [
  { id: 1, categoryId: 5, pricePerKg: 12.0 },
  { id: 2, categoryId: 6, pricePerKg: 8.0 },
  { id: 3, categoryId: 7, pricePerKg: 30.0 },
  { id: 4, categoryId: 8, pricePerKg: 450.0 },
  { id: 5, categoryId: 9, pricePerKg: 15.0 },
  { id: 6, categoryId: 10, pricePerKg: 10.0 },
  { id: 7, categoryId: 11, pricePerKg: 50.0 },
  { id: 8, categoryId: 12, pricePerKg: 100.0 },
];

export function useGetScrapCategories() {
  return useQuery<ScrapCategory[]>({
    queryKey: ['scrapCategories'],
    queryFn: async () => SCRAP_CATEGORIES,
    staleTime: Infinity,
  });
}

export function useGetScrapRates() {
  return useQuery<ScrapRate[]>({
    queryKey: ['scrapRates'],
    queryFn: async () => SCRAP_RATES,
    staleTime: Infinity,
  });
}

export function useGetScrapRatesWithCategories() {
  return useQuery<ScrapRateWithCategory[]>({
    queryKey: ['scrapRatesWithCategories'],
    queryFn: async () => {
      return SCRAP_RATES.map((rate) => {
        const cat = SCRAP_CATEGORIES.find((c) => c.id === rate.categoryId);
        return {
          id: rate.id,
          categoryId: rate.categoryId,
          pricePerKg: rate.pricePerKg,
          categoryName: cat?.name || `Category ${rate.categoryId}`,
        };
      });
    },
    staleTime: Infinity,
  });
}

export function useUpdateScrapRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { categoryId: number; pricePerKg: number }) => {
      const rate = SCRAP_RATES.find((r) => r.categoryId === params.categoryId);
      if (rate) rate.pricePerKg = params.pricePerKg;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapRates'] });
      queryClient.invalidateQueries({ queryKey: ['scrapRatesWithCategories'] });
    },
  });
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export interface BookingItem {
  id: number;
  bookingId: number;
  categoryId: number;
  estimatedWeight: number;
  finalWeight?: number | null;
}

export interface Booking {
  id: number;
  userId: string;
  addressId: number;
  address: Address;
  status: BookingStatus;
  scheduledTime: number;
  partnerId?: number | null;
  totalEstimatedAmount: number;
  totalFinalAmount?: number | null;
  items?: BookingItem[];
}

export interface AdminBooking {
  booking: Booking;
  userProfile?: UserProfile | null;
  partner?: Partner | null;
}

// Local in-memory store for bookings
let localBookings: Booking[] = [];
let localBookingItems: BookingItem[] = [];

export function useGetUserBookings() {
  return useQuery<Booking[]>({
    queryKey: ['userBookings'],
    queryFn: async () => {
      return localBookings.slice().reverse();
    },
  });
}

// Alias for backward compat
export const useGetMyBookings = useGetUserBookings;

export function useGetBookingById(bookingId: number) {
  return useQuery<Booking | null>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      return localBookings.find((b) => b.id === bookingId) || null;
    },
    enabled: bookingId > 0,
  });
}

export function useGetBookingItems(bookingId: number) {
  return useQuery<BookingItem[]>({
    queryKey: ['bookingItems', bookingId],
    queryFn: async () => {
      return localBookingItems.filter((item) => item.bookingId === bookingId);
    },
    enabled: bookingId > 0,
  });
}

export interface CreateBookingParams {
  address: Address;
  scheduledTime: Date;
  items: Array<{ categoryId: number; estimatedWeight: number }>;
  totalEstimatedAmount: number;
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      if (!actor) throw new Error('Actor not available');

      if (!params.items || params.items.length === 0) {
        throw new Error('Please add at least one scrap item');
      }
      for (const item of params.items) {
        if (!item.categoryId || item.estimatedWeight <= 0) {
          throw new Error('Each item must have a valid category and positive weight');
        }
      }

      if (!params.address.street || !params.address.city || !params.address.pincode) {
        throw new Error('Address must have street, city, and pincode');
      }

      // Convert scheduledTime Date to nanoseconds bigint
      const scheduledTimeNs = BigInt(params.scheduledTime.getTime()) * BigInt(1_000_000);

      const bookingRequest: BookingRequest = {
        address: {
          id: params.address.id,
          street: params.address.street,
          city: params.address.city,
          pincode: params.address.pincode,
          addressLabel: params.address.addressLabel,
          lat: params.address.lat,
          lng: params.address.lng,
        },
        scheduledTime: scheduledTimeNs,
        items: params.items.map(
          (item) =>
            ({
              categoryId: BigInt(item.categoryId),
              estimatedWeight: item.estimatedWeight,
            } as BookingItemRequest)
        ),
        totalEstimatedAmount: params.totalEstimatedAmount,
      };

      const result = await actor.createBooking(bookingRequest);

      if (result.__kind__ === 'error') {
        const err = result.error;
        switch (err.__kind__) {
          case 'unauthorized':
            throw new Error('You must be logged in to create a booking');
          case 'invalidAddress':
            throw new Error('Invalid address. Please check street, city, and pincode');
          case 'missingItems':
            throw new Error('Please add at least one scrap item');
          case 'invalidCategory':
            throw new Error(`Invalid scrap category: ${err.invalidCategory}`);
          case 'invalidWeight':
            throw new Error(`Invalid weight: ${err.invalidWeight}`);
          case 'backendError':
            throw new Error(err.backendError);
          default:
            throw new Error('Failed to create booking. Please try again.');
        }
      }

      const bookingResponse = result.success;
      const bookingId = Number(bookingResponse.bookingId);

      const newBooking: Booking = {
        id: bookingId,
        userId: getPhoneFromStorage(),
        addressId: Number(params.address.id),
        address: params.address,
        status: BookingStatus.pending,
        scheduledTime: params.scheduledTime.getTime(),
        partnerId: bookingResponse.partnerId ? Number(bookingResponse.partnerId) : null,
        totalEstimatedAmount: bookingResponse.estimatedAmount,
        totalFinalAmount: null,
        items: params.items.map((item, idx) => ({
          id: idx + 1,
          bookingId,
          categoryId: item.categoryId,
          estimatedWeight: item.estimatedWeight,
          finalWeight: null,
        })),
      };

      localBookings.push(newBooking);
      params.items.forEach((item, idx) => {
        localBookingItems.push({
          id: idx + 1,
          bookingId,
          categoryId: item.categoryId,
          estimatedWeight: item.estimatedWeight,
          finalWeight: null,
        });
      });

      return newBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: number; status: BookingStatus }) => {
      const booking = localBookings.find((b) => b.id === params.bookingId);
      if (booking) {
        booking.status = params.status;
      }
      return params;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: number) => {
      const booking = localBookings.find((b) => b.id === bookingId);
      if (booking) {
        booking.status = BookingStatus.cancelled;
      }
      return bookingId;
    },
    onSuccess: (_data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });
}

// ── Partners ─────────────────────────────────────────────────────────────────

export interface Partner {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  active: boolean;
}

const PARTNERS: Partner[] = [
  { id: 1, name: 'Ravi Kumar', phone: '+91-9876543210', vehicle: 'Mini Truck', rating: 4.5, active: true },
  { id: 2, name: 'Suresh Singh', phone: '+91-9876543211', vehicle: 'Tempo', rating: 4.2, active: true },
  { id: 3, name: 'Amit Sharma', phone: '+91-9876543212', vehicle: 'Cycle Cart', rating: 4.8, active: false },
  { id: 4, name: 'Sunita Reddy', phone: '+91-9876543213', vehicle: 'Mini Truck', rating: 4.6, active: true },
  { id: 5, name: 'Mohan Lal', phone: '+91-9876543214', vehicle: 'Tempo', rating: 4.9, active: true },
];

export function useGetPartners() {
  return useQuery<Partner[]>({
    queryKey: ['partners'],
    queryFn: async () => [...PARTNERS],
    staleTime: Infinity,
  });
}

export function useGetPartnerById(partnerId: number | null | undefined) {
  return useQuery<Partner | null>({
    queryKey: ['partner', partnerId],
    queryFn: async () => {
      if (!partnerId) return null;
      return PARTNERS.find((p) => p.id === partnerId) || null;
    },
    enabled: !!partnerId,
  });
}

export function useGetPartnerByPhone(phone: string | null | undefined) {
  return useQuery<Partner | null>({
    queryKey: ['partnerByPhone', phone],
    queryFn: async () => {
      if (!phone) return null;
      return PARTNERS.find((p) => p.phone === phone || p.phone.replace(/[^0-9]/g, '').endsWith(phone.replace(/[^0-9]/g, ''))) || null;
    },
    enabled: !!phone,
  });
}

export function useGetBookingsByPartnerId(partnerId: number | null | undefined) {
  return useQuery<Booking[]>({
    queryKey: ['bookingsByPartner', partnerId],
    queryFn: async () => {
      if (!partnerId) return [];
      return localBookings.filter((b) => b.partnerId === partnerId);
    },
    enabled: !!partnerId,
  });
}

export function useAddPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partner: Omit<Partner, 'id'>) => {
      const newPartner: Partner = { ...partner, id: PARTNERS.length + 1 };
      PARTNERS.push(newPartner);
      return newPartner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partner: Partner) => {
      const idx = PARTNERS.findIndex((p) => p.id === partner.id);
      if (idx !== -1) PARTNERS[idx] = partner;
      return partner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useAssignPartnerToBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookingId: number; partnerId: number }) => {
      const booking = localBookings.find((b) => b.id === params.bookingId);
      if (booking) {
        booking.partnerId = params.partnerId;
        booking.status = BookingStatus.partner_assigned;
      }
      return params;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
}

export function usePartnerAcceptBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookingId: number; partnerId: number }) => {
      const booking = localBookings.find((b) => b.id === params.bookingId);
      if (booking) {
        booking.partnerId = params.partnerId;
        booking.status = BookingStatus.confirmed;
      }
      return params;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookingsByPartner', variables.partnerId] });
    },
  });
}

export function usePartnerUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookingId: number; status: BookingStatus; partnerId?: number }) => {
      const booking = localBookings.find((b) => b.id === params.bookingId);
      if (booking) {
        booking.status = params.status;
      }
      return params;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      if (variables.partnerId) {
        queryClient.invalidateQueries({ queryKey: ['bookingsByPartner', variables.partnerId] });
      }
    },
  });
}

// ── Assign Partner (admin) ────────────────────────────────────────────────────

export function useAssignPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookingId: number; partnerId: number }) => {
      const booking = localBookings.find((b) => b.id === params.bookingId);
      if (booking) {
        booking.partnerId = params.partnerId;
        booking.status = BookingStatus.partner_assigned;
      }
      return params;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
}

// ── Payments ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string | null;
}

let localPayments: Payment[] = [];

export function useGetPaymentByBookingId(bookingId: number) {
  return useQuery<Payment | null>({
    queryKey: ['payment', bookingId],
    queryFn: async () => {
      return localPayments.find((p) => p.bookingId === bookingId) || null;
    },
    enabled: bookingId > 0,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      bookingId: number;
      amount: number;
      method: PaymentMethod;
    }) => {
      const payment: Payment = {
        id: localPayments.length + 1,
        bookingId: params.bookingId,
        amount: params.amount,
        method: params.method,
        status: 'completed',
        transactionId: `TXN${Date.now()}`,
      };
      localPayments.push(payment);
      return payment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
}

// ── Ratings ──────────────────────────────────────────────────────────────────

export interface RatingData {
  id: number;
  bookingId: number;
  stars: number;
  comment?: string | null;
}

let localRatings: RatingData[] = [];

export function useSubmitRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookingId: number; stars: number; comment?: string }) => {
      const rating: RatingData = {
        id: localRatings.length + 1,
        bookingId: params.bookingId,
        stars: params.stars,
        comment: params.comment || null,
      };
      localRatings.push(rating);
      return rating;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: number;
  userId: string;
  icon: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

let localNotifications: NotificationItem[] = [];

export function useGetNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const phone = getPhoneFromStorage();
      return localNotifications
        .filter((n) => n.userId === phone)
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const phone = getPhoneFromStorage();
      localNotifications = localNotifications.map((n) =>
        n.userId === phone ? { ...n, isRead: true } : n
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const phone = getPhoneFromStorage();
      localNotifications = localNotifications.filter((n) => n.userId !== phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ── Support Tickets ───────────────────────────────────────────────────────────

export interface SupportTicketData {
  id: number;
  userId: string;
  subject: string;
  message: string;
  timestamp: number;
  status: TicketStatus;
}

// Alias for backward compat
export type SupportTicket = SupportTicketData;

let localSupportTickets: SupportTicketData[] = [];

export function useGetSupportTickets() {
  return useQuery<SupportTicketData[]>({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      return localSupportTickets.slice().sort((a, b) => b.timestamp - a.timestamp);
    },
  });
}

// Alias for backward compat
export const useGetAllSupportTickets = useGetSupportTickets;

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { subject: string; message: string }) => {
      const phone = getPhoneFromStorage();
      const ticket: SupportTicketData = {
        id: localSupportTickets.length + 1,
        userId: phone,
        subject: params.subject,
        message: params.message,
        timestamp: Date.now(),
        status: 'open',
      };
      localSupportTickets.push(ticket);
      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });
}

// Alias for backward compat
export const useSubmitSupportTicket = useCreateSupportTicket;

export function useUpdateSupportTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: number; status: TicketStatus }) => {
      const ticket = localSupportTickets.find((t) => t.id === params.id);
      if (ticket) ticket.status = params.status;
      return params;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });
}

// ── Admin Bookings ────────────────────────────────────────────────────────────

export function useGetAllBookings() {
  return useQuery<AdminBooking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      return localBookings.slice().reverse().map((booking) => ({
        booking,
        userProfile: null,
        partner: PARTNERS.find((p) => p.id === booking.partnerId) || null,
      }));
    },
  });
}

// ── Scrap Shop ────────────────────────────────────────────────────────────────

export function useRegisterScrapShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      ownerName: string;
      shopName: string;
      phone: string;
      email: string;
      city: string;
      area: string;
      pincode: string;
      streetAddress: string;
      scrapCategoriesHandled: number[];
      preferredLanguage: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const shop = await actor.registerScrapShop(
        params.ownerName,
        params.shopName,
        params.phone,
        params.email,
        params.city,
        params.area,
        params.pincode,
        params.streetAddress,
        params.scrapCategoriesHandled.map((id) => BigInt(id)),
        params.preferredLanguage
      );
      return shop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapShop'] });
    },
  });
}

export function useGetScrapShopByPhone(phone: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['scrapShop', phone],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getScrapShopByPhone(phone);
    },
    enabled: !!actor && !actorFetching && !!phone,
  });
}

export function useGetAllScrapShops() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allScrapShops'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllScrapShops();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateScrapShopStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: 'pending' | 'approved' | 'rejected' }) => {
      if (!actor) throw new Error('Actor not available');
      const { ScrapShopStatus } = await import('../backend');
      const statusEnum =
        params.status === 'approved'
          ? ScrapShopStatus.approved
          : params.status === 'rejected'
          ? ScrapShopStatus.rejected
          : ScrapShopStatus.pending;
      return actor.updateScrapShopStatus(params.id, statusEnum);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allScrapShops'] });
    },
  });
}
