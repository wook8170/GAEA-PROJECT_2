/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { Node } from "@tiptap/core";
// types
import type { TFileHandler } from "@/types";

export enum EAttachmentAttributeNames {
    ID = "id",
    NAME = "name",
    SIZE = "size",
    TYPE = "type",
    SRC = "src",
}

export type TAttachmentAttributes = {
    [EAttachmentAttributeNames.ID]: string;
    [EAttachmentAttributeNames.NAME]: string;
    [EAttachmentAttributeNames.SIZE]: number;
    [EAttachmentAttributeNames.TYPE]: string;
    [EAttachmentAttributeNames.SRC]: string;
};

export type AttachmentExtensionOptions = {
    getAttachmentSource: TFileHandler["getAssetSrc"];
    HTMLAttributes: Record<string, any>;
};

export type AttachmentExtensionStorage = {
    fileMap: Map<string, { file?: File; event: "insert" | "drop" }>;
    deletedAttachmentSet: Map<string, boolean>;
};

export type InsertAttachmentComponentProps = {
    file?: File;
    pos?: number;
    event: "insert" | "drop";
};

export type AttachmentExtensionType = Node<AttachmentExtensionOptions, AttachmentExtensionStorage>;
