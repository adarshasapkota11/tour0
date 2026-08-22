import pytest
from django.contrib.auth.models import Group, Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIClient

from accounts.models import User
from bookings.models import Booking
from destinations.models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationGallery,
    DestinationVisitPackage,
)
from payments.models import Payment

pytestmark = pytest.mark.django_db

CONTENT_PERMS = [
    ("destinations", "destination", {"view", "add", "change", "delete"}),
    ("destinations", "activity", {"view", "add", "change", "delete"}),
    ("destinations", "activitycategory", {"view", "add", "change", "delete"}),
    ("destinations", "destinationgallery", {"view", "add", "change", "delete"}),
    ("destinations", "destinationvisitpackage", {"view", "add", "change", "delete"}),
    ("bookings", "booking", {"view", "change"}),
    ("payments", "payment", {"view", "change"}),
    ("inquiries", "inquiry", {"view", "change"}),
]


def make_staff_with_perms(email, perm_specs):
    user = User.objects.create_user(email=email, password="password123", is_staff=True)
    group = Group.objects.create(name=f"grp-{email}")
    permission_ids = set()
    for app_label, model, actions in perm_specs:
        codes = {f"{action}_{model}" for action in actions}
        permission_ids |= set(
            Permission.objects.filter(
                codename__in=codes, content_type__app_label=app_label
            ).values_list("id", flat=True)
        )
    group.permissions.set(permission_ids)
    user.groups.add(group)
    return user


def make_image(name="test.png"):
    buffer = __import__("io").BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buffer, format="PNG")
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/png")


@pytest.fixture
def destination():
    return Destination.objects.create(name="Pokhara", province="Gandaki", description="Lake city")


@pytest.fixture
def category():
    return ActivityCategory.objects.create(name="Adventure", icon="\U0001FAA2")


@pytest.fixture
def activity(destination, category):
    return Activity.objects.create(
        destination=destination,
        category=category,
        name="Paragliding",
        description="Fly",
        price=7500,
        capacity=10,
    )


@pytest.fixture
def visit_package(destination):
    return DestinationVisitPackage.objects.create(
        destination=destination,
        name="Pokhara Getaway",
        price=9500,
        days=3,
        capacity=12,
    )


@pytest.fixture
def customer():
    return User.objects.create_user(email="customer@example.com", password="password123")


@pytest.fixture
def booking(customer, activity):
    return Booking.objects.create(
        user=customer,
        activity=activity,
        travel_date=(timezone.localdate() + timezone.timedelta(days=30)).isoformat(),
        travelers=2,
    )


@pytest.fixture
def payment(booking):
    return Payment.objects.create(
        booking=booking,
        gateway=Payment.Gateway.ESEWA,
        transaction_uuid="uuid-1",
        amount=booking.total_price,
        status=Payment.Status.PENDING,
    )


@pytest.fixture
def content_manager():
    return make_staff_with_perms("cm@example.com", CONTENT_PERMS)


@pytest.fixture
def viewer():
    return make_staff_with_perms("viewer@example.com", [("destinations", "activity", {"view"})])


@pytest.fixture
def regular_user():
    return User.objects.create_user(email="user@example.com", password="password123")


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user)
    return client


def test_anonymous_forbidden():
    response = APIClient().get("/api/admin/destinations/")
    assert response.status_code == 401


def test_non_staff_forbidden(regular_user, destination):
    client = auth_client(regular_user)
    assert client.get("/api/admin/destinations/").status_code == 403
    assert client.post("/api/admin/destinations/", {"name": "X"}, format="json").status_code == 403
    assert client.get("/api/admin/stats/").status_code == 403


def test_staff_without_perm_forbidden(viewer, activity):
    client = auth_client(viewer)
    assert client.get("/api/admin/destinations/").status_code == 403
    assert client.get("/api/admin/bookings/").status_code == 403
    assert client.post(
        "/api/admin/activities/",
        {"destination": activity.destination.id, "category": activity.category.id, "name": "X", "price": "100"},
        format="json",
    ).status_code == 403
    assert client.get("/api/admin/activities/").status_code == 200


def test_content_manager_can_list_everything(content_manager):
    client = auth_client(content_manager)
    for url in (
        "/api/admin/destinations/",
        "/api/admin/activities/",
        "/api/admin/categories/",
        "/api/admin/gallery/",
        "/api/admin/visit-packages/",
        "/api/admin/bookings/",
        "/api/admin/payments/",
        "/api/admin/inquiries/",
    ):
        assert client.get(url).status_code == 200, url


