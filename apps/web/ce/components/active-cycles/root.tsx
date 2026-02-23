/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { ContentWrapper, Loader } from "@plane/ui";
// services
import { CycleService } from "@/services/cycle.service";

const cycleService = new CycleService();

export const WorkspaceActiveCyclesRoot = observer(function WorkspaceActiveCyclesRoot() {
  const { workspaceSlug } = useParams();
  const { t } = useTranslation();
  const [activeCycles, setActiveCycles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!workspaceSlug) return;
    setIsLoading(true);
    cycleService
      .workspaceActiveCycles(workspaceSlug.toString(), ``, 20)
      .then((res) => {
        setActiveCycles(res?.results ?? []);
      })
      .catch(() => {
        setActiveCycles([]);
      })
      .finally(() => setIsLoading(false));
  }, [workspaceSlug]);

  if (isLoading) {
    return (
      <ContentWrapper>
        <Loader className="flex flex-col gap-4">
          <Loader.Item height="150px" />
          <Loader.Item height="150px" />
        </Loader>
      </ContentWrapper>
    );
  }

  if (activeCycles.length === 0) {
    return (
      <ContentWrapper className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <RefreshCw className="size-10 text-tertiary" />
          <h3 className="text-lg font-medium">{t("no_active_cycles")}</h3>
          <p className="text-body-sm-regular text-tertiary max-w-md">
            {t("no_active_cycles_description")}
          </p>
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {activeCycles.map((cycle: any) => (
          <div
            key={cycle.id}
            className="flex flex-col gap-3 rounded-xl border border-subtle bg-layer-1 p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-body-md-medium truncate">{cycle.name}</h4>
              <span className="text-caption-md-regular text-tertiary">{cycle.project_detail?.identifier}</span>
            </div>
            <div className="flex items-center gap-4 text-caption-md-regular text-tertiary">
              <span>{cycle.total_issues ?? 0} items</span>
              <span>{cycle.completed_issues ?? 0} completed</span>
            </div>
            {cycle.total_issues > 0 && (
              <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.round(((cycle.completed_issues ?? 0) / cycle.total_issues) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </ContentWrapper>
  );
});
