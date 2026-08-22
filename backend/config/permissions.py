from rest_framework.permissions import SAFE_METHODS, BasePermission


def _action_for(request, view):
    """Map the request to a Django permission verb.

    Uses the DRF ``view.action`` when available (set before permission checks),
    so custom ``@action`` endpoints like ``confirm``/``cancel`` resolve to
    ``change`` instead of ``add``.
    """
    if request.method in SAFE_METHODS:
        return "view"
    action = getattr(view, "action", None)
    if action == "create":
        return "add"
    if action in ("update", "partial_update"):
        return "change"
    if action == "destroy":
        return "delete"
    if action:
        return "change"
    if request.method == "POST":
        return "add"
    return "change"


class IsStaffUser(BasePermission):
    """Allow access to any authenticated staff user."""

    message = "Staff access required."

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


class HasModelPerm(BasePermission):
    """Require a Django model permission for the current HTTP action.

    GET/HEAD/OPTIONS -> ``view``, POST (create) -> ``add``, PUT/PATCH -> ``change``,
    DELETE -> ``delete``. Custom ``@action`` endpoints map to ``change``.
    Permission codename: ``{app_label}.{action}_{model_name}``.
    The user must also be staff.
    """

    message = "You do not have permission to perform this action."

    def __init__(self, app_label, model_name, actions=None):
        self.app_label = app_label
        self.model_name = model_name
        self.allowed_actions = actions or {"view", "add", "change", "delete"}

    def __call__(self):
        # DRF instantiates each entry in permission_classes; this allows passing
        # a pre-configured instance in the view (e.g. HasModelPerm("app", "model")).
        return self

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return False
        action = _action_for(request, view)
        if action is None or action not in self.allowed_actions:
            return False
        return request.user.has_perm(f"{self.app_label}.{action}_{self.model_name}")
