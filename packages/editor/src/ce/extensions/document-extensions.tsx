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
    getExtension: ({ provider, userDetails }) => {
      // Only configure CollaborationCursor if provider exists
      if (!provider) {
        // Return a dummy extension that does nothing
        return {
          name: 'dummy-collaboration-cursor',
          addOptions() {
            return {};
          },
          addPlugin() {
            return [];
          },
        } as any;
      }
      
      return CollaborationCursor.configure({
        provider,
        user: userDetails,
        render: (user: TUserDetails) => {
          const cursor = document.createElement("span");
          cursor.classList.add("collaboration-cursor__caret");
          cursor.setAttribute("style", `border-color: ${user.color}; border-left: 2px solid ${user.color}; position: relative; display: inline-block; height: 1.2em; vertical-align: middle;`);

          const label = document.createElement("div");
          label.classList.add("collaboration-cursor__label");
          label.setAttribute("style", `background-color: ${user.color}; position: absolute; top: -1.8em; left: -1px; font-size: 13px; font-weight: 600; padding: 2px 8px; border-radius: 4px 4px 4px 0; white-space: nowrap; display: flex; align-items: center; gap: 6px; color: white; pointer-events: none; z-index: 10; line-height: 1.4;`);

          if (user.avatar && user.avatar.trim() !== "") {
            const avatar = document.createElement("img");
            const finalAvatarUrl = user.avatar.startsWith("/") ? `http://localhost:9001${user.avatar}` : user.avatar;
            avatar.setAttribute("src", finalAvatarUrl);
            avatar.setAttribute("style", "width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid rgba(255, 255, 255, 0.4); flex-shrink: 0;");
            // 이미지가 깨질 경우 표시하지 않도록 예외 처리
            avatar.onerror = () => {
              avatar.style.display = "none";
            };
            label.appendChild(avatar);
          }

          const nameContainer = document.createElement("span");
          nameContainer.innerText = user.name;
          label.appendChild(nameContainer);

          cursor.appendChild(label);
          return cursor;
        },
      });
    },
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
