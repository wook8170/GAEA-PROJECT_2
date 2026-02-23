/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IWorkspace } from "@plane/types";

type TProps = {
  workspace?: IWorkspace;
};

export function SubscriptionPill(_props: TProps) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-caption-sm-medium bg-green-500/10 text-green-600">
      Free
    </span>
  );
}
