# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from rest_framework.response import Response
from rest_framework import status

from plane.app.views import BaseViewSet
from plane.app.serializers import IssueTemplateSerializer, ProjectTemplateSerializer
from plane.app.permissions import ROLE, allow_permission
from plane.db.models import IssueTemplate, ProjectTemplate


class IssueTemplateViewSet(BaseViewSet):
    serializer_class = IssueTemplateSerializer
    model = IssueTemplate

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .select_related("workspace", "project")
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug):
        project_id = request.query_params.get("project_id")
        qs = self.get_queryset()
        if project_id:
            qs = qs.filter(project_id=project_id)
        return Response(IssueTemplateSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def retrieve(self, request, slug, pk):
        tpl = IssueTemplate.objects.get(pk=pk, workspace__slug=slug)
        return Response(IssueTemplateSerializer(tpl).data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug):
        from plane.db.models import Workspace
        workspace = Workspace.objects.get(slug=slug)
        serializer = IssueTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(workspace=workspace)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def partial_update(self, request, slug, pk):
        tpl = IssueTemplate.objects.get(pk=pk, workspace__slug=slug)
        serializer = IssueTemplateSerializer(tpl, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, pk):
        tpl = IssueTemplate.objects.get(pk=pk, workspace__slug=slug)
        tpl.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectTemplateViewSet(BaseViewSet):
    serializer_class = ProjectTemplateSerializer
    model = ProjectTemplate

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
        return Response(
            ProjectTemplateSerializer(self.get_queryset(), many=True).data,
            status=status.HTTP_200_OK,
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def retrieve(self, request, slug, pk):
        tpl = ProjectTemplate.objects.get(pk=pk, workspace__slug=slug)
        return Response(ProjectTemplateSerializer(tpl).data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug):
        from plane.db.models import Workspace
        workspace = Workspace.objects.get(slug=slug)
        serializer = ProjectTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(workspace=workspace)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def partial_update(self, request, slug, pk):
        tpl = ProjectTemplate.objects.get(pk=pk, workspace__slug=slug)
        serializer = ProjectTemplateSerializer(tpl, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, pk):
        tpl = ProjectTemplate.objects.get(pk=pk, workspace__slug=slug)
        tpl.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
