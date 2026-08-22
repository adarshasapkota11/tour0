from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .emails import send_booking_cancelled, send_booking_confirmation
from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.select_related(
            "activity__destination", "visit_package__destination"
        ).filter(user=self.request.user)

    def perform_create(self, serializer):
        booking = serializer.save(user=self.request.user)
        send_booking_confirmation(booking)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {"detail": "Booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if booking.status == Booking.Status.CONFIRMED:
            return Response(
                {"detail": "Confirmed bookings cannot be cancelled online. Contact support."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reason = request.data.get("reason", "")
        booking.status = Booking.Status.CANCELLED
        booking.cancel_reason = reason
        booking.save(update_fields=["status", "cancel_reason", "updated_at"])
        send_booking_cancelled(booking)
        return Response(self.get_serializer(booking).data)
