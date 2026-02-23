/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Extension } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import codemark from "prosemirror-codemark";
// helpers
import { CORE_EXTENSIONS } from "@/constants/extension";
import { restorePublicImages } from "@/helpers/image-helpers";
import { CORE_ASSETS_META_DATA_RECORD } from "@/helpers/assets";
// plugins
import type { TAdditionalActiveDropbarExtensions } from "@/plane-editor/types/utils";
import { DropHandlerPlugin } from "@/plugins/drop";
import { FilePlugins } from "@/plugins/file/root";
import { MarkdownClipboardPlugin } from "@/plugins/markdown-clipboard";
import type { IEditorProps, TEditorAsset, TFileHandler } from "@/types";

type TActiveDropbarExtensions =
  | CORE_EXTENSIONS.MENTION
  | CORE_EXTENSIONS.EMOJI
  | CORE_EXTENSIONS.SLASH_COMMANDS
  | CORE_EXTENSIONS.TABLE
  | "bubble-menu"
  | CORE_EXTENSIONS.SIDE_MENU
  | TAdditionalActiveDropbarExtensions;

declare module "@tiptap/core" {
  interface Commands {
    [CORE_EXTENSIONS.UTILITY]: {
      updateAssetsUploadStatus: (updatedStatus: TFileHandler["assetsUploadStatus"]) => (props: CommandProps) => boolean;
      updateAssetsList: (
        args:
          | {
              asset: TEditorAsset;
            }
          | {
              idToRemove: string;
            }
      ) => () => void;
      addActiveDropbarExtension: (extension: TActiveDropbarExtensions) => () => void;
      removeActiveDropbarExtension: (extension: TActiveDropbarExtensions) => () => void;
    };
  }
  interface Storage {
    [CORE_EXTENSIONS.UTILITY]: UtilityExtensionStorage;
  }
}

export type UtilityExtensionStorage = {
  assetsList: TEditorAsset[];
  assetsUploadStatus: TFileHandler["assetsUploadStatus"];
  uploadInProgress: boolean;
  activeDropbarExtensions: TActiveDropbarExtensions[];
  isTouchDevice: boolean;
  lastAssetsUpdate: number;
};

type Props = Pick<IEditorProps, "disabledExtensions" | "flaggedExtensions" | "getEditorMetaData"> & {
  fileHandler: TFileHandler;
  isEditable: boolean;
  isTouchDevice: boolean;
};

export const UtilityExtension = (props: Props) => {
  const { disabledExtensions, flaggedExtensions, fileHandler, getEditorMetaData, isEditable, isTouchDevice } = props;
  const { restore } = fileHandler;

  return Extension.create<Record<string, unknown>, UtilityExtensionStorage>({
    name: CORE_EXTENSIONS.UTILITY,
    priority: 1000,

    addProseMirrorPlugins() {
      return [
        ...FilePlugins({
          editor: this.editor,
          isEditable,
          fileHandler,
        }),
        ...codemark({ markType: this.editor.schema.marks.code }),
        MarkdownClipboardPlugin({
          editor: this.editor,
          getEditorMetaData,
        }),
        DropHandlerPlugin({
          disabledExtensions,
          flaggedExtensions,
          editor: this.editor,
        }),
      ];
    },

    onCreate() {
      restorePublicImages(this.editor, restore);
      
      const doc = this.editor.state.doc;
      const newAssets: TEditorAsset[] = [];
      const seenIds = new Set<string>();

      doc.descendants((node) => {
        const nodeType = node.type.name as keyof typeof CORE_ASSETS_META_DATA_RECORD;
        const assetMetaData = CORE_ASSETS_META_DATA_RECORD[nodeType]?.(node.attrs);
        
        if (assetMetaData && assetMetaData.id && !seenIds.has(assetMetaData.id)) {
          newAssets.push(assetMetaData);
          seenIds.add(assetMetaData.id);
        }
      });

      this.storage.assetsList = newAssets;
      this.storage.lastAssetsUpdate = Date.now();
    },

    onUpdate() {
      const doc = this.editor.state.doc;
      const newAssets: TEditorAsset[] = [];
      const seenIds = new Set<string>();

      doc.descendants((node) => {
        const nodeType = node.type.name as keyof typeof CORE_ASSETS_META_DATA_RECORD;
        const assetMetaData = CORE_ASSETS_META_DATA_RECORD[nodeType]?.(node.attrs);
        
        if (assetMetaData && assetMetaData.id && !seenIds.has(assetMetaData.id)) {
          newAssets.push(assetMetaData);
          seenIds.add(assetMetaData.id);
        }
      });

      const currentIds = this.storage.assetsList.map((a: TEditorAsset) => a.id).join(",");
      const newIds = newAssets.map((a: TEditorAsset) => a.id).join(",");

      if (currentIds !== newIds) {
        this.storage.assetsList = newAssets;
        this.storage.lastAssetsUpdate = Date.now();
      }
    },

    addStorage() {
      return {
        assetsList: [],
        assetsUploadStatus: isEditable && "assetsUploadStatus" in fileHandler ? fileHandler.assetsUploadStatus : {},
        uploadInProgress: false,
        activeDropbarExtensions: [],
        isTouchDevice,
        lastAssetsUpdate: 0,
      };
    },

    addCommands() {
      return {
        updateAssetsUploadStatus: (updatedStatus) => ({ tr, dispatch }: CommandProps) => {
          this.storage.assetsUploadStatus = updatedStatus;
          // Dispatch a no-op transaction so useEditorState detects the change
          tr.setMeta("addToHistory", false);
          dispatch?.(tr);
          return true;
        },
        updateAssetsList: (args) => () => {
          const uniqueAssets = new Set(this.storage.assetsList);
          if ("asset" in args) {
            const alreadyExists = this.storage.assetsList.find((asset) => asset.id === args.asset.id);
            if (!alreadyExists) {
              uniqueAssets.add(args.asset);
            }
          } else if ("idToRemove" in args) {
            const asset = this.storage.assetsList.find((asset) => asset.id === args.idToRemove);
            if (asset) {
              uniqueAssets.delete(asset);
            }
          }
          // Sort assets by their position in the document
          const assetArray = Array.from(uniqueAssets);
          const doc = this.editor.state.doc;
          const posMap = new Map<string, number>();
          doc.descendants((node, pos) => {
            const nodeId = node.attrs?.id;
            if (nodeId && !posMap.has(nodeId)) {
              posMap.set(nodeId, pos);
            }
          });
          assetArray.sort((a, b) => (posMap.get(a.id) ?? Infinity) - (posMap.get(b.id) ?? Infinity));
          this.storage.assetsList = assetArray;
          this.storage.lastAssetsUpdate = Date.now();
        },
        addActiveDropbarExtension: (extension) => () => {
          const index = this.storage.activeDropbarExtensions.indexOf(extension);
          if (index === -1) {
            this.storage.activeDropbarExtensions.push(extension);
          }
        },
        removeActiveDropbarExtension: (extension) => () => {
          const index = this.storage.activeDropbarExtensions.indexOf(extension);
          if (index !== -1) {
            this.storage.activeDropbarExtensions.splice(index, 1);
          }
        },
      };
    },
  });
};
