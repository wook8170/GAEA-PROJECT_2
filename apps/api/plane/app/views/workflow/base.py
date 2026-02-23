# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from rest_framework.response import Response
from rest_framework import status

from plane.app.views import BaseViewSet
from plane.app.serializers import StateTransitionSerializer
from plane.app.permissions import ROLE, allow_permission
from plane.db.models import StateTransition


class StateTransitionViewSet(BaseViewSet):
    serializer_class = StateTransitionSerializer
    model = StateTransition

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .filter(
                project__project_projectmember__member=self.request.user,
                project__project_projectmember__is_active=True,
                project__archived_at__isnull=True,
            )
            .select_related("from_state", "to_state", "project", "workspace")
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        transitions = StateTransitionSerializer(self.get_queryset(), many=True).data
        return Response(transitions, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug, project_id):
        serializer = StateTransitionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project_id=project_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def partial_update(self, request, slug, project_id, pk):
        transition = StateTransition.objects.get(
            pk=pk, project_id=project_id, workspace__slug=slug
        )
        serializer = StateTransitionSerializer(transition, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, project_id, pk):
        transition = StateTransition.objects.get(
            pk=pk, project_id=project_id, workspace__slug=slug
        )
        transition.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
