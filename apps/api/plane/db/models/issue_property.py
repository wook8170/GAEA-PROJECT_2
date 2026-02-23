# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import models
from django.db.models import Q

from .base import BaseModel
from .project import ProjectBaseModel


class PropertyTypeChoices(models.TextChoices):
    TEXT = "text", "Text"
    NUMBER = "number", "Number"
    SELECT = "select", "Select"
    MULTI_SELECT = "multi_select", "Multi Select"
    DATE = "date", "Date"
    CHECKBOX = "checkbox", "Checkbox"
    URL = "url", "URL"
    EMAIL = "email", "Email"
    FILE = "file", "File"
    RELATION = "relation", "Relation"


class IssueProperty(BaseModel):
    """Custom property definition for an issue type within a workspace."""
    workspace = models.ForeignKey(
        "db.Workspace", on_delete=models.CASCADE, related_name="issue_properties"
    )
    issue_type = models.ForeignKey(
        "db.IssueType", on_delete=models.CASCADE, related_name="properties",
        null=True, blank=True,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    property_type = models.CharField(
        max_length=20, choices=PropertyTypeChoices.choices, default=PropertyTypeChoices.TEXT
    )
    is_required = models.BooleanField(default=False)
    is_multi = models.BooleanField(default=False)
    default_value = models.JSONField(null=True, blank=True)
    options = models.JSONField(default=list, blank=True)
    sort_order = models.FloatField(default=65535)

    class Meta:
        unique_together = ["workspace", "issue_type", "name", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["workspace", "issue_type", "name"],
                condition=Q(deleted_at__isnull=True),
                name="issue_property_unique_when_deleted_at_null",
            )
        ]
        verbose_name = "Issue Property"
        verbose_name_plural = "Issue Properties"
        db_table = "issue_properties"
        ordering = ("sort_order",)

    def __str__(self):
        return f"{self.name} ({self.property_type})"


class IssuePropertyValue(BaseModel):
    """Value of a custom property for a specific issue."""
    issue = models.ForeignKey(
        "db.Issue", on_delete=models.CASCADE, related_name="property_values"
    )
    property = models.ForeignKey(
        IssueProperty, on_delete=models.CASCADE, related_name="values"
    )
    value = models.JSONField(default=dict)

    class Meta:
        unique_together = ["issue", "property", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["issue", "property"],
                condition=Q(deleted_at__isnull=True),
                name="issue_property_value_unique_when_deleted_at_null",
            )
        ]
        verbose_name = "Issue Property Value"
        verbose_name_plural = "Issue Property Values"
        db_table = "issue_property_values"

    def __str__(self):
        return f"{self.issue_id} - {self.property.name}"
