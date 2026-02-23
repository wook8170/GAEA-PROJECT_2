/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { cn } from "@plane/utils";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";

type Props = {
  issueId: string;
  className?: string;
  size?: number;
  showProgressText?: boolean;
  showLabel?: boolean;
};

export const IssueStats = observer(function IssueStats(props: Props) {
  const { issueId, className, showProgressText = true, showLabel = false } = props;
  const {
    issue: { getIssueById },
  } = useIssueDetail();

  const issue = getIssueById(issueId);
  if (!issue) return <></>;

  const total = issue.sub_issues_count ?? 0;
  if (total === 0) return <></>;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {showLabel && <span>Sub-items</span>}
      <span>{total} sub-item{total !== 1 ? "s" : ""}</span>
    </div>
  );
});
