"""Gateway integrations for eSewa and Khalti (sandbox) with a dev-mode bypass.

When settings.PAYMENT_DEV_MODE is True, initiate/verify return mock payloads so
the full booking->payment flow can be tested without live gateway keys.
"""

import uuid

import requests
from django.conf import settings

from .models import Payment

ESEWA_BASE = "https://rc-epay.esewa.com.np"
ESEWA_FORM_URL = f"{ESEWA_BASE}/api/epay/main/v2/form"
ESEWA_STATUS_URL = f"{ESEWA_BASE}/api/epay/transaction/status/"

KHALTI_BASE = "https://dev.khalti.com"
KHALTI_INITIATE_URL = f"{KHALTI_BASE}/api/v2/epay/initiate/"
KHALTI_LOOKUP_URL = f"{KHALTI_BASE}/api/v2/epay/lookup/"


class PaymentError(Exception):
    pass


def is_dev_mode():
    return getattr(settings, "PAYMENT_DEV_MODE", False)


def new_transaction_uuid():
    return uuid.uuid4().hex


def confirm_payment(payment, transaction_id=""):
    payment.status = Payment.Status.SUCCESS
    if transaction_id:
        payment.transaction_id = transaction_id
    payment.save(update_fields=["status", "transaction_id", "updated_at"])

    booking = payment.booking
    booking.status = booking.Status.CONFIRMED
    booking.save(update_fields=["status", "updated_at"])
    return payment


def initiate_payment(booking, gateway, return_url, failure_url):
    """Create (or reuse) the pending payment and return the gateway payload."""
    if booking.status == booking.Status.CANCELLED:
        raise PaymentError("Cannot pay for a cancelled booking.")
    if booking.status == booking.Status.CONFIRMED:
        raise PaymentError("Booking is already confirmed.")

    payment, _ = Payment.objects.get_or_create(
        booking=booking,
        defaults={
            "gateway": gateway,
            "transaction_uuid": new_transaction_uuid(),
            "amount": booking.total_price,
        },
    )
    if payment.status == Payment.Status.SUCCESS:
        raise PaymentError("Booking is already paid.")

    if is_dev_mode():
        return {
            "dev_mode": True,
            "gateway": gateway,
            "transaction_uuid": payment.transaction_uuid,
            "amount": str(payment.amount),
            "url": None,
            "fields": None,
            "pidx": None,
        }

    if gateway == Payment.Gateway.ESEWA:
        return _esewa_initiate(payment, return_url, failure_url)
    if gateway == Payment.Gateway.KHALTI:
        return _khalti_initiate(payment, return_url)
    raise PaymentError(f"Unsupported gateway: {gateway}")


def _esewa_initiate(payment, return_url, failure_url):
    merchant_code = settings.ESEWA_MERCHANT_CODE
    if not merchant_code:
        raise PaymentError("ESEWA_MERCHANT_CODE is not configured.")

    fields = {
        "amt": str(payment.amount),
        "pdc": "0",
        "psc": "0",
        "txAmt": "0",
        "tAmt": str(payment.amount),
        "psd": "0",
        "scd": merchant_code,
        "pid": payment.transaction_uuid,
        "su": return_url,
        "fu": failure_url,
    }
    return {
        "dev_mode": False,
        "gateway": payment.gateway,
        "transaction_uuid": payment.transaction_uuid,
        "amount": str(payment.amount),
        "url": ESEWA_FORM_URL,
        "fields": fields,
        "pidx": None,
    }


def _khalti_initiate(payment, return_url):
    merchant_key = settings.KHALTI_MERCHANT_KEY
    if not merchant_key:
        raise PaymentError("KHALTI_MERCHANT_KEY is not configured.")

    payload = {
        "return_url": return_url,
        "website_url": settings.FRONTEND_URL,
        "amount": int(payment.amount * 100),  # paisa
        "purchase_order_id": payment.transaction_uuid,
        "purchase_order_name": f"Tour booking #{payment.booking_id}",
        "customer_info": {
            "name": payment.booking.user.full_name or "Traveller",
            "email": payment.booking.user.email,
        },
    }
    response = requests.post(
        KHALTI_INITIATE_URL,
        json=payload,
        headers={"Authorization": f"Key {merchant_key}"},
        timeout=15,
    )
    data = response.json()
    if response.status_code != 200 or "pidx" not in data:
        raise PaymentError(f"Khalti initiate failed: {data}")
    return {
        "dev_mode": False,
        "gateway": payment.gateway,
        "transaction_uuid": payment.transaction_uuid,
        "amount": str(payment.amount),
        "url": data["payment_url"],
        "fields": None,
        "pidx": data["pidx"],
    }


def verify_payment(payment, ref_id=None, pidx=None):
    """Verify a pending payment; confirm booking on success."""
    if payment.status == Payment.Status.SUCCESS:
        return payment

    if is_dev_mode():
        return confirm_payment(payment, transaction_id=ref_id or pidx or "dev-reference")

    if payment.gateway == Payment.Gateway.ESEWA:
        return _verify_esewa(payment, ref_id)
    if payment.gateway == Payment.Gateway.KHALTI:
        return _verify_khalti(payment, pidx)
    raise PaymentError(f"Unsupported gateway: {payment.gateway}")


def _verify_esewa(payment, ref_id):
    if not ref_id:
        raise PaymentError("Missing eSewa reference id.")
    if not settings.ESEWA_MERCHANT_CODE:
        raise PaymentError("ESEWA_MERCHANT_CODE is not configured.")

    response = requests.get(
        ESEWA_STATUS_URL,
        params={
            "product_code": settings.ESEWA_MERCHANT_CODE,
            "total_amount": str(payment.amount),
            "transaction_uuid": payment.transaction_uuid,
        },
        timeout=15,
    )
    data = response.json()
    if data.get("status") == "COMPLETE":
        return confirm_payment(payment, transaction_id=ref_id)
    raise PaymentError(f"eSewa payment not complete: {data}")


def _verify_khalti(payment, pidx):
    if not pidx:
        raise PaymentError("Missing Khalti pidx.")
    if not settings.KHALTI_MERCHANT_KEY:
        raise PaymentError("KHALTI_MERCHANT_KEY is not configured.")

    response = requests.post(
        KHALTI_LOOKUP_URL,
        json={"pidx": pidx},
        headers={"Authorization": f"Key {settings.KHALTI_MERCHANT_KEY}"},
        timeout=15,
    )
    data = response.json()
    if data.get("status") == "Completed":
        return confirm_payment(payment, transaction_id=pidx)
    raise PaymentError(f"Khalti payment not completed: {data}")
