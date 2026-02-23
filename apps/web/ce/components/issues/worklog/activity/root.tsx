/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FC } from "react";
import type { TIssueActivityComment } from "@plane/types";

type TIssueActivityWorklog = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  activityComment: TIssueActivityComment;
  ends?: "top" | "bottom";
};

export function IssueActivityWorklog(props: TIssueActivityWorklog) {
  const { activityComment } = props;
  return (
    <div className="flex items-center gap-1 text-caption-md-regular text-tertiary">
      <span>logged time on this work item</span>
    </div>
  );
}
