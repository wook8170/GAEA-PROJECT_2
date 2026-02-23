/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { EIssueServiceType } from "@plane/types";
import { BLOCK_HEIGHT } from "@/components/gantt-chart/constants";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useTimeLineChartStore } from "@/hooks/use-timeline-chart";
import { StoreContext } from "@/lib/store-context";

type Props = {
  isEpic?: boolean;
};

/**
 * Compute an SVG path from source block's right edge to target block's left edge.
 * Always exits to the right and enters from the left, producing a natural S-curve
 * even when source and target are vertically aligned or target is to the left.
 */
function computeDependencyPath(
  srcX: number,
  srcY: number,
  tgtX: number,
  tgtY: number
): string {
  const gap = tgtX - srcX;
  const minOffset = 30;

  if (gap > minOffset * 2) {
    // Normal case: enough horizontal space — smooth bezier
    const midX = (srcX + tgtX) / 2;
    return `M ${srcX} ${srcY} C ${midX} ${srcY}, ${midX} ${tgtY}, ${tgtX} ${tgtY}`;
  }

  // S-curve: exit right from source, enter left into target
  const offset = Math.max(minOffset, Math.abs(gap) / 2 + minOffset);
  const cp1x = srcX + offset;
  const cp2x = tgtX - offset;
  return `M ${srcX} ${srcY} C ${cp1x} ${srcY}, ${cp2x} ${tgtY}, ${tgtX} ${tgtY}`;
}

export const TimelineDependencyPaths = observer(function TimelineDependencyPaths(props: Props) {
  const { isEpic = false } = props;
  const { workspaceSlug, projectId } = useParams();
  const serviceType = isEpic ? EIssueServiceType.EPICS : EIssueServiceType.ISSUES;
  const { relation } = useIssueDetail(serviceType);
  const { blockIds, getBlockById } = useTimeLineChartStore();
  const rootStore = useContext(StoreContext);
  const getIssueById = rootStore.issue.issues.getIssueById;

  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  // Click outside to deselect
  useEffect(() => {
    if (!selectedEdge) return;
    const handleClickOutside = () => setSelectedEdge(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [selectedEdge]);

  const handleRemoveRelation = useCallback(
    async (srcId: string, tgtId: string) => {
      if (!workspaceSlug || !projectId) return;
      const issue = getIssueById(srcId);
      const pid = issue?.project_id ?? projectId.toString();
      try {
        await relation.removeRelation(
          workspaceSlug.toString(),
          pid,
          srcId,
          "blocking",
          tgtId
        );
      } catch (e) {
        console.error("[DEP-PATHS] Failed to remove relation:", e);
      }
      setSelectedEdge(null);
    },
    [workspaceSlug, projectId, relation, getIssueById]
  );

  if (!blockIds || blockIds.length === 0) return <></>;

  // Build a map of blockId -> index for Y position calculation
  const blockIndexMap = new Map<string, number>();
  blockIds.forEach((id: string, index: number) => blockIndexMap.set(id, index));

  // Collect all dependency edges (blocking: source -> target)
  const edges: { srcId: string; tgtId: string }[] = [];

  for (const blockId of blockIds) {
    const blockingIds = relation.getRelationByIssueIdRelationType(blockId, "blocking");
    if (!blockingIds) continue;
    for (const targetId of blockingIds) {
      if (blockIndexMap.has(targetId)) {
        edges.push({ srcId: blockId, tgtId: targetId });
      }
    }
  }

  if (edges.length === 0) return <></>;

  const halfBlockHeight = BLOCK_HEIGHT / 2;

  return (
    <svg
      className="absolute inset-0 z-[3] text-accent-primary"
      style={{ width: "100%", height: `${blockIds.length * BLOCK_HEIGHT}px`, overflow: "visible", pointerEvents: "none" }}
    >
      <defs>
        <filter id="dep-hover-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(220,38,38,0.4)" />
        </filter>
      </defs>
      {edges.map(({ srcId, tgtId }) => {
        const srcBlock = getBlockById(srcId);
        const tgtBlock = getBlockById(tgtId);
        if (!srcBlock?.position || !tgtBlock?.position) return null;

        const srcIndex = blockIndexMap.get(srcId) ?? 0;
        const tgtIndex = blockIndexMap.get(tgtId) ?? 0;

        // Source: right edge of the blocking block
        const srcX = srcBlock.position.marginLeft + srcBlock.position.width;
        const srcY = srcIndex * BLOCK_HEIGHT + halfBlockHeight;

        // Target: left edge of the blocked block
        const tgtX = tgtBlock.position.marginLeft;
        const tgtY = tgtIndex * BLOCK_HEIGHT + halfBlockHeight;

        // Path ends at the arrowhead base (8px before tip)
        const pathD = computeDependencyPath(srcX, srcY, tgtX - 8, tgtY);
        const key = `${srcId}-${tgtId}`;
        const isSelected = selectedEdge === key;

        const handleEdgeClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          setSelectedEdge(isSelected ? null : key);
        };

        return (
          <g key={key}>
            {/* Visible path — clickable via stroke */}
            <path
              d={pathD}
              fill="none"
              stroke={isSelected ? "rgb(220,38,38)" : "currentColor"}
              strokeWidth={isSelected ? 2 : 2}
              opacity={isSelected ? 0.7 : 0.4}
              filter={isSelected ? "url(#dep-hover-shadow)" : undefined}
              className="transition-all duration-150"
              style={{ pointerEvents: "stroke", cursor: "pointer" }}
              onClick={handleEdgeClick}
            />
            {/* Arrow head at target */}
            <path
              d={`M ${tgtX} ${tgtY} l -8 -5 v 10 z`}
              fill={isSelected ? "rgb(220,38,38)" : "currentColor"}
              style={{ pointerEvents: "auto", cursor: "pointer" }}
              onClick={handleEdgeClick}
            />
            {/* Delete button when selected */}
            {isSelected && (
              <g
                style={{ pointerEvents: "auto", cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("종속 관계를 삭제하시겠습니까?")) {
                    handleRemoveRelation(srcId, tgtId);
                  }
                }}
              >
                <rect
                  x={(srcX + tgtX) / 2 - 18}
                  y={(srcY + tgtY) / 2 - 10}
                  width={36}
                  height={20}
                  rx={4}
                  fill="rgb(220,38,38)"
                />
                <text
                  x={(srcX + tgtX) / 2}
                  y={(srcY + tgtY) / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={11}
                  fontFamily="Arial, sans-serif"
                  fontWeight="600"
                  style={{ pointerEvents: "none" }}
                >
                  삭제
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
});
