/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FC } from "react";
import React from "react";

export type TCustomAutomationsRootProps = {
  projectId: string;
  workspaceSlug: string;
};

export function CustomAutomationsRoot(_props: TCustomAutomationsRootProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-body-md-regular text-tertiary">
        Custom automations can be configured from the project settings.
      </p>
    </div>
  );
}
