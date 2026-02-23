/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  cycleId: string;
  projectId: string;
  workspaceSlug: string;
  transferrableIssuesCount: number;
  cycleName: string;
}

export function EndCycleModal(props: Props) {
  const { isOpen, handleClose, cycleName, transferrableIssuesCount } = props;
  if (!isOpen) return <></>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-layer-0 p-5 shadow-lg">
        <h3 className="text-lg font-medium mb-2">End Cycle</h3>
        <p className="text-body-sm-regular text-tertiary mb-4">
          Are you sure you want to end <span className="font-medium text-primary">{cycleName}</span>?
          {transferrableIssuesCount > 0 && (
            <span> {transferrableIssuesCount} incomplete item(s) will remain in the backlog.</span>
          )}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={handleClose} className="rounded-md px-3 py-1.5 text-body-sm-medium text-secondary hover:bg-layer-1 transition-colors">Cancel</button>
          <button type="button" onClick={handleClose} className="rounded-md px-3 py-1.5 text-body-sm-medium bg-red-500 text-white hover:bg-red-600 transition-colors">End cycle</button>
        </div>
      </div>
    </div>
  );
}
