/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { ArrowRightLeft } from "lucide-react";
// plane imports
import { Tooltip } from "@plane/propel/tooltip";
// components
import { MovePageModal } from "@/plane-web/components/pages/modals/move-page-modal";
// plane web hooks
import type { EPageStoreType } from "@/plane-web/hooks/store";
// store
import type { TPageInstance } from "@/store/pages/base-page";

export type TPageMoveControlProps = {
  page: TPageInstance;
  storeType: EPageStoreType;
};

export const PageMoveControl = observer(function PageMoveControl({ page, storeType }: TPageMoveControlProps) {
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const { canCurrentUserMovePage } = page;

  if (!canCurrentUserMovePage) return null;

  return (
    <>
      <Tooltip tooltipContent="Move page" position="bottom">
        <button
          type="button"
          onClick={() => setIsMoveModalOpen(true)}
          className="flex-shrink-0 size-6 grid place-items-center rounded-sm text-secondary hover:text-primary hover:bg-layer-1 transition-colors"
          aria-label="Move page"
        >
          <ArrowRightLeft className="size-3.5" />
        </button>
      </Tooltip>
      <MovePageModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} page={page} storeType={storeType} />
    </>
  );
});
