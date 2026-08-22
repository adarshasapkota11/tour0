from django.db import models
from django.utils.text import slugify


def unique_slug(model_class, slug_field, name):
    """Generate a unique slug for a given model/field from a name."""
    slug = slugify(name) or "item"
    base = slug
    counter = 1
    while model_class.objects.filter(**{slug_field: slug}).exists():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


class Destination(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=230, unique=True, blank=True)
    province = models.CharField(max_length=100)
    description = models.TextField()
    cover_image = models.ImageField(upload_to="destinations/", blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("name",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(Destination, "slug", self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class DestinationGallery(models.Model):
    destination = models.ForeignKey(
        Destination, related_name="gallery", on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="destinations/gallery/")
    caption = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.destination.name} - {self.caption or self.pk}"


class DestinationVisitPackage(models.Model):
    destination = models.ForeignKey(
        Destination, related_name="visit_packages", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    days = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("days", "name")

    def __str__(self):
        return f"{self.destination.name} - {self.name} ({self.days} day(s))"


class ActivityCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name_plural = "activity categories"
        ordering = ("name",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(ActivityCategory, "slug", self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Activity(models.Model):
    class Difficulty(models.TextChoices):
        EASY = "easy", "Easy"
        MODERATE = "moderate", "Moderate"
        CHALLENGING = "challenging", "Challenging"

    destination = models.ForeignKey(
        Destination, related_name="activities", on_delete=models.CASCADE
    )
    category = models.ForeignKey(
        ActivityCategory, related_name="activities", on_delete=models.PROTECT
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=230, unique=True, blank=True)
    description = models.TextField()
    image = models.ImageField(upload_to="activities/", blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=100, blank=True)
    capacity = models.PositiveIntegerField(default=1)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.EASY)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "activities"
        ordering = ("name",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(Activity, "slug", self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.destination.name})"
