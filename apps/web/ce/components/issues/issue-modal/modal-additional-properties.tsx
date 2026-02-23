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
} from "@/services/issue-property.service";

export type TWorkItemModalAdditionalPropertiesProps = {
  isDraft?: boolean;
  projectId: string | null;
  workItemId: string | undefined;
  workspaceSlug: string;
};

const issuePropertyService = new IssuePropertyService();

export const WorkItemModalAdditionalProperties = observer(function WorkItemModalAdditionalProperties(
  props: TWorkItemModalAdditionalPropertiesProps
) {
  const { workspaceSlug } = props;
  const [properties, setProperties] = useState<TIssueProperty[]>([]);

  useEffect(() => {
    if (!workspaceSlug) return;
    issuePropertyService
      .listProperties(workspaceSlug)
      .then(setProperties)
      .catch(() => setProperties([]));
  }, [workspaceSlug]);

  if (properties.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 py-2">
      {properties.map((prop) => (
        <div key={prop.id} className="flex items-center gap-2">
          <label className="text-body-sm-regular text-tertiary w-1/3 flex-shrink-0">{prop.name}</label>
          <input
            type="text"
            placeholder={`Enter ${prop.name.toLowerCase()}`}
            className="flex-1 rounded-md border border-subtle bg-transparent px-2 py-1 text-body-sm-regular text-secondary placeholder:text-tertiary focus:border-accent-primary focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
});
