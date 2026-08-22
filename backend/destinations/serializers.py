from rest_framework import serializers

from .models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationGallery,
    DestinationVisitPackage,
)


class DestinationGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = DestinationGallery
        fields = ("id", "image", "caption")


class DestinationVisitPackageSerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination.name", read_only=True)
    destination_slug = serializers.CharField(source="destination.slug", read_only=True)
    destination_image = serializers.SerializerMethodField()

    class Meta:
        model = DestinationVisitPackage
        fields = (
            "id",
            "destination",
            "destination_name",
            "destination_slug",
            "destination_image",
            "name",
            "price",
            "days",
            "description",
            "capacity",
        )

    def get_destination_image(self, obj):
        if obj.destination.cover_image:
            return obj.destination.cover_image.url
        return None


class ActivityCategorySerializer(serializers.ModelSerializer):
    activity_count = serializers.IntegerField(source="activities.count", read_only=True)

    class Meta:
        model = ActivityCategory
        fields = ("id", "name", "slug", "icon", "activity_count")


class ActivitySerializer(serializers.ModelSerializer):
    destination_name = serializers.CharField(source="destination.name", read_only=True)
    destination_slug = serializers.SlugField(source="destination.slug", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.SlugField(source="category.slug", read_only=True)

    class Meta:
        model = Activity
        fields = (
            "id",
            "destination",
            "destination_name",
            "destination_slug",
            "category",
            "category_name",
            "category_slug",
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


class DestinationSerializer(serializers.ModelSerializer):
    gallery = DestinationGallerySerializer(many=True, read_only=True)
    visit_packages = DestinationVisitPackageSerializer(many=True, read_only=True)
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
            "visit_packages",
            "activity_count",
        )
