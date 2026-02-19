/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useCallback, useMemo } from "react";
import { FileIcon, Download, Loader2, AlertCircle } from "lucide-react";
// plane imports
import { cn } from "@plane/utils";
// local imports
import type { AttachmentNodeViewProps } from "./node-view";
import { EAttachmentAttributeNames } from "../types";

type AttachmentBlockProps = AttachmentNodeViewProps & {
    isUploaded: boolean;
    isUploading: boolean;
    isError: boolean;
    setIsUploaded: (isUploaded: boolean) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
};

export function AttachmentBlock(props: AttachmentBlockProps) {
    const { node, isUploaded, isUploading, isError, extension, fileInputRef, editor } = props;
    const { id, name, size, type, src } = node.attrs;

    const isEditable = editor.isEditable;

    // Format file size
    const formattedSize = useMemo(() => {
        if (!size) return "";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }, [size]);

    const handleDownload = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!src) return;

            try {
                const fullUrl = await extension.options.getAttachmentSource(src);
                if (fullUrl) {
                    window.open(fullUrl, "_blank");
                }
            } catch (error) {
                console.error("Failed to download attachment:", error);
            }
        },
        [src, extension.options]
    );

    return (
        <div
            className={cn(
                "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ease-in-out select-none",
                {
                    "bg-layer-2 hover:bg-layer-2-hover cursor-pointer border-subtle": isEditable && !isError,
                    "border-danger-base bg-danger-subtle text-danger-primary": isError,
                    "opacity-60": isUploading && name,
                }
            )}
            onClick={() => {
                if (!isUploaded && isEditable && !isUploading) {
                    fileInputRef.current?.click();
                }
            }}
            contentEditable={false}
        >
            <div className={cn(
                "flex size-10 items-center justify-center rounded-md transition-colors",
                isError ? "bg-danger-primary text-white" : "bg-layer-3 text-secondary group-hover:bg-layer-1 group-hover:text-primary"
            )}>
                {isError ? (
                    <AlertCircle className="size-5" />
                ) : isUploading ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    <FileIcon className="size-5" />
                )}
            </div>

            <div className="flex flex-1 flex-col truncate overflow-hidden">
                <span className={cn(
                    "text-14 font-medium truncate leading-tight",
                    isError ? "text-danger-primary" : "text-primary"
                )}>
                    {isError ? "Error uploading file" : isUploading ? "Uploading..." : (name || (isEditable ? "Click to add a file" : "No file attached"))}
                </span>
                <span className={cn(
                    "text-12",
                    isError ? "text-danger-primary/80" : "text-tertiary"
                )}>
                    {isError ? "Click to retry" : name ? (
                        <>
                            {formattedSize} {type && `• ${type.split("/").pop()?.toUpperCase()}`}
                        </>
                    ) : (
                        "Maximum file size: 100MB"
                    )}
                </span>
            </div>

            {isUploaded && src && (
                <button
                    type="button"
                    onClick={handleDownload}
                    className="flex size-8 items-center justify-center rounded-md hover:bg-layer-1 text-tertiary hover:text-primary transition-all relative z-20"
                    title="Download file"
                >
                    <Download className="size-4" />
                </button>
            )}
        </div>
    );
}
