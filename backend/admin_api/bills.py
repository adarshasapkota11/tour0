"""Server-side PDF bill generation with reportlab."""

import io

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BRAND = "TourNepal"
POWERED_BY = "Powered by aPrayogshala.com.np"

_GREY = colors.HexColor("#6b7280")
_BRAND = colors.HexColor("#4f46e5")


def _money(amount):
    return f"Rs {float(amount):,.2f}"


def _payment_text(booking):
    payment = getattr(booking, "payment", None)
    if payment is None:
        return ["No payment recorded", "—", "—", "—"]
    gateway_label = "eSewa" if payment.gateway == "esewa" else "Khalti"
    transaction = payment.transaction_id or payment.transaction_uuid or "—"
    paid_on = payment.updated_at.strftime("%d %b %Y") if payment.status == "success" else "—"
    return [
        f"{gateway_label} ({payment.status})",
        transaction,
        _money(payment.amount),
        paid_on,
    ]


def generate_bill_pdf(booking):
    """Return the bill for ``booking`` as PDF bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=f"Bill #{booking.id}",
        author=BRAND,
    )

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle(
        "Brand", parent=styles["Title"], textColor=_BRAND, fontSize=22, spaceAfter=0
    )
    muted = ParagraphStyle(
        "Muted", parent=styles["Normal"], textColor=_GREY, fontSize=8.5
    )
    label = ParagraphStyle(
        "Label", parent=styles["Normal"], textColor=_GREY, fontSize=8, spaceAfter=1
    )
    value = ParagraphStyle(
        "Value", parent=styles["Normal"], fontSize=10.5, leading=14
    )
    section = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        fontSize=11,
        textColor=_BRAND,
        spaceBefore=10,
        spaceAfter=4,
    )

    item_name = (
        booking.activity.name
        if booking.activity
        else booking.visit_package.name
    )
    item_type = "Activity" if booking.activity else "Visit package"
    unit_price = (
        booking.activity.price
        if booking.activity
        else booking.visit_package.price
    )
    customer = booking.user

    def row(label_text, value_text):
        return [
            Paragraph(f"<b>{label_text}</b>", label),
            Paragraph(str(value_text), value),
        ]

    info_rows = [
        row("Bill number", f"BILL-{booking.id}"),
        row("Bill date", timezone.localdate().strftime("%d %b %Y")),
        row("Customer", f"{customer.full_name or customer.email} ({customer.email})"),
        row("Item type", item_type),
        row("Item", item_name),
        row("Destination", item_name_destination(booking)),
        row("Travel date", booking.travel_date.strftime("%d %b %Y")),
        row("Travelers", str(booking.travelers)),
        row("Days", str(booking.days)),
        row("Booking status", booking.status.capitalize()),
    ]
    info = Table(info_rows, colWidths=[38 * mm, 130 * mm])
    info.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
                ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.HexColor("#e5e7eb")),
            ]
        )
    )

    payment_text = _payment_text(booking)
    payment_rows = [
        [Paragraph("<b>Payment</b>", label), Paragraph(str(payment_text[0]), value)],
        [Paragraph("<b>Transaction</b>", label), Paragraph(str(payment_text[1]), value)],
        [Paragraph("<b>Amount</b>", label), Paragraph(str(payment_text[2]), value)],
        [Paragraph("<b>Paid on</b>", label), Paragraph(str(payment_text[3]), value)],
    ]
    payment = Table(payment_rows, colWidths=[38 * mm, 130 * mm])
    payment.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
                ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.HexColor("#e5e7eb")),
            ]
        )
    )

    price_rows = [
        [
            Paragraph("Description", label),
            Paragraph("Qty", label),
            Paragraph("Unit price", label),
            Paragraph("Total", label),
        ],
        [
            Paragraph(item_name, value),
            Paragraph(f"{booking.travelers} × {booking.days} day(s)", value),
            Paragraph(_money(unit_price), value),
            Paragraph(_money(booking.total_price), value),
        ],
        [
            Paragraph("", value),
            Paragraph("", value),
            Paragraph("<b>Grand total</b>", value),
            Paragraph(f"<b>{_money(booking.total_price)}</b>", value),
        ],
    ]
    price = Table(price_rows, colWidths=[86 * mm, 30 * mm, 26 * mm, 26 * mm])
    price.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef2ff")),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#eef2ff")),
                ("GRID", (0, 0), (-1, -2), 0.25, colors.HexColor("#e5e7eb")),
                ("LINEABOVE", (0, -1), (-1, -1), 0.5, _BRAND),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ]
        )
    )

    story = [
        Paragraph(BRAND, h1),
        Paragraph(POWERED_BY, muted),
        Spacer(1, 6 * mm),
        Paragraph("Invoice / Bill", styles["Title"]),
        Spacer(1, 4 * mm),
        Paragraph("Booking detail", section),
        info,
        Paragraph("Payment detail", section),
        payment,
        Paragraph("Price breakdown", section),
        price,
        Spacer(1, 6 * mm),
        Paragraph(
            "Thank you for choosing TourNepal. This bill was generated by "
            "aPrayogshala.com.np.",
            muted,
        ),
    ]

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def item_name_destination(booking):
    if booking.activity:
        return booking.activity.destination.name
    if booking.visit_package:
        return booking.visit_package.destination.name
    return "—"
