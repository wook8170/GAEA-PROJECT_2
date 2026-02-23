/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";

export type TIssueTemplate = {
  id: string;
  workspace: string;
  project: string | null;
  name: string;
  description: string;
  template_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TProjectTemplate = {
  id: string;
  workspace: string;
  name: string;
  description: string;
  template_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export class TemplateService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async listIssueTemplates(workspaceSlug: string, projectId?: string): Promise<TIssueTemplate[]> {
    const query = projectId ? `?project_id=${projectId}` : "";
    return this.get(`/api/workspaces/${workspaceSlug}/issue-templates/${query}`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async getIssueTemplate(workspaceSlug: string, templateId: string): Promise<TIssueTemplate> {
    return this.get(`/api/workspaces/${workspaceSlug}/issue-templates/${templateId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async createIssueTemplate(workspaceSlug: string, data: Partial<TIssueTemplate>): Promise<TIssueTemplate> {
    return this.post(`/api/workspaces/${workspaceSlug}/issue-templates/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async updateIssueTemplate(
    workspaceSlug: string,
    templateId: string,
    data: Partial<TIssueTemplate>
  ): Promise<TIssueTemplate> {
    return this.patch(`/api/workspaces/${workspaceSlug}/issue-templates/${templateId}/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async deleteIssueTemplate(workspaceSlug: string, templateId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/issue-templates/${templateId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async listProjectTemplates(workspaceSlug: string): Promise<TProjectTemplate[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/project-templates/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async getProjectTemplate(workspaceSlug: string, templateId: string): Promise<TProjectTemplate> {
    return this.get(`/api/workspaces/${workspaceSlug}/project-templates/${templateId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async createProjectTemplate(workspaceSlug: string, data: Partial<TProjectTemplate>): Promise<TProjectTemplate> {
    return this.post(`/api/workspaces/${workspaceSlug}/project-templates/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async updateProjectTemplate(
    workspaceSlug: string,
    templateId: string,
    data: Partial<TProjectTemplate>
  ): Promise<TProjectTemplate> {
    return this.patch(`/api/workspaces/${workspaceSlug}/project-templates/${templateId}/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async deleteProjectTemplate(workspaceSlug: string, templateId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/project-templates/${templateId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }
}
