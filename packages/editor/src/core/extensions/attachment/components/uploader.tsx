/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useCallback, useEffect, useMemo, useRef } from "react";
// constants
import { ACCEPTED_ATTACHMENT_MIME_TYPES } from "@/constants/config";
// hooks
import { useUploader, useDropZone, uploadFirstFileAndInsertRemaining } from "@/hooks/use-file-upload";
// local imports
import { getAttachmentComponentFileMap } from "../utils";
import type { AttachmentNodeViewProps } from "./node-view";
import { EAttachmentAttributeNames } from "../types";

type AttachmentUploaderProps = AttachmentNodeViewProps & {
    setIsUploaded: (isUploaded: boolean) => void;
    setIsUploading: (isUploading: boolean) => void;
    setIsError: (isError: boolean) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
};

export function AttachmentUploader(props: AttachmentUploaderProps) {
    const {
        editor,
        node,
        getPos,
        setIsUploaded,
        setIsUploading,
        setIsError,
        updateAttributes,
        extension,
        fileInputRef
    } = props;
    const { id } = node.attrs;
    const isTouchDevice = !!editor.storage.utility.isTouchDevice;
    const fileMap = useMemo(() => getAttachmentComponentFileMap(editor), [editor]);
    const hasTriedUploadingOnMountRef = useRef(false);
    const hasTriggeredPickerRef = useRef(false);

    const onUpload = useCallback(
        (url: string) => {
            if (url) {
                setIsUploaded(true);
                setIsError(false);
                updateAttributes({
                    [EAttachmentAttributeNames.SRC]: url,
                });
                fileMap?.delete(id);
            }
        },
        [id, setIsUploaded, setIsError, updateAttributes, fileMap]
    );

    const uploadAttachmentCommand = useCallback(
        async (file: File) => {
            setIsError(false);
            // Update metadata before upload
            updateAttributes({
                [EAttachmentAttributeNames.NAME]: file.name,
                [EAttachmentAttributeNames.SIZE]: file.size,
                [EAttachmentAttributeNames.TYPE]: file.type,
            });
            return await extension.options.uploadAttachment?.(id || "", file);
        },
        [extension.options, id, updateAttributes, setIsError]
    );

    const handleProgressStatus = useCallback(
        (isUploading: boolean) => {
            setIsUploading(isUploading);
        },
        [setIsUploading]
    );

    const { isUploading: hookIsUploading, uploadFile } = useUploader({
        acceptedMimeTypes: ACCEPTED_ATTACHMENT_MIME_TYPES,
        editorCommand: uploadAttachmentCommand,
        handleProgressStatus,
        maxFileSize: 0, // No file size limit
        onInvalidFile: (_error, _file, message) => {
            alert(message);
            setIsError(true);
        },
        onError: () => {
            // Remove the failed attachment node from the editor instead of showing retry block
            const pos = getPos();
            if (pos !== undefined) {
                editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
            }
        },
        onUpload,
    });

    const { onDrop, onDragEnter, onDragLeave } = useDropZone({
        editor,
        getPos,
        type: "attachment",
        uploader: uploadFile,
    });

    const onFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            const filesList = e.target.files;
            const pos = getPos();
            if (!filesList || pos === undefined) return;

            await uploadFirstFileAndInsertRemaining({
                editor,
                filesList,
                pos,
                type: "attachment",
                uploader: uploadFile,
            });
        },
        [editor, getPos, uploadFile]
    );

    useEffect(() => {
        if (hasTriedUploadingOnMountRef.current) return;

        const meta = fileMap?.get(id || "");
        if (meta) {
            if (meta.file) {
                hasTriedUploadingOnMountRef.current = true;
                uploadFile(meta.file);
            } else if (meta.event === "insert" && !hasTriggeredPickerRef.current) {
                if (!isTouchDevice && fileInputRef.current) {
                    fileInputRef.current.click();
                    hasTriggeredPickerRef.current = true;
                }
            }
        } else {
            hasTriedUploadingOnMountRef.current = true; // No meta found, stop trying
        }
    }, [id, fileMap, uploadFile, isTouchDevice, fileInputRef]);

    return (
        <>
            <div
                onDrop={onDrop}
                onDragOver={onDragEnter}
                onDragLeave={onDragLeave}
                className="absolute inset-0 z-10"
            />
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={onFileChange}
                multiple
            />
        </>
    );
}
