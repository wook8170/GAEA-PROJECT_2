/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Clock } from "lucide-react";

type TIssueWorklogProperty = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
};

export function IssueWorklogProperty(_props: TIssueWorklogProperty) {
  return (
    <div className="flex items-center gap-2 text-secondary">
      <Clock className="size-3.5 flex-shrink-0" />
      <span className="text-body-sm-regular">Time tracking</span>
    </div>
  );
}
