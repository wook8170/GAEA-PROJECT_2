/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
// constants
import { ACCEPTED_IMAGE_MIME_TYPES, ACCEPTED_ATTACHMENT_MIME_TYPES } from "@/constants/config";
// types
import type { TEditorCommands, TExtensions } from "@/types";

type Props = {
  disabledExtensions?: TExtensions[];
  flaggedExtensions?: TExtensions[];
  editor: Editor;
};

export const DropHandlerPlugin = (props: Props): Plugin => {
  const { disabledExtensions, flaggedExtensions, editor } = props;

  return new Plugin({
    key: new PluginKey("dropHandler"),
    priority: 1000, // High priority to ensure it runs first
    props: {
      handlePaste: (view, event) => {
        if (
          editor.isEditable &&
          event.clipboardData &&
          event.clipboardData.files &&
          event.clipboardData.files.length > 0
        ) {
          event.preventDefault();
          const files = Array.from(event.clipboardData.files);
          const acceptedFiles = files; // Allow all files

          if (acceptedFiles.length) {
            const pos = view.state.selection.from;
            insertFilesSafely({
              disabledExtensions,
              flaggedExtensions,
              editor,
              files: acceptedFiles,
              initialPos: pos,
              event: "drop",
            });
          }
          return true;
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (
          editor.isEditable &&
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files.length > 0
        ) {
          event.preventDefault();
          const files = Array.from(event.dataTransfer.files);
          const acceptedFiles = files; // Allow all files

          if (acceptedFiles.length) {
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            if (coordinates) {
              const pos = coordinates.pos;
              insertFilesSafely({
                disabledExtensions,
                editor,
                files: acceptedFiles,
                initialPos: pos,
                event: "drop",
              });
            }
            return true;
          }
        }
        return false;
      },
    },
  });
};

type InsertFilesSafelyArgs = {
  disabledExtensions?: TExtensions[];
  flaggedExtensions?: TExtensions[];
  editor: Editor;
  event: "insert" | "drop";
  files: File[];
  initialPos: number;
  type?: Extract<TEditorCommands, "image" | "attach">;
};

export const insertFilesSafely = async (args: InsertFilesSafelyArgs) => {
  const { disabledExtensions, editor, event, files, initialPos, type } = args;
  let pos = initialPos;

  for (const file of files) {
    // safe insertion
    const docSize = editor.state.doc.content.size;
    pos = Math.min(pos, docSize);

    let fileType: "image" | "attach" | null = null;

    try {
      if (type) {
        if (["image", "attach"].includes(type)) fileType = type;
        else throw new Error("Wrong file type passed");
      } else {
        if (ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) fileType = "image";
        else fileType = "attach"; // Default to attach for all other files
      }
      // insert file depending on the type at the current position
      if (fileType === "image" && !disabledExtensions?.includes("image")) {
        editor.commands.insertImageComponent({
          file,
          pos,
          event,
        });
      } else if (fileType === "attach" && !disabledExtensions?.includes("image")) {
        editor.commands.insertImageComponent({
          file,
          pos,
          event,
        });
      }
    } catch (error) {
      console.error(`Error while ${event}ing file:`, error);
    }

    // Move to the next position
    pos += 1;
  }
};
