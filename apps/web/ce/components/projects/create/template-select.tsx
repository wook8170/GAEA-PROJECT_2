/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { FileText, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { TemplateService, type TProjectTemplate } from "@/services/template.service";

export type TProjectTemplateSelect = {
  disabled?: boolean;
  onClick?: () => void;
};

const templateService = new TemplateService();

export const ProjectTemplateSelect = observer(function ProjectTemplateSelect(props: TProjectTemplateSelect) {
  const { disabled } = props;
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const [templates, setTemplates] = useState<TProjectTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<TProjectTemplate | null>(null);

  useEffect(() => {
    if (!workspaceSlug) return;
    templateService
      .listProjectTemplates(workspaceSlug)
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, [workspaceSlug]);

  if (templates.length === 0) return <></>;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-md border border-subtle px-3 py-1.5 text-body-sm-medium text-secondary hover:bg-layer-1 transition-colors disabled:opacity-50"
        onClick={() => setIsOpen((v) => !v)}
      >
        <FileText className="size-3.5" />
        <span>{selected ? selected.name : "Use template"}</span>
        <ChevronDown className="size-3" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-1 w-56 rounded-md border border-subtle bg-layer-0 shadow-lg py-1">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-body-sm-regular hover:bg-layer-1 text-secondary"
            onClick={() => { setSelected(null); setIsOpen(false); }}
          >
            No template
          </button>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-body-sm-regular hover:bg-layer-1 text-secondary"
              onClick={() => { setSelected(tpl); setIsOpen(false); }}
            >
              {tpl.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
