from datetime import datetime, time

from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from bookings.models import Booking
from destinations.models import Activity, Destination
from payments.models import Payment


def _last_months(n=12):
    """Return a list of (year, month) tuples for the last ``n`` months, ascending."""
    months = []
    today = timezone.localdate()
    year, month = today.year, today.month
    for _ in range(n):
        months.append((year, month))
        month -= 1
        if month == 0:
            year -= 1
            month = 12
    return list(reversed(months))


def get_dashboard_stats():
    """Aggregate booking/payment stats for the admin dashboard."""
    bookings = Booking.objects.all()
    today = timezone.localdate()
    start_month = timezone.make_aware(
        datetime.combine(today.replace(day=1), time.min), timezone.get_current_timezone()
    )

    revenue = (
        Payment.objects.filter(status=Payment.Status.SUCCESS)
        .aggregate(total=Sum("amount"))["total"]
        or 0
    )

    return {
        "total_bookings": bookings.count(),
        "pending_bookings": bookings.filter(status=Booking.Status.PENDING).count(),
        "confirmed_bookings": bookings.filter(status=Booking.Status.CONFIRMED).count(),
        "cancelled_bookings": bookings.filter(status=Booking.Status.CANCELLED).count(),
        "revenue": revenue,
        "today_bookings": bookings.filter(created_at__date=today).count(),
        "month_bookings": bookings.filter(created_at__gte=start_month).count(),
        "top_activities": list(
            Activity.objects.annotate(booking_count=Count("bookings"))
            .filter(booking_count__gt=0)
            .order_by("-booking_count")[:5]
            .values_list("name", "booking_count")
        ),
    }


def get_recent_bookings(limit=8):
    return Booking.objects.select_related(
        "user", "activity", "visit_package__destination"
    ).order_by("-created_at")[:limit]


def _month_key(month_label):
    return (month_label.year, month_label.month)


def get_chart_data():
    """Time series + breakdown data for the admin dashboard charts."""
    months = _last_months(12)
    labels = [f"{y}-{m:02d}" for y, m in months]
    bookings = {label: 0 for label in labels}
    revenue = {label: 0 for label in labels}

    booking_rows = (
        Booking.objects.annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(count=Count("id"))
    )
    for row in booking_rows:
        key = row["month"]
        if key:
            label = f"{key.year}-{key.month:02d}"
            if label in bookings:
                bookings[label] = row["count"]

    payment_rows = (
        Payment.objects.filter(status=Payment.Status.SUCCESS)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(total=Sum("amount"))
    )
    for row in payment_rows:
        key = row["month"]
        if key:
            label = f"{key.year}-{key.month:02d}"
            if label in revenue:
                revenue[label] = float(row["total"] or 0)

    return {
        "labels": labels,
        "bookings_by_month": [bookings[label] for label in labels],
        "revenue_by_month": [revenue[label] for label in labels],
        "bookings_by_status": {
            "pending": Booking.objects.filter(status=Booking.Status.PENDING).count(),
            "confirmed": Booking.objects.filter(status=Booking.Status.CONFIRMED).count(),
            "cancelled": Booking.objects.filter(status=Booking.Status.CANCELLED).count(),
        },
        "top_destinations": list(
            Destination.objects.annotate(booking_count=Count("activities__bookings"))
            .filter(booking_count__gt=0)
            .order_by("-booking_count")[:5]
            .values_list("name", "booking_count")
        ),
    }
