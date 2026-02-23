# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path
from plane.app.views import IssueTemplateViewSet, ProjectTemplateViewSet

urlpatterns = [
    path(
        "workspaces/<str:slug>/issue-templates/",
        IssueTemplateViewSet.as_view({"get": "list", "post": "create"}),
        name="issue-templates",
    ),
    path(
        "workspaces/<str:slug>/issue-templates/<uuid:pk>/",
        IssueTemplateViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="issue-template",
    ),
    path(
        "workspaces/<str:slug>/project-templates/",
        ProjectTemplateViewSet.as_view({"get": "list", "post": "create"}),
        name="project-templates",
    ),
    path(
        "workspaces/<str:slug>/project-templates/<uuid:pk>/",
        ProjectTemplateViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="project-template",
    ),
]
