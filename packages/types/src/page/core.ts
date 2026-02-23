/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TLogoProps } from "../common";
import type { EPageAccess } from "../enums";
import type { TPageExtended } from "./extended";
import type { TPageLock } from "./lock";
import type { TPagePermission } from "./permission";
import type { TPageVersion } from "./version";
import type { TEditorAsset } from "@plane/editor";

export type TPage = {
  access: EPageAccess | undefined;
  archived_at: string | null | undefined;
  color: string | undefined;
  created_at: Date | undefined;
  created_by: string | undefined;
  description_json: object | undefined;
  description_html: string | undefined;
  id: string | undefined;
  is_bookmarked: boolean | undefined;
  is_favorite: boolean | undefined;
  is_page_favorited: boolean | undefined;
  is_template: boolean | undefined;
  logo_props: TLogoProps | undefined;
  name: string | undefined;
  parent: string | undefined;
  project: string | undefined;
  updated_at: Date | undefined;
  updated_by: string | undefined;
  workspace: string | undefined;
  owned_by: string | undefined;
} & TPageExtended;

export type TPageEmbedType = "mention" | "issue";

// page filters
export type TPageNavigationTabs = "public" | "private" | "archived";

export type TPageFiltersSortKey = "name" | "created_at" | "updated_at" | "opened_at";

export type TPageFiltersSortBy = "asc" | "desc";

export type TPageFilterProps = {
  created_at?: string[] | null;
  created_by?: string[] | null;
  favorites?: boolean;
  labels?: string[] | null;
};

export type TPageFilters = {
  searchQuery: string;
  sortKey: TPageFiltersSortKey;
  sortBy: TPageFiltersSortBy;
  filters?: TPageFilterProps;
};

export type TPageVersion = {
  created_at: string;
  created_by: string;
  deleted_at: string | null;
  description_binary?: string | null;
  description_html?: string | null;
  description_json?: object;
  id: string;
  last_saved_at: string;
  owned_by: string;
  page: string;
  updated_at: string;
  updated_by: string;
  workspace: string;
  assets_list?: TEditorAsset[]; // 에셋 목록 추가
};

export type TDocumentPayload = {
  description_binary: string;
  description_html: string;
  description_json: object;
};

export type TWebhookConnectionQueryParams = {
  documentType: "project_page" | "team_page" | "workspace_page";
  projectId?: string;
  teamId?: string;
  workspaceSlug: string;
};
