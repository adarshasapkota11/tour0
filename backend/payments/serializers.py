from rest_framework import serializers

from bookings.models import Booking

from .models import Payment


class PaymentInitiateSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    gateway = serializers.ChoiceField(choices=Payment.Gateway.choices)
    return_url = serializers.URLField(allow_blank=True, required=False)
    failure_url = serializers.URLField(allow_blank=True, required=False)


class PaymentVerifySerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    ref_id = serializers.CharField(allow_blank=True, required=False)
    pidx = serializers.CharField(allow_blank=True, required=False)
