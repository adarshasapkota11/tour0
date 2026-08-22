from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "booking", "gateway", "amount", "status", "transaction_uuid", "transaction_id", "created_at")
    list_filter = ("gateway", "status")
    search_fields = ("transaction_uuid", "transaction_id", "booking__user__email")
    readonly_fields = ("transaction_uuid",)
