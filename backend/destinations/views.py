from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny

from .models import Activity, ActivityCategory, Destination, DestinationVisitPackage
from .serializers import (
    ActivityCategorySerializer,
    ActivitySerializer,
    DestinationSerializer,
    DestinationVisitPackageSerializer,
)


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Destination.objects.prefetch_related("gallery", "activities")
    serializer_class = DestinationSerializer
    lookup_field = "slug"
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("is_featured", "province")
    search_fields = ("name", "province", "description")


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Activity.objects.select_related("destination", "category")
    serializer_class = ActivitySerializer
    lookup_field = "slug"
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("category__slug", "destination__slug", "is_featured", "difficulty")
    search_fields = ("name", "description", "destination__name")
    ordering_fields = ("price", "name")


class ActivityCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = ActivityCategory.objects.all()
    serializer_class = ActivityCategorySerializer
    lookup_field = "slug"


class VisitPackageViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = DestinationVisitPackage.objects.select_related("destination").filter(
        is_active=True
    )
    serializer_class = DestinationVisitPackageSerializer
