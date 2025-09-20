import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Layout Components
import Layout from './components/layout/Layout';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Page Components
import HomePage from './pages/HomePage';
import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import HotelsPage from './pages/hotels/HotelsPage';
import HotelDetailPage from './pages/hotels/HotelDetailPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import VehiclesPage from './pages/vehicles/VehiclesPage';
import VehicleDetailPage from './pages/vehicles/VehicleDetailPage';
import VehicleBookingPage from './pages/vehicles/VehicleBookingPage';
import VehicleRentalConfirmation from './pages/vehicles/VehicleRentalConfirmation';
import GuideBookingPage from './pages/guides/GuideBookingPage';
import GuideDetailPage from './pages/guides/GuideDetailPage';
import TripPlanningPage from './pages/TripPlanningPage';
import GuidesPage from './pages/GuidesPage';
import DashboardRouter from './components/DashboardRouter';

import BookingPage from './pages/booking/BookingPage';
import PaymentPage from './pages/payment/PaymentPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import ContactSupportPage from './pages/support/ContactSupportPage';
import MySupportRequestsPage from './pages/support/MySupportRequestsPage';
import SupportRequestDetailPage from './pages/support/SupportRequestDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TripRequestsManagement from './pages/admin/TripRequestsManagement';
import UserManagement from './pages/admin/UserManagement';
import ContentManagement from './pages/admin/ContentManagement';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

// Role-based Dashboards
import HotelOwnerDashboard from './pages/hotel-owner/HotelOwnerDashboard';
import VehicleOwnerDashboard from './pages/vehicle-owner/VehicleOwnerDashboard';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import TripRequestsPage from './pages/staff/TripRequestsPage';
import VehicleApprovalsPage from './pages/staff/VehicleApprovalsPage';
import SupportPage from './pages/staff/SupportPage';
import UsersPage from './pages/staff/UsersPage';
import AnalyticsPage from './pages/staff/AnalyticsPage';
import SettingsPage from './pages/staff/SettingsPage';

// Hotel Owner Pages

// Guide Pages
import GuideDashboard from './pages/guide/GuideDashboard';

// Import new authentication components
import LoginPage from './pages/LoginPage';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import EmailVerificationForm from './components/auth/EmailVerificationForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import UserOnlyRoute from './components/auth/UserOnlyRoute';
import GuideLayout from './components/layout/GuideLayout';
import EditProfile from './pages/guide/EditProfile';
import ManageServices from './pages/guide/ManageServices';
import SetAvailability from './pages/guide/SetAvailability';
import MyBookings from './pages/guide/MyBookings';
import MyProfile from './pages/guide/MyProfile';
import Earnings from './pages/guide/Earnings';
import Reviews from './pages/guide/Reviews';
import Settings from './pages/guide/Settings';
import Analytics from './pages/guide/Analytics';

