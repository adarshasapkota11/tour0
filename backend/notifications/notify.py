"""Broadcast notifications to connected clients via Channels."""

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model

from .models import Notification


def _broadcast(group, payload):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        group, {"type": "notify", "payload": payload}
    )


def _payload(notification):
    return {
        "id": notification.id,
        "verb": notification.verb,
        "text": notification.text,
        "link": notification.link,
        "created_at": notification.created_at.isoformat(),
    }


def notify_user(user, verb, text, link=""):
    """Create a notification for ``user`` and broadcast to their channel group."""
    notification = Notification.objects.create(
        user=user, verb=verb, text=text, link=link
    )
    _broadcast(f"notify_{user.id}", _payload(notification))


def notify_staff(verb, text, link=""):
    """Create a notification for every active staff user and broadcast to staff."""
    User = get_user_model()
    staff = list(User.objects.filter(is_staff=True, is_active=True))
    if not staff:
        return
    notifications = [
        Notification(user=user, verb=verb, text=text, link=link) for user in staff
    ]
    Notification.objects.bulk_create(notifications)
    _broadcast(
        "notify_staff",
        {"verb": verb, "text": text, "link": link},
    )
