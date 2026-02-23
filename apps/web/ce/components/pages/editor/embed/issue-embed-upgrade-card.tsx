/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { FileText } from "lucide-react";
import { cn } from "@plane/utils";

export function IssueEmbedUpgradeCard(props: any) {
  return (
    <div
      className={cn(
        "w-full bg-layer-1 rounded-md border-[0.5px] border-subtle shadow-raised-100 flex items-center gap-4 px-5 py-3 max-md:flex-wrap",
        {
          "border-2 border-accent-primary": props.selected,
        }
      )}
    >
      <FileText className="flex-shrink-0 size-4 text-tertiary" />
      <p className="text-secondary text-14">
        Issue embed is available. Select a work item to embed it in this page.
      </p>
    </div>
  );
}
