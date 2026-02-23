/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FC } from "react";

type TIssueActivityWorklogCreateButton = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
};

export function IssueActivityWorklogCreateButton(props: TIssueActivityWorklogCreateButton) {
  const { disabled } = props;
  if (disabled) return <></>;
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-caption-md-medium text-accent-primary hover:bg-accent-primary/10 transition-colors"
    >
      Log time
    </button>
  );
}
