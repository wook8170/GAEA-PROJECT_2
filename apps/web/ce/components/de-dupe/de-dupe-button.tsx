/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FC } from "react";
import React from "react";
// local components

type TDeDupeButtonRoot = {
  workspaceSlug: string;
  isDuplicateModalOpen: boolean;
  handleOnClick: () => void;
  label: string;
};

export function DeDupeButtonRoot(props: TDeDupeButtonRoot) {
  const { label, handleOnClick } = props;
  return (
    <button
      type="button"
      onClick={handleOnClick}
      className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-caption-md-medium text-secondary hover:bg-layer-1 hover:text-primary transition-colors"
    >
      {label}
    </button>
  );
}
