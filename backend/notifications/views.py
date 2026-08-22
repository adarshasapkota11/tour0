from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = NotificationSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("is_read", "verb")

    def get_queryset(self):
        return self.request.user.notifications.all()

    def list(self, request, *args, **kwargs):
        unread = request.user.notifications.filter(is_read=False).count()
        response = super().list(request, *args, **kwargs)
        response.data["unread_count"] = unread
        return response

    @action(detail=True, methods=["post"], url_path="read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=["post"], url_path="read-all")
    def mark_all_read(self, request):
        updated = request.user.notifications.filter(is_read=False).update(is_read=True)
        return Response({"updated": updated})
