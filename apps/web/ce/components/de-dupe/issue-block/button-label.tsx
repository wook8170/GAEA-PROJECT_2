/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FC } from "react";

type TDeDupeIssueButtonLabelProps = {
  isOpen: boolean;
  buttonLabel: string;
};

export function DeDupeIssueButtonLabel(props: TDeDupeIssueButtonLabelProps) {
  const { buttonLabel } = props;
  return <span className="text-caption-md-medium">{buttonLabel}</span>;
}
