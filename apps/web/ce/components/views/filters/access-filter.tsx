/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import type { EViewAccess } from "@plane/types";

type TAccessFilterOption = {
  key: EViewAccess;
  value: string;
};

type Props = {
  appliedFilters?: EViewAccess[] | null;
  handleUpdate: (val: string | string[]) => void;
  searchQuery: string;
  accessFilters: TAccessFilterOption[];
};

export function FilterByAccess(props: Props) {
  const { appliedFilters, handleUpdate, searchQuery, accessFilters } = props;
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredOptions = accessFilters.filter((o) =>
    o.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredOptions.length === 0) return null;

  return (
    <div className="py-2">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-2 py-1 text-body-sm-medium text-secondary"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span>Access</span>
        <span className="text-caption-md-regular">{isExpanded ? "−" : "+"}</span>
      </button>
      {isExpanded && (
        <div className="mt-1 flex flex-col gap-0.5">
          {filteredOptions.map((option) => {
            const isSelected = appliedFilters?.includes(option.key) ?? false;
            return (
              <button
                key={option.key}
                type="button"
                className="flex items-center gap-2 rounded px-2 py-1 text-body-sm-regular hover:bg-layer-1 transition-colors"
                onClick={() => handleUpdate(String(option.key))}
              >
                <span
                  className={`flex size-3.5 items-center justify-center rounded-sm border ${
                    isSelected ? "border-accent-primary bg-accent-primary text-white" : "border-subtle"
                  }`}
                >
                  {isSelected && <span className="text-[10px]">✓</span>}
                </span>
                <span>{option.value}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
