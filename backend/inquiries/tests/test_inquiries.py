import pytest
from django.contrib.auth.models import Group, Permission
from rest_framework.test import APIClient

from accounts.models import User
from inquiries.models import Inquiry, InquiryMessage

pytestmark = pytest.mark.django_db


@pytest.fixture
def customer():
    return User.objects.create_user(email="customer@example.com", password="password123")


@pytest.fixture
def other_user():
    return User.objects.create_user(email="other@example.com", password="password123")


@pytest.fixture
def staff():
    user = User.objects.create_user(email="staff@example.com", password="password123", is_staff=True)
    group = Group.objects.create(name="inquiry-staff")
    permission_ids = set(
        Permission.objects.filter(
            codename__in={"view_inquiry", "change_inquiry"},
            content_type__app_label="inquiries",
        ).values_list("id", flat=True)
    )
    group.permissions.set(permission_ids)
    user.groups.add(group)
    return user


@pytest.fixture
def staff_no_perm():
    return User.objects.create_user(email="viewer@example.com", password="password123", is_staff=True)


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user)
    return client


def start_thread(client, subject="Best time to trek", message="When should I go to Annapurna?"):
    return client.post(
        "/api/inquiries/start/",
        {"subject": subject, "message": message},
        format="json",
    )


def test_anonymous_cannot_start_thread():
    response = APIClient().post(
        "/api/inquiries/start/",
        {"subject": "Hi", "message": "Hello"},
        format="json",
    )
    assert response.status_code == 401


def test_user_can_start_thread(customer):
    client = auth_client(customer)
    response = start_thread(client)
    assert response.status_code == 201
    data = response.data
    assert data["subject"] == "Best time to trek"
    assert data["status"] == "open"
    assert len(data["messages"]) == 1
    assert data["messages"][0]["is_from_staff"] is False
    assert data["messages"][0]["body"] == "When should I go to Annapurna?"
    inquiry = Inquiry.objects.get(pk=data["id"])
    assert inquiry.user == customer


def test_user_can_list_own_threads(customer):
    client = auth_client(customer)
    start_thread(client, subject="Thread A", message="One")
    start_thread(client, subject="Thread B", message="Two")
    response = client.get("/api/inquiries/")
    assert response.status_code == 200
    results = response.data["results"]
    assert len(results) == 2
    assert {r["subject"] for r in results} == {"Thread A", "Thread B"}
    assert all(r["message_count"] == 1 for r in results)
    assert {r["last_message"] for r in results} == {"One", "Two"}


def test_user_cannot_see_others_threads(customer, other_user):
    client = auth_client(customer)
    start_thread(client)
    other = auth_client(other_user)
    response = other.get("/api/inquiries/")
    assert response.status_code == 200
    assert len(response.data["results"]) == 0
    own = Inquiry.objects.get(user=customer)
    assert other.get(f"/api/inquiries/{own.id}/").status_code == 404


def test_user_can_send_message_on_thread(customer):
    client = auth_client(customer)
    inquiry = start_thread(client).data["id"]
    response = client.post(
        f"/api/inquiries/{inquiry}/messages/",
        {"body": "Also, which airport should I fly into?"},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["is_from_staff"] is False
    detail = client.get(f"/api/inquiries/{inquiry}/")
    assert len(detail.data["messages"]) == 2
    assert detail.data["messages"][1]["body"].startswith("Also")


def test_user_cannot_send_message_on_others_thread(customer, other_user):
    client = auth_client(customer)
    inquiry = start_thread(client).data["id"]
    other = auth_client(other_user)
    response = other.post(
        f"/api/inquiries/{inquiry}/messages/",
        {"body": "Sneak in"},
        format="json",
    )
    assert response.status_code == 404


def test_staff_can_list_inquiries(staff, customer):
    client = auth_client(customer)
    start_thread(client)
    staff_client = auth_client(staff)
    response = staff_client.get("/api/admin/inquiries/")
    assert response.status_code == 200
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["last_message"] == "When should I go to Annapurna?"


def test_staff_can_reply_to_inquiry(staff, customer):
    client = auth_client(customer)
    inquiry_id = start_thread(client).data["id"]
    staff_client = auth_client(staff)
    response = staff_client.post(
        f"/api/admin/inquiries/{inquiry_id}/reply/",
        {"body": "Best in October — fly into Kathmandu."},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["is_from_staff"] is True
    detail = client.get(f"/api/inquiries/{inquiry_id}/")
    assert len(detail.data["messages"]) == 2
    assert detail.data["messages"][-1]["is_from_staff"] is True


def test_non_staff_cannot_access_admin_inquiries(other_user):
    client = auth_client(other_user)
    assert client.get("/api/admin/inquiries/").status_code == 403


def test_staff_without_perm_cannot_access_admin_inquiries(staff_no_perm, customer):
    client = auth_client(customer)
    start_thread(client)
    staff_client = auth_client(staff_no_perm)
    assert staff_client.get("/api/admin/inquiries/").status_code == 403


def test_staff_can_resolve_inquiry(staff, customer):
    client = auth_client(customer)
    inquiry_id = start_thread(client).data["id"]
    staff_client = auth_client(staff)
    response = staff_client.post(f"/api/admin/inquiries/{inquiry_id}/resolve/")
    assert response.status_code == 200
    assert response.data["status"] == "resolved"


def test_staff_can_reopen_resolved_inquiry(staff, customer):
    client = auth_client(customer)
    inquiry_id = start_thread(client).data["id"]
    Inquiry.objects.filter(id=inquiry_id).update(status=Inquiry.Status.RESOLVED)
    staff_client = auth_client(staff)
    response = staff_client.post(f"/api/admin/inquiries/{inquiry_id}/reopen/")
    assert response.status_code == 200
    assert response.data["status"] == "open"
