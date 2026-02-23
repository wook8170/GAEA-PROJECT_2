# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from rest_framework.response import Response
from rest_framework import status

from plane.app.views import BaseViewSet
from plane.app.serializers import IssuePropertySerializer, IssuePropertyValueSerializer
from plane.app.permissions import ROLE, allow_permission
from plane.db.models import IssueProperty, IssuePropertyValue


class IssuePropertyViewSet(BaseViewSet):
    serializer_class = IssuePropertySerializer
    model = IssueProperty

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .select_related("workspace", "issue_type")
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug):
        issue_type_id = request.query_params.get("issue_type_id")
        qs = self.get_queryset()
        if issue_type_id:
            qs = qs.filter(issue_type_id=issue_type_id)
        return Response(IssuePropertySerializer(qs, many=True).data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def retrieve(self, request, slug, pk):
        prop = IssueProperty.objects.get(pk=pk, workspace__slug=slug)
        return Response(IssuePropertySerializer(prop).data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug):
        from plane.db.models import Workspace
        workspace = Workspace.objects.get(slug=slug)
        serializer = IssuePropertySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(workspace=workspace)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def partial_update(self, request, slug, pk):
        prop = IssueProperty.objects.get(pk=pk, workspace__slug=slug)
        serializer = IssuePropertySerializer(prop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, pk):
        prop = IssueProperty.objects.get(pk=pk, workspace__slug=slug)
        prop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class IssuePropertyValueViewSet(BaseViewSet):
    serializer_class = IssuePropertyValueSerializer
    model = IssuePropertyValue

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(issue__workspace__slug=self.kwargs.get("slug"))
            .filter(issue__project_id=self.kwargs.get("project_id"))
            .filter(issue_id=self.kwargs.get("issue_id"))
            .select_related("issue", "property")
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id, issue_id):
        return Response(
            IssuePropertyValueSerializer(self.get_queryset(), many=True).data,
            status=status.HTTP_200_OK,
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id, issue_id):
        serializer = IssuePropertyValueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(issue_id=issue_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def partial_update(self, request, slug, project_id, issue_id, pk):
        pv = IssuePropertyValue.objects.get(pk=pk, issue_id=issue_id)
        serializer = IssuePropertyValueSerializer(pv, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def destroy(self, request, slug, project_id, issue_id, pk):
        pv = IssuePropertyValue.objects.get(pk=pk, issue_id=issue_id)
        pv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
