/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useCallback, useContext } from "react";
import { useParams } from "next/navigation";
import type { EIssueServiceType } from "@plane/types";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { StoreContext } from "@/lib/store-context";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Auto-schedule: when A blocks B, if B starts before A ends, shift B forward.
 * Returns two hooks:
 *  - autoSchedule(blockingId, blockedId) — for newly created dependencies
 *  - cascadeFromBlock(blockId) — for when an existing block is moved/resized
 */
export function useAutoScheduleDependency(serviceType?: EIssueServiceType) {
  const { workspaceSlug, projectId } = useParams();
  const rootStore = useContext(StoreContext);
  const { relation } = useIssueDetail(serviceType);

  const getIssueById = rootStore.issue.issues.getIssueById;

  /**
   * Collect all downstream date updates starting from srcId → tgtId.
   * Uses shiftedEndDates map to track dates that were already shifted in this cascade.
   */
  const collectCascadeUpdates = useCallback(
    (
      startSrcId: string,
      startTgtId: string | null,
      overrideSrcEndDate?: Date
    ): { id: string; start_date?: string; target_date?: string }[] => {
      const visited = new Set<string>();
      const allUpdates: { id: string; start_date?: string; target_date?: string }[] = [];
      const shiftedEndDates = new Map<string, Date>();

      if (overrideSrcEndDate) {
        shiftedEndDates.set(startSrcId, overrideSrcEndDate);
      }

      const processEdge = (srcId: string, tgtId: string) => {
        if (visited.has(tgtId)) return;
        visited.add(tgtId);

        const srcIssue = getIssueById(srcId);
        const tgtIssue = getIssueById(tgtId);
        if (!srcIssue || !tgtIssue) return;

        const srcEnd = shiftedEndDates.get(srcId)
          ?? (srcIssue.target_date ? new Date(srcIssue.target_date) : null);
        const tgtStart = tgtIssue.start_date ? new Date(tgtIssue.start_date) : null;
        const tgtEnd = tgtIssue.target_date ? new Date(tgtIssue.target_date) : null;

        if (!srcEnd || !tgtStart) return;
        if (tgtStart > srcEnd) return;

        const newStart = new Date(srcEnd);
        newStart.setDate(newStart.getDate() + 1);
        const shiftMs = newStart.getTime() - tgtStart.getTime();

        const update: { id: string; start_date: string; target_date?: string } = {
          id: tgtId,
          start_date: formatDate(newStart),
        };

        if (tgtEnd) {
          const newEnd = new Date(tgtEnd.getTime() + shiftMs);
          update.target_date = formatDate(newEnd);
          shiftedEndDates.set(tgtId, newEnd);
        }

        allUpdates.push(update);

        // Cascade downstream
        const downstreamIds = relation.getRelationByIssueIdRelationType(tgtId, "blocking");
        if (downstreamIds) {
          for (const downId of downstreamIds) {
            processEdge(tgtId, downId);
          }
        }
      };

      if (startTgtId) {
        // Single edge: srcId → tgtId
        processEdge(startSrcId, startTgtId);
      } else {
        // All downstream from srcId
        const downstreamIds = relation.getRelationByIssueIdRelationType(startSrcId, "blocking");
        if (downstreamIds) {
          for (const downId of downstreamIds) {
            processEdge(startSrcId, downId);
          }
        }
      }

      return allUpdates;
    },
    [getIssueById, relation]
  );

  const submitUpdates = useCallback(
    async (allUpdates: { id: string; start_date?: string; target_date?: string }[]) => {
      if (allUpdates.length === 0 || !workspaceSlug || !projectId) return;
      try {
        await rootStore.issue.projectIssues.updateIssueDates(
          workspaceSlug.toString(),
          allUpdates,
          projectId.toString()
        );
      } catch (e) {
        console.error("[AUTO-SCHEDULE] Failed to update dates:", e);
      }
    },
    [workspaceSlug, projectId, rootStore.issue.projectIssues]
  );

  /** Call after creating a new dependency: A blocks B */
  const autoSchedule = useCallback(
    async (blockingIssueId: string, blockedIssueId: string) => {
      const updates = collectCascadeUpdates(blockingIssueId, blockedIssueId);
      await submitUpdates(updates);
    },
    [collectCascadeUpdates, submitUpdates]
  );

  /** Call after moving/resizing an existing block — cascades to ALL downstream */
  const cascadeFromBlock = useCallback(
    async (blockId: string, newTargetDate?: string) => {
      const overrideEnd = newTargetDate ? new Date(newTargetDate) : undefined;
      const updates = collectCascadeUpdates(blockId, null, overrideEnd);
      await submitUpdates(updates);
    },
    [collectCascadeUpdates, submitUpdates]
  );

  /**
   * Enforce blocked_by constraint: if a block has predecessors,
   * its start_date cannot be earlier than max(predecessors' target_dates) + 1 day.
   * Returns adjusted updates (preserving duration).
   */
  const enforceBlockedByConstraint = useCallback(
    (
      updates: { id: string; start_date?: string; target_date?: string }[]
    ): { id: string; start_date?: string; target_date?: string }[] => {
      return updates.map((update) => {
        if (!update.start_date) return update;

        // Find all blockers (issues that block this one)
        const blockerIds = relation.getRelationByIssueIdRelationType(update.id, "blocked_by");
        if (!blockerIds || blockerIds.length === 0) return update;

        // Find the latest blocker end date
        let latestBlockerEnd: Date | null = null;
        for (const blockerId of blockerIds) {
          const blockerIssue = getIssueById(blockerId);
          if (blockerIssue?.target_date) {
            const blockerEnd = new Date(blockerIssue.target_date);
            if (!latestBlockerEnd || blockerEnd > latestBlockerEnd) {
              latestBlockerEnd = blockerEnd;
            }
          }
        }

        if (!latestBlockerEnd) return update;

        const minStart = new Date(latestBlockerEnd);
        minStart.setDate(minStart.getDate() + 1);

        const proposedStart = new Date(update.start_date);
        if (proposedStart >= minStart) return update;

        // Snap to minimum allowed start, preserving duration
        const adjusted = { ...update, start_date: formatDate(minStart) };
        if (update.target_date) {
          const proposedEnd = new Date(update.target_date);
          const duration = proposedEnd.getTime() - proposedStart.getTime();
          const newEnd = new Date(minStart.getTime() + duration);
          adjusted.target_date = formatDate(newEnd);
        }

        return adjusted;
      });
    },
    [getIssueById, relation]
  );

  /**
   * Check if creating a "blocking" relation from srcId to tgtId would create a cycle.
   * Walks the existing blocking graph forward from tgtId to see if srcId is reachable.
   */
  const wouldCreateCycle = useCallback(
    (srcId: string, tgtId: string): boolean => {
      const visited = new Set<string>();
      const queue = [tgtId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === srcId) return true;
        if (visited.has(current)) continue;
        visited.add(current);
        const downstream = relation.getRelationByIssueIdRelationType(current, "blocking");
        if (downstream) {
          for (const id of downstream) {
            if (!visited.has(id)) queue.push(id);
          }
        }
      }
      return false;
    },
    [relation]
  );

  return { autoSchedule, cascadeFromBlock, enforceBlockedByConstraint, wouldCreateCycle };
}
