/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import {
  IssuePropertyService,
  type TIssueProperty,
  type TIssuePropertyValue,
} from "@/services/issue-property.service";

export type TWorkItemAdditionalSidebarProperties = {
  workItemId: string;
  workItemTypeId: string | null;
  projectId: string;
  workspaceSlug: string;
  isEditable: boolean;
  isPeekView?: boolean;
};

const issuePropertyService = new IssuePropertyService();

export const WorkItemAdditionalSidebarProperties = observer(function WorkItemAdditionalSidebarProperties(
  props: TWorkItemAdditionalSidebarProperties
) {
  const { workItemId, workItemTypeId, projectId, workspaceSlug } = props;
  const [properties, setProperties] = useState<TIssueProperty[]>([]);
  const [values, setValues] = useState<TIssuePropertyValue[]>([]);

  useEffect(() => {
    if (!workspaceSlug || !workItemTypeId) return;
    issuePropertyService
      .listProperties(workspaceSlug, workItemTypeId)
      .then(setProperties)
      .catch(() => setProperties([]));
  }, [workspaceSlug, workItemTypeId]);

  useEffect(() => {
    if (!workspaceSlug || !projectId || !workItemId) return;
    issuePropertyService
      .listValues(workspaceSlug, projectId, workItemId)
      .then(setValues)
      .catch(() => setValues([]));
  }, [workspaceSlug, projectId, workItemId]);

  if (properties.length === 0) return <></>;

  return (
    <div className="flex flex-col gap-2 py-1">
      {properties.map((prop) => {
        const pv = values.find((v) => v.property === prop.id);
        const displayValue = pv?.value ? JSON.stringify(pv.value) : "—";
        return (
          <div key={prop.id} className="flex items-center justify-between gap-2">
            <span className="text-caption-md-regular text-tertiary truncate flex-shrink-0 w-1/3">
              {prop.name}
            </span>
            <span className="text-body-sm-regular text-secondary truncate text-right">
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
});
