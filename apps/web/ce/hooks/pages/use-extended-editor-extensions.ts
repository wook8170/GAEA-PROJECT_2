/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { IEditorPropsExtended } from "@plane/editor";
import type { TSearchEntityRequestPayload, TSearchResponse } from "@plane/types";
import type { TPageInstance } from "@/store/pages/base-page";
import type { EPageStoreType } from "../store";

export type TExtendedEditorExtensionsHookParams = {
  workspaceSlug: string;
  page: TPageInstance;
  storeType: EPageStoreType;
  fetchEntity: (payload: TSearchEntityRequestPayload) => Promise<TSearchResponse>;
  getRedirectionLink: (pageId?: string) => string;
  extensionHandlers?: Map<string, unknown>;
  projectId?: string;
  showToast?: (type: "error" | "success" | "info" | "warning", title: string, message?: string) => void;
};

export type TExtendedEditorExtensionsConfig = IEditorPropsExtended;

export const useExtendedEditorProps = (
  params: TExtendedEditorExtensionsHookParams
): TExtendedEditorExtensionsConfig => {
  const { showToast } = params;
  return {
    // Pass showToast to editor extensions
    showToast,
  };
};
