/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { ReactNodeViewRenderer } from "@tiptap/react";
import { v4 as uuidv4 } from "uuid";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// helpers
import { insertEmptyParagraphAtNodeBoundaries } from "@/helpers/insert-empty-paragraph-at-node-boundary";
// types
import type { TFileHandler } from "@/types";
// local imports
import { AttachmentNodeView } from "./components/node-view";
import { AttachmentExtensionConfig } from "./extension-config";
import type { AttachmentExtensionStorage, InsertAttachmentComponentProps } from "./types";
import { EAttachmentAttributeNames } from "./types";
import { getAttachmentComponentFileMap } from "./utils";

declare module "@tiptap/core" {
    interface Storage {
        [CORE_EXTENSIONS.ATTACHMENT]: AttachmentExtensionStorage;
    }
}

type Props = {
    fileHandler: TFileHandler;
};

export function AttachmentExtension(props: Props) {
    const { fileHandler } = props;
    // derived values
    const { getAssetSrc } = fileHandler;

    return AttachmentExtensionConfig.extend({
        addOptions() {
            const upload = "upload" in fileHandler ? fileHandler.upload : undefined;
            return {
                ...this.parent?.(),
                getAttachmentSource: getAssetSrc,
                uploadAttachment: upload,
            };
        },

        addKeyboardShortcuts() {
            return {
                ArrowDown: insertEmptyParagraphAtNodeBoundaries("down", this.name),
                ArrowUp: insertEmptyParagraphAtNodeBoundaries("up", this.name),
            };
        },

        addStorage() {
            return {
                fileMap: new Map(),
                deletedAttachmentSet: new Map<string, boolean>(),
            };
        },

        addCommands() {
            return {
                insertAttachmentComponent:
                    (props) =>
                        ({ commands }) => {
                            const fileId = uuidv4();
                            const fileMap = getAttachmentComponentFileMap(this.editor);

                            if (fileMap) {
                                fileMap.set(fileId, {
                                    file: props?.file,
                                    event: props.event,
                                });
                            }

                            const attributes = {
                                [EAttachmentAttributeNames.ID]: fileId,
                                [EAttachmentAttributeNames.NAME]: props?.file?.name || "",
                                [EAttachmentAttributeNames.SIZE]: props?.file?.size || 0,
                                [EAttachmentAttributeNames.TYPE]: props?.file?.type || "",
                            };

                            if (props.pos) {
                                return commands.insertContentAt(props.pos, {
                                    type: this.name,
                                    attrs: attributes,
                                });
                            }
                            return commands.insertContent({
                                type: this.name,
                                attrs: attributes,
                            });
                        },
            };
        },

        addNodeView() {
            return ReactNodeViewRenderer((props) => (
                <AttachmentNodeView {...props} />
            ));
        },
    });
}
