from rest_framework import serializers

from .models import Inquiry, InquiryMessage


class InquiryMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.full_name", read_only=True)
    sender_email = serializers.CharField(source="sender.email", read_only=True)

    class Meta:
        model = InquiryMessage
        fields = ("id", "sender_name", "sender_email", "is_from_staff", "body", "created_at")


class InquiryListSerializer(serializers.ModelSerializer):
    message_count = serializers.IntegerField(read_only=True)
    last_message = serializers.CharField(read_only=True)
    last_message_at = serializers.DateTimeField(read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = Inquiry
        fields = (
            "id",
            "subject",
            "status",
            "message_count",
            "last_message",
            "last_message_at",
            "user_email",
            "user_full_name",
            "created_at",
            "updated_at",
        )


class InquiryDetailSerializer(serializers.ModelSerializer):
    messages = InquiryMessageSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = Inquiry
        fields = (
            "id",
            "subject",
            "status",
            "messages",
            "user_email",
            "user_full_name",
            "created_at",
            "updated_at",
        )


class InquiryCreateSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=150)
    message = serializers.CharField(max_length=4000)


class InquiryMessageCreateSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=4000)
