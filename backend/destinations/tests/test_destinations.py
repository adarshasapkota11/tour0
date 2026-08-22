import pytest
from rest_framework.test import APIClient

from destinations.models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationVisitPackage,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def seeded():
    client = APIClient()
    category = ActivityCategory.objects.create(name="Adventure")
    destination = Destination.objects.create(
        name="Pokhara",
        province="Gandaki",
        description="Lake city",
        latitude="28.209600",
        longitude="83.985600",
    )
    Activity.objects.create(
        destination=destination,
        category=category,
        name="Paragliding",
        description="Fly",
        price=7500,
        duration="45 min",
    )
    DestinationVisitPackage.objects.create(
        destination=destination,
        name="Pokhara Getaway",
        price=9500,
        days=3,
        capacity=12,
    )
    return client, category, destination


def test_destination_list(seeded):
    client, _, _ = seeded
    response = client.get("/api/destinations/")
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["name"] == "Pokhara"
    assert response.data["results"][0]["latitude"] == "28.209600"
    assert response.data["results"][0]["longitude"] == "83.985600"


def test_destination_detail_by_slug(seeded):
    client, _, destination = seeded
    response = client.get(f"/api/destinations/{destination.slug}/")
    assert response.status_code == 200
    assert response.data["slug"] == destination.slug


def test_destination_detail_includes_visit_packages(seeded):
    client, _, destination = seeded
    response = client.get(f"/api/destinations/{destination.slug}/")
    packages = response.data["visit_packages"]
    assert len(packages) == 1
    assert packages[0]["name"] == "Pokhara Getaway"
    assert packages[0]["price"] == "9500.00"
    assert packages[0]["days"] == 3


def test_visit_package_detail_endpoint(seeded):
    client, _, destination = seeded
    package = destination.visit_packages.first()
    response = client.get(f"/api/visit-packages/{package.id}/")
    assert response.status_code == 200
    assert response.data["name"] == "Pokhara Getaway"
    assert response.data["destination_name"] == "Pokhara"


def test_activity_list_is_public(seeded):
    client, _, _ = seeded
    assert client.get("/api/activities/").status_code == 200


def test_activity_filter_by_category(seeded):
    client, category, _ = seeded
    response = client.get(f"/api/activities/?category__slug={category.slug}")
    assert response.data["count"] == 1
    assert response.data["results"][0]["name"] == "Paragliding"


def test_activity_filter_by_destination(seeded):
    client, _, destination = seeded
    response = client.get(f"/api/activities/?destination__slug={destination.slug}")
    assert response.data["count"] == 1


def test_activity_filter_by_difficulty(seeded):
    client, _, _ = seeded
    response = client.get("/api/activities/?difficulty=challenging")
    assert response.data["count"] == 0


def test_destination_str(seeded):
    _, _, destination = seeded
    assert str(destination) == "Pokhara"


def test_destination_auto_slug():
    destination = Destination.objects.create(
        name="Lumbini", province="Lumbini", description="Birthplace of Buddha"
    )
    assert destination.slug == "lumbini"


def test_destination_slug_unique():
    d1 = Destination.objects.create(name="Kathmandu", province="Bagmati", description="Capital")
    d2 = Destination.objects.create(name="Kathmandu", province="Bagmati", description="Capital again")
    assert d1.slug != d2.slug
    assert d2.slug == "kathmandu-1"


def test_destination_ordering():
    Destination.objects.create(name="Zebra", province="A", description="Z")
    Destination.objects.create(name="Apple", province="B", description="A")
    names = list(Destination.objects.values_list("name", flat=True))
    assert names == ["Apple", "Zebra"]


def test_activity_str(seeded):
    _, _, destination = seeded
    activity = Activity.objects.first()
    assert str(activity) == "Paragliding (Pokhara)"


def test_activity_auto_slug():
    category = ActivityCategory.objects.create(name="Water")
    destination = Destination.objects.create(name="Chitwan", province="Bagmati", description="Jungle")
    activity = Activity.objects.create(
        destination=destination, category=category, name="Kayaking", description="Paddle", price=3000,
    )
    assert activity.slug == "kayaking"


def test_activity_difficulty_choices():
    category = ActivityCategory.objects.create(name="Wellness")
    destination = Destination.objects.create(name="Nagarkot", province="Bagmati", description="Hills")
    activity = Activity.objects.create(
        destination=destination, category=category, name="Yoga", description="Relax", price=2000, difficulty="easy",
    )
    assert activity.difficulty == "easy"


def test_activity_category_protect():
    from django.db import IntegrityError
    category = ActivityCategory.objects.create(name="Trekking")
    destination = Destination.objects.create(name="Everest", province="Koshi", description="Peak")
    Activity.objects.create(
        destination=destination, category=category, name="EBC Trek", description="Trek", price=50000,
    )
    with pytest.raises(IntegrityError):
        category.delete()


def test_category_str():
    category = ActivityCategory.objects.create(name="Cultural")
    assert str(category) == "Cultural"


def test_category_auto_slug():
    category = ActivityCategory.objects.create(name="Wildlife Safari")
    assert category.slug == "wildlife-safari"


def test_visit_package_str(seeded):
    _, _, destination = seeded
    package = destination.visit_packages.first()
    assert str(package) == "Pokhara - Pokhara Getaway (3 day(s))"


def test_activity_detail_by_slug(seeded):
    client, _, _ = seeded
    activity = Activity.objects.first()
    response = client.get(f"/api/activities/{activity.slug}/")
    assert response.status_code == 200
    assert response.data["name"] == "Paragliding"


def test_activity_detail_404(seeded):
    client, _, _ = seeded
    response = client.get("/api/activities/nonexistent/")
    assert response.status_code == 404


def test_category_list(seeded):
    client, _, _ = seeded
    response = client.get("/api/categories/")
    assert response.status_code == 200
    assert response.data["count"] == 1


def test_category_detail_by_slug(seeded):
    client, category, _ = seeded
    response = client.get(f"/api/categories/{category.slug}/")
    assert response.status_code == 200
    assert response.data["name"] == "Adventure"


def test_category_detail_404(seeded):
    client, _, _ = seeded
    response = client.get("/api/categories/nonexistent/")
    assert response.status_code == 404


def test_visit_package_list(seeded):
    client, _, _ = seeded
    response = client.get("/api/visit-packages/")
    assert response.status_code == 200
    assert response.data["count"] == 1
