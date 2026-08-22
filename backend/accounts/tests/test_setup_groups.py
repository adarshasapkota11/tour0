import pytest
from django.contrib.auth.models import Group, Permission
from django.core.management import call_command


def perm_codes(group):
    return set(
        group.permissions.filter(content_type__app_label="inquiries").values_list(
            "codename", flat=True
        )
    )


@pytest.mark.django_db
class TestSetupGroups:
    def test_creates_groups_with_inquiry_perms(self):
        call_command("setup_groups")

        content = Group.objects.get(name="Content Manager")
        booking = Group.objects.get(name="Booking Manager")

        assert {"view_inquiry", "change_inquiry"} <= perm_codes(content)
        assert {"view_inquiry", "change_inquiry"} <= perm_codes(booking)

    def test_content_manager_has_full_destination_and_booking_view(self):
        call_command("setup_groups")
        content = Group.objects.get(name="Content Manager")
        codes = set(content.permissions.values_list("codename", flat=True))
        assert {
            "view_destination",
            "change_destination",
            "view_booking",
            "change_booking",
            "view_payment",
            "change_payment",
        } <= codes

    def test_idempotent(self):
        call_command("setup_groups")
        call_command("setup_groups")
        assert Group.objects.filter(name="Content Manager").count() == 1
        assert Group.objects.filter(name="Booking Manager").count() == 1
