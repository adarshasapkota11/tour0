import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User
from bookings.models import Booking
from destinations.models import Activity, ActivityCategory, Destination
from payments.models import Payment

pytestmark = pytest.mark.django_db


@pytest.fixture
def staff():
    return User.objects.create_user(
        email="staff@example.com", password="password123", is_staff=True
    )


@pytest.fixture
def customer():
    return User.objects.create_user(email="customer@example.com", password="password123")


@pytest.fixture
def activity():
    dest = Destination.objects.create(name="Pokhara", province="Gandaki", description="Lake")
    cat = ActivityCategory.objects.create(name="Adventure", icon="x")
    return Activity.objects.create(
        destination=dest,
        category=cat,
        name="Paragliding",
        description="Fly",
        price=7500,
        capacity=10,
    )


def make_booking(customer, activity, days_from_today):
    travel = timezone.localdate() + timezone.timedelta(days=days_from_today)
    return Booking.objects.create(
        user=customer,
        activity=activity,
        travel_date=travel.isoformat(),
        travelers=2,
    )


@pytest.fixture
def booking(customer, activity):
    return make_booking(customer, activity, 3)


def test_reports_endpoint_summary(staff, customer, activity):
    in_range = make_booking(customer, activity, 3)
    Payment.objects.create(
        booking=in_range,
        gateway=Payment.Gateway.ESEWA,
        transaction_uuid="uuid-a",
        amount=in_range.total_price,
        status=Payment.Status.SUCCESS,
    )
    out_of_range = make_booking(customer, activity, 90)
    Payment.objects.create(
        booking=out_of_range,
        gateway=Payment.Gateway.KHALTI,
        transaction_uuid="uuid-b",
        amount=out_of_range.total_price,
        status=Payment.Status.PENDING,
    )

    today = timezone.localdate()
    client = APIClient()
    client.force_authenticate(staff)
    start = (today + timezone.timedelta(days=1)).isoformat()
    end = (today + timezone.timedelta(days=10)).isoformat()
    response = client.get(f"/api/admin/reports/?start={start}&end={end}")

    assert response.status_code == 200
    data = response.data
    assert data["totals"]["bookings"] == 1
    assert data["totals"]["confirmed"] == 0
    assert data["totals"]["revenue"] == float(in_range.total_price)
    assert data["item_split"]["activity"] == 1
    assert data["item_split"]["visit_package"] == 0
    assert data["payments_by_status"]["success"] == 1
    assert data["payments_by_gateway"]["esewa"] == 1


def test_reports_anonymous_forbidden():
    assert APIClient().get("/api/admin/reports/").status_code == 401


def test_reports_non_staff_forbidden(customer):
    client = APIClient()
    client.force_authenticate(customer)
    assert client.get("/api/admin/reports/").status_code == 403


def test_bill_pdf_returns_pdf(staff, customer, activity):
    booking = make_booking(customer, activity, 3)
    client = APIClient()
    client.force_authenticate(staff)
    response = client.get(f"/api/admin/bills/{booking.id}/pdf/")

    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"
    assert response.content[:4] == b"%PDF"


def test_bill_pdf_anonymous_forbidden(booking):
    response = APIClient().get(f"/api/admin/bills/{booking.id}/pdf/")
    assert response.status_code == 401


def test_bill_pdf_missing_booking(staff):
    client = APIClient()
    client.force_authenticate(staff)
    response = client.get("/api/admin/bills/99999/pdf/")
    assert response.status_code == 404
