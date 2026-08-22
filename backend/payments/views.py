from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from notifications.notify import notify_user

from .models import Payment
from .serializers import PaymentInitiateSerializer, PaymentVerifySerializer
from .services import PaymentError, initiate_payment, verify_payment


class PaymentInitiateView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = Booking.objects.filter(
            pk=serializer.validated_data["booking_id"], user=request.user
        ).first()
        if not booking:
            return Response(
                {"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            payload = initiate_payment(
                booking,
                serializer.validated_data["gateway"],
                return_url=serializer.validated_data.get("return_url", ""),
                failure_url=serializer.validated_data.get("failure_url", ""),
            )
        except PaymentError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(payload, status=status.HTTP_200_OK)


class PaymentVerifyView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = Booking.objects.filter(
            pk=serializer.validated_data["booking_id"], user=request.user
        ).first()
        if not booking:
            return Response(
                {"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND
            )

        payment = getattr(booking, "payment", None)
        if not payment:
            return Response(
                {"detail": "No payment initiated for this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = verify_payment(
                payment,
                ref_id=serializer.validated_data.get("ref_id"),
                pidx=serializer.validated_data.get("pidx"),
            )
        except PaymentError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )
        if payment.status == Payment.Status.SUCCESS:
            notify_user(
                request.user,
                "payment_success",
                "Payment successful. Booking confirmed.",
                link="/my-bookings",
            )
        return Response(
            {
                "detail": "Payment successful. Booking confirmed.",
                "payment_id": payment.id,
                "transaction_id": payment.transaction_id,
                "status": payment.status,
            },
            status=status.HTTP_200_OK,
        )
