from django.db import models
from django.utils import timezone


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        "accounts.User", related_name="bookings", on_delete=models.CASCADE
    )
    activity = models.ForeignKey(
        "destinations.Activity",
        related_name="bookings",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    visit_package = models.ForeignKey(
        "destinations.DestinationVisitPackage",
        related_name="bookings",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    days = models.PositiveIntegerField(default=1)
    travel_date = models.DateField()
    travelers = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    cancel_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.CheckConstraint(
                check=models.Q(activity__isnull=False)
                ^ models.Q(visit_package__isnull=False),
                name="booking_has_activity_or_visit_package",
            )
        ]

    def clean(self):
        if bool(self.activity) == bool(self.visit_package):
            from django.core.exceptions import ValidationError

            raise ValidationError(
                "A booking must reference exactly one of an activity or a visit package."
            )

    def save(self, *args, **kwargs):
        if self.visit_package:
            self.days = self.visit_package.days
            self.total_price = self.travelers * self.visit_package.price * self.days
        elif self.activity:
            self.total_price = self.travelers * self.activity.price
        super().save(*args, **kwargs)

    def __str__(self):
        if self.visit_package:
            return f"{self.user.email} - {self.visit_package.name} - {self.travel_date}"
        return f"{self.user.email} - {self.activity.name} - {self.travel_date}"
