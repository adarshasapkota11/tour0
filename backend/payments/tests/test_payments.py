import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User
from bookings.models import Booking
from destinations.models import Activity, ActivityCategory, Destination
from payments.models import Payment


def future_date():
    return (timezone.localdate() + timezone.timedelta(days=30)).isoformat()

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    return User.objects.create_user(email="payer@example.com", password="password123")


@pytest.fixture
def activity():
    category = ActivityCategory.objects.create(name="Adventure")
    destination = Destination.objects.create(name="Pokhara", province="Gandaki", description="Lake city")
    return Activity.objects.create(
        destination=destination, category=category, name="Paragliding",
        description="Fly", price=7500,
    )


@pytest.fixture
def booking(user, activity):
    return Booking.objects.create(
        user=user,
        activity=activity,
        travel_date=(timezone.localdate() + timezone.timedelta(days=30)).isoformat(),
        travelers=2,
    )


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user)
    return client


def test_initiate_requires_auth(booking):
    assert APIClient().post("/api/payments/initiate/", {"booking_id": booking.id, "gateway": "esewa"}).status_code == 401


def test_initiate_returns_dev_payload(auth_client, booking):
    response = auth_client.post(
        "/api/payments/initiate/",
        {"booking_id": booking.id, "gateway": "esewa"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["dev_mode"] is True
    assert response.data["amount"] == "15000.00"
    assert Payment.objects.filter(booking=booking).exists()


def test_verify_confirms_booking(auth_client, booking):
    auth_client.post("/api/payments/initiate/", {"booking_id": booking.id, "gateway": "esewa"}, format="json")
    response = auth_client.post(
        "/api/payments/verify/", {"booking_id": booking.id, "ref_id": "test-ref"}, format="json"
    )
    assert response.status_code == 200
    booking.refresh_from_db()
    payment = booking.payment
    assert booking.status == Booking.Status.CONFIRMED
    assert payment.status == Payment.Status.SUCCESS
    assert payment.transaction_id == "test-ref"


def test_verify_without_initiate(auth_client, booking):
    response = auth_client.post("/api/payments/verify/", {"booking_id": booking.id}, format="json")
    assert response.status_code == 400


def test_initiate_cancelled_booking(auth_client, booking):
    booking.status = Booking.Status.CANCELLED
    booking.save(update_fields=["status"])
    response = auth_client.post(
        "/api/payments/initiate/", {"booking_id": booking.id, "gateway": "esewa"}, format="json"
    )
    assert response.status_code == 400


def test_cannot_pay_someone_else_booking(user, activity, booking):
    other = User.objects.create_user(email="other@example.com", password="password123")
    client = APIClient()
    client.force_authenticate(other)
    response = client.post(
        "/api/payments/initiate/", {"booking_id": booking.id, "gateway": "esewa"}, format="json"
    )
    assert response.status_code == 404


def test_payment_str(booking):
    payment = Payment.objects.create(
        booking=booking, gateway="esewa", amount=15000, transaction_uuid="uuid-1",
    )
    assert str(payment) == f"{booking} - esewa - pending"


def test_payment_default_status(booking):
    payment = Payment.objects.create(
        booking=booking, gateway="esewa", amount=15000, transaction_uuid="uuid-2",
    )
    assert payment.status == "pending"


def test_payment_unique_uuid(booking):
    user2 = User.objects.create_user(email="second@example.com", password="password123")
    from destinations.models import ActivityCategory, Activity
    cat = ActivityCategory.objects.create(name="X")
    dest = Destination.objects.create(name="D", province="P", description="Desc")
    act = Activity.objects.create(destination=dest, category=cat, name="Act", description="Desc", price=1000)
    b2 = Booking.objects.create(user=user2, activity=act, travel_date=future_date(), travelers=1)
    Payment.objects.create(booking=booking, gateway="esewa", amount=15000, transaction_uuid="uuid-a")
    Payment.objects.create(booking=b2, gateway="khalti", amount=1000, transaction_uuid="uuid-b")
    assert Payment.objects.count() == 2


def test_payment_cascade_delete(booking):
    Payment.objects.create(
        booking=booking, gateway="esewa", amount=15000, transaction_uuid="uuid-c",
    )
    assert Payment.objects.count() == 1
    booking.delete()
    assert Payment.objects.count() == 0
