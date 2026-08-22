import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import AdminLayout from './components/admin/AdminLayout'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import RequireStaff from './components/RequireStaff'
import { Loading } from './components/State'
import Activities from './pages/Activities'
import ActivityDetail from './pages/ActivityDetail'
import Book from './pages/Book'
import BookVisit from './pages/BookVisit'
import Confirmation from './pages/Confirmation'
import DestinationDetail from './pages/DestinationDetail'
import Destinations from './pages/Destinations'
import Home from './pages/Home'
import Login from './pages/Login'
import MyBookings from './pages/MyBookings'
import NotFound from './pages/NotFound'
import PaymentReturn from './pages/PaymentReturn'
import Privacy from './pages/Privacy'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Search from './pages/Search'

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ActivitiesList = lazy(() => import('./pages/admin/ActivitiesList'))
const ActivityForm = lazy(() => import('./pages/admin/ActivityForm'))
const BookingDetail = lazy(() => import('./pages/admin/BookingDetail'))
const BookingsList = lazy(() => import('./pages/admin/BookingsList'))
const CategoriesList = lazy(() => import('./pages/admin/CategoriesList'))
const CategoryForm = lazy(() => import('./pages/admin/CategoryForm'))
const DestinationsList = lazy(() => import('./pages/admin/DestinationsList'))
const DestinationForm = lazy(() => import('./pages/admin/DestinationForm'))
const InquiriesList = lazy(() => import('./pages/admin/InquiriesList'))
const PaymentDetail = lazy(() => import('./pages/admin/PaymentDetail'))
const PaymentsList = lazy(() => import('./pages/admin/PaymentsList'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const VisitPackageForm = lazy(() => import('./pages/admin/VisitPackageForm'))
const VisitPackagesList = lazy(() => import('./pages/admin/VisitPackagesList'))

export default function App() {
  return (
    <Suspense fallback={<Loading label="Loading…" />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/:slug" element={<ActivityDetail />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:slug" element={<DestinationDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/book/:slug"
            element={
              <RequireAuth>
                <Book />
              </RequireAuth>
            }
          />
          <Route
            path="/book/visit/:packageId"
            element={
              <RequireAuth>
                <BookVisit />
              </RequireAuth>
            }
          />
          <Route
            path="/payment/return/:bookingId"
            element={
              <RequireAuth>
                <PaymentReturn />
              </RequireAuth>
            }
          />
          <Route
            path="/confirmation/:bookingId"
            element={
              <RequireAuth>
                <Confirmation />
              </RequireAuth>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <RequireAuth>
                <MyBookings />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireStaff>
              <AdminLayout />
            </RequireStaff>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="destinations" element={<DestinationsList />} />
          <Route path="destinations/new" element={<DestinationForm />} />
          <Route path="destinations/:id" element={<DestinationForm />} />
          <Route path="activities" element={<ActivitiesList />} />
          <Route path="activities/new" element={<ActivityForm />} />
          <Route path="activities/:id" element={<ActivityForm />} />
          <Route path="categories" element={<CategoriesList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id" element={<CategoryForm />} />
          <Route path="visit-packages" element={<VisitPackagesList />} />
          <Route path="visit-packages/new" element={<VisitPackageForm />} />
          <Route path="visit-packages/:id" element={<VisitPackageForm />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="payments" element={<PaymentsList />} />
          <Route path="payments/:id" element={<PaymentDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="inquiries" element={<InquiriesList />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
