/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";

export type TStateTransition = {
  id: string;
  from_state: string;
  to_state: string;
  is_allowed: boolean;
  project: string;
  workspace: string;
  created_at: string;
  updated_at: string;
};

export class WorkflowService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async list(workspaceSlug: string, projectId: string): Promise<TStateTransition[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/state-transitions/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async create(
    workspaceSlug: string,
    projectId: string,
    data: Partial<TStateTransition>
  ): Promise<TStateTransition> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/state-transitions/`, data)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async update(
    workspaceSlug: string,
    projectId: string,
    transitionId: string,
    data: Partial<TStateTransition>
  ): Promise<TStateTransition> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/state-transitions/${transitionId}/`,
      data
    )
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async remove(workspaceSlug: string, projectId: string, transitionId: string): Promise<void> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/state-transitions/${transitionId}/`
    )
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}
