"""
Populates the database with 100 dummy HPC jobs, each with a realistic
status history.

"""

import os
import sys
import django
import random
from datetime import timedelta
from django.utils import timezone

# ── Bootstrap Django ──────────────────────────────────────────────
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.settings")
django.setup()

# Import models AFTER django.setup()
from api.models import Job, JobStatus

# ── Config ────────────────────────────────────────────────────────
TOTAL_JOBS = 100

JOB_NAMES = [
    "Fluid Dynamics Simulation",
    "ML Model Training",
    "Protein Folding Analysis",
    "Climate Model Run",
    "Genome Sequence Alignment",
    "Neural Network Benchmark",
    "Monte Carlo Simulation",
    "Finite Element Analysis",
    "Molecular Dynamics",
    "Image Segmentation Pipeline",
    "Seismic Wave Propagation",
    "Quantum Circuit Simulation",
    "Data Preprocessing Job",
    "Turbulence Modelling",
    "Radar Signal Processing",
]

# Weights control how likely each final state is
STATUSES = ["COMPLETED", "FAILED", "RUNNING", "PENDING"]
WEIGHTS  = [50, 15, 20, 15]


def random_job_name(index: int) -> str:
    base = random.choice(JOB_NAMES)
    return f"{base} #{index + 1}"


def create_status_history(job: Job, final_status: str) -> None:
    """
    Insert a realistic sequence of JobStatus rows for a job.

    PENDING  → always the first entry
    RUNNING  → added if the job ever started
    COMPLETED / FAILED → added as the terminal entry
    """
    now = timezone.now()

    if final_status == "PENDING":
        # Job is still waiting — only one status entry
        JobStatus.objects.create(
            job=job,
            status_type="PENDING",
            timestamp=now - timedelta(minutes=random.randint(1, 120)),
        )

    elif final_status == "RUNNING":
        # Job started but hasn't finished yet
        JobStatus.objects.create(
            job=job,
            status_type="PENDING",
            timestamp=now - timedelta(minutes=random.randint(30, 180)),
        )
        JobStatus.objects.create(
            job=job,
            status_type="RUNNING",
            timestamp=now - timedelta(minutes=random.randint(1, 29)),
        )

    else:
        # COMPLETED or FAILED — full history
        pending_at   = now - timedelta(hours=random.randint(2, 48))
        running_at   = pending_at + timedelta(minutes=random.randint(1, 30))
        finished_at  = running_at + timedelta(hours=random.randint(1, 12))

        JobStatus.objects.create(job=job, status_type="PENDING",      timestamp=pending_at)
        JobStatus.objects.create(job=job, status_type="RUNNING",      timestamp=running_at)
        JobStatus.objects.create(job=job, status_type=final_status,   timestamp=finished_at)


def seed():
    if Job.objects.exists():
        print("Database already has data, skipping seed.")
        return
    existing = Job.objects.count()
    if existing > 0:
        answer = input(f"Database already has {existing} jobs. Clear and reseed? [y/N] ")
        if answer.strip().lower() != "y":
            print("Aborted.")
            sys.exit(0)
        JobStatus.objects.all().delete()
        Job.objects.all().delete()
        print("Cleared existing data.")

    print(f"Creating {TOTAL_JOBS} jobs…")

    for i in range(TOTAL_JOBS):
        final_status = random.choices(STATUSES, weights=WEIGHTS, k=1)[0]
        job = Job.objects.create(name=random_job_name(i))
        create_status_history(job, final_status)

        # Progress indicator
        if (i + 1) % 10 == 0:
            print(f"  {i + 1}/{TOTAL_JOBS} created")

    # Summary
    print("\nDone! Breakdown:")
    for s in STATUSES:
        count = JobStatus.objects.filter(
            status_type=s,
            job__statuses__status_type=s,
        ).values("job").distinct().count()
        print(f"  {s:<12} {count} jobs")


if __name__ == "__main__":
    seed()
