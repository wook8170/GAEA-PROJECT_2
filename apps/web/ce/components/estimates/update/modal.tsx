/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { EModalWidth, ModalCore } from "@plane/ui";
import { Button } from "@plane/propel/button";

type TUpdateEstimateModal = {
  workspaceSlug: string;
  projectId: string;
  estimateId: string | undefined;
  isOpen: boolean;
  handleClose: () => void;
};

export const UpdateEstimateModal = observer(function UpdateEstimateModal(props: TUpdateEstimateModal) {
  const { isOpen, handleClose, estimateId } = props;

  if (!estimateId) return <></>;

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose} width={EModalWidth.SM}>
      <div className="p-5">
        <h3 className="text-lg font-medium mb-2">Estimate Settings</h3>
        <p className="text-body-sm-regular text-tertiary mb-4">
          Manage estimate points and values from the project settings page.
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </ModalCore>
  );
});
