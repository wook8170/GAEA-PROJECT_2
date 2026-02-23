/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Download, FileText, FileImage, FileArchive, FileCode, FileVideo, FileAudio, File, FileSpreadsheet, Presentation, FilePlus } from "lucide-react";
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
          className="shrink-0 py-0.5 px-1 flex items-center gap-1 rounded-sm text-secondary hover:text-primary transition-colors duration-200"
          title="Download file"
        >
          <Download className="shrink-0 size-3" />
          <span className="text-11 font-medium">다운로드</span>
        </button>
      </div>
    </div>
  );
}
