import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User
from bookings.models import Booking
from destinations.models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationVisitPackage,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    return User.objects.create_user(email="booker@example.com", password="password123")


@pytest.fixture
def activity():
    category = ActivityCategory.objects.create(name="Adventure")
    destination = Destination.objects.create(name="Pokhara", province="Gandaki", description="Lake city")
    return Activity.objects.create(
        destination=destination,
        category=category,
        name="Paragliding",
        description="Fly",
        price=7500,
        capacity=10,
    )


@pytest.fixture
def visit_package():
    destination = Destination.objects.create(name="Pokhara", province="Gandaki", description="Lake city")
    return DestinationVisitPackage.objects.create(
        destination=destination,
        name="Pokhara Getaway",
        price=9500,
        days=3,
        capacity=12,
    )


def future_date():
    return (timezone.localdate() + timezone.timedelta(days=30)).isoformat()


def test_create_booking_requires_auth(activity):
    client = APIClient()
    response = client.post(
        "/api/bookings/",
        {"activity": activity.id, "travel_date": future_date(), "travelers": 1},
        format="json",
    )
    assert response.status_code == 401


def test_create_booking_computes_total(user, activity):
    client = APIClient()
    client.force_authenticate(user)
    response = client.post(
        "/api/bookings/",
        {"activity": activity.id, "travel_date": future_date(), "travelers": 3},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["total_price"] == "22500.00"
    assert response.data["status"] == "pending"


def test_create_booking_over_capacity(user, activity):
    client = APIClient()
    client.force_authenticate(user)
    response = client.post(
        "/api/bookings/",
        {"activity": activity.id, "travel_date": future_date(), "travelers": 99},
        format="json",
    )
    assert response.status_code == 400


def test_create_booking_past_date(user, activity):
    client = APIClient()
    client.force_authenticate(user)
    response = client.post(
        "/api/bookings/",
        {"activity": activity.id, "travel_date": "2020-01-01", "travelers": 1},
        format="json",
    )
    assert response.status_code == 400


def test_bookings_are_private(user, activity):
    other = User.objects.create_user(email="other@example.com", password="password123")
    Booking.objects.create(user=other, activity=activity, travel_date=future_date(), travelers=1)
    client = APIClient()
    client.force_authenticate(user)
    response = client.get("/api/bookings/")
    assert response.data["count"] == 0


def test_cancel_pending_booking(user, activity):
    booking = Booking.objects.create(user=user, activity=activity, travel_date=future_date(), travelers=1)
    client = APIClient()
    client.force_authenticate(user)
    response = client.post(f"/api/bookings/{booking.id}/cancel/")
    assert response.status_code == 200
    booking.refresh_from_db()
    assert booking.status == Booking.Status.CANCELLED


def test_cancel_confirmed_booking_blocked(user, activity):
    booking = Booking.objects.create(
        user=user, activity=activity, travel_date=future_date(), travelers=1,
        status=Booking.Status.CONFIRMED,
    )
    client = APIClient()
    client.force_authenticate(user)
    response = client.post(f"/api/bookings/{booking.id}/cancel/")
    assert response.status_code == 400


def test_create_visit_package_booking_computes_total(user, visit_package):
    client = APIClient()
    client.force_authenticate(user)
    response = client.post(
        "/api/bookings/",
        {
            "visit_package": visit_package.id,
            "travel_date": future_date(),
            "travelers": 2,
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.data["total_price"] == "57000.00"
    assert response.data["days"] == 3
    assert response.data["item_type"] == "visit_package"
    assert response.data["visit_package_name"] == "Pokhara Getaway"
    assert response.data["destination_name"] == "Pokhara"


def test_create_booking_requires_exactly_one_of_activity_or_package(user, activity, visit_package):
    client = APIClient()
    client.force_authenticate(user)
    both = client.post(
        "/api/bookings/",
        {
            "activity": activity.id,
            "visit_package": visit_package.id,
            "travel_date": future_date(),
            "travelers": 1,
        },
        format="json",
    )
    assert both.status_code == 400

    neither = client.post(
        "/api/bookings/",
        {"travel_date": future_date(), "travelers": 1},
        format="json",
    )
    assert neither.status_code == 400


def test_create_visit_package_booking_over_capacity(user, visit_package):
    client = APIClient()
    client.force_authenticate(user)
    response = client.post(
        "/api/bookings/",
        {
            "visit_package": visit_package.id,
            "travel_date": future_date(),
            "travelers": 99,
        },
        format="json",
    )
    assert response.status_code == 400


def test_booking_str_activity(user, activity):
    booking = Booking.objects.create(user=user, activity=activity, travel_date=future_date(), travelers=1)
    assert str(booking) == f"{user.email} - {activity.name} - {booking.travel_date}"


def test_booking_str_visit_package(user, visit_package):
    booking = Booking.objects.create(user=user, visit_package=visit_package, travel_date=future_date(), travelers=1)
    assert str(booking) == f"{user.email} - {visit_package.name} - {booking.travel_date}"


def test_booking_auto_price_activity(user, activity):
    booking = Booking.objects.create(user=user, activity=activity, travel_date=future_date(), travelers=3)
    assert booking.total_price == 3 * activity.price


def test_booking_auto_price_visit_package(user, visit_package):
    booking = Booking.objects.create(user=user, visit_package=visit_package, travel_date=future_date(), travelers=2)
    assert booking.total_price == 2 * visit_package.price * visit_package.days


def test_booking_clean_both_set(user, activity, visit_package):
    booking = Booking(user=user, activity=activity, visit_package=visit_package, travel_date=future_date(), travelers=1)
    from django.core.exceptions import ValidationError
    with pytest.raises(ValidationError):
        booking.clean()


def test_booking_clean_neither_set(user):
    booking = Booking(user=user, travel_date=future_date(), travelers=1, total_price=0)
    from django.core.exceptions import ValidationError
    with pytest.raises(ValidationError):
        booking.clean()


def test_booking_ordering(user, activity):
    from django.utils import timezone as tz
    from datetime import timedelta
    b1 = Booking.objects.create(user=user, activity=activity, travel_date=(tz.localdate() + timedelta(days=1)).isoformat(), travelers=1)
    b2 = Booking.objects.create(user=user, activity=activity, travel_date=(tz.localdate() + timedelta(days=2)).isoformat(), travelers=1)
    bookings = list(Booking.objects.all())
    assert bookings[0].id == b2.id
    assert bookings[1].id == b1.id


def test_retrieve_own_booking(user, activity):
    booking = Booking.objects.create(user=user, activity=activity, travel_date=future_date(), travelers=1)
    client = APIClient()
    client.force_authenticate(user)
    response = client.get(f"/api/bookings/{booking.id}/")
    assert response.status_code == 200
    assert response.data["id"] == booking.id
    assert response.data["travelers"] == 1


def test_retrieve_other_booking_forbidden(user, activity):
    other = User.objects.create_user(email="other2@example.com", password="password123")
    booking = Booking.objects.create(user=other, activity=activity, travel_date=future_date(), travelers=1)
    client = APIClient()
    client.force_authenticate(user)
    response = client.get(f"/api/bookings/{booking.id}/")
    assert response.status_code == 404


def test_update_own_booking(user, activity):
    booking = Booking.objects.create(user=user, activity=activity, travel_date=future_date(), travelers=1)
    client = APIClient()
    client.force_authenticate(user)
    response = client.put(
        f"/api/bookings/{booking.id}/",
        {"activity": activity.id, "travel_date": future_date(), "travelers": 2},
        format="json",
    )
    assert response.status_code == 200
    booking.refresh_from_db()
    assert booking.travelers == 2


def test_patch_own_booking(user, activity):
    booking = Booking.objects.create(user=user, activity=activity, travel_date=future_date(), travelers=1)
    client = APIClient()
    client.force_authenticate(user)
    response = client.patch(
        f"/api/bookings/{booking.id}/",
        {"activity": activity.id, "travelers": 2, "travel_date": future_date()},
        format="json",
    )
    assert response.status_code == 200
    booking.refresh_from_db()
    assert booking.travelers == 2


def test_delete_own_booking(user, activity):
    booking = Booking.objects.create(user=user, activity=activity, travel_date=future_date(), travelers=1)
    client = APIClient()
    client.force_authenticate(user)
    response = client.delete(f"/api/bookings/{booking.id}/")
    assert response.status_code == 204
    assert not Booking.objects.filter(pk=booking.id).exists()
