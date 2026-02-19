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
    // states
    const [isUploaded, setIsUploaded] = useState(!!src);

    return (
        <NodeViewWrapper className="attachment-component-wrapper w-full py-1">
            <AttachmentBlock {...props} isUploaded={isUploaded} setIsUploaded={setIsUploaded} />
            {!isUploaded && (
                <AttachmentUploader {...props} setIsUploaded={setIsUploaded} />
            )}
        </NodeViewWrapper>
    );
}
