/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useCallback, useEffect, useMemo, useRef } from "react";
// constants
import { ACCEPTED_ATTACHMENT_MIME_TYPES } from "@/constants/config";
// hooks
import { useUploader, useDropZone } from "@/hooks/use-file-upload";
// local imports
import { getAttachmentComponentFileMap } from "../utils";
import type { AttachmentNodeViewProps } from "./node-view";
import { EAttachmentAttributeNames } from "../types";

type AttachmentUploaderProps = AttachmentNodeViewProps & {
    setIsUploaded: (isUploaded: boolean) => void;
};

export function AttachmentUploader(props: AttachmentUploaderProps) {
    const { editor, node, getPos, setIsUploaded, updateAttributes, extension } = props;
    const { id } = node.attrs;
    const isTouchDevice = !!editor.storage.utility.isTouchDevice;
    const fileMap = useMemo(() => getAttachmentComponentFileMap(editor), [editor]);
    const hasTriedUploadingOnMountRef = useRef(false);

    const onUpload = useCallback(
        (url: string) => {
            if (url) {
                setIsUploaded(true);
                updateAttributes({
                    [EAttachmentAttributeNames.SRC]: url,
                });
                fileMap?.delete(id);
            }
        },
        [id, setIsUploaded, updateAttributes, fileMap]
    );

    const uploadAttachmentCommand = useCallback(
        async (file: File) => {
            return await extension.options.uploadAttachment?.(id || "", file);
        },
        [extension.options, id]
    );

    const { isUploading, uploadFile } = useUploader({
        acceptedMimeTypes: ACCEPTED_ATTACHMENT_MIME_TYPES,
        editorCommand: uploadAttachmentCommand,
        maxFileSize: 100 * 1024 * 1024, // 100MB default
        onInvalidFile: (_error, _file, message) => alert(message),
        onUpload,
    });

    const { onDrop, onDragEnter, onDragLeave } = useDropZone({
        editor,
        getPos,
        type: "attachment",
        uploader: uploadFile,
    });

    useEffect(() => {
        if (hasTriedUploadingOnMountRef.current) return;

        const meta = fileMap?.get(id || "");
        if (meta && meta.file) {
            hasTriedUploadingOnMountRef.current = true;
            uploadFile(meta.file);
        }
    }, [id, fileMap, uploadFile]);

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragEnter}
            onDragLeave={onDragLeave}
            className="hidden"
        />
    );
}
