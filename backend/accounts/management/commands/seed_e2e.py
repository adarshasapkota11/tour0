"""Seed deterministic data for Playwright E2E tests.

Destroys all non-superuser data first so the database is in a known state.
Run with:  python manage.py seed_e2e
"""

from datetime import date, timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from bookings.models import Booking
from django.contrib.auth.models import Group
from destinations.models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationVisitPackage,
)
from inquiries.models import Inquiry, InquiryMessage
from notifications.models import Notification


class Command(BaseCommand):
    help = "Reset and seed deterministic data for E2E tests."

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            self.stdout.write(self.style.WARNING(
                "Skipping E2E seed in production (DEBUG=False). "
                "Set DJANGO_DEBUG=True to run."
            ))
            return

        self.stdout.write("Resetting database…")
        Group.objects.all().delete()
        Notification.objects.all().delete()
        InquiryMessage.objects.all().delete()
        Inquiry.objects.all().delete()
        Booking.objects.all().delete()
        Activity.objects.all().delete()
        DestinationVisitPackage.objects.all().delete()
        ActivityCategory.objects.all().delete()
        Destination.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        # ── Users ──────────────────────────────────────────────────────
        regular = User.objects.create_user(
            email="e2e@test.com",
            password="e2e1234!",
            full_name="E2E Test User",
            phone="9800000001",
        )
        staff = User.objects.create_user(
            email="e2e-admin@test.com",
            password="e2e1234!",
            full_name="E2E Admin User",
            is_staff=True,
        )
        for group_name in ("Content Manager", "Booking Manager"):
            group, _ = Group.objects.get_or_create(name=group_name)
            staff.groups.add(group)
        self.stdout.write(f"  Users: {regular.email}, {staff.email}")

        # ── Category ───────────────────────────────────────────────────
        cat_adventure = ActivityCategory.objects.create(
            name="Adventure", icon="🏔"
        )
        cat_culture = ActivityCategory.objects.create(
            name="Culture", icon="🏛"
        )

        # ── Destinations ───────────────────────────────────────────────
        ktm = Destination.objects.create(
            name="Kathmandu",
            province="Bagmati",
            description="Historic capital of Nepal with UNESCO heritage sites.",
            latitude="27.717200",
            longitude="85.324000",
            is_featured=True,
        )
        pokhara = Destination.objects.create(
            name="Pokhara",
            province="Gandaki",
            description="Adventure capital beside Phewa Lake.",
            latitude="28.209600",
            longitude="83.985600",
            is_featured=True,
        )
        chitwan = Destination.objects.create(
            name="Chitwan",
            province="Bagmati",
            description="Jungle safari paradise.",
            latitude="27.531800",
            longitude="84.476900",
            is_featured=False,
        )
        everest = Destination.objects.create(
            name="Mount Everest",
            province="Province 1",
            description="Home of the world's highest peak and legendary trekking routes.",
            latitude="27.988100",
            longitude="86.925000",
            is_featured=True,
        )
        bhote_koshi = Destination.objects.create(
            name="Bhote Koshi",
            province="Bagmati",
            description="Adrenaline-pumping rafting and bungee over a turquoise gorge.",
            latitude="27.867400",
            longitude="85.931200",
            is_featured=False,
        )
        janakpur = Destination.objects.create(
            name="Janakpur",
            province="Province 2",
            description="Sacred city of Goddess Sita and stunning Mithila art.",
            latitude="26.728800",
            longitude="85.924900",
            is_featured=False,
        )
        mustang = Destination.objects.create(
            name="Mustang",
            province="Gandaki",
            description="Ancient forbidden kingdom with dramatic desert landscapes.",
            latitude="28.780400",
            longitude="83.723000",
            is_featured=True,
        )

        # ── Activities ─────────────────────────────────────────────────
        act_paragliding = Activity.objects.create(
            destination=pokhara,
            category=cat_adventure,
            name="Tandem Paragliding",
            description="Soar over Phewa Lake with a certified pilot.",
            price=7500,
            duration="45 minutes",
            capacity=30,
            difficulty="moderate",
            is_featured=True,
        )
        act_heritage = Activity.objects.create(
            destination=ktm,
            category=cat_culture,
            name="Heritage Walking Tour",
            description="Walk through Durbar Square and Swayambhunath.",
            price=2500,
            duration="4 hours",
            capacity=10,
            difficulty="easy",
            is_featured=True,
        )
        act_safari = Activity.objects.create(
            destination=chitwan,
            category=cat_adventure,
            name="Jungle Safari",
            description="Jeep safari for rhinos and tigers.",
            price=3000,
            duration="4 hours",
            capacity=16,
            difficulty="moderate",
            is_featured=False,
        )
        act_everest_trek = Activity.objects.create(
            destination=everest,
            category=cat_adventure,
            name="Everest Base Camp Trek",
            description="14-day trek to the foot of the world's highest mountain.",
            price=85000,
            duration="14 days",
            capacity=12,
            difficulty="challenging",
            is_featured=True,
        )
        act_everest_flight = Activity.objects.create(
            destination=everest,
            category=cat_adventure,
            name="Mountain Flight",
            description="Scenic flight past Everest, Lhotse, and Makalu.",
            price=12000,
            duration="1 hour",
            capacity=20,
            difficulty="easy",
            is_featured=False,
        )
        act_bhote_rafting = Activity.objects.create(
            destination=bhote_koshi,
            category=cat_adventure,
            name="Bhote Koshi White-Water Rafting",
            description="Class IV–V rapids through a steep Himalayan gorge.",
            price=6500,
            duration="2 days",
            capacity=16,
            difficulty="challenging",
            is_featured=True,
        )
        act_bhote_bungee = Activity.objects.create(
            destination=bhote_koshi,
            category=cat_adventure,
            name="Tibetan Bridge Bungee",
            description="160m freefall over the Bhote Koshi River.",
            price=9000,
            duration="30 minutes",
            capacity=8,
            difficulty="challenging",
            is_featured=False,
        )
        act_janakpur_temple = Activity.objects.create(
            destination=janakpur,
            category=cat_culture,
            name="Janaki Mandir Tour",
            description="Visit the stunning marble temple dedicated to Goddess Sita.",
            price=1500,
            duration="3 hours",
            capacity=20,
            difficulty="easy",
            is_featured=True,
        )
        act_janakpur_art = Activity.objects.create(
            destination=janakpur,
            category=cat_culture,
            name="Mithila Art Workshop",
            description="Learn traditional Madhubani painting from local artists.",
            price=3000,
            duration="4 hours",
            capacity=10,
            difficulty="easy",
            is_featured=False,
        )
        act_mustang_trek = Activity.objects.create(
            destination=mustang,
            category=cat_adventure,
            name="Upper Mustang Trek",
            description="Journey through the ancient walled kingdom of Lo Manthang.",
            price=95000,
            duration="16 days",
            capacity=8,
            difficulty="challenging",
            is_featured=True,
        )
        act_mustang_cave = Activity.objects.create(
            destination=mustang,
            category=cat_culture,
            name="Sky Caves Exploration",
            description="Discover mysterious cliff-side caves thousands of years old.",
            price=5000,
            duration="5 hours",
            capacity=10,
            difficulty="moderate",
            is_featured=False,
        )

        # ── Visit Packages ─────────────────────────────────────────────
        pkg_ktm = DestinationVisitPackage.objects.create(
            destination=ktm,
            name="Kathmandu Day Pass",
            price=4500,
            days=1,
            description="Heritage sites and local markets.",
            capacity=8,
        )
        pkg_pokhara = DestinationVisitPackage.objects.create(
            destination=pokhara,
            name="Pokhara Getaway",
            price=9500,
            days=3,
            description="Lake views and adventure.",
            capacity=14,
        )
        pkg_everest = DestinationVisitPackage.objects.create(
            destination=everest,
            name="Everest Panorama Tour",
            price=35000,
            days=5,
            description="Scenic mountain views without the full trek.",
            capacity=10,
        )
        pkg_mustang = DestinationVisitPackage.objects.create(
            destination=mustang,
            name="Mustang Explorer",
            price=55000,
            days=7,
            description="Discover ancient monasteries and desert canyons.",
            capacity=6,
        )

        # ── Bookings ───────────────────────────────────────────────────
        today = date.today()
        b1 = Booking(
            user=regular,
            activity=act_paragliding,
            travel_date=today + timedelta(days=14),
            travelers=2,
        )
        b1.save()  # triggers auto-calc of total_price
        b2 = Booking(
            user=regular,
            visit_package=pkg_ktm,
            travel_date=today + timedelta(days=30),
            travelers=1,
        )
        b2.save()

        # ── Inquiry ────────────────────────────────────────────────────
        inq = Inquiry.objects.create(
            user=regular,
            subject="Question about paragliding safety",
            status="open",
        )
        InquiryMessage.objects.create(
            inquiry=inq,
            sender=regular,
            is_from_staff=False,
            body="Is tandem paragliding safe for beginners?",
        )
        InquiryMessage.objects.create(
            inquiry=inq,
            sender=staff,
            is_from_staff=True,
            body="Yes, you fly with a certified pilot. Safety briefing provided.",
        )

        # ── Notification for staff ─────────────────────────────────────
        Notification.objects.create(
            user=staff,
            verb="New inquiry received",
            text=f"New inquiry: {inq.subject}",
            link=f"/admin/inquiries",
        )

        self.stdout.write(self.style.SUCCESS(
            "E2E seed complete: "
            f"{User.objects.count()} users, "
            f"{Destination.objects.count()} destinations, "
            f"{Activity.objects.count()} activities, "
            f"{ActivityCategory.objects.count()} categories, "
            f"{DestinationVisitPackage.objects.count()} packages, "
            f"{Booking.objects.count()} bookings, "
            f"{Inquiry.objects.count()} inquiries, "
            f"{Notification.objects.count()} notifications."
        ))
