from django.db import models


class Payment(models.Model):
    class Gateway(models.TextChoices):
        ESEWA = "esewa", "eSewa"
        KHALTI = "khalti", "Khalti"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    booking = models.OneToOneField(
        "bookings.Booking", related_name="payment", on_delete=models.CASCADE
    )
    gateway = models.CharField(max_length=20, choices=Gateway.choices)
    transaction_uuid = models.CharField(max_length=100, unique=True, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.booking} - {self.gateway} - {self.status}"
