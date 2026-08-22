from django.db.models import Count, OuterRef, Subquery
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from config.permissions import HasModelPerm
from notifications.notify import notify_staff, notify_user

from .models import Inquiry, InquiryMessage
from .serializers import (
    InquiryCreateSerializer,
    InquiryDetailSerializer,
    InquiryListSerializer,
    InquiryMessageCreateSerializer,
    InquiryMessageSerializer,
)

last_message = (
    InquiryMessage.objects.filter(inquiry=OuterRef("pk"))
    .order_by("-created_at")
    .values("body")[:1]
)
last_message_at = (
    InquiryMessage.objects.filter(inquiry=OuterRef("pk"))
    .order_by("-created_at")
    .values("created_at")[:1]
)


class InquiryViewSet(viewsets.ModelViewSet):
    """Authenticated user's own inquiry threads."""

    permission_classes = (IsAuthenticated,)
    http_method_names = ("get", "post", "head", "options")

    def get_serializer_class(self):
        if self.action in ("list",):
            return InquiryListSerializer
        return InquiryDetailSerializer

    def get_queryset(self):
        return (
            Inquiry.objects.filter(user=self.request.user)
            .prefetch_related("messages__sender")
            .annotate(
                message_count=Count("messages"),
                last_message=Subquery(last_message),
                last_message_at=Subquery(last_message_at),
            )
            .order_by("-updated_at", "-id")
        )

    @action(detail=False, methods=["post"])
    def start(self, request):
        serializer = InquiryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = Inquiry.objects.create(
            user=request.user, subject=serializer.validated_data["subject"]
        )
        InquiryMessage.objects.create(
            inquiry=inquiry,
            sender=request.user,
            is_from_staff=False,
            body=serializer.validated_data["message"],
        )
        notify_staff(
            "inquiry_new",
            f"{request.user.full_name or request.user.email} started an inquiry: {inquiry.subject}",
            link=f"/admin/inquiries/{inquiry.id}",
        )
        return Response(
            InquiryDetailSerializer(inquiry).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"], url_path="messages")
    def send_message(self, request, pk=None):
        inquiry = self.get_object()
        serializer = InquiryMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = InquiryMessage.objects.create(
            inquiry=inquiry,
            sender=request.user,
            is_from_staff=False,
            body=serializer.validated_data["body"],
        )
        notify_staff(
            "inquiry_message",
            f"{request.user.full_name or request.user.email} replied: {message.body[:60]}",
            link=f"/admin/inquiries/{inquiry.id}",
        )
        return Response(
            InquiryMessageSerializer(message).data, status=status.HTTP_201_CREATED
        )


class AdminInquiryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (HasModelPerm("inquiries", "inquiry"),)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ("status",)
    search_fields = ("subject", "user__email", "user__full_name")

    def get_serializer_class(self):
        if self.action == "list":
            return InquiryListSerializer
        return InquiryDetailSerializer

    def get_queryset(self):
        return (
            Inquiry.objects.select_related("user")
            .prefetch_related("messages__sender")
            .annotate(
                message_count=Count("messages"),
                last_message=Subquery(last_message),
                last_message_at=Subquery(last_message_at),
            )
            .order_by("-updated_at", "-id")
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[HasModelPerm("inquiries", "inquiry", {"change"})],
    )
    def reply(self, request, pk=None):
        inquiry = self.get_object()
        serializer = InquiryMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = InquiryMessage.objects.create(
            inquiry=inquiry,
            sender=request.user,
            is_from_staff=True,
            body=serializer.validated_data["body"],
        )
        inquiry.status = Inquiry.Status.OPEN
        inquiry.save(update_fields=["status", "updated_at"])
        notify_user(
            inquiry.user,
            "inquiry_reply",
            "Staff replied to your inquiry",
            link="/inquiries",
        )
        return Response(
            InquiryMessageSerializer(message).data, status=status.HTTP_201_CREATED
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[HasModelPerm("inquiries", "inquiry", {"change"})],
    )
    def resolve(self, request, pk=None):
        inquiry = self.get_object()
        inquiry.status = Inquiry.Status.RESOLVED
        inquiry.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(inquiry).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[HasModelPerm("inquiries", "inquiry", {"change"})],
    )
    def reopen(self, request, pk=None):
        inquiry = self.get_object()
        inquiry.status = Inquiry.Status.OPEN
        inquiry.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(inquiry).data)
