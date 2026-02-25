import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { BookingStatus, ScrapShopStatus, type UserProfile, type ScrapShop } from '../backend';
import type { Principal } from '@dfinity/principal';

// ── Local Types (not exported from new backend interface) ─────────
export interface Address {
  id: bigint;
  userId: Principal;
  addressLabel: string;
  street: string;
  city: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
}

export interface ScrapCategory {
  id: bigint;
  name: string;
  parentId: bigint | null;
  unit: string;
}

export interface ScrapRate {
  id: bigint;
  categoryId: bigint;
  pricePerKg: number;
}

export interface ScrapRateWithCategory {
  id: bigint;
  categoryId: bigint;
  pricePerKg: number;
  categoryName: string;
}

export interface Booking {
  id: bigint;
  userId: Principal;
  addressId: bigint;
  status: BookingStatus;
  scheduledTime: bigint;
  partnerId: bigint | null;
  totalEstimatedAmount: number;
  totalFinalAmount: number | null;
}

export interface BookingItem {
  id: bigint;
  bookingId: bigint;
  categoryId: bigint;
  estimatedWeight: number;
  finalWeight: number | null;
}

export interface Partner {
  id: bigint;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  active: boolean;
}

export interface Payment {
  id: bigint;
  bookingId: bigint;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
}

export interface Rating {
  id: bigint;
  bookingId: bigint;
  userId: Principal;
  partnerId: bigint;
  stars: bigint;
  comment: string | null;
}

export interface Notification {
  id: bigint;
  userId: Principal;
  icon: string;
  title: string;
  message: string;
  timestamp: bigint;
  isRead: boolean;
}

export interface SupportTicket {
  id: bigint;
  userId: Principal;
  subject: string;
  message: string;
  timestamp: bigint;
  status: TicketStatus;
}

export interface AdminBooking {
  booking: Booking;
  userProfile: UserProfile | null;
  partner: Partner | null;
}

export enum PaymentMethod {
  cash = 'cash',
  upi = 'upi',
}

export enum PaymentStatus {
  pending = 'pending',
  completed = 'completed',
  failed = 'failed',
  refunded = 'refunded',
}

export enum TicketStatus {
  open = 'open',
  resolved = 'resolved',
}

