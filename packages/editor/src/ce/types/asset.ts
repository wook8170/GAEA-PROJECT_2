/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { CORE_EXTENSIONS } from "@/constants/extension";

export type TEditorAttachmentAsset = {
    href: string;
    id: string;
    name: string;
    size: number;
    src: string;
    type: CORE_EXTENSIONS.ATTACHMENT;
};

export type TAdditionalEditorAsset = TEditorAttachmentAsset;
