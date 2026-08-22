from django.db import models


class Inquiry(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        RESOLVED = "resolved", "Resolved"

    user = models.ForeignKey(
        "accounts.User", related_name="inquiries", on_delete=models.CASCADE
    )
    subject = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at", "-id")

    def __str__(self):
        return f"{self.user.email} - {self.subject}"


class InquiryMessage(models.Model):
    inquiry = models.ForeignKey(
        Inquiry, related_name="messages", on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        "accounts.User", related_name="inquiry_messages", on_delete=models.CASCADE
    )
    is_from_staff = models.BooleanField(default=False)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self):
        return f"{self.sender.email} - {self.inquiry.subject}"
