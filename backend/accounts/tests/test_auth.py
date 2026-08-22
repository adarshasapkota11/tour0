import pytest
from rest_framework.test import APIClient

from accounts.models import User

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(email="tester@example.com", password="password123")


def test_register_success(client):
    response = client.post(
        "/api/auth/register/",
        {"email": "new@example.com", "password": "password123", "full_name": "New User"},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["email"] == "new@example.com"
    assert User.objects.filter(email="new@example.com").exists()


def test_register_duplicate_email(client, user):
    response = client.post(
        "/api/auth/register/",
        {"email": user.email, "password": "password123"},
        format="json",
    )
    assert response.status_code == 400


def test_register_short_password(client):
    response = client.post(
        "/api/auth/register/", {"email": "a@example.com", "password": "short"}, format="json"
    )
    assert response.status_code == 400


def test_login_success(client, user):
    response = client.post(
        "/api/auth/login/", {"email": user.email, "password": "password123"}, format="json"
    )
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


def test_login_wrong_password(client, user):
    response = client.post(
        "/api/auth/login/", {"email": user.email, "password": "wrongpass"}, format="json"
    )
    assert response.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/auth/me/").status_code == 401


def test_me_returns_user(client, user):
    client.force_authenticate(user)
    response = client.get("/api/auth/me/")
    assert response.status_code == 200
    assert response.data["email"] == user.email


def test_token_refresh_success(client, user):
    login = client.post(
        "/api/auth/login/", {"email": user.email, "password": "password123"}, format="json"
    )
    refresh_token = login.data["refresh"]
    response = client.post(
        "/api/auth/refresh/", {"refresh": refresh_token}, format="json"
    )
    assert response.status_code == 200
    assert "access" in response.data


def test_token_refresh_invalid(client):
    response = client.post(
        "/api/auth/refresh/", {"refresh": "garbage-token"}, format="json"
    )
    assert response.status_code == 401


def test_user_str(user):
    assert str(user) == "tester@example.com"


def test_user_email_required():
    with pytest.raises(ValueError, match="The Email field must be set"):
        User.objects.create_user(email="", password="password123")


def test_user_email_normalized():
    user = User.objects.create_user(email="TEST@EXAMPLE.COM", password="password123")
    assert user.email == "TEST@example.com"


def test_create_superuser_is_staff():
    admin = User.objects.create_superuser(email="admin@example.com", password="password123")
    assert admin.is_staff is True
    assert admin.is_superuser is True


def test_create_user_not_staff():
    user = User.objects.create_user(email="normal@example.com", password="password123")
    assert user.is_staff is False
    assert user.is_superuser is False


def test_username_field_is_email():
    assert User.USERNAME_FIELD == "email"
