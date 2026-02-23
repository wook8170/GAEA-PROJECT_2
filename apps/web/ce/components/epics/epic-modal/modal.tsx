/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TIssue } from "@plane/types";
import { CreateUpdateIssueModal } from "@/components/issues/issue-modal/modal";

export interface EpicModalProps {
  data?: Partial<TIssue>;
  isOpen: boolean;
  onClose: () => void;
  beforeFormSubmit?: () => Promise<void>;
  onSubmit?: (res: TIssue) => Promise<void>;
  fetchIssueDetails?: boolean;
  primaryButtonText?: {
    default: string;
    loading: string;
  };
  isProjectSelectionDisabled?: boolean;
}

export function CreateUpdateEpicModal(props: EpicModalProps) {
  const { data, isOpen, onClose, beforeFormSubmit, onSubmit, fetchIssueDetails, primaryButtonText, isProjectSelectionDisabled } = props;

  return (
    <CreateUpdateIssueModal
      data={{ ...data, is_epic: true }}
      isOpen={isOpen}
      onClose={onClose}
      beforeFormSubmit={beforeFormSubmit}
      onSubmit={onSubmit}
      fetchIssueDetails={fetchIssueDetails}
      primaryButtonText={primaryButtonText}
      isProjectSelectionDisabled={isProjectSelectionDisabled}
      modalTitle={data?.id ? "Update Epic" : "Create Epic"}
    />
  );
}