// ── User Profile ─────────────────────────────────────────────────
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
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
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Addresses ────────────────────────────────────────────────────
export function useGetAddresses() {
  const { actor, isFetching } = useActor();

  return useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAddresses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAddressById(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Address | null>({
    queryKey: ['address', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return (actor as any).getAddressById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { addressLabel: string; street: string; city: string; pincode: string; lat: number | null; lng: number | null }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addAddress(params.addressLabel, params.street, params.city, params.pincode, params.lat, params.lng);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useUpdateAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; addressLabel: string; street: string; city: string; pincode: string; lat: number | null; lng: number | null }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateAddress(params.id, params.addressLabel, params.street, params.city, params.pincode, params.lat, params.lng);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteAddress(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

// ── Scrap Categories ─────────────────────────────────────────────
export function useGetScrapCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<ScrapCategory[]>({
    queryKey: ['scrapCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getScrapCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetScrapRates() {
  const { actor, isFetching } = useActor();

  return useQuery<ScrapRate[]>({
    queryKey: ['scrapRates'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getScrapRates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetScrapRateByCategoryId(categoryId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ScrapRate | null>({
    queryKey: ['scrapRate', categoryId?.toString()],
    queryFn: async () => {
      if (!actor || categoryId === null) return null;
      return (actor as any).getScrapRateByCategoryId(categoryId);
    },
    enabled: !!actor && !isFetching && categoryId !== null,
  });
}

// ── Scrap Rates With Categories ──────────────────────────────────
export function useGetScrapRatesWithCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<ScrapRateWithCategory[]>({
    queryKey: ['scrapRatesWithCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getScrapRatesWithCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateScrapRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { categoryId: bigint; pricePerKg: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateScrapRate(params.categoryId, params.pricePerKg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapRatesWithCategories'] });
      queryClient.invalidateQueries({ queryKey: ['scrapRates'] });
    },
  });
}

// ── Bookings ─────────────────────────────────────────────────────
export function useGetMyBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['myBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMyBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBookingById(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking | null>({
    queryKey: ['booking', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return (actor as any).getBookingById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { addressId: bigint; scheduledTime: bigint; totalEstimatedAmount: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createBooking(params.addressId, params.scheduledTime, params.totalEstimatedAmount) as Promise<Booking>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

export function useAddBookingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; categoryId: bigint; estimatedWeight: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addBookingItem(params.bookingId, params.categoryId, params.estimatedWeight);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['bookingItems', vars.bookingId.toString()] });
    },
  });
}

export function useGetBookingItems(bookingId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<BookingItem[]>({
    queryKey: ['bookingItems', bookingId?.toString()],
    queryFn: async () => {
      if (!actor || bookingId === null) return [];
      return (actor as any).getBookingItems(bookingId);
    },
    enabled: !!actor && !isFetching && bookingId !== null,
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateBookingStatus(params.id, params.status);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['booking', vars.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useAssignPartnerToBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; partnerId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).assignPartnerToBooking(params.bookingId, params.partnerId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['booking', vars.bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useUpdateBookingItemFinalWeight() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; finalWeight: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateBookingItemFinalWeight(params.id, params.finalWeight);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingItems'] });
    },
  });
}

// ── Partners ─────────────────────────────────────────────────────
export function useGetPartners() {
  const { actor, isFetching } = useActor();

  return useQuery<Partner[]>({
    queryKey: ['partners'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerById(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Partner | null>({
    queryKey: ['partner', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return (actor as any).getPartnerById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetPartnerByPhone(phone: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Partner | null>({
    queryKey: ['partnerByPhone', phone],
    queryFn: async () => {
      if (!actor || !phone) return null;
      return (actor as any).getPartnerByPhone(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
  });
}

export function useGetBookingsByPartnerId(partnerId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['bookingsByPartner', partnerId?.toString()],
    queryFn: async () => {
      if (!actor || partnerId === null) return [];
      return (actor as any).getBookingsByPartnerId(partnerId);
    },
    enabled: !!actor && !isFetching && partnerId !== null,
    refetchInterval: 15000,
  });
}

export function usePartnerAcceptBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; partnerId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).partnerAcceptBooking(params.bookingId, params.partnerId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['bookingsByPartner'] });
      queryClient.invalidateQueries({ queryKey: ['booking', vars.bookingId.toString()] });
    },
  });
}

export function usePartnerUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; partnerId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).partnerUpdateBookingStatus(params.bookingId, params.partnerId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['bookingsByPartner'] });
      queryClient.invalidateQueries({ queryKey: ['booking', vars.bookingId.toString()] });
    },
  });
}

// ── Payments ─────────────────────────────────────────────────────
export function useCreatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; amount: number; method: PaymentMethod; transactionId: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createPayment(params.bookingId, params.amount, params.method, params.transactionId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['payment', vars.bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

export function useGetPaymentByBookingId(bookingId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Payment | null>({
    queryKey: ['payment', bookingId?.toString()],
    queryFn: async () => {
      if (!actor || bookingId === null) return null;
      return (actor as any).getPaymentByBookingId(bookingId);
    },
    enabled: !!actor && !isFetching && bookingId !== null,
  });
}

// ── Ratings ──────────────────────────────────────────────────────
export function useSubmitRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; partnerId: bigint; stars: bigint; comment: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitRating(params.bookingId, params.partnerId, params.stars, params.comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
}

// ── Notifications ────────────────────────────────────────────────
export function useGetNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarkAllNotificationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useClearAllNotifications() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).clearAllNotifications();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ── Support ──────────────────────────────────────────────────────
export function useSubmitSupportTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { subject: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitSupportTicket(params.subject, params.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });
}

// ── Admin Queries ────────────────────────────────────────────────
export function useGetAllBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminBooking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPartners() {
  const { actor, isFetching } = useActor();

  return useQuery<Partner[]>({
    queryKey: ['allPartners'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSupportTickets() {
  const { actor, isFetching } = useActor();

  return useQuery<SupportTicket[]>({
    queryKey: ['allSupportTickets'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllSupportTickets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAddPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; phone: string; vehicle: string; rating: number; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).adminAddPartner(params.name, params.phone, params.vehicle, params.rating, params.active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartners'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useAdminUpdatePartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; name: string; phone: string; vehicle: string; rating: number; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).adminUpdatePartner(params.id, params.name, params.phone, params.vehicle, params.rating, params.active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartners'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useTogglePartnerActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; active: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).togglePartnerActive(params.id, params.active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartners'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useUpdateSupportTicketStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; status: TicketStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateSupportTicketStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSupportTickets'] });
    },
  });
}

// ── Scrap Shop ───────────────────────────────────────────────────
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
      scrapCategoriesHandled: bigint[];
      rawLanguage: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerScrapShop(
        params.ownerName,
        params.shopName,
        params.phone,
        params.email,
        params.city,
        params.area,
        params.pincode,
        params.streetAddress,
        params.scrapCategoriesHandled,
        params.rawLanguage,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapShopByPhone'] });
      queryClient.invalidateQueries({ queryKey: ['allScrapShops'] });
    },
  });
}

export function useGetScrapShopByPhone(phone: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ScrapShop | null>({
    queryKey: ['scrapShopByPhone', phone],
    queryFn: async () => {
      if (!actor || !phone) return null;
      return actor.getScrapShopByPhone(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
  });
}

export function useGetAllScrapShops() {
  const { actor, isFetching } = useActor();

  return useQuery<ScrapShop[]>({
    queryKey: ['allScrapShops'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllScrapShops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateScrapShopStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: ScrapShopStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateScrapShopStatus(params.id, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allScrapShops'] });
      queryClient.invalidateQueries({ queryKey: ['scrapShopByPhone'] });
    },
  });
}
