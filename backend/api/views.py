from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from .models import Job, JobStatus
from .serializers import JobSerializer, get_jobs_queryset
from django.db import IntegrityError

class JobPagination(PageNumberPagination):
    page_size = 25

@api_view(["GET", "POST"])
def job_list(request):
    if request.method == "GET":
        jobs = get_jobs_queryset()
        paginator = JobPagination()
        page = paginator.paginate_queryset(jobs, request)
        return paginator.get_paginated_response(JobSerializer(page, many=True).data)
 
    if request.method == "POST":
        serializer = JobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            job = serializer.save()
        # communicate unique name restriction to the frontend
        except IntegrityError:
            return Response(
                {"error": 'A job with this name already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        JobStatus.objects.create(job=job, status_type=JobStatus.PENDING)
        return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)

@api_view(["GET", "PATCH", "DELETE"])
def job_detail(request, job_key):
    try:
        job = Job.objects.get(pk=job_key)
    except Job.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
 
    if request.method == "GET":
        return Response(JobSerializer(job).data)
 
    if request.method == "PATCH":
        # allow the option for name to be updated for future implementations
        serializer = JobSerializer(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # add new status change
        new_status = request.data.get("status_type")
        if new_status:
            JobStatus.objects.create(job=job, status_type=new_status)
        job = get_jobs_queryset().get(pk=job_key)
        return Response(JobSerializer(job).data)
 
    if request.method == "DELETE":
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)