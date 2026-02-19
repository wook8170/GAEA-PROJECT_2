/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useCallback, useMemo } from "react";
import { FileIcon, Download, Loader2 } from "lucide-react";
// plane imports
import { cn } from "@plane/utils";
// local imports
import type { AttachmentNodeViewProps } from "./node-view";
import { EAttachmentAttributeNames } from "../types";

type AttachmentBlockProps = AttachmentNodeViewProps & {
    isUploaded: boolean;
    setIsUploaded: (isUploaded: boolean) => void;
};

export function AttachmentBlock(props: AttachmentBlockProps) {
    const { node, isUploaded, extension } = props;
    const { id, name, size, type, src } = node.attrs;

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
                "group flex items-center gap-3 p-3 rounded-lg border border-subtle bg-layer-2 hover:bg-layer-2-hover transition-all duration-200 ease-in-out",
                {
                    "opacity-60 pointer-events-none": !isUploaded,
                }
            )}
            contentEditable={false}
        >
            <div className="flex size-10 items-center justify-center rounded-md bg-layer-3 text-secondary group-hover:bg-layer-1 group-hover:text-primary transition-colors">
                {!isUploaded ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    <FileIcon className="size-5" />
                )}
            </div>

            <div className="flex flex-1 flex-col truncate overflow-hidden">
                <span className="text-14 font-medium text-primary truncate leading-tight">
                    {name || "Unnamed File"}
                </span>
                <span className="text-12 text-tertiary">
                    {formattedSize} {type && `• ${type.split("/").pop()?.toUpperCase()}`}
                </span>
            </div>

            {isUploaded && src && (
                <button
                    type="button"
                    onClick={handleDownload}
                    className="flex size-8 items-center justify-center rounded-md hover:bg-layer-1 text-tertiary hover:text-primary transition-all"
                    title="Download file"
                >
                    <Download className="size-4" />
                </button>
            )}
        </div>
    );
}
