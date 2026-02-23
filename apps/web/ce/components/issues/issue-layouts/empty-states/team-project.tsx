/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";

export const TeamProjectWorkItemEmptyState = observer(function TeamProjectWorkItemEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h3 className="text-lg font-medium">No project work items</h3>
      <p className="mt-1 text-body-sm-regular text-tertiary max-w-sm">
        Work items from this team's projects will appear here.
      </p>
    </div>
  );
});
