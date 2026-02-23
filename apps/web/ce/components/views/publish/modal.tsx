/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { Globe2, X } from "lucide-react";
import type { IProjectView } from "@plane/types";
import { Button } from "@plane/ui";

type Props = {
  isOpen: boolean;
  view: IProjectView;
  onClose: () => void;
};

export function PublishViewModal(props: Props) {
  const { isOpen, view, onClose } = props;
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-layer-0 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Publish View</h3>
          <button onClick={onClose} className="text-tertiary hover:text-secondary">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-subtle p-3 mb-4">
          <Globe2 className="size-4 text-tertiary" />
          <div>
            <p className="text-body-sm-medium">{view.name}</p>
            <p className="text-caption-md-regular text-tertiary">
              Publishing this view will make it accessible to anyone with the link.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="neutral-primary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={isPublishing}
            onClick={() => {
              setIsPublishing(true);
              setTimeout(() => {
                setIsPublishing(false);
                onClose();
              }, 500);
            }}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
