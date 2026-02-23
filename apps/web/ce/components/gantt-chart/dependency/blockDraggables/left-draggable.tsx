/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { RefObject } from "react";
import { useCallback } from "react";
import type { EIssueServiceType, IGanttBlock } from "@plane/types";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useTimeLineChartStore } from "@/hooks/use-timeline-chart";
import { useAutoScheduleDependency } from "../use-auto-schedule";
import { findTargetBlock } from "./find-target-block";

type LeftDependencyDraggableProps = {
  block: IGanttBlock;
  ganttContainerRef: RefObject<HTMLDivElement>;
};

export function LeftDependencyDraggable(props: LeftDependencyDraggableProps & { serviceType?: EIssueServiceType }) {
  const { block, ganttContainerRef, serviceType } = props;
  const { setDependencyDragState, blockIds, getBlockById } = useTimeLineChartStore();
  const { relation } = useIssueDetail(serviceType);
  const { autoSchedule, wouldCreateCycle } = useAutoScheduleDependency(serviceType);

  const getMousePositionInBlockArea = useCallback(
    (clientX: number, clientY: number) => {
      const blockEl = document.getElementById(`gantt-block-${block.id}`);
      const blockArea = blockEl?.parentElement;
      if (!blockArea) return { x: 0, y: 0 };
      const rect = blockArea.getBoundingClientRect();
      return { x: clientX - rect.left + blockArea.scrollLeft, y: clientY - rect.top + blockArea.scrollTop };
    },
    [block.id]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pos = getMousePositionInBlockArea(e.clientX, e.clientY);
      setDependencyDragState({
        sourceBlockId: block.id,
        direction: "left",
        mouseX: pos.x,
        mouseY: pos.y,
        targetBlockId: null,
      });

      const handleMouseMove = (ev: MouseEvent) => {
        const p = getMousePositionInBlockArea(ev.clientX, ev.clientY);
        const target = blockIds
          ? findTargetBlock(p.x, p.y, blockIds, getBlockById, block.id, "left")
          : { targetBlockId: null };
        setDependencyDragState({
          sourceBlockId: block.id,
          direction: "left",
          mouseX: p.x,
          mouseY: p.y,
          targetBlockId: target.targetBlockId,
          snapX: target.snapX,
          snapY: target.snapY,
        });
      };

      const handleMouseUp = (ev: MouseEvent) => {
        const p = getMousePositionInBlockArea(ev.clientX, ev.clientY);
        const target = blockIds
          ? findTargetBlock(p.x, p.y, blockIds, getBlockById, block.id, "left")
          : { targetBlockId: null };
        const targetBlockId = target.targetBlockId;

        if (targetBlockId && targetBlockId !== block.id) {
          if (wouldCreateCycle(targetBlockId, block.id)) {
            window.alert("순환 종속은 허용되지 않습니다.");
          } else {
            relation.createCurrentRelation(targetBlockId, "blocking", block.id).then(() => {
              autoSchedule(targetBlockId, block.id);
            });
          }
        }

        setDependencyDragState(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.addEventListener(
          "click",
          (e) => { e.stopPropagation(); e.preventDefault(); },
          { capture: true, once: true }
        );
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [block.id, blockIds, getBlockById, getMousePositionInBlockArea, setDependencyDragState, relation, autoSchedule, wouldCreateCycle]
  );

  return (
    <div
      className="absolute -left-[5px] top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      onMouseDown={handleMouseDown}
    >
      <div className="size-[10px] rounded-full border-2 border-accent-primary bg-white cursor-crosshair" />
    </div>
  );
}