// Import AI Chatbot
import AIChatbot from './components/chat/AIChatbot';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BookingProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* Admin Routes - Completely Separate Layout */}
                <Route path="/admin/*" element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminLayout>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="trip-requests" element={<TripRequestsManagement />} />
                        <Route path="trip-requests/:id" element={<TripRequestsManagement />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="content" element={<ContentManagement />} />
                        <Route path="analytics" element={<AnalyticsDashboard />} />
                        <Route path="tours" element={<ContentManagement />} />
                        <Route path="hotels" element={<ContentManagement />} />
                        <Route path="vehicles" element={<ContentManagement />} />
                        <Route path="guides" element={<UserManagement />} />
                        <Route path="hotel-owners" element={<UserManagement />} />
                        <Route path="settings" element={<AdminDashboard />} />
                      </Routes>
                    </AdminLayout>
                  </RoleBasedRoute>
                } />

                {/* Guide Routes - Separate Layout */}
                <Route path="/guide/*" element={
                  <Routes>
                    <Route path="dashboard" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <GuideDashboard />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="bookings" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <MyBookings />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="profile" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <MyProfile />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="earnings" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <Earnings />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="reviews" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <Reviews />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="settings" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <Settings />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="analytics" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <Analytics />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="profile/edit" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <EditProfile />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="services" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <ManageServices />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                    <Route path="availability" element={
                      <RoleBasedRoute allowedRoles={['guide']}>
                        <GuideLayout>
                          <SetAvailability />
                        </GuideLayout>
                      </RoleBasedRoute>
                    } />
                  </Routes>
                } />

              {/* Staff Routes - Separate Layout */}
              <Route path="/staff/*" element={
                <Routes>
                  <Route path="dashboard" element={
                    <RoleBasedRoute allowedRoles={['staff']}>
                      <StaffDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="trip-requests" element={
                    <RoleBasedRoute allowedRoles={['staff']}>
                      <TripRequestsPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="vehicle-approvals" element={
                    <RoleBasedRoute allowedRoles={['staff']}>
                      <VehicleApprovalsPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="support" element={
                    <RoleBasedRoute allowedRoles={['staff']}>
                      <SupportPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="users" element={
                    <RoleBasedRoute allowedRoles={['staff']}>
                      <UsersPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="analytics" element={
                    <RoleBasedRoute allowedRoles={['staff']}>
                      <AnalyticsPage />
                    </RoleBasedRoute>
                  } />
                  <Route path="settings" element={
                    <RoleBasedRoute allowedRoles={['staff']}>
                      <SettingsPage />
                    </RoleBasedRoute>
                  } />
                </Routes>
              } />

              {/* Hotel Owner Routes - Separate Layout */}
              <Route path="/hotel-owner/*" element={
                <Routes>
                  <Route path="dashboard" element={
                    <RoleBasedRoute allowedRoles={['hotel_owner']}>
                      <HotelOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="hotels" element={
                    <RoleBasedRoute allowedRoles={['hotel_owner']}>
                      <HotelOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="bookings" element={
                    <RoleBasedRoute allowedRoles={['hotel_owner']}>
                      <HotelOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="availability" element={
                    <RoleBasedRoute allowedRoles={['hotel_owner']}>
                      <HotelOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="reviews" element={
                    <RoleBasedRoute allowedRoles={['hotel_owner']}>
                      <HotelOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="analytics" element={
                    <RoleBasedRoute allowedRoles={['hotel_owner']}>
                      <HotelOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="settings" element={
                    <RoleBasedRoute allowedRoles={['hotel_owner']}>
                      <HotelOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                </Routes>
              } />

              {/* Vehicle Owner Routes - Separate Layout */}
              <Route path="/vehicle-owner/*" element={
                <Routes>
                  <Route path="dashboard" element={
                    <RoleBasedRoute allowedRoles={['vehicle_owner']}>
                      <VehicleOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="vehicles" element={
                    <RoleBasedRoute allowedRoles={['vehicle_owner']}>
                      <VehicleOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="rentals" element={
                    <RoleBasedRoute allowedRoles={['vehicle_owner']}>
                      <VehicleOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="availability" element={
                    <RoleBasedRoute allowedRoles={['vehicle_owner']}>
                      <VehicleOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="maintenance" element={
                    <RoleBasedRoute allowedRoles={['vehicle_owner']}>
                      <VehicleOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="analytics" element={
                    <RoleBasedRoute allowedRoles={['vehicle_owner']}>
                      <VehicleOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                  <Route path="settings" element={
                    <RoleBasedRoute allowedRoles={['vehicle_owner']}>
                      <VehicleOwnerDashboard />
                    </RoleBasedRoute>
                  } />
                </Routes>
              } />

                {/* Regular Routes with Tourist Layout */}
                <Route path="/*" element={
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <Layout>
                      <Routes>
                        {/* Public Routes - Only for regular users */}
                        <Route path="/" element={
                          <UserOnlyRoute>
                            <HomePage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/tours" element={
                          <UserOnlyRoute>
                            <ToursPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/tours/:id" element={
                          <UserOnlyRoute>
                            <TourDetailPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/hotels" element={
                          <UserOnlyRoute>
                            <HotelsPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/hotels/:id" element={
                          <UserOnlyRoute>
                            <HotelDetailPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/vehicles" element={
                          <UserOnlyRoute>
                            <VehiclesPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/vehicles/:id" element={
                          <UserOnlyRoute>
                            <VehicleDetailPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/vehicles/:id/book" element={
                          <UserOnlyRoute>
                            <VehicleBookingPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/vehicles/:id/rental-confirmation" element={
                          <UserOnlyRoute>
                            <VehicleRentalConfirmation />
                          </UserOnlyRoute>
                        } />
                        <Route path="/guides" element={
                          <UserOnlyRoute>
                            <GuidesPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/guides/:id" element={
                          <UserOnlyRoute>
                            <GuideDetailPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/guides/:id/book" element={
                          <UserOnlyRoute>
                            <GuideBookingPage />
                          </UserOnlyRoute>
                        } />
                        <Route path="/plan-trip" element={
                          <UserOnlyRoute>
                            <TripPlanningPage />
                          </UserOnlyRoute>
                        } />

                        {/* Protected Routes - Only for regular users */}
                        <Route path="/bookings" element={
                          <UserOnlyRoute>
                            <ProtectedRoute>
                              <MyBookingsPage />
                            </ProtectedRoute>
                          </UserOnlyRoute>
                        } />
                        <Route path="/booking/:tourId" element={
                          <UserOnlyRoute>
                            <ProtectedRoute>
                              <BookingPage />
                            </ProtectedRoute>
                          </UserOnlyRoute>
                        } />
                        <Route path="/payment/:bookingId" element={
                          <UserOnlyRoute>
                            <ProtectedRoute>
                              <PaymentPage />
                            </ProtectedRoute>
                          </UserOnlyRoute>
                        } />
                        <Route path="/payment/success/:bookingId" element={
                          <UserOnlyRoute>
                            <PaymentSuccessPage />
                          </UserOnlyRoute>
                        } />

                        {/* Support Routes */}
                        <Route path="/support/contact" element={<ContactSupportPage />} />
                        <Route path="/support/my-requests" element={
                          <ProtectedRoute>
                            <MySupportRequestsPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/support/requests/:id" element={
                          <ProtectedRoute>
                            <SupportRequestDetailPage />
                          </ProtectedRoute>
                        } />

                        {/* Authentication Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterForm />} />
                        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
                        <Route path="/verify-email/:token" element={<EmailVerificationForm />} />
                        <Route path="/verify-email" element={<EmailVerificationForm />} />



                        {/* Dashboard Router */}
                        <Route path="/dashboard" element={<DashboardRouter />} />

                        {/* 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Layout>
                    <Footer />
                  </div>
                } />
              </Routes>
              
              {/* AI Chatbot - Available on all pages */}
              <AIChatbot />
              
              {/* Toast Notifications */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </Router>
          </BookingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;