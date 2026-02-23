/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { EInboxIssueSource } from "@plane/types";

export type TInboxSourcePill = {
  source: EInboxIssueSource;
};

export function InboxSourcePill(props: TInboxSourcePill) {
  const { source } = props;
  if (!source) return <></>;
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-caption-sm-medium bg-surface-2 text-tertiary">
      {String(source)}
    </span>
  );
}
