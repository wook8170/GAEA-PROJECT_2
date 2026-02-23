/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export enum EFileError {
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  FILE_SIZE_TOO_LARGE = "FILE_SIZE_TOO_LARGE",
  NO_FILE_SELECTED = "NO_FILE_SELECTED",
}

type TArgs = {
  acceptedMimeTypes: string[];
  file: File;
  maxFileSize: number;
  onError: (error: EFileError, message: string) => void;
};

export const isFileValid = (args: TArgs): boolean => {
  const { acceptedMimeTypes, file, maxFileSize, onError } = args;

  if (!file) {
    onError(EFileError.NO_FILE_SELECTED, "파일이 선택되지 않았습니다. 업로드할 파일을 선택해주세요.");
    return false;
  }

  if (!acceptedMimeTypes.includes(file.type)) {
    onError(EFileError.INVALID_FILE_TYPE, "지원하지 않는 파일 형식입니다.");
    return false;
  }

  if (maxFileSize > 0 && file.size > maxFileSize) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    const limitMB = (maxFileSize / 1024 / 1024).toFixed(1);
    onError(
      EFileError.FILE_SIZE_TOO_LARGE,
      `파일 용량 초과 (${sizeMB}MB). ${limitMB}MB 이하의 파일을 선택해주세요.`
    );
    return false;
  }

  return true;
};
