from django.contrib import admin
from django.contrib.admin.decorators import action as admin_action
from django.utils.html import format_html

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "booked_item", "travel_date", "travelers", "days", "total_price", "status", "created_at")
    list_filter = ("status", "travel_date", "activity__destination", "visit_package__destination")
    search_fields = ("user__email", "activity__name", "visit_package__name")
    list_editable = ("status",)
    date_hierarchy = "travel_date"
    autocomplete_fields = ("user",)

    @admin.display(description="Booked item")
    def booked_item(self, obj):
        if obj.visit_package:
            return f"{obj.visit_package.name} (visit)"
        return obj.activity.name if obj.activity else "—"

    @admin_action(description="Mark selected as confirmed")
    def make_confirmed(self, request, queryset):
        queryset.update(status=Booking.Status.CONFIRMED)

    @admin_action(description="Cancel selected bookings")
    def cancel_selected(self, request, queryset):
        queryset.update(status=Booking.Status.CANCELLED)

    actions = (make_confirmed, cancel_selected)

    def status_badge(self, obj):
        colors = {"pending": "orange", "confirmed": "green", "cancelled": "red"}
        return format_html(
            '<b style="color: {};">{}</b>', colors.get(obj.status, "black"), obj.get_status_display()
        )
