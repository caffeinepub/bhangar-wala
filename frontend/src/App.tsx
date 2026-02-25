import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Splash from './pages/Splash';
import Login from './pages/Login';
import OtpVerification from './pages/OtpVerification';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import BookPickup from './pages/BookPickup';
import BookingConfirmation from './pages/BookingConfirmation';
import TrackPickup from './pages/TrackPickup';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import RateService from './pages/RateService';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import AddAddress from './pages/AddAddress';
import EditAddress from './pages/EditAddress';
import Support from './pages/Support';
import Notifications from './pages/Notifications';

const PartnerPanel = lazy(() => import('./pages/PartnerPanel'));
const AdminRates = lazy(() => import('./pages/AdminRates'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const AdminPartners = lazy(() => import('./pages/AdminPartners'));
const AdminSupportTickets = lazy(() => import('./pages/AdminSupportTickets'));
const AdminShopRegistrations = lazy(() => import('./pages/AdminShopRegistrations'));
const ShopRegister = lazy(() => import('./pages/ShopRegister'));
const ShopRegisterStatus = lazy(() => import('./pages/ShopRegisterStatus'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Public routes
const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/splash',
  component: Splash,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const otpVerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/otp-verification',
  component: OtpVerification,
});

const profileSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile-setup',
  component: ProfileSetup,
});

// Standalone routes (no bottom nav layout)
const partnerPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partner-panel',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <PartnerPanel />
    </Suspense>
  ),
});

const adminRatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rates',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AdminRates />
    </Suspense>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AdminDashboard />
    </Suspense>
  ),
});

const adminBookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/bookings',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AdminBookings />
    </Suspense>
  ),
});

const adminPartnersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/partners',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AdminPartners />
    </Suspense>
  ),
});

const adminSupportTicketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/support-tickets',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AdminSupportTickets />
    </Suspense>
  ),
});

const adminShopRegistrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/shop-registrations',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <AdminShopRegistrations />
    </Suspense>
  ),
});

const shopRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop-register',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <ShopRegister />
    </Suspense>
  ),
});

const shopRegisterStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop-register/status',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <ShopRegisterStatus />
    </Suspense>
  ),
});

// Layout route for authenticated pages
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/home',
  component: Home,
});

const bookPickupRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/book-pickup',
  component: BookPickup,
});

const bookingConfirmationRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/booking-confirmation',
  component: BookingConfirmation,
});

const trackPickupRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/track-pickup',
  component: TrackPickup,
});

const paymentRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/payment',
  component: Payment,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const rateServiceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/rate-service',
  component: RateService,
});

const bookingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/bookings',
  component: Bookings,
});

const bookingDetailsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/booking-details/$id',
  component: BookingDetails,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/profile',
  component: Profile,
});

const addressesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/addresses',
  component: Addresses,
});

const addAddressRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/add-address',
  component: AddAddress,
});

const editAddressRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/edit-address/$id',
  component: EditAddress,
});

const supportRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/support',
  component: Support,
});

const notificationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/notifications',
  component: Notifications,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/splash' });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  splashRoute,
  loginRoute,
  otpVerificationRoute,
  profileSetupRoute,
  partnerPanelRoute,
  adminRatesRoute,
  adminDashboardRoute,
  adminBookingsRoute,
  adminPartnersRoute,
  adminSupportTicketsRoute,
  adminShopRegistrationsRoute,
  shopRegisterRoute,
  shopRegisterStatusRoute,
  layoutRoute.addChildren([
    homeRoute,
    bookPickupRoute,
    bookingConfirmationRoute,
    trackPickupRoute,
    paymentRoute,
    paymentSuccessRoute,
    rateServiceRoute,
    bookingsRoute,
    bookingDetailsRoute,
    profileRoute,
    addressesRoute,
    addAddressRoute,
    editAddressRoute,
    supportRoute,
    notificationsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
