from django.contrib import admin

from accounts.admin import UserAdmin
from accounts.models import User
from bookings.admin import BookingAdmin
from bookings.models import Booking
from destinations.admin import ActivityAdmin, ActivityCategoryAdmin, DestinationAdmin
from destinations.models import Activity, ActivityCategory, Destination, DestinationVisitPackage
from inquiries.admin import InquiryAdmin
from inquiries.models import Inquiry
from notifications.models import Notification
from payments.admin import PaymentAdmin
from payments.models import Payment

from .stats import get_dashboard_stats, get_recent_bookings


class DashboardAdminSite(admin.AdminSite):
    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["stats"] = get_dashboard_stats()
        extra_context["recent_bookings"] = get_recent_bookings(8)
        return super().index(request, extra_context=extra_context)


admin_site = DashboardAdminSite(name="admin")

admin_site.site_header = "TourNepal Admin"
admin_site.site_title = "TourNepal Admin"
admin_site.index_title = "Manage destinations, activities, visit packages, bookings and payments"

admin_site.register(User, UserAdmin)
admin_site.register(Destination, DestinationAdmin)
admin_site.register(ActivityCategory, ActivityCategoryAdmin)
admin_site.register(Activity, ActivityAdmin)
admin_site.register(DestinationVisitPackage)
admin_site.register(Booking, BookingAdmin)
admin_site.register(Payment, PaymentAdmin)
admin_site.register(Inquiry, InquiryAdmin)
admin_site.register(Notification)
