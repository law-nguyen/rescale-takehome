from django.db import models


class Job(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['created_at'])]

    def __str__(self):
        return self.name


class JobStatus(models.Model):
    PENDING   = "PENDING"
    RUNNING   = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED    = "FAILED"

    STATUS_CHOICES = [
        (PENDING,   "Pending"),
        (RUNNING,   "Running"),
        (COMPLETED, "Completed"),
        (FAILED,    "Failed"),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="statuses") # deletes all instances after ascociated job is deleted
    status_type = models.CharField(max_length=16, choices=STATUS_CHOICES, default=PENDING)
    timestamp   = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['job', 'timestamp'])]

    def __str__(self):
        return f"{self.job.name} — {self.status_type}"