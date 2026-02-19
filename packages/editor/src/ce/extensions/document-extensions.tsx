/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { HocuspocusProvider } from "@hocuspocus/provider";
import type { AnyExtension } from "@tiptap/core";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { SlashCommands } from "@/extensions";
// types
import type { IEditorProps, TExtensions, TUserDetails } from "@/types";

export type TDocumentEditorAdditionalExtensionsProps = Pick<
  IEditorProps,
  "disabledExtensions" | "flaggedExtensions" | "fileHandler" | "extendedEditorProps"
> & {
  isEditable: boolean;
  provider?: HocuspocusProvider;
  userDetails: TUserDetails;
};

export type TDocumentEditorAdditionalExtensionsRegistry = {
  isEnabled: (disabledExtensions: TExtensions[], flaggedExtensions: TExtensions[]) => boolean;
  getExtension: (props: TDocumentEditorAdditionalExtensionsProps) => AnyExtension;
};

const extensionRegistry: TDocumentEditorAdditionalExtensionsRegistry[] = [
  {
    isEnabled: () => true,
    getExtension: ({ provider, userDetails }) =>
      CollaborationCursor.configure({
        provider,
        user: userDetails,
        render: (user: TUserDetails) => {
          const cursor = document.createElement("span");
          cursor.classList.add("collaboration-cursor__caret");
          cursor.setAttribute("style", `border-color: ${user.color}; border-left: 2px solid ${user.color}; position: relative; display: inline-block; height: 1.2em; vertical-align: middle;`);

          const label = document.createElement("div");
          label.classList.add("collaboration-cursor__label");
          label.setAttribute("style", `background-color: ${user.color}; position: absolute; top: -1.4em; left: -1px; font-size: 12px; font-weight: 600; padding: 1px 4px; border-radius: 3px 3px 3px 0; white-space: nowrap; display: flex; align-items: center; gap: 4px; color: white; pointer-events: none; z-index: 10;`);

          if (user.avatar) {
            const avatar = document.createElement("img");
            avatar.setAttribute("src", user.avatar);
            avatar.setAttribute("style", "width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.2);");
            label.appendChild(avatar);
          }

          const nameContainer = document.createElement("span");
          nameContainer.innerText = user.name;
          label.appendChild(nameContainer);

          cursor.appendChild(label);
          return cursor;
        },
      }),
  },
  {
    isEnabled: (disabledExtensions) => !disabledExtensions.includes("slash-commands"),
    getExtension: ({ disabledExtensions, flaggedExtensions }) =>
      SlashCommands({ disabledExtensions, flaggedExtensions }),
  },
];

export function DocumentEditorAdditionalExtensions(props: TDocumentEditorAdditionalExtensionsProps) {
  const { disabledExtensions, flaggedExtensions } = props;

  const documentExtensions = extensionRegistry
    .filter((config) => config.isEnabled(disabledExtensions, flaggedExtensions))
    .map((config) => config.getExtension(props));

  return documentExtensions;
}
