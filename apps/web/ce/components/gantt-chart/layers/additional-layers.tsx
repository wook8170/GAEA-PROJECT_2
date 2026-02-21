/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { BLOCK_HEIGHT } from "@/components/gantt-chart/constants";
import type { FC } from "react";

type Props = {
  itemsContainerWidth: number;
  blockCount: number;
};

export const GanttAdditionalLayers: FC<Props> = ({ itemsContainerWidth, blockCount }) => {
  return (
    <div
      className="absolute top-0 pointer-events-none z-[-1] left-0 h-full"
      style={{
        width: `${itemsContainerWidth}px`,
      }}
    >
      {Array.from({ length: blockCount }).map((_, i) => (
        <div
          key={i}
          className="w-full border-b border-dashed border-subtle"
          style={{ height: `${BLOCK_HEIGHT}px` }}
        />
      ))}
    </div>
  );
};
