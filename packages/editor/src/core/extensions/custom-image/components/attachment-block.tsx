/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Download, FileText, FileImage, FileArchive, FileCode, FileVideo, FileAudio, File } from "lucide-react";
import { useCallback } from "react";
// plane imports
import { cn } from "@plane/utils";
// types
import type { CustomImageNodeViewProps } from "./node-view";

type AttachmentBlockProps = CustomImageNodeViewProps;

export function AttachmentBlock(props: AttachmentBlockProps) {
  const { node, selected, editor } = props;
  const { 
    src: fileUrl, 
    fileName, 
    fileSize,
    mimeType,
    id: fileId 
  } = node.attrs;

  const getFileIcon = useCallback((fileName: string, mimeType?: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    // Image files
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(extension || '')) {
      return <FileImage className="size-4 text-blue-500" />;
    }
    
    // Video files
    if (mimeType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) {
      return <FileVideo className="size-4 text-purple-500" />;
    }
    
    // Audio files
    if (mimeType?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension || '')) {
      return <FileAudio className="size-4 text-green-500" />;
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension || '')) {
      return <FileArchive className="size-4 text-orange-500" />;
    }
    
    // Code/Text files
    if (mimeType?.startsWith('text/') || ['js', 'ts', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'md', 'log', 'txt', 'csv', 'ini', 'conf'].includes(extension || '')) {
      return <FileCode className="size-4 text-cyan-500" />;
    }
    
    // PDF files
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return <FileText className="size-4 text-red-500" />;
    }
    
    // Default file icon
    return <File className="size-4 text-tertiary" />;
  }, []);

  const handleDownload = useCallback(() => {
    if (fileUrl && fileName) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileUrl, fileName]);

  const formatFileSize = useCallback((bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  return (
    <div
      className={cn(
        "attachment-block relative group/attachment-item h-12 flex items-center gap-2 px-2 rounded-sm border border-subtle bg-layer-1 transition-colors",
        {
          "border-accent-strong bg-accent-primary/5": selected,
          "hover:bg-layer-2": editor.isEditable,
        }
      )}
      contentEditable={false}
      onClick={() => {
        // Handle click if needed
      }}
    >
      <div className="flex-shrink-0">
        {getFileIcon(fileName || '', mimeType || '')}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-13 font-medium text-primary truncate">
            {fileName || 'Untitled file'}
          </div>
          <div className="text-11 text-secondary shrink-0">
            {formatFileSize(fileSize)}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={handleDownload}
          className="shrink-0 py-0.5 px-1 flex items-center justify-center rounded-sm text-secondary hover:text-primary transition-colors duration-200"
          title="Download file"
        >
          <Download className="size-4" />
        </button>
      </div>
    </div>
  );
}
