/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssue } from "@plane/types";

export type TDateAlertProps = {
  date: string;
  workItem: TIssue;
  projectId: string;
};
export function DateAlert(props: TDateAlertProps) {
  const { date, workItem } = props;
  if (!date) return <></>;
  const now = new Date();
  const target = new Date(date);
  const isPast = target < now;
  if (!isPast) return <></>;
  return (
    <span className="text-red-500 text-caption-md-regular">Overdue</span>
  );
}
