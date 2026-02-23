/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Controller } from "react-hook-form";
import { Globe2, Lock } from "lucide-react";
import { EViewAccess } from "@plane/types";

export function AccessController(props: { control: any }) {
  const { control } = props;
  return (
    <Controller
      control={control}
      name="access"
      render={({ field: { value, onChange } }) => {
        const isPublic = value === EViewAccess.PUBLIC;
        return (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-subtle px-3 py-1.5 text-body-sm-medium text-secondary hover:bg-layer-1 transition-colors"
            onClick={() => onChange(isPublic ? EViewAccess.PRIVATE : EViewAccess.PUBLIC)}
          >
            {isPublic ? (
              <>
                <Globe2 className="size-3.5" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                <span>Private</span>
              </>
            )}
          </button>
        );
      }}
    />
  );
}
