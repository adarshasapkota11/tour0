"""Create Django admin permission groups for staff users.

Usage: python manage.py setup_groups
"""

from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand


def get_permissions(app_label, model, actions):
    codes = {f"{action}_{model}" for action in actions}
    return Permission.objects.filter(
        codename__in=codes, content_type__app_label=app_label
    )


def sync_group(name, perm_specs):
    group, _ = Group.objects.get_or_create(name=name)
    permissions = set()
    for app_label, model, actions in perm_specs:
        permissions |= set(get_permissions(app_label, model, actions))
    group.permissions.set(permissions)
    return group


class Command(BaseCommand):
    help = "Create admin permission groups (Content Manager, Booking Manager)."

    def handle(self, *args, **options):
        content_manager = sync_group(
            "Content Manager",
            [
                ("destinations", "destination", {"view", "add", "change", "delete"}),
                ("destinations", "activitycategory", {"view", "add", "change", "delete"}),
                ("destinations", "activity", {"view", "add", "change", "delete"}),
                ("destinations", "destinationgallery", {"view", "add", "change", "delete"}),
                ("destinations", "destinationvisitpackage", {"view", "add", "change", "delete"}),
                ("bookings", "booking", {"view", "change"}),
                ("payments", "payment", {"view", "change"}),
                ("inquiries", "inquiry", {"view", "change"}),
            ],
        )

        booking_manager = sync_group(
            "Booking Manager",
            [
                ("bookings", "booking", {"view", "change"}),
                ("payments", "payment", {"view", "change"}),
                ("destinations", "activity", {"view"}),
                ("inquiries", "inquiry", {"view", "change"}),
            ],
        )

        self.stdout.write(self.style.SUCCESS(
            f"Groups ready: "
            f"{content_manager.name} ({content_manager.permissions.count()} permissions), "
            f"{booking_manager.name} ({booking_manager.permissions.count()} permissions). "
            "Assign staff users to a group in the Django admin."
        ))
