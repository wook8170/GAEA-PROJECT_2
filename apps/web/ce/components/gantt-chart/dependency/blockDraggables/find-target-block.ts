/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IGanttBlock } from "@plane/types";
import { BLOCK_HEIGHT } from "@/components/gantt-chart/constants";

/** Magnetic snap radius in pixels */
const SNAP_RADIUS = 40;

type TargetResult = {
  targetBlockId: string | null;
  snapX?: number;
  snapY?: number;
};

/**
 * Find target block by checking if the mouse is over any block's actual bounds.
 * Also provides magnetic snap coordinates when mouse is near a block.
 *
 * @param mouseX - mouse X in block area coords
 * @param mouseY - mouse Y in block area coords
 * @param blockIds - all block IDs in order
 * @param getBlockById - function to get block data
 * @param sourceBlockId - block being dragged from (excluded)
 * @param dragDirection - "left" or "right" determines which edge to snap to
 */
export function findTargetBlock(
  mouseX: number,
  mouseY: number,
  blockIds: string[],
  getBlockById: (id: string) => IGanttBlock | undefined,
  sourceBlockId: string,
  dragDirection: "left" | "right"
): TargetResult {
  let bestMatch: TargetResult = { targetBlockId: null };
  let bestDist = Infinity;

  for (let i = 0; i < blockIds.length; i++) {
    const id = blockIds[i];
    if (id === sourceBlockId) continue;

    const blk = getBlockById(id);
    if (!blk?.position) continue;

    const rowTop = i * BLOCK_HEIGHT;
    const rowBottom = rowTop + BLOCK_HEIGHT;
    const blockLeft = blk.position.marginLeft;
    const blockRight = blockLeft + blk.position.width;
    const blockCenterY = rowTop + BLOCK_HEIGHT / 2;

    // Check Y: mouse must be within the row
    if (mouseY < rowTop - SNAP_RADIUS || mouseY > rowBottom + SNAP_RADIUS) continue;

    // For right-drag: target's left edge is the snap point
    // For left-drag: target's right edge is the snap point
    const edgeX = dragDirection === "right" ? blockLeft : blockRight;

    // Distance from mouse to the snap edge
    const dx = Math.abs(mouseX - edgeX);
    const dy = Math.abs(mouseY - blockCenterY);

    // Check if mouse is on or near the block
    const isOnBlockX = mouseX >= blockLeft - SNAP_RADIUS && mouseX <= blockRight + SNAP_RADIUS;
    const isOnBlockY = mouseY >= rowTop && mouseY <= rowBottom;

    if (isOnBlockX && isOnBlockY) {
      // Mouse is directly over the block area
      const dist = dx + dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = {
          targetBlockId: id,
          snapX: edgeX,
          snapY: blockCenterY,
        };
      }
    } else if (dx < SNAP_RADIUS && dy < SNAP_RADIUS * 2) {
      // Magnetic zone near the edge
      const dist = dx + dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = {
          targetBlockId: id,
          snapX: edgeX,
          snapY: blockCenterY,
        };
      }
    }
  }

  return bestMatch;
}
