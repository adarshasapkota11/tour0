from django.contrib import admin

from .models import Inquiry, InquiryMessage


class InquiryMessageInline(admin.TabularInline):
    model = InquiryMessage
    extra = 0
    fields = ("sender", "is_from_staff", "body", "created_at")
    readonly_fields = ("sender", "is_from_staff", "body", "created_at")
    can_delete = False


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("id", "subject", "user", "status", "message_count", "created_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("subject", "user__email", "user__full_name")
    readonly_fields = ("user", "subject", "created_at", "updated_at")
    inlines = (InquiryMessageInline,)
    list_editable = ("status",)

    @admin.display(description="Messages")
    def message_count(self, obj):
        return obj.messages.count()
