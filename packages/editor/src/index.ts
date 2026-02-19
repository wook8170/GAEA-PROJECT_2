/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// editors
export {
  CollaborativeDocumentEditorWithRef,
  DocumentEditorWithRef,
  LiteTextEditorWithRef,
  RichTextEditorWithRef,
} from "@/components/editors";

// constants
export * from "@/constants/common";

// helpers
export * from "@/helpers/common";
export * from "@/helpers/yjs-utils";

export { CORE_EXTENSIONS } from "@/constants/extension";
export { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";

// contexts
export { CollaborationProvider, useCollaboration, CollabContext } from "@/contexts";

// types
export * from "@/types";
export type { CollaborationState, TServerHandler, CollabStage } from "@/types/collaboration";

// additional exports
export { TrailingNode } from "./core/extensions/trailing-node";
