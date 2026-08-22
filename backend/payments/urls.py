from django.urls import path

from .views import PaymentInitiateView, PaymentVerifyView

app_name = "payments"

urlpatterns = [
    path("payments/initiate/", PaymentInitiateView.as_view(), name="initiate"),
    path("payments/verify/", PaymentVerifyView.as_view(), name="verify"),
]
