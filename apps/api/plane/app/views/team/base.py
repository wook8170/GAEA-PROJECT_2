# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from rest_framework.response import Response
from rest_framework import status

from plane.app.views import BaseViewSet
from plane.app.serializers import TeamSerializer, TeamMemberSerializer, TeamProjectSerializer
from plane.app.permissions import ROLE, allow_permission
from plane.db.models import Team, TeamMember, TeamProject


class TeamViewSet(BaseViewSet):
    serializer_class = TeamSerializer
    model = Team

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .select_related("workspace")
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug):
        teams = TeamSerializer(self.get_queryset(), many=True).data
        return Response(teams, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def retrieve(self, request, slug, pk):
        team = Team.objects.get(pk=pk, workspace__slug=slug)
        return Response(TeamSerializer(team).data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug):
        from plane.db.models import Workspace
        workspace = Workspace.objects.get(slug=slug)
        serializer = TeamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(workspace=workspace)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def partial_update(self, request, slug, pk):
        team = Team.objects.get(pk=pk, workspace__slug=slug)
        serializer = TeamSerializer(team, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, pk):
        team = Team.objects.get(pk=pk, workspace__slug=slug)
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamMemberViewSet(BaseViewSet):
    serializer_class = TeamMemberSerializer
    model = TeamMember

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(team__workspace__slug=self.kwargs.get("slug"))
            .filter(team_id=self.kwargs.get("team_id"))
            .select_related("team", "member")
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, team_id):
        members = TeamMemberSerializer(self.get_queryset(), many=True).data
        return Response(members, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug, team_id):
        serializer = TeamMemberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(team_id=team_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, team_id, pk):
        member = TeamMember.objects.get(pk=pk, team_id=team_id, team__workspace__slug=slug)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamProjectViewSet(BaseViewSet):
    serializer_class = TeamProjectSerializer
    model = TeamProject

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(team__workspace__slug=self.kwargs.get("slug"))
            .filter(team_id=self.kwargs.get("team_id"))
            .select_related("team", "project")
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, team_id):
        projects = TeamProjectSerializer(self.get_queryset(), many=True).data
        return Response(projects, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug, team_id):
        serializer = TeamProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(team_id=team_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, team_id, pk):
        tp = TeamProject.objects.get(pk=pk, team_id=team_id, team__workspace__slug=slug)
        tp.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