def test_content_manager_create_destination(content_manager):
    client = auth_client(content_manager)
    response = client.post(
        "/api/admin/destinations/",
        {
            "name": "Mustang",
            "province": "Gandaki",
            "description": "High desert",
            "latitude": "28.780400",
            "longitude": "83.723000",
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.data["slug"] == "mustang"
    destination = Destination.objects.get(slug="mustang")
    assert str(destination.latitude) == "28.780400"
    assert str(destination.longitude) == "83.723000"


def test_content_manager_update_and_delete_destination(content_manager, destination):
    client = auth_client(content_manager)
    patch = client.patch(
        f"/api/admin/destinations/{destination.id}/",
        {"name": "Pokhara Valley"},
        format="json",
    )
    assert patch.status_code == 200
    destination.refresh_from_db()
    assert destination.name == "Pokhara Valley"

    delete = client.delete(f"/api/admin/destinations/{destination.id}/")
    assert delete.status_code == 204
    assert not Destination.objects.filter(pk=destination.id).exists()


def test_content_manager_create_activity_with_image(content_manager, destination, category):
    client = auth_client(content_manager)
    response = client.post(
        "/api/admin/activities/",
        {
            "destination": destination.id,
            "category": category.id,
            "name": "Ultra Flight",
            "description": "High tandem flight",
            "price": "15000",
            "capacity": 5,
            "difficulty": "moderate",
            "image": make_image(),
        },
        format="multipart",
    )
    assert response.status_code == 201
    activity = Activity.objects.get(slug="ultra-flight")
    assert activity.image.name.startswith("activities/")


def test_content_manager_cannot_delete_category_in_use(content_manager, activity):
    client = auth_client(content_manager)
    response = client.delete(f"/api/admin/categories/{activity.category.id}/")
    assert response.status_code == 400
    assert ActivityCategory.objects.filter(pk=activity.category.id).exists()


def test_content_manager_create_gallery_image(content_manager, destination):
    client = auth_client(content_manager)
    response = client.post(
        "/api/admin/gallery/",
        {"destination": destination.id, "image": make_image(), "caption": "Lakeside"},
        format="multipart",
    )
    assert response.status_code == 201
    assert DestinationGallery.objects.filter(destination=destination).count() == 1


def test_content_manager_crud_visit_package(content_manager, destination):
    client = auth_client(content_manager)
    create = client.post(
        "/api/admin/visit-packages/",
        {
            "destination": destination.id,
            "name": "Pokhara Getaway",
            "price": "9500.00",
            "days": 3,
            "description": "Three days in the lakeside.",
            "capacity": 12,
        },
        format="json",
    )
    assert create.status_code == 201
    package = DestinationVisitPackage.objects.get(name="Pokhara Getaway")
    assert package.days == 3

    patch = client.patch(
        f"/api/admin/visit-packages/{package.id}/",
        {"price": "10500.00"},
        format="json",
    )
    assert patch.status_code == 200
    package.refresh_from_db()
    assert str(package.price) == "10500.00"

    assert client.delete(f"/api/admin/visit-packages/{package.id}/").status_code == 204
    assert not DestinationVisitPackage.objects.filter(pk=package.id).exists()


def test_content_manager_list_shows_visit_package_booking(
    content_manager, customer, visit_package
):
    booking = Booking.objects.create(
        user=customer,
        visit_package=visit_package,
        travel_date=(timezone.localdate() + timezone.timedelta(days=30)).isoformat(),
        travelers=2,
    )
    client = auth_client(content_manager)
    response = client.get("/api/admin/bookings/")
    assert response.status_code == 200
    data = response.data["results"][0]
    assert data["id"] == booking.id
    assert data["item_type"] == "visit_package"
    assert data["visit_package_name"] == "Pokhara Getaway"
    assert data["destination_name"] == "Pokhara"
    assert data["days"] == 3
    assert data["total_price"] == "57000.00"


def test_content_manager_confirm_and_cancel_booking(content_manager, booking):
    client = auth_client(content_manager)
    confirm = client.post(f"/api/admin/bookings/{booking.id}/confirm/")
    assert confirm.status_code == 200
    booking.refresh_from_db()
    assert booking.status == Booking.Status.CONFIRMED

    cancel = client.post(f"/api/admin/bookings/{booking.id}/cancel/")
    assert cancel.status_code == 200
    booking.refresh_from_db()
    assert booking.status == Booking.Status.CANCELLED


def test_content_manager_patch_payment_status(content_manager, payment):
    client = auth_client(content_manager)
    response = client.patch(
        f"/api/admin/payments/{payment.id}/",
        {"status": Payment.Status.SUCCESS, "transaction_id": "esewa-ref-9"},
        format="json",
    )
    assert response.status_code == 200
    payment.refresh_from_db()
    assert payment.status == Payment.Status.SUCCESS
    assert payment.transaction_id == "esewa-ref-9"


def test_cannot_create_booking_directly(content_manager, activity):
    client = auth_client(content_manager)
    response = client.post(
        "/api/admin/bookings/",
        {"activity": activity.id, "travel_date": "2030-01-01", "travelers": 1},
        format="json",
    )
    assert response.status_code == 403


def test_payment_write_methods_restricted(content_manager, payment):
    client = auth_client(content_manager)
    assert client.post("/api/admin/payments/", {}).status_code == 403
    assert client.delete(f"/api/admin/payments/{payment.id}/").status_code == 403


def test_stats_shape(content_manager, booking, payment):
    client = auth_client(content_manager)
    response = client.get("/api/admin/stats/")
    assert response.status_code == 200
    stats = response.data["stats"]
    for key in ("total_bookings", "pending_bookings", "confirmed_bookings", "revenue", "top_activities"):
        assert key in stats
    assert stats["total_bookings"] == 1
    assert isinstance(response.data["recent_bookings"], list)


def test_stats_chart_shape(content_manager, booking, payment):
    client = auth_client(content_manager)
    response = client.get("/api/admin/stats/")
    assert response.status_code == 200
    chart = response.data["chart"]
    assert len(chart["labels"]) == 12
    assert len(chart["bookings_by_month"]) == 12
    assert len(chart["revenue_by_month"]) == 12
    assert chart["bookings_by_month"][-1] == 1
    for status_key in ("pending", "confirmed", "cancelled"):
        assert status_key in chart["bookings_by_status"]
    assert chart["bookings_by_status"]["pending"] == 1
    assert isinstance(chart["top_destinations"], list)


def test_admin_retrieve_destination(content_manager, destination):
    client = auth_client(content_manager)
    response = client.get(f"/api/admin/destinations/{destination.id}/")
    assert response.status_code == 200
    assert response.data["name"] == "Pokhara"


def test_admin_update_destination_full(content_manager, destination):
    client = auth_client(content_manager)
    response = client.put(
        f"/api/admin/destinations/{destination.id}/",
        {"name": "New Pokhara", "province": "Gandaki", "description": "Updated city"},
        format="json",
    )
    assert response.status_code == 200
    destination.refresh_from_db()
    assert destination.name == "New Pokhara"


def test_admin_retrieve_activity(content_manager, activity):
    client = auth_client(content_manager)
    response = client.get(f"/api/admin/activities/{activity.id}/")
    assert response.status_code == 200
    assert response.data["name"] == "Paragliding"


def test_admin_update_activity(content_manager, activity, destination, category):
    client = auth_client(content_manager)
    response = client.put(
        f"/api/admin/activities/{activity.id}/",
        {
            "destination": destination.id,
            "category": category.id,
            "name": "Updated Paragliding",
            "description": "Fly high",
            "price": "10000",
            "capacity": 15,
        },
        format="json",
    )
    assert response.status_code == 200
    activity.refresh_from_db()
    assert activity.name == "Updated Paragliding"


def test_admin_patch_activity(content_manager, activity):
    client = auth_client(content_manager)
    response = client.patch(
        f"/api/admin/activities/{activity.id}/",
        {"price": "8000"},
        format="json",
    )
    assert response.status_code == 200
    activity.refresh_from_db()
    assert str(activity.price) == "8000.00"


def test_admin_delete_activity(content_manager, activity):
    client = auth_client(content_manager)
    response = client.delete(f"/api/admin/activities/{activity.id}/")
    assert response.status_code == 204
    assert not Activity.objects.filter(pk=activity.id).exists()


def test_admin_create_category(content_manager):
    client = auth_client(content_manager)
    response = client.post(
        "/api/admin/categories/",
        {"name": "Water Sports"},
        format="json",
    )
    assert response.status_code == 201
    assert ActivityCategory.objects.filter(name="Water Sports").exists()


def test_admin_retrieve_category(content_manager, category):
    client = auth_client(content_manager)
    response = client.get(f"/api/admin/categories/{category.id}/")
    assert response.status_code == 200
    assert response.data["name"] == "Adventure"


def test_admin_update_category(content_manager, category):
    client = auth_client(content_manager)
    response = client.put(
        f"/api/admin/categories/{category.id}/",
        {"name": "Extreme Sports", "icon": "fire"},
        format="json",
    )
    assert response.status_code == 200
    category.refresh_from_db()
    assert category.name == "Extreme Sports"


def test_admin_patch_category(content_manager, category):
    client = auth_client(content_manager)
    response = client.patch(
        f"/api/admin/categories/{category.id}/",
        {"icon": "star"},
        format="json",
    )
    assert response.status_code == 200
    category.refresh_from_db()
    assert category.icon == "star"


def test_admin_retrieve_gallery(content_manager, destination):
    gallery = DestinationGallery.objects.create(destination=destination, image=make_image(), caption="Lake view")
    client = auth_client(content_manager)
    response = client.get(f"/api/admin/gallery/{gallery.id}/")
    assert response.status_code == 200
    assert response.data["caption"] == "Lake view"


def test_admin_update_gallery(content_manager, destination):
    gallery = DestinationGallery.objects.create(destination=destination, image=make_image(), caption="Lake view")
    client = auth_client(content_manager)
    response = client.put(
        f"/api/admin/gallery/{gallery.id}/",
        {"destination": destination.id, "image": make_image("new.png"), "caption": "Updated view"},
        format="multipart",
    )
    assert response.status_code == 200
    gallery.refresh_from_db()
    assert gallery.caption == "Updated view"


def test_admin_patch_gallery(content_manager, destination):
    gallery = DestinationGallery.objects.create(destination=destination, image=make_image(), caption="Lake view")
    client = auth_client(content_manager)
    response = client.patch(
        f"/api/admin/gallery/{gallery.id}/",
        {"caption": "Patched view"},
        format="json",
    )
    assert response.status_code == 200
    gallery.refresh_from_db()
    assert gallery.caption == "Patched view"


def test_admin_delete_gallery(content_manager, destination):
    gallery = DestinationGallery.objects.create(destination=destination, image=make_image(), caption="Lake view")
    client = auth_client(content_manager)
    response = client.delete(f"/api/admin/gallery/{gallery.id}/")
    assert response.status_code == 204
    assert not DestinationGallery.objects.filter(pk=gallery.id).exists()


def test_admin_retrieve_visit_package(content_manager, visit_package):
    client = auth_client(content_manager)
    response = client.get(f"/api/admin/visit-packages/{visit_package.id}/")
    assert response.status_code == 200
    assert response.data["name"] == "Pokhara Getaway"


def test_admin_update_visit_package(content_manager, visit_package, destination):
    client = auth_client(content_manager)
    response = client.put(
        f"/api/admin/visit-packages/{visit_package.id}/",
        {
            "destination": destination.id,
            "name": "Updated Getaway",
            "price": "12000.00",
            "days": 5,
            "capacity": 10,
        },
        format="json",
    )
    assert response.status_code == 200
    visit_package.refresh_from_db()
    assert visit_package.name == "Updated Getaway"


def test_admin_retrieve_booking(content_manager, booking):
    client = auth_client(content_manager)
    response = client.get(f"/api/admin/bookings/{booking.id}/")
    assert response.status_code == 200
    assert response.data["id"] == booking.id


def test_admin_retrieve_payment(content_manager, payment):
    client = auth_client(content_manager)
    response = client.get(f"/api/admin/payments/{payment.id}/")
    assert response.status_code == 200
    assert response.data["gateway"] == Payment.Gateway.ESEWA


def test_admin_update_payment(content_manager, payment):
    client = auth_client(content_manager)
    response = client.put(
        f"/api/admin/payments/{payment.id}/",
        {
            "status": Payment.Status.SUCCESS,
            "transaction_id": "esewa-123",
            "transaction_uuid": payment.transaction_uuid,
        },
        format="json",
    )
    assert response.status_code == 200
    payment.refresh_from_db()
    assert payment.status == Payment.Status.SUCCESS


def test_admin_retrieve_inquiry(content_manager, customer):
    from inquiries.models import Inquiry
    inquiry = Inquiry.objects.create(user=customer, subject="Test inquiry")
    client = auth_client(content_manager)
    response = client.get(f"/api/admin/inquiries/{inquiry.id}/")
    assert response.status_code == 200
    assert response.data["subject"] == "Test inquiry"
