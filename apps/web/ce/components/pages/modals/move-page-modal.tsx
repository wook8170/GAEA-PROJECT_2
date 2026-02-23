/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { Button } from "@plane/propel/button";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { CheckIcon, SearchIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
// plane web hooks
import type { EPageStoreType } from "@/plane-web/hooks/store";
import { usePageStore } from "@/plane-web/hooks/store";
// store types
import type { TPageInstance } from "@/store/pages/base-page";

export type TMovePageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  page: TPageInstance;
  storeType: EPageStoreType;
};

export const MovePageModal = observer(function MovePageModal(props: TMovePageModalProps) {
  const { isOpen, onClose, page, storeType } = props;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // router
  const router = useAppRouter();
  const { workspaceSlug, pageId: routePageId } = useParams<{ workspaceSlug: string; pageId: string }>();
  // store hooks
  const { workspaceProjectIds, getProjectById } = useProject();
  const { movePage } = usePageStore(storeType);

  const currentProjectIds = page.project_ids ?? [];
  const currentProjectId = currentProjectIds[0];

  const filteredProjectIds = (workspaceProjectIds ?? []).filter((pid) => {
    if (currentProjectIds.includes(pid)) return false;
    const project = getProjectById(pid);
    if (!project) return false;
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleMove = async () => {
    if (!selectedProjectId || !workspaceSlug || !currentProjectId || !page.id) return;
    setIsMoving(true);
    try {
      await movePage(workspaceSlug, currentProjectId, page.id, selectedProjectId);
      setToast({ type: TOAST_TYPE.SUCCESS, title: "완료", message: "페이지가 이동되었습니다." });
      handleClose();
      if (routePageId) {
        router.back();
      }
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "오류", message: "페이지 이동에 실패했습니다. 다시 시도해주세요." });
    } finally {
      setIsMoving(false);
    }
  };

  const handleClose = () => {
    setSelectedProjectId(null);
    setIsMoving(false);
    setSearchQuery("");
    onClose();
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose} width={EModalWidth.SM} position={EModalPosition.CENTER}>
      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-18 font-medium text-secondary">페이지 이동</h3>
          <p className="mt-1 text-13 text-secondary">
            이동할 프로젝트를 선택하세요.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border-[0.5px] border-subtle bg-surface-2 px-2.5">
          <SearchIcon className="h-3.5 w-3.5 text-placeholder flex-shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent py-1.5 text-13 text-secondary placeholder:text-placeholder focus:outline-none"
            autoFocus
          />
        </div>
        <div className="max-h-44 space-y-0.5 overflow-y-auto vertical-scrollbar scrollbar-sm">
          {filteredProjectIds.length === 0 ? (
            <p className="text-center py-3 text-13 text-placeholder">검색 결과가 없습니다</p>
          ) : (
            filteredProjectIds.map((pid) => {
              const project = getProjectById(pid);
              if (!project) return null;
              const isSelected = selectedProjectId === pid;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setSelectedProjectId(pid)}
                  className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer select-none text-13 transition-colors ${
                    isSelected
                      ? "bg-accent-primary/10 text-accent-primary"
                      : "hover:bg-layer-2 text-secondary"
                  }`}
                >
                  {project.logo_props ? (
                    <span className="grid place-items-center flex-shrink-0 h-5 w-5">
                      <Logo logo={project.logo_props} size={14} />
                    </span>
                  ) : (
                    <span className="grid place-items-center flex-shrink-0 h-5 w-5 rounded bg-layer-2 text-11 font-medium text-tertiary">
                      {project.identifier?.[0]}
                    </span>
                  )}
                  <span className="truncate flex-1">{project.name}</span>
                  <span className="flex-shrink-0 text-11 text-tertiary">{project.identifier}</span>
                  {isSelected && <CheckIcon className="flex-shrink-0 h-3.5 w-3.5" />}
                </button>
              );
            })
          )}
        </div>
      </div>
      <div className="px-5 py-4 flex items-center justify-end gap-2 border-t-[0.5px] border-subtle">
        <Button variant="secondary" size="lg" onClick={handleClose}>
          취소
        </Button>
        <Button variant="primary" size="lg" onClick={handleMove} disabled={!selectedProjectId} loading={isMoving}>
          {isMoving ? "이동 중" : "이동"}
        </Button>
      </div>
    </ModalCore>
  );
});
