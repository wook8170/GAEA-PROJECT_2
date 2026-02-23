/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FC } from "react";

import type { TEstimatePointsObject, TEstimateSystemKeys, TEstimateTypeErrorObject } from "@plane/types";

export type TEstimatePointDelete = {
  workspaceSlug: string;
  projectId: string;
  estimateId: string;
  estimatePointId: string;
  estimatePoints: TEstimatePointsObject[];
  callback: () => void;
  estimatePointError?: TEstimateTypeErrorObject | undefined;
  handleEstimatePointError?: (newValue: string, message: string | undefined, mode?: "add" | "delete") => void;
  estimateSystem: TEstimateSystemKeys;
};

export function EstimatePointDelete(props: TEstimatePointDelete) {
  const { estimatePointId, callback, handleEstimatePointError } = props;

  const handleDelete = () => {
    if (handleEstimatePointError) handleEstimatePointError(estimatePointId, undefined, "delete");
    callback();
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="flex-shrink-0 size-6 grid place-items-center rounded-sm text-red-500 hover:bg-red-500/10 transition-colors"
      aria-label="Delete estimate point"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
