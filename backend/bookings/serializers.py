from django.utils import timezone
from rest_framework import serializers

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    activity_name = serializers.SerializerMethodField()
    destination_name = serializers.SerializerMethodField()
    activity_slug = serializers.SlugField(source="activity.slug", read_only=True, default=None)
    activity_image = serializers.ImageField(source="activity.image", read_only=True, default=None)
    visit_package_name = serializers.CharField(
        source="visit_package.name", read_only=True, default=None
    )
    package_days = serializers.IntegerField(source="visit_package.days", read_only=True, default=None)
    item_type = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "activity",
            "activity_name",
            "activity_slug",
            "destination_name",
            "activity_image",
            "visit_package",
            "visit_package_name",
            "package_days",
            "item_type",
            "days",
            "travel_date",
            "travelers",
            "total_price",
            "status",
            "cancel_reason",
            "created_at",
        )
        read_only_fields = ("total_price", "status", "cancel_reason", "created_at")

    def get_activity_name(self, obj):
        if obj.visit_package:
            return obj.visit_package.name
        return obj.activity.name if obj.activity else None

    def get_destination_name(self, obj):
        if obj.visit_package:
            return obj.visit_package.destination.name
        return obj.activity.destination.name if obj.activity else None

    def get_item_type(self, obj):
        return "visit_package" if obj.visit_package else "activity"

    def validate_travel_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Travel date cannot be in the past.")
        return value

    def validate(self, attrs):
        activity = attrs.get("activity")
        visit_package = attrs.get("visit_package")
        travelers = attrs.get("travelers", 1)

        if bool(activity) == bool(visit_package):
            raise serializers.ValidationError(
                "A booking must reference exactly one of an activity or a visit package."
            )

        capacity = visit_package.capacity if visit_package else activity.capacity
        if capacity and travelers > capacity:
            raise serializers.ValidationError(
                {"travelers": f"Only {capacity} slots available for this booking."}
            )
        return attrs

    def create(self, validated_data):
        travelers = validated_data["travelers"]
        visit_package = validated_data.get("visit_package")
        activity = validated_data.get("activity")
        if visit_package:
            validated_data["days"] = visit_package.days
            validated_data["total_price"] = travelers * visit_package.price * visit_package.days
        else:
            validated_data["total_price"] = travelers * activity.price
        return super().create(validated_data)
