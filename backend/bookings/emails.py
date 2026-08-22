from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


def _item_name(booking):
    return booking.visit_package.name if booking.visit_package else booking.activity.name


def _destination_name(booking):
    return booking.visit_package.destination.name if booking.visit_package else booking.activity.destination.name


def send_booking_confirmation(booking):
    subject = f"Booking Confirmed — {_item_name(booking)}"
    ctx = {
        "user": booking.user,
        "booking": booking,
        "item_name": _item_name(booking),
        "destination": _destination_name(booking),
        "frontend_url": getattr(settings, "FRONTEND_URL", "http://localhost:5173"),
    }
    html = render_to_string("emails/booking_confirmed.html", ctx)
    plain = (
        f"Hi {booking.user.full_name or booking.user.email},\n\n"
        f"Your booking for {ctx['item_name']} in {ctx['destination']} is confirmed.\n"
        f"Travel date: {booking.travel_date}\n"
        f"Total: NPR {booking.total_price}\n\n"
        f"View details: {ctx['frontend_url']}/confirmation/{booking.id}\n\n"
        "— TourNepal"
    )
    send_mail(
        subject,
        plain,
        settings.DEFAULT_FROM_EMAIL,
        [booking.user.email],
        html_message=html,
        fail_silently=True,
    )


def send_booking_cancelled(booking):
    subject = f"Booking Cancelled — {_item_name(booking)}"
    ctx = {
        "user": booking.user,
        "booking": booking,
        "item_name": _item_name(booking),
        "cancel_reason": booking.cancel_reason,
        "frontend_url": getattr(settings, "FRONTEND_URL", "http://localhost:5173"),
    }
    html = render_to_string("emails/booking_cancelled.html", ctx)
    plain = (
        f"Hi {booking.user.full_name or booking.user.email},\n\n"
        f"Your booking for {ctx['item_name']} has been cancelled.\n"
        f"{'Reason: ' + ctx['cancel_reason'] if ctx['cancel_reason'] else ''}\n\n"
        "— TourNepal"
    )
    send_mail(
        subject,
        plain,
        settings.DEFAULT_FROM_EMAIL,
        [booking.user.email],
        html_message=html,
        fail_silently=True,
    )
