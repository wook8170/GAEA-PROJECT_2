# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from .base import BaseSerializer
from plane.db.models import IssueProperty, IssuePropertyValue


class IssuePropertySerializer(BaseSerializer):
    class Meta:
        model = IssueProperty
        fields = "__all__"
        read_only_fields = ["id", "workspace", "created_by", "updated_by", "created_at", "updated_at"]


class IssuePropertyValueSerializer(BaseSerializer):
    class Meta:
        model = IssuePropertyValue
        fields = "__all__"
        read_only_fields = ["id", "created_by", "updated_by", "created_at", "updated_at"]
