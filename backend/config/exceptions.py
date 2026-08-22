from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None and exc:
        from django.core.exceptions import ObjectDoesNotExist

        if isinstance(exc, ObjectDoesNotExist) or (
            hasattr(exc, "__cause__")
            and isinstance(exc.__cause__, ObjectDoesNotExist)
        ):
            from rest_framework.response import Response
            from rest_framework import status

            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

    return response
