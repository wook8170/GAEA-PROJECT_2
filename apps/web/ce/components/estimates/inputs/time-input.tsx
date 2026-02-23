/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Clock } from "lucide-react";

export type TEstimateTimeInputProps = {
  value?: number;
  handleEstimateInputValue: (value: string) => void;
};

export function EstimateTimeInput(props: TEstimateTimeInputProps) {
  const { value, handleEstimateInputValue } = props;

  return (
    <div className="flex items-center gap-2">
      <Clock className="size-4 text-tertiary flex-shrink-0" />
      <input
        type="number"
        min={0}
        step={0.5}
        value={value ?? ""}
        onChange={(e) => handleEstimateInputValue(e.target.value)}
        placeholder="0"
        className="w-20 rounded-md border border-subtle bg-surface-1 px-2 py-1 text-body-sm-regular"
      />
      <span className="text-caption-md-regular text-tertiary">hours</span>
    </div>
  );
}
