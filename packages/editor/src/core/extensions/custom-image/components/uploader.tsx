/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { ImageIcon, Paperclip, RotateCcw, Download, FileText, FileImage, FileArchive, FileCode, FileVideo, FileAudio, File as FileIcon, FileSpreadsheet, Presentation, FilePlus } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
// plane imports
import { cn } from "@plane/utils";
// constants
import { ACCEPTED_IMAGE_MIME_TYPES, ACCEPTED_ATTACHMENT_MIME_TYPES } from "@/constants/config";
import { CORE_EXTENSIONS } from "@/constants/extension";
// helpers
import type { EFileError } from "@/helpers/file";
// hooks
import { useUploader, useDropZone, uploadFirstFileAndInsertRemaining } from "@/hooks/use-file-upload";
// local imports
import { ECustomImageStatus } from "../types";
import { getImageComponentImageFileMap } from "../utils";
import type { CustomImageNodeViewProps } from "./node-view";

type CustomImageUploaderProps = CustomImageNodeViewProps & {
  failedToLoadImage: boolean;
  hasDuplicationFailed: boolean;
  loadImageFromFileSystem: (file: string) => void;
  maxFileSize: number;
  setIsUploaded: (isUploaded: boolean) => void;
};

export const CustomImageUploader = (props: CustomImageUploaderProps) => {
  const {
    editor,
    extension,
    getPos,
    node,
    selected,
    updateAttributes,
    failedToLoadImage,
    hasDuplicationFailed,
    loadImageFromFileSystem,
    maxFileSize,
    setIsUploaded,
  } = props;
  // refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredFilePickerRef = useRef(false);
  const hasTriedUploadingOnMountRef = useRef(false);
  const { id: imageEntityId } = node.attrs;
  // derived values
  const imageComponentImageFileMap = useMemo(() => getImageComponentImageFileMap(editor), [editor]);
  const isTouchDevice = !!editor.storage.utility.isTouchDevice;

  const onUpload = useCallback(
    (url: string, file?: File) => {
      if (url) {
        if (!imageEntityId) return;
        setIsUploaded(true);
        
        // Determine file type
        let fileType: "image" | "attachment" = "image";
        if (file) {
          fileType = ACCEPTED_IMAGE_MIME_TYPES.includes(file.type) ? "image" : "attachment";
        }
        
        // Update the node view's src attribute post upload
        updateAttributes({
          src: url,
          status: ECustomImageStatus.UPLOADED,
          fileType,
          fileName: file?.name || null,
          fileSize: file?.size || null,
          mimeType: file?.type || null,
        });
        imageComponentImageFileMap?.delete(imageEntityId);

        const pos = getPos();
        // get current node
        const getCurrentSelection = editor.state.selection;
        const currentNode = editor.state.doc.nodeAt(getCurrentSelection.from);

        // only if the cursor is at the current image component, manipulate
        // the cursor position
        if (
          currentNode &&
          currentNode.type.name === node.type.name &&
          currentNode.attrs.src === url &&
          pos !== undefined
        ) {
          // control cursor position after upload
          const nextNode = editor.state.doc.nodeAt(pos + 1);

          if (nextNode && nextNode.type.name === CORE_EXTENSIONS.PARAGRAPH) {
            // If there is a paragraph node after the image component, move the focus to the next node
            editor.commands.setTextSelection(pos + 1);
          } else {
            // create a new paragraph after the image component post upload
            editor.commands.createParagraphNear();
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageComponentImageFileMap, imageEntityId, updateAttributes, getPos]
  );

  const uploadImageEditorCommand = useCallback(
    async (file: File) => {
      updateAttributes({ status: ECustomImageStatus.UPLOADING });
      return await extension.options.uploadImage?.(imageEntityId ?? "", file);
    },
    [extension.options, imageEntityId, updateAttributes]
  );

  const handleProgressStatus = useCallback(
    (isUploading: boolean) => {
      editor.storage.utility.uploadInProgress = isUploading;
    },
    [editor]
  );

  const handleInvalidFile = useCallback((_error: EFileError, _file: File, message: string) => {
    // Use global toast function
    const globalToast = (window as any)?.planeToast;
    if (globalToast) {
      globalToast({
        type: "error",
        title: "파일 용량 초과",
        message: message,
      });
    } else {
      // Fallback to alert
      alert(message);
    }
  }, []);

  // hooks
  const { isUploading: isImageBeingUploaded, uploadFile } = useUploader({
    acceptedMimeTypes: [...ACCEPTED_IMAGE_MIME_TYPES, ...ACCEPTED_ATTACHMENT_MIME_TYPES],
    editorCommand: uploadImageEditorCommand,
    handleProgressStatus,
    loadFileFromFileSystem: loadImageFromFileSystem,
    maxFileSize,
    onInvalidFile: handleInvalidFile,
    onUpload,
  });

  const { draggedInside, onDrop, onDragEnter, onDragLeave } = useDropZone({
    editor,
    getPos,
    type: "image",
    uploader: uploadFile,
  });

  // after the image component is mounted we start the upload process based on
  // it's uploaded
  useEffect(() => {
    if (hasTriedUploadingOnMountRef.current) return;

    // the meta data of the image component
    const meta = imageComponentImageFileMap?.get(imageEntityId ?? "");
    if (meta) {
      if (meta.event === "drop" && "file" in meta) {
        hasTriedUploadingOnMountRef.current = true;
        uploadFile(meta.file);
      } else if (meta.event === "insert" && fileInputRef.current && !hasTriggeredFilePickerRef.current) {
        if (meta.hasOpenedFileInputOnce) return;
        if (!isTouchDevice) {
          fileInputRef.current.click();
        }
        hasTriggeredFilePickerRef.current = true;
        imageComponentImageFileMap?.set(imageEntityId ?? "", { ...meta, hasOpenedFileInputOnce: true });
      }
    } else {
      hasTriedUploadingOnMountRef.current = true;
    }
  }, [imageEntityId, isTouchDevice, uploadFile, imageComponentImageFileMap]);

  const onFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const filesList = e.target.files;
      const pos = getPos();
      if (!filesList || pos === undefined) {
        return;
      }
      
      // Determine file type from first file
      const firstFile = filesList[0];
      let fileType: "image" | "attach" = "image";
      if (firstFile) {
        fileType = ACCEPTED_IMAGE_MIME_TYPES.includes(firstFile.type) ? "image" : "attach";
      }
      
      await uploadFirstFileAndInsertRemaining({
        editor,
        filesList,
        pos,
        type: fileType,
        uploader: uploadFile,
      });
    },
    [uploadFile, editor, getPos]
  );

  const isErrorState = failedToLoadImage || hasDuplicationFailed;

  const borderColor =
    selected && editor.isEditable && !isErrorState
      ? "color-mix(in srgb, var(--border-color-accent-strong) 20%, transparent)"
      : undefined;

  const getDisplayMessage = useCallback(() => {
    const isUploading = isImageBeingUploaded;
    if (isErrorState) {
      return "Error loading file";
    }

    if (isUploading) {
      return "Uploading...";
    }

    if (draggedInside && editor.isEditable) {
      return "Drop file here";
    }

    return "Add a file";
  }, [draggedInside, editor.isEditable, isErrorState, isImageBeingUploaded]);

  const handleRetryClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasDuplicationFailed && editor.isEditable) {
        updateAttributes({ status: ECustomImageStatus.DUPLICATING });
      }
    },
    [hasDuplicationFailed, editor.isEditable, updateAttributes]
  );

  const getFileIcon = useCallback(() => {
    return <Paperclip className="size-4" />;
  }, []);

  // Reuse the same icon logic as attachment-block
  const getFileTypeIcon = useCallback((fileName: string, mimeType?: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    // 1. Check file extension first (priority)
    
    // Image files by extension
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico', 'psd', 'ai', 'eps'].includes(extension || '')) {
      return <FileImage className="size-4 text-blue-500" />;
    }
    
    // Video files by extension
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'mpg', 'mpeg', '3gp', 'm4v'].includes(extension || '')) {
      return <FileVideo className="size-4 text-purple-500" />;
    }
    
    // Audio files by extension
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus', 'aiff', 'au'].includes(extension || '')) {
      return <FileAudio className="size-4 text-green-500" />;
    }
    
    // Archive files by extension
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'z', 'deb', 'rpm', 'dmg', 'pkg', 'sitx'].includes(extension || '')) {
      return <FileArchive className="size-4 text-orange-500" />;
    }
    
    // Code/Text files by extension
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'md', 'log', 'txt', 'csv', 'ini', 'conf', 'config', 'env', 'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sh', 'bat', 'ps1', 'sql', 'dockerfile', 'r', 'm', 'pl', 'vb', 'cs', 'vb', 'pas', 'asm'].includes(extension || '')) {
      return <FileCode className="size-4 text-cyan-500" />;
    }
    
    // Document files by extension
    if (['pdf'].includes(extension || '')) {
      return <FileText className="size-4 text-red-500" />;
    }
    
    // Microsoft Office files
    if (['doc', 'docx'].includes(extension || '')) {
      return <FileText className="size-4" style={{ color: 'rgb(59, 130, 246)' }} />;
    }
    
    if (['xls', 'xlsx'].includes(extension || '')) {
      return <FileSpreadsheet className="size-4" style={{ color: 'rgb(16, 185, 129)' }} />;
    }
    
    if (['ppt', 'pptx'].includes(extension || '')) {
      return <Presentation className="size-4" style={{ color: 'rgb(245, 158, 11)' }} />;
    }
    
    // Apple iWork files
    if (['pages'].includes(extension || '')) {
      return <FileText className="size-4 text-blue-500" />;
    }
    
    if (['numbers'].includes(extension || '')) {
      return <FileSpreadsheet className="size-4 text-green-500" />;
    }
    
    if (['key'].includes(extension || '')) {
      return <Presentation className="size-4 text-orange-500" />;
    }
    
    // OpenDocument files
    if (['odt'].includes(extension || '')) {
      return <FileText className="size-4 text-blue-500" />;
    }
    
    if (['ods'].includes(extension || '')) {
      return <FileSpreadsheet className="size-4 text-green-500" />;
    }
    
    if (['odp'].includes(extension || '')) {
      return <Presentation className="size-4 text-orange-500" />;
    }
    
    // Other document formats
    if (['rtf'].includes(extension || '')) {
      return <FileText className="size-4 text-red-500" />;
    }
    
    // 2. If no extension match, check MIME type
    
    // Image files by MIME type
    if (mimeType?.startsWith('image/')) {
      return <FileImage className="size-4 text-blue-500" />;
    }
    
    // Video files by MIME type
    if (mimeType?.startsWith('video/')) {
      return <FileVideo className="size-4 text-purple-500" />;
    }
    
    // Audio files by MIME type
    if (mimeType?.startsWith('audio/')) {
      return <FileAudio className="size-4 text-green-500" />;
    }
    
    // Text files by MIME type
    if (mimeType?.startsWith('text/')) {
      return <FileCode className="size-4 text-cyan-500" />;
    }
    
    // PDF by MIME type
    if (mimeType === 'application/pdf') {
      return <FileText className="size-4 text-red-500" />;
    }
    
    // Default file icon
    return <FileIcon className="size-4 text-tertiary" />;
  }, []);

  return (
    <div
      className={cn(
        "image-upload-component flex items-center justify-start gap-2 py-3 px-2 rounded-lg text-accent-secondary bg-accent-primary/5 border border-dashed border-accent-primary/50 transition-all duration-200 ease-in-out cursor-default",
        {
          "border-subtle": !(selected && editor.isEditable && !isErrorState),
          "hover:text-accent-secondary hover:bg-accent-primary/10 cursor-pointer": editor.isEditable && !isErrorState,
          "bg-accent-primary/10 text-accent-secondary": draggedInside && editor.isEditable && !isErrorState,
          "text-accent-secondary bg-accent-primary/10 hover:bg-accent-primary/10 hover:text-accent-secondary":
            selected && editor.isEditable && !isErrorState,
          "text-danger-primary bg-danger-subtle cursor-default": isErrorState,
          "hover:text-danger-primary hover:bg-danger-subtle-hover": isErrorState && editor.isEditable,
          "bg-danger-subtle-selected": isErrorState && selected,
          "hover:bg-danger-subtle-active": isErrorState && selected && editor.isEditable,
        }
      )}
      style={borderColor ? { borderColor } : undefined}
      onDrop={onDrop}
      onDragOver={onDragEnter}
      onDragLeave={onDragLeave}
      contentEditable={false}
      onClick={() => {
        if (!failedToLoadImage && editor.isEditable && !hasDuplicationFailed) {
          fileInputRef.current?.click();
        }
      }}
    >
      {getFileIcon()}
      <div className="text-14 font-medium flex-1">{getDisplayMessage()}</div>
      {hasDuplicationFailed && editor.isEditable && (
        <button
          type="button"
          onClick={handleRetryClick}
          className={cn(
            "flex items-center gap-1 px-2 py-1 font-medium text-danger-primary rounded-md transition-all duration-200 ease-in-out hover:bg-danger-subtle-hover",
            {
              "hover:bg-danger-subtle-hover": selected,
            }
          )}
          title="Retry duplication"
        >
          <RotateCcw className="size-3" />
          <span className="text-11">Retry</span>
        </button>
      )}
      <input
        className="size-0 overflow-hidden"
        ref={fileInputRef}
        hidden
        type="file"
        accept="*"
        onChange={onFileChange}
        multiple
      />
    </div>
  );
}
