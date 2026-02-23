/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { autorun } from "mobx";
import { BLOCK_HEIGHT } from "@/components/gantt-chart/constants";
import { useTimeLineChartStore } from "@/hooks/use-timeline-chart";

/**
 * @param direction "right" = exits right from source, "left" = exits left from source
 */
function computeDragPath(
  srcX: number, srcY: number,
  tgtX: number, tgtY: number,
  direction: "left" | "right"
): string {
  const minOffset = 30;

  if (direction === "left") {
    // Exit LEFT from source, enter RIGHT into target
    const gap = srcX - tgtX;
    if (gap > minOffset * 2) {
      const midX = (srcX + tgtX) / 2;
      return `M ${srcX} ${srcY} C ${midX} ${srcY}, ${midX} ${tgtY}, ${tgtX} ${tgtY}`;
    }
    const offset = Math.max(minOffset, Math.abs(gap) / 2 + minOffset);
    const cp1x = srcX - offset;
    const cp2x = tgtX + offset;
    return `M ${srcX} ${srcY} C ${cp1x} ${srcY}, ${cp2x} ${tgtY}, ${tgtX} ${tgtY}`;
  }

  // direction === "right": exit RIGHT from source, enter LEFT into target
  const gap = tgtX - srcX;
  if (gap > minOffset * 2) {
    const midX = (srcX + tgtX) / 2;
    return `M ${srcX} ${srcY} C ${midX} ${srcY}, ${midX} ${tgtY}, ${tgtX} ${tgtY}`;
  }
  const offset = Math.max(minOffset, Math.abs(gap) / 2 + minOffset);
  const cp1x = srcX + offset;
  const cp2x = tgtX - offset;
  return `M ${srcX} ${srcY} C ${cp1x} ${srcY}, ${cp2x} ${tgtY}, ${tgtX} ${tgtY}`;
}

export const TimelineDraggablePath = observer(function TimelineDraggablePath() {
  const store = useTimeLineChartStore();
  const { dependencyDragState, blockIds, getBlockById } = store;

  const [, setTick] = useState(0);
  useEffect(() => {
    const dispose = autorun(() => {
      const _state = store.dependencyDragState;
      setTick((t) => t + 1);
    });
    return dispose;
  }, [store]);

  if (!dependencyDragState || !blockIds || blockIds.length === 0) return <></>;

  const { sourceBlockId, direction, mouseX, mouseY, snapX, snapY, targetBlockId } = dependencyDragState;
  const srcBlock = getBlockById(sourceBlockId);
  if (!srcBlock?.position) return <></>;

  const blockIndexMap = new Map<string, number>();
  blockIds.forEach((id: string, index: number) => blockIndexMap.set(id, index));

  const srcIndex = blockIndexMap.get(sourceBlockId) ?? 0;
  const halfBlockHeight = BLOCK_HEIGHT / 2;

  const srcX =
    direction === "right"
      ? srcBlock.position.marginLeft + srcBlock.position.width
      : srcBlock.position.marginLeft;
  const srcY = srcIndex * BLOCK_HEIGHT + halfBlockHeight;

  // Use snap coordinates when a target is detected (magnetic effect)
  const isSnapped = targetBlockId && snapX !== undefined && snapY !== undefined;
  const tgtX = isSnapped ? snapX : mouseX;
  const tgtY = isSnapped ? snapY : mouseY;

  // Path ends at arrowhead base (8px before tip), except when snapped (dot shown instead)
  const arrowOffset = isSnapped ? 0 : (direction === "left" ? 8 : -8);
  const pathD = computeDragPath(srcX, srcY, tgtX + arrowOffset, tgtY, direction);

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-[8] text-accent-primary"
      style={{ width: "100%", height: `${blockIds.length * BLOCK_HEIGHT}px`, overflow: "visible" }}
    >
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray={isSnapped ? "none" : "6 3"}
        opacity={isSnapped ? 0.8 : 0.6}
      />
      {/* Arrow head at target — flips based on drag direction */}
      {isSnapped ? (
        /* When snapped: show a dot matching the block handle style (white fill + accent border) */
        <circle cx={tgtX} cy={tgtY} r={4} fill="white" stroke="currentColor" strokeWidth={2} />
      ) : (
        <path
          d={direction === "left"
            ? `M ${tgtX} ${tgtY} l 8 -5 v 10 z`
            : `M ${tgtX} ${tgtY} l -8 -5 v 10 z`}
          fill="currentColor"
          opacity={0.8}
        />
      )}
    </svg>
  );
});
