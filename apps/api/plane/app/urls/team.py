# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path
from plane.app.views import TeamViewSet, TeamMemberViewSet, TeamProjectViewSet

urlpatterns = [
    path(
        "workspaces/<str:slug>/teams/",
        TeamViewSet.as_view({"get": "list", "post": "create"}),
        name="teams",
    ),
    path(
        "workspaces/<str:slug>/teams/<uuid:pk>/",
        TeamViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="team",
    ),
    path(
        "workspaces/<str:slug>/teams/<uuid:team_id>/members/",
        TeamMemberViewSet.as_view({"get": "list", "post": "create"}),
        name="team-members",
    ),
    path(
        "workspaces/<str:slug>/teams/<uuid:team_id>/members/<uuid:pk>/",
        TeamMemberViewSet.as_view({"delete": "destroy"}),
        name="team-member",
    ),
    path(
        "workspaces/<str:slug>/teams/<uuid:team_id>/projects/",
        TeamProjectViewSet.as_view({"get": "list", "post": "create"}),
        name="team-projects",
    ),
    path(
        "workspaces/<str:slug>/teams/<uuid:team_id>/projects/<uuid:pk>/",
        TeamProjectViewSet.as_view({"delete": "destroy"}),
        name="team-project",
    ),
]
