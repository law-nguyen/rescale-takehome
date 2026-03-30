from rest_framework import serializers
from django.db.models import OuterRef, Subquery
from .models import Job, JobStatus


def get_jobs_queryset():
    latest_status = JobStatus.objects.filter(
        job=OuterRef("pk")
    ).order_by("-timestamp").values("status_type")[:1]

    return Job.objects.annotate(latest_status=Subquery(latest_status)).order_by('-created_at')


class JobSerializer(serializers.ModelSerializer):
    current_status = serializers.SerializerMethodField()

    class Meta:
        model  = Job
        fields = ["id", "name", "current_status", "created_at", "updated_at"]

    def get_current_status(self, obj):
        return obj.latest_status if hasattr(obj, "latest_status") else None