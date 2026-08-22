"""WebSocket consumer for real-time notifications.

Auth via ``?token=<access JWT>`` query parameter so the browser can connect
without cookies (the SPA uses Bearer tokens in localStorage).
"""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def user_for_token(token):
    if not token:
        return None
    try:
        access = AccessToken(token)
        user_id = access["user_id"]
    except (InvalidToken, TokenError, KeyError, ValueError):
        return None
    User = get_user_model()
    try:
        return User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return None


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        token = parse_qs(self.scope.get("query_string", b"").decode()).get("token", [None])[0]
        user = await user_for_token(token)
        if user is None:
            await self.close(code=4001)
            return

        self.user = user
        self.groups = [f"notify_{user.id}"]
        if user.is_staff:
            self.groups.append("notify_staff")

        for group in self.groups:
            await self.channel_layer.group_add(group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        for group in getattr(self, "groups", []):
            await self.channel_layer.group_discard(group, self.channel_name)

    async def notify(self, event):
        await self.send_json(event["payload"])
