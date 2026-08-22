from django.urls import include, path
from rest_framework.routers import DefaultRouter

from inquiries.views import AdminInquiryViewSet

from .views import (
    AdminActivityViewSet,
    AdminBillPDFView,
    AdminBookingViewSet,
    AdminCategoryViewSet,
    AdminDestinationViewSet,
    AdminGalleryViewSet,
    AdminPaymentViewSet,
    AdminReportView,
    AdminStatsView,
    AdminVisitPackageViewSet,
)

app_name = "admin_api"

router = DefaultRouter()
router.register("destinations", AdminDestinationViewSet, basename="admin-destination")
router.register("activities", AdminActivityViewSet, basename="admin-activity")
router.register("categories", AdminCategoryViewSet, basename="admin-category")
router.register("gallery", AdminGalleryViewSet, basename="admin-gallery")
router.register("visit-packages", AdminVisitPackageViewSet, basename="admin-visit-package")
router.register("bookings", AdminBookingViewSet, basename="admin-booking")
router.register("payments", AdminPaymentViewSet, basename="admin-payment")
router.register("inquiries", AdminInquiryViewSet, basename="admin-inquiry")

urlpatterns = [
    *router.urls,
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("reports/", AdminReportView.as_view(), name="admin-reports"),
    path("bills/<int:booking_id>/pdf/", AdminBillPDFView.as_view(), name="admin-bill-pdf"),
]
