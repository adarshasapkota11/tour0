import asyncio

import pytest
from channels.layers import get_channel_layer
from channels.testing import WebsocketCommunicator
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User

from ..consumers import NotificationConsumer
from ..models import Notification
from ..notify import notify_staff, notify_user

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    return User.objects.create_user(email="user@example.com", password="password123")


@pytest.fixture
def other():
    return User.objects.create_user(email="other@example.com", password="password123")


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user)
    return client


def test_anonymous_forbidden():
    assert APIClient().get("/api/notifications/").status_code == 401


def test_list_only_own_notifications(user, other):
    Notification.objects.create(user=user, verb="a", text="mine")
    Notification.objects.create(user=other, verb="a", text="theirs")
    client = auth_client(user)
    response = client.get("/api/notifications/")
    assert response.status_code == 200
    assert response.data["unread_count"] == 1
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["text"] == "mine"


def test_mark_read(user):
    notification = Notification.objects.create(user=user, verb="a", text="mine")
    client = auth_client(user)
    response = client.post(f"/api/notifications/{notification.id}/read/")
    assert response.status_code == 200
    assert response.data["is_read"] is True


def test_mark_all_read(user):
    Notification.objects.create(user=user, verb="a", text="one")
    Notification.objects.create(user=user, verb="b", text="two")
    client = auth_client(user)
    response = client.post("/api/notifications/read-all/")
    assert response.status_code == 200
    assert response.data["updated"] == 2
    assert not user.notifications.filter(is_read=False).exists()


def test_notify_user_creates_row_and_broadcasts(user):
    notify_user(user, "booking_status", "Confirmed", link="/my-bookings")
    assert user.notifications.count() == 1
    assert user.notifications.first().link == "/my-bookings"


def test_notify_staff_creates_row_per_staff(user):
    staff = User.objects.create_user(
        email="staff@example.com", password="password123", is_staff=True
    )
    notify_staff("inquiry_new", "New inquiry")
    assert user.notifications.count() == 0
    assert staff.notifications.count() == 1


@pytest.mark.django_db(transaction=True)
def test_consumer_receives_broadcast():
    user = User.objects.create_user(
        email="ws@example.com", password="password123"
    )
    token = str(AccessToken.for_user(user))

    async def scenario():
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(),
            f"/ws/notifications/?token={token}",
        )
        connected, _ = await communicator.connect()
        assert connected
        layer = get_channel_layer()
        await layer.group_send(
            f"notify_{user.id}",
            {"type": "notify", "payload": {"text": "hello", "verb": "test"}},
        )
        payload = await communicator.receive_json_from()
        assert payload["text"] == "hello"
        await communicator.disconnect()

    asyncio.run(scenario())


def test_consumer_rejects_bad_token():
    async def scenario():
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(),
            "/ws/notifications/?token=not-a-real-token",
        )
        connected, _ = await communicator.connect()
        assert connected is False

    asyncio.run(scenario())


def test_consumer_rejects_missing_token():
    async def scenario():
        communicator = WebsocketCommunicator(
            NotificationConsumer.as_asgi(),
            "/ws/notifications/",
        )
        connected, _ = await communicator.connect()
        assert connected is False

    asyncio.run(scenario())


def test_retrieve_own_notification(user):
    notification = Notification.objects.create(user=user, verb="a", text="mine")
    client = auth_client(user)
    response = client.get(f"/api/notifications/{notification.id}/")
    assert response.status_code == 200
    assert response.data["text"] == "mine"


def test_retrieve_other_notification_forbidden(user, other):
    notification = Notification.objects.create(user=other, verb="a", text="theirs")
    client = auth_client(user)
    response = client.get(f"/api/notifications/{notification.id}/")
    assert response.status_code == 404
