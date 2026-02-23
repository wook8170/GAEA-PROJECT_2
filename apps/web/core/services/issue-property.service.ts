/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";

export type TIssuePropertyType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "file"
  | "relation";

export type TIssueProperty = {
  id: string;
  workspace: string;
  issue_type: string | null;
  name: string;
  description: string;
  property_type: TIssuePropertyType;
  is_required: boolean;
  is_multi: boolean;
  default_value: unknown;
  options: unknown[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TIssuePropertyValue = {
  id: string;
  issue: string;
  property: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export class IssuePropertyService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async listProperties(workspaceSlug: string, issueTypeId?: string): Promise<TIssueProperty[]> {
    const query = issueTypeId ? `?issue_type_id=${issueTypeId}` : "";
    return this.get(`/api/workspaces/${workspaceSlug}/issue-properties/${query}`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async getProperty(workspaceSlug: string, propertyId: string): Promise<TIssueProperty> {
    return this.get(`/api/workspaces/${workspaceSlug}/issue-properties/${propertyId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async createProperty(workspaceSlug: string, data: Partial<TIssueProperty>): Promise<TIssueProperty> {
    return this.post(`/api/workspaces/${workspaceSlug}/issue-properties/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async updateProperty(
    workspaceSlug: string,
    propertyId: string,
    data: Partial<TIssueProperty>
  ): Promise<TIssueProperty> {
    return this.patch(`/api/workspaces/${workspaceSlug}/issue-properties/${propertyId}/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async deleteProperty(workspaceSlug: string, propertyId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/issue-properties/${propertyId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async listValues(
    workspaceSlug: string,
    projectId: string,
    issueId: string
  ): Promise<TIssuePropertyValue[]> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/property-values/`
    )
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async createValue(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssuePropertyValue>
  ): Promise<TIssuePropertyValue> {
    return this.post(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/property-values/`,
      data
    )
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async updateValue(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    valueId: string,
    data: Partial<TIssuePropertyValue>
  ): Promise<TIssuePropertyValue> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/property-values/${valueId}/`,
      data
    )
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async deleteValue(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    valueId: string
  ): Promise<void> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/property-values/${valueId}/`
    )
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }
}
