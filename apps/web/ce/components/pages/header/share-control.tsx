/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { Globe2, Lock } from "lucide-react";
// plane imports
import { EPageAccess } from "@plane/constants";
import { Tooltip } from "@plane/propel/tooltip";
// hooks
import { usePageOperations } from "@/hooks/use-page-operations";
// store
import type { EPageStoreType } from "@/plane-web/hooks/store";
import type { TPageInstance } from "@/store/pages/base-page";

export type TPageShareControlProps = {
  page: TPageInstance;
  storeType: EPageStoreType;
};

export const PageShareControl = observer(function PageShareControl({ page }: TPageShareControlProps) {
  const { access, canCurrentUserChangeAccess } = page;
  const {
    pageOperations: { toggleAccess },
  } = usePageOperations({ page });

  if (!canCurrentUserChangeAccess) return null;

  const isPublic = access === EPageAccess.PUBLIC;

  return (
    <Tooltip tooltipContent={isPublic ? "Make private" : "Make public"} position="bottom">
      <button
        type="button"
        onClick={toggleAccess}
        className="flex-shrink-0 h-6 flex items-center gap-1 px-2 rounded-sm text-secondary hover:text-primary hover:bg-layer-1 transition-colors"
        aria-label={isPublic ? "Make private" : "Make public"}
      >
        {isPublic ? <Globe2 className="size-3.5" /> : <Lock className="size-3.5" />}
        <span className="text-11 font-medium">{isPublic ? "Public" : "Private"}</span>
      </button>
    </Tooltip>
  );
});
