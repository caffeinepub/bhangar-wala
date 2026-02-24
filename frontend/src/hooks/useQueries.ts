import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { BookingStatus, PaymentMethod, type UserProfile, type Address, type Booking, type BookingItem, type ScrapCategory, type ScrapRate, type ScrapRateWithCategory, type Partner, type Payment, type Rating, type Notification, type SupportTicket } from '../backend';

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
      return actor.getAddresses();
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
      return actor.getAddressById(id);
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
      return actor.addAddress(params.addressLabel, params.street, params.city, params.pincode, params.lat, params.lng);
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
      return actor.updateAddress(params.id, params.addressLabel, params.street, params.city, params.pincode, params.lat, params.lng);
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
      return actor.deleteAddress(id);
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
      return actor.getScrapCategories();
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
      return actor.getScrapRates();
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
      return actor.getScrapRateByCategoryId(categoryId);
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
      return actor.getScrapRatesWithCategories();
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
      return actor.updateScrapRate(params.categoryId, params.pricePerKg);
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
      return actor.getMyBookings();
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
      return actor.getBookingById(id);
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
      return actor.createBooking(params.addressId, params.scheduledTime, params.totalEstimatedAmount);
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
      return actor.addBookingItem(params.bookingId, params.categoryId, params.estimatedWeight);
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
      return actor.getBookingItems(bookingId);
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
      return actor.updateBookingStatus(params.id, params.status);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['booking', vars.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

export function useAssignPartnerToBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; partnerId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignPartnerToBooking(params.bookingId, params.partnerId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['booking', vars.bookingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

export function useUpdateBookingItemFinalWeight() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; finalWeight: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookingItemFinalWeight(params.id, params.finalWeight);
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
      return actor.getPartners();
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
      return actor.getPartnerById(id);
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
      return actor.getPartnerByPhone(phone);
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
      return actor.getBookingsByPartnerId(partnerId);
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
      return actor.partnerAcceptBooking(params.bookingId, params.partnerId);
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
      return actor.partnerUpdateBookingStatus(params.bookingId, params.partnerId);
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
      return actor.createPayment(params.bookingId, params.amount, params.method, params.transactionId);
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
      return actor.getPaymentByBookingId(bookingId);
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
      return actor.submitRating(params.bookingId, params.partnerId, params.stars, params.comment);
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
      return actor.getNotifications();
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
      return actor.markAllNotificationsRead();
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
      return actor.clearAllNotifications();
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
      return actor.submitSupportTicket(params.subject, params.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });
}
