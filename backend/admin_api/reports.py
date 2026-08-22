"""Aggregation helpers for the admin reports endpoint."""

from datetime import date, timedelta

from django.db.models import Count, Sum
from django.db.models.functions import TruncDay

from bookings.models import Booking
from destinations.models import Activity, Destination
from payments.models import Payment


def _parse_date(value, default):
    try:
        return date.fromisoformat(str(value))
    except (TypeError, ValueError):
        return default


def _day_keys(start, end):
    """Return every ISO date string between start and end inclusive."""
    days = []
    current = start
    while current <= end:
        days.append(current.isoformat())
        current += timedelta(days=1)
    return days


def get_report_data(start, end):
    start_date = _parse_date(start, date.today().replace(day=1))
    end_date = _parse_date(end, start_date)
    if end_date < start_date:
        end_date = start_date

    bookings = Booking.objects.filter(travel_date__range=(start_date, end_date))
    paid = Payment.objects.filter(
        status=Payment.Status.SUCCESS,
        booking__travel_date__range=(start_date, end_date),
    )

    revenue = paid.aggregate(total=Sum("amount"))["total"] or 0

    daily_booking_rows = (
        bookings.annotate(day=TruncDay("created_at"))
        .values("day")
        .annotate(count=Count("id"))
    )
    daily_revenue_rows = (
        paid.annotate(day=TruncDay("created_at"))
        .values("day")
        .annotate(total=Sum("amount"))
    )

    days = _day_keys(start_date, end_date)
    bookings_by_day = {d: 0 for d in days}
    revenue_by_day = {d: 0 for d in days}
    for row in daily_booking_rows:
        key = row["day"]
        if key:
            bookings_by_day[key.date().isoformat()] = row["count"]
    for row in daily_revenue_rows:
        key = row["day"]
        if key:
            revenue_by_day[key.date().isoformat()] = float(row["total"] or 0)

    payment_status = {s: 0 for s in Payment.Status.values}
    payment_gateway = {}
    for row in Payment.objects.filter(
        booking__travel_date__range=(start_date, end_date)
    ).values("status", "gateway"):
        payment_status[row["status"]] += 1
        payment_gateway[row["gateway"]] = payment_gateway.get(row["gateway"], 0) + 1

    top_activities = list(
        Activity.objects.annotate(booking_count=Count("bookings"))
        .filter(booking_count__gt=0, bookings__travel_date__range=(start_date, end_date))
        .order_by("-booking_count")[:5]
        .values_list("name", "booking_count")
    )
    top_destinations = list(
        Destination.objects.annotate(
            booking_count=Count("activities__bookings")
        )
        .filter(
            booking_count__gt=0,
            activities__bookings__travel_date__range=(start_date, end_date),
        )
        .order_by("-booking_count")[:5]
        .values_list("name", "booking_count")
    )

    item_split = {
        "activity": bookings.filter(activity__isnull=False).count(),
        "visit_package": bookings.filter(visit_package__isnull=False).count(),
    }

    confirmed = bookings.filter(status=Booking.Status.CONFIRMED).count()
    cancelled = bookings.filter(status=Booking.Status.CANCELLED).count()
    total = bookings.count()

    return {
        "range": {"start": start_date.isoformat(), "end": end_date.isoformat()},
        "totals": {
            "bookings": total,
            "confirmed": confirmed,
            "cancelled": cancelled,
            "revenue": float(revenue),
            "avg_booking_value": round(float(revenue) / total, 2) if total else 0,
        },
        "bookings_by_day": [bookings_by_day[d] for d in days],
        "revenue_by_day": [revenue_by_day[d] for d in days],
        "days": days,
        "top_activities": [list(row) for row in top_activities],
        "top_destinations": [list(row) for row in top_destinations],
        "payments_by_status": payment_status,
        "payments_by_gateway": payment_gateway,
        "item_split": item_split,
    }
