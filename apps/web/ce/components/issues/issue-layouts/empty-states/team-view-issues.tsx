/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";

export const TeamViewEmptyState = observer(function TeamViewEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h3 className="text-lg font-medium">No view work items</h3>
      <p className="mt-1 text-body-sm-regular text-tertiary max-w-sm">
        Work items matching this view's filters will appear here.
      </p>
    </div>
  );
});
