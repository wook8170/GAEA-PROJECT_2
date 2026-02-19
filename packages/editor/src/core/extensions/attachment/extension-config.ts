/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Node, mergeAttributes } from "@tiptap/core";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// local imports
import { EAttachmentAttributeNames } from "./types";
import type {
    AttachmentExtensionOptions,
    TAttachmentAttributes,
    AttachmentExtensionType,
    AttachmentExtensionStorage,
    InsertAttachmentComponentProps,
} from "./types";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        [CORE_EXTENSIONS.ATTACHMENT]: {
            insertAttachmentComponent: ({ file, pos, event }: InsertAttachmentComponentProps) => ReturnType;
        };
    }
    interface Storage {
        [CORE_EXTENSIONS.ATTACHMENT]: AttachmentExtensionStorage;
    }
}

export const AttachmentExtensionConfig: AttachmentExtensionType = Node.create<
    AttachmentExtensionOptions,
    AttachmentExtensionStorage
>({
    name: CORE_EXTENSIONS.ATTACHMENT,
    group: "block",
    atom: true,

    addOptions() {
        return {
            getAttachmentSource: async (assetId: string) => assetId,
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            [EAttachmentAttributeNames.ID]: {
                default: "",
            },
            [EAttachmentAttributeNames.NAME]: {
                default: "",
            },
            [EAttachmentAttributeNames.SIZE]: {
                default: 0,
            },
            [EAttachmentAttributeNames.TYPE]: {
                default: "",
            },
            [EAttachmentAttributeNames.SRC]: {
                default: "",
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "attachment-component",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["attachment-component", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },
});
