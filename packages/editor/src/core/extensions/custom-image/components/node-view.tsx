/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
// local imports
import type { CustomImageExtensionType, TCustomImageAttributes } from "../types";
import { ECustomImageAttributeNames, ECustomImageStatus } from "../types";
import { hasImageDuplicationFailed } from "../utils";
import { CustomImageBlock } from "./block";
import { AttachmentBlock } from "./attachment-block";
import { CustomImageUploader } from "./uploader";

export type CustomImageNodeViewProps = Omit<NodeViewProps, "extension" | "updateAttributes"> & {
  extension: CustomImageExtensionType;
  node: NodeViewProps["node"] & {
    attrs: TCustomImageAttributes;
  };
  updateAttributes: (attrs: Partial<TCustomImageAttributes>) => void;
};

export function CustomImageNodeView(props: CustomImageNodeViewProps) {
  const { editor, extension, node, updateAttributes } = props;
  const { src: imgNodeSrc, status, fileType } = node.attrs;

  // Helper function to check if file is attachment based on extension
  function isAttachmentFile(src: string): boolean {
    if (!src) return false;
    
    const extension = src.split('.').pop()?.toLowerCase();
    if (!extension) return false;
    
    // Common attachment extensions (non-image)
    const attachmentExtensions = [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'txt', 'rtf', 'csv', 'zip', 'rar', '7z', 'tar', 'gz',
      'hwp', 'hwpx', 'pages', 'numbers', 'key', 'odt', 'ods', 'odp'
    ];
    
    // Image extensions
    const imageExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'
    ];
    
    return attachmentExtensions.includes(extension) && !imageExtensions.includes(extension);
  }

  const [isUploaded, setIsUploaded] = useState(!!imgNodeSrc);
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(undefined);
  const [resolvedDownloadSrc, setResolvedDownloadSrc] = useState<string | undefined>(undefined);
  const [imageFromFileSystem, setImageFromFileSystem] = useState<string | undefined>(undefined);
  const [failedToLoadImage, setFailedToLoadImage] = useState(false);

  const [editorContainer, setEditorContainer] = useState<HTMLDivElement | null>(null);
  const imageComponentRef = useRef<HTMLDivElement>(null);
  const hasRetriedOnMount = useRef(false);
  const isDuplicatingRef = useRef(false);

  useEffect(() => {
    const closestEditorContainer = imageComponentRef.current?.closest(".editor-container");
    if (closestEditorContainer) {
      setEditorContainer(closestEditorContainer as HTMLDivElement);
    }
  }, []);

  // the image is already uploaded if the image-component node has src attribute
  // and we need to remove the blob from our file system
  useEffect(() => {
    if (resolvedSrc || imgNodeSrc) {
      setIsUploaded(true);
      setImageFromFileSystem(undefined);
    } else {
      setIsUploaded(false);
    }
  }, [resolvedSrc, imgNodeSrc]);

  useEffect(() => {
    if (!imgNodeSrc) {
      setResolvedSrc(undefined);
      setResolvedDownloadSrc(undefined);
      setFailedToLoadImage(false);
      return;
    }

    setResolvedSrc(undefined);
    setResolvedDownloadSrc(undefined);
    setFailedToLoadImage(false);

    // For attachment files, we don't need to fetch image source
    console.log("🔍 NodeView - fileType:", fileType, "imgNodeSrc:", imgNodeSrc);
    
    // Check if this is actually an attachment based on file extension
    const isAttachment = fileType === "attachment" || (imgNodeSrc && isAttachmentFile(imgNodeSrc));
    console.log("🔍 NodeView - isAttachment:", isAttachment);
    
    if (isAttachment) {
      // For attachments, just get download source without failing
      const getAttachmentSource = async () => {
        try {
          const downloadUrl = await extension.options.getImageDownloadSource?.(imgNodeSrc);
          setResolvedDownloadSrc(downloadUrl);
          console.log("🔍 NodeView - Attachment download URL resolved:", downloadUrl);
        } catch (error) {
          console.error("Error fetching attachment download source:", error);
          // Don't set failedToLoadImage for attachments, just log the error
        }
      };
      void getAttachmentSource();
      return;
    }

    // For image files, fetch both image and download sources
    const getImageSource = async () => {
      try {
        const url = await extension.options.getImageSource?.(imgNodeSrc);
        setResolvedSrc(url);
        const downloadUrl = await extension.options.getImageDownloadSource?.(imgNodeSrc);
        setResolvedDownloadSrc(downloadUrl);
      } catch (error) {
        console.error("Error fetching image source:", error);
        setFailedToLoadImage(true);
      }
    };
    void getImageSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgNodeSrc, fileType, extension.options.getImageSource, extension.options.getImageDownloadSource]);

  useEffect(() => {
    const handleDuplication = async () => {
      if (status !== ECustomImageStatus.DUPLICATING || !extension.options.duplicateImage || !imgNodeSrc) {
        return;
      }

      // Prevent duplicate calls - check if already duplicating this asset
      if (isDuplicatingRef.current) {
        return;
      }

      isDuplicatingRef.current = true;
      try {
        hasRetriedOnMount.current = true;

        const newAssetId = await extension.options.duplicateImage(imgNodeSrc);

        if (!newAssetId) {
          throw new Error("Duplication returned invalid asset ID");
        }

        setFailedToLoadImage(false);
        updateAttributes({ src: newAssetId, status: ECustomImageStatus.UPLOADED });
      } catch (error: unknown) {
        console.error("Failed to duplicate image:", error);
        // Update status to failed
        updateAttributes({ status: ECustomImageStatus.DUPLICATION_FAILED });
      } finally {
        isDuplicatingRef.current = false;
      }
    };

    void handleDuplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, imgNodeSrc, extension.options.duplicateImage, updateAttributes]);

  useEffect(() => {
    if (hasImageDuplicationFailed(status) && !hasRetriedOnMount.current && imgNodeSrc) {
      hasRetriedOnMount.current = true;
      // Add a small delay before retrying to avoid immediate retries
      updateAttributes({ status: ECustomImageStatus.DUPLICATING });
    }
  }, [status, imgNodeSrc, updateAttributes]);

  useEffect(() => {
    if (status === ECustomImageStatus.UPLOADED) {
      hasRetriedOnMount.current = false;
      setFailedToLoadImage(false);
    }
  }, [status]);

  const hasDuplicationFailed = hasImageDuplicationFailed(status);
  const hasValidImageSource = imageFromFileSystem || (isUploaded && resolvedSrc);
  const hasValidAttachmentSource = isUploaded && resolvedDownloadSrc;
  const isActuallyAttachment = fileType === "attachment" || (imgNodeSrc && isAttachmentFile(imgNodeSrc));
  const shouldShowBlock = (isActuallyAttachment ? hasValidAttachmentSource : hasValidImageSource) && !failedToLoadImage && !hasDuplicationFailed;

  console.log("🔍 NodeView - State:", {
    fileType,
    isUploaded,
    resolvedSrc,
    resolvedDownloadSrc,
    failedToLoadImage,
    hasDuplicationFailed,
    hasValidAttachmentSource,
    isActuallyAttachment,
    shouldShowBlock
  });

  return (
    <NodeViewWrapper key={node.attrs[ECustomImageAttributeNames.ID]}>
      <div className="p-0 mx-0 my-2" data-drag-handle ref={imageComponentRef}>
        {isActuallyAttachment && isUploaded ? (
          <AttachmentBlock {...props} />
        ) : shouldShowBlock && !hasDuplicationFailed ? (
          <CustomImageBlock
            editorContainer={editorContainer}
            imageFromFileSystem={imageFromFileSystem}
            setEditorContainer={setEditorContainer}
            setFailedToLoadImage={setFailedToLoadImage}
            src={resolvedSrc}
            downloadSrc={resolvedDownloadSrc}
            {...props}
          />
        ) : (
          <CustomImageUploader
            failedToLoadImage={failedToLoadImage}
            hasDuplicationFailed={hasDuplicationFailed}
            loadImageFromFileSystem={setImageFromFileSystem}
            maxFileSize={extension.storage.maxFileSize}
            setIsUploaded={setIsUploaded}
            {...props}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
