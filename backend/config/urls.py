from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from .admin import admin_site
from .views import health_check

urlpatterns = [
    path("health/", health_check),
    path("admin/", admin_site.urls),
    path("api/admin/", include("admin_api.urls")),
    path("api/", include("accounts.urls")),
    path("api/", include("destinations.urls")),
    path("api/", include("bookings.urls")),
    path("api/", include("payments.urls")),
    path("api/", include("inquiries.urls")),
    path("api/", include("notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    from django.views.static import serve as static_serve

    urlpatterns += [
        path("media/<path:path>", static_serve, {"document_root": settings.MEDIA_ROOT}),
    ]
