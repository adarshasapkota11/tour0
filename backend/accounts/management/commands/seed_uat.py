"""Seed realistic UAT data with three user roles.

Creates a customer, a staff admin, and a super admin, plus destinations,
activities, bookings, payments, inquiries, and notifications.

Run with:  python manage.py seed_uat
"""

import uuid
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import Group
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from bookings.models import Booking
from destinations.models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationVisitPackage,
)
from inquiries.models import Inquiry, InquiryMessage
from notifications.models import Notification
from payments.models import Payment

UAT_DOMAIN = "uat.tour0"


class Command(BaseCommand):
    help = "Seed realistic UAT data (customer, admin, superadmin + full catalogue)."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Seeding UAT data…")

        call_command("setup_groups", verbosity=0)

        # ── Upsert users (idempotent) ────────────────────────────────
        customer, _ = User.objects.update_or_create(
            email=f"customer@{UAT_DOMAIN}",
            defaults={
                "full_name": "Ram Bahadur",
                "phone": "9801000001",
                "is_staff": False,
                "is_superuser": False,
            },
        )
        customer.set_password("customer123!")
        customer.save()

        admin_user, _ = User.objects.update_or_create(
            email=f"admin@{UAT_DOMAIN}",
            defaults={
                "full_name": "Sita Thapa",
                "is_staff": True,
                "is_superuser": False,
            },
        )
        admin_user.set_password("admin123!")
        admin_user.save()
        for group_name in ("Content Manager", "Booking Manager"):
            admin_user.groups.add(Group.objects.get(name=group_name))

        superadmin, _ = User.objects.update_or_create(
            email=f"superadmin@{UAT_DOMAIN}",
            defaults={
                "full_name": "Hari Sharma",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        superadmin.set_password("superadmin123!")
        superadmin.save()

        self.stdout.write(
            f"  Users: {customer.email}, {admin_user.email}, {superadmin.email}"
        )

        # ── Categories (upsert) ───────────────────────────────────────
        cat_adventure, _ = ActivityCategory.objects.update_or_create(
            name="Adventure", defaults={"icon": "🏔"}
        )
        cat_culture, _ = ActivityCategory.objects.update_or_create(
            name="Culture", defaults={"icon": "🏛"}
        )
        cat_nature, _ = ActivityCategory.objects.update_or_create(
            name="Nature", defaults={"icon": "🌿"}
        )
        cat_spiritual, _ = ActivityCategory.objects.update_or_create(
            name="Spiritual", defaults={"icon": "🕉"}
        )

        # ── Destinations (upsert) ────────────────────────────────────
        ktm, _ = Destination.objects.update_or_create(
            name="Kathmandu",
            defaults={
                "province": "Bagmati",
                "description": "Historic capital with UNESCO World Heritage sites.",
                "latitude": "27.717200",
                "longitude": "85.324000",
                "is_featured": True,
            },
        )
        pokhara, _ = Destination.objects.update_or_create(
            name="Pokhara",
            defaults={
                "province": "Gandaki",
                "description": "Adventure capital beside Phewa Lake.",
                "latitude": "28.209600",
                "longitude": "83.985600",
                "is_featured": True,
            },
        )
        chitwan, _ = Destination.objects.update_or_create(
            name="Chitwan",
            defaults={
                "province": "Bagmati",
                "description": "Jungle safari paradise in the Terai lowlands.",
                "latitude": "27.531800",
                "longitude": "84.476900",
                "is_featured": False,
            },
        )
        lumbini, _ = Destination.objects.update_or_create(
            name="Lumbini",
            defaults={
                "province": "Lumbini",
                "description": "Birthplace of Lord Buddha and spiritual hub.",
                "latitude": "27.483300",
                "longitude": "83.276400",
                "is_featured": False,
            },
        )
        everest, _ = Destination.objects.update_or_create(
            name="Mount Everest",
            defaults={
                "province": "Province 1",
                "description": "Home of the world's highest peak and legendary trekking routes.",
                "latitude": "27.988100",
                "longitude": "86.925000",
                "is_featured": True,
            },
        )
        bhote_koshi, _ = Destination.objects.update_or_create(
            name="Bhote Koshi",
            defaults={
                "province": "Bagmati",
                "description": "Adrenaline-pumping rafting and bungee over a turquoise gorge.",
                "latitude": "27.867400",
                "longitude": "85.931200",
                "is_featured": False,
            },
        )
        janakpur, _ = Destination.objects.update_or_create(
            name="Janakpur",
            defaults={
                "province": "Province 2",
                "description": "Sacred city of Goddess Sita and stunning Mithila art.",
                "latitude": "26.728800",
                "longitude": "85.924900",
                "is_featured": False,
            },
        )
        mustang, _ = Destination.objects.update_or_create(
            name="Mustang",
            defaults={
                "province": "Gandaki",
                "description": "Ancient forbidden kingdom with dramatic desert landscapes.",
                "latitude": "28.780400",
                "longitude": "83.723000",
                "is_featured": True,
            },
        )

        # ── Activities (upsert) ──────────────────────────────────────
        Activity.objects.update_or_create(
            name="Tandem Paragliding",
            defaults={
                "destination": pokhara,
                "category": cat_adventure,
                "description": "Soar over Phewa Lake with a certified pilot.",
                "price": Decimal("7500.00"),
                "duration": "45 minutes",
                "capacity": 30,
                "difficulty": "moderate",
                "is_featured": True,
            },
        )
        Activity.objects.update_or_create(
            name="Heritage Walking Tour",
            defaults={
                "destination": ktm,
                "category": cat_culture,
                "description": "Walk through Durbar Square and Swayambhunath.",
                "price": Decimal("2500.00"),
                "duration": "4 hours",
                "capacity": 10,
                "difficulty": "easy",
                "is_featured": True,
            },
        )
        Activity.objects.update_or_create(
            name="Jungle Safari",
            defaults={
                "destination": chitwan,
                "category": cat_nature,
                "description": "Jeep safari to spot rhinos and Bengal tigers.",
                "price": Decimal("3000.00"),
                "duration": "4 hours",
                "capacity": 16,
                "difficulty": "moderate",
                "is_featured": False,
            },
        )
        Activity.objects.update_or_create(
            name="Monastery Trail Walk",
            defaults={
                "destination": lumbini,
                "category": cat_spiritual,
                "description": "Visit monasteries built by Buddhist nations worldwide.",
                "price": Decimal("1500.00"),
                "duration": "3 hours",
                "capacity": 12,
                "difficulty": "easy",
                "is_featured": False,
            },
        )
        Activity.objects.update_or_create(
            name="Trisuli River Rafting",
            defaults={
                "destination": pokhara,
                "category": cat_adventure,
                "description": "Class III–IV rapids through a scenic gorge.",
                "price": Decimal("4500.00"),
                "duration": "3 hours",
                "capacity": 20,
                "difficulty": "moderate",
                "is_featured": False,
            },
        )
        Activity.objects.update_or_create(
            name="Birdwatching Canopy Walk",
            defaults={
                "destination": chitwan,
                "category": cat_nature,
                "description": "Spot over 500 species from treetop walkways.",
                "price": Decimal("2000.00"),
                "duration": "2 hours",
                "capacity": 8,
                "difficulty": "easy",
                "is_featured": False,
            },
        )
        Activity.objects.update_or_create(
            name="Everest Base Camp Trek",
            defaults={
                "destination": everest,
                "category": cat_adventure,
                "description": "14-day trek to the foot of the world's highest mountain.",
                "price": Decimal("85000.00"),
                "duration": "14 days",
                "capacity": 12,
                "difficulty": "challenging",
                "is_featured": True,
            },
        )
        Activity.objects.update_or_create(
            name="Mountain Flight",
            defaults={
                "destination": everest,
                "category": cat_adventure,
                "description": "Scenic flight past Everest, Lhotse, and Makalu.",
                "price": Decimal("12000.00"),
                "duration": "1 hour",
                "capacity": 20,
                "difficulty": "easy",
                "is_featured": False,
            },
        )
        Activity.objects.update_or_create(
            name="Bhote Koshi White-Water Rafting",
            defaults={
                "destination": bhote_koshi,
                "category": cat_adventure,
                "description": "Class IV–V rapids through a steep Himalayan gorge.",
                "price": Decimal("6500.00"),
                "duration": "2 days",
                "capacity": 16,
                "difficulty": "challenging",
                "is_featured": True,
            },
        )
        Activity.objects.update_or_create(
            name="Tibetan Bridge Bungee",
            defaults={
                "destination": bhote_koshi,
                "category": cat_adventure,
                "description": "160m freefall over the Bhote Koshi River.",
                "price": Decimal("9000.00"),
                "duration": "30 minutes",
                "capacity": 8,
                "difficulty": "challenging",
                "is_featured": False,
            },
        )
        Activity.objects.update_or_create(
            name="Janaki Mandir Tour",
            defaults={
                "destination": janakpur,
                "category": cat_culture,
                "description": "Visit the stunning marble temple dedicated to Goddess Sita.",
                "price": Decimal("1500.00"),
                "duration": "3 hours",
                "capacity": 20,
                "difficulty": "easy",
                "is_featured": True,
            },
        )
        Activity.objects.update_or_create(
            name="Mithila Art Workshop",
            defaults={
                "destination": janakpur,
                "category": cat_culture,
                "description": "Learn traditional Madhubani painting from local artists.",
                "price": Decimal("3000.00"),
                "duration": "4 hours",
                "capacity": 10,
                "difficulty": "easy",
                "is_featured": False,
            },
        )
        Activity.objects.update_or_create(
            name="Upper Mustang Trek",
            defaults={
                "destination": mustang,
                "category": cat_adventure,
                "description": "Journey through the ancient walled kingdom of Lo Manthang.",
                "price": Decimal("95000.00"),
                "duration": "16 days",
                "capacity": 8,
                "difficulty": "challenging",
                "is_featured": True,
            },
        )
        Activity.objects.update_or_create(
            name="Sky Caves Exploration",
            defaults={
                "destination": mustang,
                "category": cat_culture,
                "description": "Discover mysterious cliff-side caves thousands of years old.",
                "price": Decimal("5000.00"),
                "duration": "5 hours",
                "capacity": 10,
                "difficulty": "moderate",
                "is_featured": False,
            },
        )

        # ── Visit Packages (upsert) ──────────────────────────────────
        DestinationVisitPackage.objects.update_or_create(
            name="Kathmandu Valley Explorer",
            defaults={
                "destination": ktm,
                "price": Decimal("12000.00"),
                "days": 3,
                "description": "Three-day immersion in heritage sites and local culture.",
                "capacity": 8,
            },
        )
        DestinationVisitPackage.objects.update_or_create(
            name="Pokhara Adventure Getaway",
            defaults={
                "destination": pokhara,
                "price": Decimal("15000.00"),
                "days": 4,
                "description": "Lake views, paragliding, and sunrise at Sarangkot.",
                "capacity": 12,
            },
        )
        DestinationVisitPackage.objects.update_or_create(
            name="Chitwan Wildlife Retreat",
            defaults={
                "destination": chitwan,
                "price": Decimal("10000.00"),
                "days": 3,
                "description": "Safari, canoe ride, and Tharu cultural show.",
                "capacity": 10,
            },
        )
        DestinationVisitPackage.objects.update_or_create(
            name="Lumbini Spiritual Journey",
            defaults={
                "destination": lumbini,
                "price": Decimal("8000.00"),
                "days": 2,
                "description": "Meditation, monastery visits, and Mayadevi Temple.",
                "capacity": 6,
            },
        )
        DestinationVisitPackage.objects.update_or_create(
            name="Everest Panorama Tour",
            defaults={
                "destination": everest,
                "price": Decimal("35000.00"),
                "days": 5,
                "description": "Scenic mountain views without the full trek.",
                "capacity": 10,
            },
        )
        DestinationVisitPackage.objects.update_or_create(
            name="Mustang Explorer",
            defaults={
                "destination": mustang,
                "price": Decimal("55000.00"),
                "days": 7,
                "description": "Discover ancient monasteries and desert canyons.",
                "capacity": 6,
            },
        )

        # ── Bookings (only create if customer has none yet) ───────────
        today = date.today()
        if not Booking.objects.filter(user=customer).exists():
            act_paragliding = Activity.objects.get(name="Tandem Paragliding")
            act_heritage = Activity.objects.get(name="Heritage Walking Tour")
            act_safari = Activity.objects.get(name="Jungle Safari")
            pkg_pokhara = DestinationVisitPackage.objects.get(
                name="Pokhara Adventure Getaway"
            )

            b1 = Booking(
                user=customer,
                activity=act_paragliding,
                travel_date=today + timedelta(days=14),
                travelers=2,
                status="confirmed",
            )
            b1.save()

            b2 = Booking(
                user=customer,
                activity=act_heritage,
                travel_date=today + timedelta(days=21),
                travelers=1,
                status="pending",
            )
            b2.save()

            b3 = Booking(
                user=customer,
                visit_package=pkg_pokhara,
                travel_date=today + timedelta(days=30),
                travelers=2,
                status="confirmed",
            )
            b3.save()

            b4 = Booking(
                user=customer,
                activity=act_safari,
                travel_date=today - timedelta(days=10),
                travelers=3,
                status="cancelled",
            )
            b4.save()

            # ── Payments ──────────────────────────────────────────
            Payment.objects.create(
                booking=b1,
                gateway="esewa",
                amount=b1.total_price,
                status="success",
                transaction_uuid=str(uuid.uuid4()),
                transaction_id="ESEWE-UAT-001",
            )
            Payment.objects.create(
                booking=b3,
                gateway="khalti",
                amount=b3.total_price,
                status="success",
                transaction_uuid=str(uuid.uuid4()),
                transaction_id="KHALTI-UAT-002",
            )

            # ── Inquiry ───────────────────────────────────────────
            inq = Inquiry.objects.create(
                user=customer,
                subject="Is paragliding safe during monsoon?",
                status="open",
            )
            InquiryMessage.objects.create(
                inquiry=inq,
                sender=customer,
                is_from_staff=False,
                body="I booked the Pokhara paragliding for next month. "
                "Is it safe if it rains?",
            )
            InquiryMessage.objects.create(
                inquiry=inq,
                sender=admin_user,
                is_from_staff=True,
                body="Flights are weather-dependent. If conditions are unsafe "
                "we reschedule or refund in full.",
            )

            # ── Notifications ─────────────────────────────────────
            Notification.objects.create(
                user=admin_user,
                verb="New booking",
                text=f"New booking from {customer.full_name} for "
                f"{act_paragliding.name}.",
                link="/admin/bookings",
            )
            Notification.objects.create(
                user=admin_user,
                verb="New inquiry",
                text=f"{customer.full_name} asked: {inq.subject}",
                link="/admin/inquiries",
            )

        self.stdout.write(self.style.SUCCESS(
            "UAT seed complete:\n"
            f"  Users:          {User.objects.count()} "
            f"(customer, admin, superadmin)\n"
            f"  Categories:     {ActivityCategory.objects.count()}\n"
            f"  Destinations:   {Destination.objects.count()}\n"
            f"  Activities:     {Activity.objects.count()}\n"
            f"  Visit packages: {DestinationVisitPackage.objects.count()}\n"
            f"  Bookings:       {Booking.objects.count()}\n"
            f"  Payments:       {Payment.objects.count()}\n"
            f"  Inquiries:      {Inquiry.objects.count()}\n"
            f"  Notifications:  {Notification.objects.count()}"
        ))
