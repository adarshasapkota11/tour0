from rest_framework import serializers

from bookings.models import Booking
from destinations.models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationGallery,
    DestinationVisitPackage,
)
from payments.models import Payment


class AdminDestinationSerializer(serializers.ModelSerializer):
    gallery = serializers.SerializerMethodField()
    activity_count = serializers.IntegerField(source="activities.count", read_only=True)

    class Meta:
        model = Destination
        fields = (
            "id",
            "name",
            "slug",
            "province",
            "description",
            "cover_image",
            "latitude",
            "longitude",
            "is_featured",
            "gallery",
            "activity_count",
        )
        read_only_fields = ("id", "gallery", "activity_count")
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}

    def get_gallery(self, obj):
        return AdminGallerySerializer(obj.gallery.all(), many=True).data


class AdminActivitySerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Activity
        fields = (
            "id",
            "destination",
            "destination_name",
            "category",
            "category_name",
            "name",
            "slug",
            "description",
            "image",
            "price",
            "duration",
            "capacity",
            "difficulty",
            "is_featured",
        )
        read_only_fields = ("id", "destination_name", "category_name")
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}


class AdminCategorySerializer(serializers.ModelSerializer):
    activity_count = serializers.IntegerField(source="activities.count", read_only=True)

    class Meta:
        model = ActivityCategory
        fields = ("id", "name", "slug", "icon", "activity_count")
        read_only_fields = ("id", "activity_count")
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}


class AdminGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = DestinationGallery
        fields = ("id", "destination", "image", "caption")


class AdminVisitPackageSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination.name", read_only=True)

    class Meta:
        model = DestinationVisitPackage
        fields = (
            "id",
            "destination",
            "destination_name",
            "name",
            "price",
            "days",
            "description",
            "capacity",
            "is_active",
        )
        read_only_fields = ("id", "destination_name")


class AdminBookingSerializer(serializers.ModelSerializer):
    activity_name = serializers.SerializerMethodField()
    visit_package_name = serializers.CharField(
        source="visit_package.name", read_only=True, default=None
    )
    destination_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    payment_status = serializers.CharField(
        source="payment.status", read_only=True, default=None
    )

    class Meta:
        model = Booking
        fields = (
            "id",
            "activity",
            "activity_name",
            "visit_package",
            "visit_package_name",
            "destination_name",
            "item_type",
            "days",
            "user",
            "user_email",
            "user_full_name",
            "user_phone",
            "travel_date",
            "travelers",
            "total_price",
            "status",
            "payment_status",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

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


class AdminPaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source="booking.id", read_only=True)
    activity_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source="booking.user.email", read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "booking",
            "booking_id",
            "activity_name",
            "user_email",
            "gateway",
            "amount",
            "status",
            "transaction_uuid",
            "transaction_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "booking",
            "booking_id",
            "activity_name",
            "user_email",
            "gateway",
            "amount",
            "transaction_uuid",
            "created_at",
            "updated_at",
        )

    def get_activity_name(self, obj):
        booking = obj.booking
        if booking.visit_package:
            return booking.visit_package.name
        return booking.activity.name if booking.activity else None
