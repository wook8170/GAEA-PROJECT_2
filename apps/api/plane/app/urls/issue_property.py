# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path
from plane.app.views import IssuePropertyViewSet, IssuePropertyValueViewSet

urlpatterns = [
    path(
        "workspaces/<str:slug>/issue-properties/",
        IssuePropertyViewSet.as_view({"get": "list", "post": "create"}),
        name="issue-properties",
    ),
    path(
        "workspaces/<str:slug>/issue-properties/<uuid:pk>/",
        IssuePropertyViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="issue-property",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issues/<uuid:issue_id>/property-values/",
        IssuePropertyValueViewSet.as_view({"get": "list", "post": "create"}),
        name="issue-property-values",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issues/<uuid:issue_id>/property-values/<uuid:pk>/",
        IssuePropertyValueViewSet.as_view({"patch": "partial_update", "delete": "destroy"}),
        name="issue-property-value",
    ),
]
