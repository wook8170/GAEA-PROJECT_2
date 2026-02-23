/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Download, FileText, FileImage, FileArchive, FileCode, FileVideo, FileAudio, File, FileSpreadsheet, Presentation, FilePlus } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
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

  // 에셋 정보 상태
  const [assetInfo, setAssetInfo] = useState({ fileName: 'Untitled file', fileSize: null });

  // DB에서 실제 파일 정보 가져오기
  const getAssetInfoFromDB = useCallback(() => {
    // node.attrs에서 직접 정보 가져오기
    const { name: nodeName, size: nodeSize, src: nodeSrc } = node.attrs;
    
    console.log("🔍 Node attrs info:", { name: nodeName, size: nodeSize, src: nodeSrc });
    console.log("🔍 All node.attrs:", node.attrs);
    
    // 히스토리 버전인지 확인 (fileType이 null인 경우)
    const isHistoryVersion = node.attrs.fileType === null;
    console.log("🔍 Is history version:", isHistoryVersion);
    
    if (nodeName && nodeSize) {
      // node.attrs에 직접 정보가 있는 경우
      console.log("🔍 Found info in node attrs:", { fileName: nodeName, fileSize: nodeSize });
      setAssetInfo({ fileName: nodeName, fileSize: nodeSize });
      return;
    }
    
    // 히스토리 버전인 경우 다른 방식으로 처리
    if (isHistoryVersion) {
      console.log("🔍 Processing history version");
      
      // 히스토리 버전에서는 API를 통해 직접 에셋 정보 가져오기
      if (nodeSrc) {
        console.log("🔍 Fetching history asset info for src:", nodeSrc);
        
        // 에디터의 API 설정 가져오기
        const apiConfig = editor?.storage?.utility?.apiConfig || {};
        const headers = {
          'Content-Type': 'application/json',
          ...(apiConfig.authorization && { 'Authorization': apiConfig.authorization })
        };
        
        console.log("🔍 API headers:", headers);
        
        fetch(`http://localhost:9001/api/assets/v2/workspaces/gaeasoft/check/${nodeSrc}/`, { headers })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          })
          .then(data => {
            console.log("🔍 History asset check result:", data);
            
            if (data.exists) {
              // 에셋이 존재하면 DB에서 직접 정보 가져오기
              console.log("🔍 History asset exists, fetching details...");
              
              // 히스토리 버전의 에셋 정보는 다른 방식으로 저장될 수 있음
              // node.attrs에 있는 정보를 우선 사용
              if (nodeName) {
                console.log("🔍 Using node name for history:", nodeName);
                setAssetInfo({ fileName: nodeName, fileSize: nodeSize });
              } else {
                console.log("🔍 Using src as filename for history:", nodeSrc);
                setAssetInfo({ fileName: nodeSrc, fileSize: null });
              }
            } else {
              console.log("🔍 History asset does not exist");
              setAssetInfo({ fileName: nodeSrc, fileSize: null });
            }
          })
          .catch(error => {
            console.error("🔍 Error fetching history asset:", error);
            // API 호출 실패 시 node.attrs 정보 사용
            if (nodeName) {
              console.log("🔍 Using node name as fallback:", nodeName);
              setAssetInfo({ fileName: nodeName, fileSize: nodeSize });
            } else {
              console.log("🔍 Using src as fallback:", nodeSrc);
              setAssetInfo({ fileName: nodeSrc, fileSize: null });
            }
          });
        
        return;
      }
    }
    
    // 일반적인 경우: 에셋 리스트에서 찾기
    if (fileId && editor && editor.storage && editor.storage.utility && editor.storage.utility.assetsList) {
      console.log("🔍 Searching for asset with ID:", fileId);
      
      const asset = editor.storage.utility.assetsList.find((a: any) => a.id === fileId);
      if (asset) {
        console.log("🔍 Found asset in assetsList:", asset);
        
        // attributes에서 실제 파일명과 사이즈 추출
        const fileName = asset.attributes?.name || asset.name || 'Untitled file';
        const fileSize = asset.size || null;
        
        console.log("🔍 Real file info from assetsList:", { fileName, fileSize });
        setAssetInfo({ fileName, fileSize });
        return;
      }
      
      console.log("🔍 Asset not found in assetsList, using fallback");
    }
  }, [editor, fileId, node.attrs]);

  useEffect(() => {
    // 에셋 리스트가 로드될 때까지 기다렸다가 정보 가져오기
    const timer = setTimeout(() => {
      getAssetInfoFromDB();
    }, 100); // 100ms 지연으로 에셋 리스트 로드 대기
    
    return () => clearTimeout(timer);
  }, [getAssetInfoFromDB]);

  // 에셋 리스트 변경 시 다시 시도
  useEffect(() => {
    if (editor?.storage?.utility?.assetsList?.length > 0) {
      getAssetInfoFromDB();
    }
  }, [editor?.storage?.utility?.assetsList?.length, getAssetInfoFromDB]);

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
      return <FileText className="size-4" style={{ color: 'rgb(245, 158, 11)' }} />;
    }
    
    // Microsoft Office files
    if (['doc', 'docx'].includes(extension || '')) {
      return <FileText className="size-4" style={{ color: 'rgb(59, 130, 246)' }} />;
    }
    
    if (['xls', 'xlsx'].includes(extension || '')) {
      return <FileSpreadsheet className="size-4" style={{ color: 'rgb(16, 185, 129)' }} />;
    }
    
    if (['ppt', 'pptx'].includes(extension || '')) {
      return <Presentation className="size-4" style={{ color: 'rgb(239, 68, 68)' }} />;
    }
    
    // Korean HWP files
    if (['hwp', 'hwpx'].includes(extension || '')) {
      return <FileText className="size-4" style={{ color: 'rgb(59, 130, 246)' }} />;
    }
    
    // Apple iWork files
    if (['pages'].includes(extension || '')) {
      return <FileText className="size-4 text-blue-500" />;
    }
    
    if (['numbers'].includes(extension || '')) {
      return <FileSpreadsheet className="size-4 text-green-500" />;
    }
    
    if (['key'].includes(extension || '')) {
      return <Presentation className="size-4" style={{ color: 'rgb(239, 68, 68)' }} />;
    }
    
    // OpenDocument files
    if (['odt'].includes(extension || '')) {
      return <FileText className="size-4 text-blue-500" />;
    }
    
    if (['ods'].includes(extension || '')) {
      return <FileSpreadsheet className="size-4 text-green-500" />;
    }
    
    if (['odp'].includes(extension || '')) {
      return <Presentation className="size-4" style={{ color: 'rgb(239, 68, 68)' }} />;
    }
    
    // Other document formats
    if (['rtf'].includes(extension || '')) {
      return <FileText className="size-4" style={{ color: 'rgb(239, 68, 68)' }} />;
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
    if (fileId && assetInfo.fileName) {
      // 프로젝트 첨부파일 다운로드 URL
      const downloadUrl = `/api/assets/v2/workspaces/gaeasoft/projects/bd06f3a5-90c0-403d-a75d-a6f39c8b51af/download/${fileId}/`;
      
      console.log("🔍 Download triggered:", { downloadUrl, fileName: assetInfo.fileName, fileId });
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = assetInfo.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.warn("🔍 Cannot download: missing fileId or fileName", { fileId, fileName: assetInfo.fileName });
    }
  }, [fileId, assetInfo.fileName]);

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
        {getFileIcon(assetInfo.fileName || '', mimeType || '')}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-13 font-medium text-primary truncate">
            {assetInfo.fileName}
          </div>
          <div className="text-11 text-secondary shrink-0">
            {formatFileSize(assetInfo.fileSize)}
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
