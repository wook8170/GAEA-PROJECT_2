/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { ReactNodeViewRenderer } from "@tiptap/react";
import { v4 as uuidv4 } from "uuid";
// constants
import { ACCEPTED_ATTACHMENT_MIME_TYPES, ACCEPTED_IMAGE_MIME_TYPES } from "@/constants/config";
import { ECustomImageStatus } from "@/extensions/custom-image/types";
import { isFileValid } from "@/helpers/file";
import { AttachmentBlock } from "@/extensions/custom-image/components/attachment-block";
import { CustomImageBlock } from "@/extensions/custom-image/components/block";
import { CustomImageNodeView } from "@/extensions/custom-image/components/node-view";
import { CustomImageUploader } from "@/extensions/custom-image/components/uploader";
import { DEFAULT_CUSTOM_IMAGE_ATTRIBUTES } from "@/extensions/custom-image/utils";
import { mergeAttributes, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { TEditorCommands } from "@/types";
// local imports
import { CustomImageExtensionConfig } from "./extension-config";
import type { TFileHandler, CustomImageExtensionOptions, CustomImageExtensionStorage } from "./types";
import { ECustomImageAttributeNames } from "./types";
import { getImageComponentImageFileMap } from "./utils";
import { insertEmptyParagraphAtNodeBoundaries } from "@/helpers/insert-empty-paragraph-at-node-boundary";
import type { CustomImageNodeViewProps } from "./components/node-view";

type Props = {
  fileHandler: TFileHandler;
  isEditable: boolean;
};

export function CustomImageExtension(props: Props) {
  const { fileHandler, isEditable } = props;
  // derived values
  const { getAssetSrc, getAssetDownloadSrc, restore: restoreImageFn } = fileHandler;
  
  return CustomImageExtensionConfig.extend<CustomImageExtensionOptions, CustomImageExtensionStorage>({
    selectable: isEditable,
    draggable: isEditable,

    addOptions() {
      const upload = "upload" in fileHandler ? fileHandler.upload : undefined;
      const duplicate = "duplicate" in fileHandler ? fileHandler.duplicate : undefined;
      return {
        ...this.parent?.(),
        getImageDownloadSource: getAssetDownloadSrc,
        getImageSource: getAssetSrc,
        restoreImage: restoreImageFn,
        uploadImage: upload,
        duplicateImage: duplicate,
      };
    },

    addStorage() {
      const maxFileSize = "validation" in fileHandler ? fileHandler.validation?.maxFileSize : 0;

      return {
        fileMap: new Map(),
        deletedImageSet: new Map<string, boolean>(),
        maxFileSize,
        // escape markdown for images
        markdown: {
          serialize() {},
        },
      };
    },

    addCommands() {
      return {
        insertImageComponent:
          (props) =>
          ({ commands }) => {
            // Early return if there's an invalid file being dropped
            if (
              props?.file &&
              !isFileValid({
                acceptedMimeTypes: [...ACCEPTED_IMAGE_MIME_TYPES, ...ACCEPTED_ATTACHMENT_MIME_TYPES],
                file: props.file,
                maxFileSize: this.storage.maxFileSize,
                onError: (_error, message) => {
              // Use global toast function
              const globalToast = (window as any)?.planeToast;
              if (globalToast) {
                globalToast({
                  type: "error",
                  title: message,
                });
              }
            },
              })
            ) {
              return false;
            }

            // generate a unique id for the image to keep track of dropped
            // files' file data
            const fileId = uuidv4();

            const imageComponentImageFileMap = getImageComponentImageFileMap(this.editor);

            if (imageComponentImageFileMap) {
              if (props?.event === "drop" && props.file) {
                imageComponentImageFileMap.set(fileId, {
                  file: props.file,
                  event: props.event,
                });
              } else if (props.event === "insert") {
                imageComponentImageFileMap.set(fileId, {
                  event: props.event,
                  hasOpenedFileInputOnce: false,
                });
              }
            }

            const attributes = {
              [ECustomImageAttributeNames.ID]: fileId,
              [ECustomImageAttributeNames.STATUS]: ECustomImageStatus.PENDING,
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

    addKeyboardShortcuts() {
      return {
        ArrowDown: insertEmptyParagraphAtNodeBoundaries("down", this.name),
        ArrowUp: insertEmptyParagraphAtNodeBoundaries("up", this.name),
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer((props) => (
        <CustomImageNodeView {...props} node={props.node as CustomImageNodeViewProps["node"]} />
      ));
    },
  });
}
