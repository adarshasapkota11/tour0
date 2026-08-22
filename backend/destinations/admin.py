from decimal import Decimal

from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationGallery,
    DestinationVisitPackage,
)


class DestinationGalleryInline(admin.TabularInline):
    model = DestinationGallery
    extra = 1


class DestinationVisitPackageInline(admin.TabularInline):
    model = DestinationVisitPackage
    extra = 0


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ("name", "province", "is_featured", "activity_count", "cover_preview")
    list_filter = ("province", "is_featured")
    search_fields = ("name", "province", "description")
    prepopulated_fields = {"slug": ("name",)}
    inlines = (DestinationGalleryInline, DestinationVisitPackageInline)

    @admin.display(description="Cover")
    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html('<img src="{}" height="48" />', obj.cover_image.url)
        return "—"

    @admin.display(description="Activities")
    def activity_count(self, obj):
        return obj.activities.count()


@admin.register(ActivityCategory)
class ActivityCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "icon", "activity_count")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    @admin.display(description="Activities")
    def activity_count(self, obj):
        return obj.activities.count()


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("name", "destination", "category", "price", "duration", "difficulty", "capacity", "is_featured", "image_preview")
    list_filter = ("category", "destination", "difficulty", "is_featured")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("price", "is_featured")
    autocomplete_fields = ("destination",)

    @admin.display(description="Image")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="48" />', obj.image.url)
        return "—"

    @admin.action(description="Increase prices by 10%")
    def increase_prices_10(self, request, queryset):
        for activity in queryset:
            activity.price = round(activity.price * Decimal("1.10"), 2)
        Activity.objects.bulk_update(queryset, ["price"])
        self.message_user(request, f"Updated {queryset.count()} activity price(s).")

    @admin.action(description="Decrease prices by 10%")
    def decrease_prices_10(self, request, queryset):
        for activity in queryset:
            activity.price = round(activity.price * Decimal("0.90"), 2)
        Activity.objects.bulk_update(queryset, ["price"])
        self.message_user(request, f"Updated {queryset.count()} activity price(s).")

    @admin.action(description="Set selected to Rs 5,000")
    def set_price_5000(self, request, queryset):
        queryset.update(price=5000.00)
        self.message_user(request, f"Set price for {queryset.count()} activity(ies) to Rs 5,000.")

    actions = (increase_prices_10, decrease_prices_10, set_price_5000)
