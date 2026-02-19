/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React, { useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
// local imports
import { AttachmentBlock } from "./block";
import { AttachmentUploader } from "./uploader";

export type AttachmentNodeViewProps = NodeViewProps;

export function AttachmentNodeView(props: AttachmentNodeViewProps) {
    const { node } = props;
    const { src } = node.attrs;
    // refs
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    // states
    const [isUploaded, setIsUploaded] = useState(!!src);
    const [isUploading, setIsUploading] = useState(false);
    const [isError, setIsError] = useState(false);

    return (
        <NodeViewWrapper className="attachment-component-wrapper w-full py-1 relative">
            <AttachmentBlock
                {...props}
                isUploaded={isUploaded}
                isUploading={isUploading}
                isError={isError}
                setIsUploaded={setIsUploaded}
                fileInputRef={fileInputRef}
            />
            {!isUploaded && (
                <AttachmentUploader
                    {...props}
                    setIsUploaded={setIsUploaded}
                    setIsUploading={setIsUploading}
                    setIsError={setIsError}
                    fileInputRef={fileInputRef}
                />
            )}
        </NodeViewWrapper>
    );
}
