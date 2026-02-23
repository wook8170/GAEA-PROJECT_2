/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FC } from "react";
// types
import type { TDeDupeIssue } from "@plane/types";

type TDuplicateModalRootProps = {
  workspaceSlug: string;
  issues: TDeDupeIssue[];
  handleDuplicateIssueModal: (value: boolean) => void;
};

export function DuplicateModalRoot(props: TDuplicateModalRootProps) {
  const { issues, handleDuplicateIssueModal } = props;

  if (issues.length === 0) return <></>;

  return (
    <div className="rounded-md border border-subtle bg-layer-1 p-3">
      <p className="text-body-sm-regular text-tertiary mb-2">
        {issues.length} potential duplicate(s) found
      </p>
      <button
        type="button"
        onClick={() => handleDuplicateIssueModal(false)}
        className="text-caption-md-medium text-accent-primary hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
}
