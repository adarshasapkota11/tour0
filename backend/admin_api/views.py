from django.db.models.deletion import ProtectedError
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from destinations.models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationGallery,
    DestinationVisitPackage,
)
from payments.models import Payment

from config.permissions import HasModelPerm, IsStaffUser
from config.stats import get_chart_data, get_dashboard_stats, get_recent_bookings
from notifications.notify import notify_user

from .bills import generate_bill_pdf
from .reports import get_report_data

from .serializers import (
    AdminActivitySerializer,
    AdminBookingSerializer,
    AdminCategorySerializer,
    AdminDestinationSerializer,
    AdminGallerySerializer,
    AdminPaymentSerializer,
    AdminVisitPackageSerializer,
)


class AdminDestinationViewSet(viewsets.ModelViewSet):
    permission_classes = (HasModelPerm("destinations", "destination"),)
    queryset = Destination.objects.prefetch_related("gallery", "activities")
    serializer_class = AdminDestinationSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("is_featured", "province")
    search_fields = ("name", "province", "description")
    ordering = ("name",)


class AdminActivityViewSet(viewsets.ModelViewSet):
    permission_classes = (HasModelPerm("destinations", "activity"),)
    queryset = Activity.objects.select_related("destination", "category")
    serializer_class = AdminActivitySerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("category", "destination", "is_featured", "difficulty")
    search_fields = ("name", "description", "destination__name")
    ordering = ("name",)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = (HasModelPerm("destinations", "activitycategory"),)
    queryset = ActivityCategory.objects.all()
    serializer_class = AdminCategorySerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name",)
    ordering = ("name",)

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            raise ValidationError(
                "This category is in use by one or more activities and cannot be deleted."
            )


class AdminGalleryViewSet(viewsets.ModelViewSet):
    permission_classes = (HasModelPerm("destinations", "destinationgallery"),)
    queryset = DestinationGallery.objects.select_related("destination")
    serializer_class = AdminGallerySerializer
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ("destination",)
    ordering = ("id",)


class AdminVisitPackageViewSet(viewsets.ModelViewSet):
    permission_classes = (HasModelPerm("destinations", "destinationvisitpackage"),)
    queryset = DestinationVisitPackage.objects.select_related("destination")
    serializer_class = AdminVisitPackageSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("destination", "is_active")
    search_fields = ("name", "destination__name")
    ordering = ("days", "name")


class AdminBookingViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (HasModelPerm("bookings", "booking"),)
    queryset = Booking.objects.select_related(
        "user", "activity__destination", "visit_package__destination"
    )
    serializer_class = AdminBookingSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("status", "activity__destination", "visit_package__destination", "payment__status")
    search_fields = (
        "user__email",
        "user__full_name",
        "activity__name",
        "visit_package__name",
    )
    ordering = ("-created_at",)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[HasModelPerm("bookings", "booking", {"change"})],
    )
    def confirm(self, request, pk=None):
        booking = self.get_object()
        booking.status = Booking.Status.CONFIRMED
        booking.save(update_fields=["status", "updated_at"])
        notify_user(
            booking.user,
            "booking_status",
            "Your booking has been confirmed",
            link="/my-bookings",
        )
        return Response(self.get_serializer(booking).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[HasModelPerm("bookings", "booking", {"change"})],
    )
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=["status", "updated_at"])
        notify_user(
            booking.user,
            "booking_status",
            "Your booking has been cancelled",
            link="/my-bookings",
        )
        return Response(self.get_serializer(booking).data)


class AdminPaymentViewSet(viewsets.ModelViewSet):
    permission_classes = (HasModelPerm("payments", "payment"),)
    queryset = Payment.objects.select_related(
        "booking__user", "booking__activity", "booking__visit_package"
    )
    serializer_class = AdminPaymentSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("status", "gateway")
    search_fields = (
        "transaction_uuid",
        "transaction_id",
        "booking__user__email",
        "booking__activity__name",
        "booking__visit_package__name",
    )
    ordering = ("-created_at",)


class AdminStatsView(APIView):
    permission_classes = (IsStaffUser,)

    def get(self, request):
        stats = get_dashboard_stats()
        recent = AdminBookingSerializer(get_recent_bookings(8), many=True).data
        return Response({"stats": stats, "chart": get_chart_data(), "recent_bookings": recent})


class AdminReportView(APIView):
    permission_classes = (IsStaffUser,)

    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        return Response(get_report_data(start, end))


class AdminBillPDFView(APIView):
    permission_classes = (IsStaffUser,)
    queryset = Booking.objects.select_related(
        "user", "activity__destination", "visit_package__destination"
    )

    def get(self, request, booking_id):
        try:
            booking = self.queryset.get(id=booking_id)
        except Booking.DoesNotExist:
            raise NotFound("Booking not found.")
        pdf = generate_bill_pdf(booking)
        response = HttpResponse(pdf, content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="bill-{booking.id}.pdf"'
        return response
