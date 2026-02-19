/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { Editor } from "@tiptap/core";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// local imports
import type { AttachmentExtensionStorage, InsertAttachmentComponentProps } from "./types";

export const getAttachmentComponentFileMap = (editor: Editor) => {
    const extension = editor.extensionManager.extensions.find((ext) => ext.name === CORE_EXTENSIONS.ATTACHMENT);
    if (!extension) return null;
    return (extension.storage as AttachmentExtensionStorage).fileMap;
};

// Actually I should probably add a separate fileMap to storage
