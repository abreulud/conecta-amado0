import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';
import { HomePage } from './components/pages/HomePage';
import { PrivateRoute } from './components/PrivateRoute';
import { ForgotPasswordPage } from './components/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminRoute } from './components/admin/AdminRoute';
import { BookingPage } from './components/pages/BookingPage';
import { UserBookingsPage } from './components/pages/UserBookingsPage';
import { BookingConfirmation } from './components/pages/BookingConfirmation';
import { ServiceDisplayPage } from './components/pages/ServiceDisplayPage';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServiceDisplayPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/book" element={<BookingPage />} />
        </Route>

        <Route path="/my-bookings" element={<UserBookingsPage />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
