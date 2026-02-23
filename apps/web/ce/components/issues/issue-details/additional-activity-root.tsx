/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FC } from "react";
import { observer } from "mobx-react";

export type TAdditionalActivityRoot = {
  activityId: string;
  showIssue?: boolean;
  ends: "top" | "bottom" | undefined;
  field: string | undefined;
};

export const AdditionalActivityRoot = observer(function AdditionalActivityRoot(props: TAdditionalActivityRoot) {
  const { field } = props;
  if (!field) return <></>;
  return (
    <span className="text-caption-md-regular text-tertiary">updated {field}</span>
  );
});
