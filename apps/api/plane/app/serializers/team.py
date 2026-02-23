# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from .base import BaseSerializer
from plane.db.models import Team, TeamMember, TeamProject


class TeamSerializer(BaseSerializer):
    class Meta:
        model = Team
        fields = "__all__"
        read_only_fields = ["id", "workspace", "created_by", "updated_by", "created_at", "updated_at"]


class TeamMemberSerializer(BaseSerializer):
    class Meta:
        model = TeamMember
        fields = "__all__"
        read_only_fields = ["id", "team", "created_by", "updated_by", "created_at", "updated_at"]


class TeamProjectSerializer(BaseSerializer):
    class Meta:
        model = TeamProject
        fields = "__all__"
        read_only_fields = ["id", "team", "created_by", "updated_by", "created_at", "updated_at"]
