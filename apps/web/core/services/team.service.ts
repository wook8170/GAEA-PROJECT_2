/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";

export type TTeam = {
  id: string;
  name: string;
  description: string;
  workspace: string;
  logo_props: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TTeamMember = {
  id: string;
  team: string;
  member: string;
  role: number;
  created_at: string;
  updated_at: string;
};

export type TTeamProject = {
  id: string;
  team: string;
  project: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export class TeamService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async listTeams(workspaceSlug: string): Promise<TTeam[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/teams/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async getTeam(workspaceSlug: string, teamId: string): Promise<TTeam> {
    return this.get(`/api/workspaces/${workspaceSlug}/teams/${teamId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async createTeam(workspaceSlug: string, data: Partial<TTeam>): Promise<TTeam> {
    return this.post(`/api/workspaces/${workspaceSlug}/teams/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async updateTeam(workspaceSlug: string, teamId: string, data: Partial<TTeam>): Promise<TTeam> {
    return this.patch(`/api/workspaces/${workspaceSlug}/teams/${teamId}/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async deleteTeam(workspaceSlug: string, teamId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/teams/${teamId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async listMembers(workspaceSlug: string, teamId: string): Promise<TTeamMember[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/teams/${teamId}/members/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async addMember(workspaceSlug: string, teamId: string, data: Partial<TTeamMember>): Promise<TTeamMember> {
    return this.post(`/api/workspaces/${workspaceSlug}/teams/${teamId}/members/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async removeMember(workspaceSlug: string, teamId: string, memberId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/teams/${teamId}/members/${memberId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async listProjects(workspaceSlug: string, teamId: string): Promise<TTeamProject[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/teams/${teamId}/projects/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async addProject(workspaceSlug: string, teamId: string, data: Partial<TTeamProject>): Promise<TTeamProject> {
    return this.post(`/api/workspaces/${workspaceSlug}/teams/${teamId}/projects/`, data)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }

  async removeProject(workspaceSlug: string, teamId: string, projectId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/teams/${teamId}/projects/${projectId}/`)
      .then((res) => res?.data)
      .catch((err) => { throw err?.response?.data; });
  }
}
