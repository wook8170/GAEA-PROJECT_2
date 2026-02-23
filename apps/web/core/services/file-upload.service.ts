/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { AxiosRequestConfig } from "axios";
import axios from "axios";
// services
import { APIService } from "@/services/api.service";

export class FileUploadService extends APIService {
  private activeSources: Map<string, ReturnType<typeof axios.CancelToken.source>> = new Map();

  constructor() {
    super("");
  }

  async uploadFile(
    url: string,
    data: FormData,
    uploadProgressHandler?: AxiosRequestConfig["onUploadProgress"]
  ): Promise<void> {
    const source = axios.CancelToken.source();
    const uploadId = `${Date.now()}-${Math.random()}`;
    this.activeSources.set(uploadId, source);
    return this.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      cancelToken: source.token,
      withCredentials: false,
      onUploadProgress: uploadProgressHandler,
    })
      .then((response) => response?.data)
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log(error.message);
        } else {
          throw error?.response?.data;
        }
      })
      .finally(() => {
        this.activeSources.delete(uploadId);
      });
  }

  cancelUpload() {
    this.activeSources.forEach((source) => source.cancel("Upload canceled"));
    this.activeSources.clear();
  }
}
