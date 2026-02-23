# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models
from django.db.models import Q

from .base import BaseModel


class IssueTemplate(BaseModel):
    """Reusable template for creating issues."""
    workspace = models.ForeignKey(
        "db.Workspace", on_delete=models.CASCADE, related_name="issue_templates"
    )
    project = models.ForeignKey(
        "db.Project", on_delete=models.CASCADE, related_name="issue_templates",
        null=True, blank=True,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    template_data = models.JSONField(default=dict)

    class Meta:
        unique_together = ["workspace", "project", "name", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["workspace", "project", "name"],
                condition=Q(deleted_at__isnull=True),
                name="issue_template_unique_when_deleted_at_null",
            )
        ]
        verbose_name = "Issue Template"
        verbose_name_plural = "Issue Templates"
        db_table = "issue_templates"
        ordering = ("name",)

    def __str__(self):
        return self.name


class ProjectTemplate(BaseModel):
    """Reusable template for creating projects."""
    workspace = models.ForeignKey(
        "db.Workspace", on_delete=models.CASCADE, related_name="project_templates"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    template_data = models.JSONField(default=dict)

    class Meta:
        unique_together = ["workspace", "name", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["workspace", "name"],
                condition=Q(deleted_at__isnull=True),
                name="project_template_unique_when_deleted_at_null",
            )
        ]
        verbose_name = "Project Template"
        verbose_name_plural = "Project Templates"
        db_table = "project_templates"
        ordering = ("name",)

    def __str__(self):
        return self.name
