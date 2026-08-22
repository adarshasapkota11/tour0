from rest_framework.routers import DefaultRouter

from .views import (
    ActivityCategoryViewSet,
    ActivityViewSet,
    DestinationViewSet,
    VisitPackageViewSet,
)

app_name = "destinations"

router = DefaultRouter()
router.register("destinations", DestinationViewSet, basename="destination")
router.register("activities", ActivityViewSet, basename="activity")
router.register("categories", ActivityCategoryViewSet, basename="category")
router.register("visit-packages", VisitPackageViewSet, basename="visit-package")

urlpatterns = router.urls
