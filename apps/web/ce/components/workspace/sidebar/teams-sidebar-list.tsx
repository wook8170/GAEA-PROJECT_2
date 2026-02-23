/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Users } from "lucide-react";
import { useParams } from "next/navigation";
import { TeamService, type TTeam } from "@/services/team.service";

const teamService = new TeamService();

export const SidebarTeamsList = observer(function SidebarTeamsList() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const [teams, setTeams] = useState<TTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workspaceSlug) return;
    setIsLoading(true);
    teamService
      .listTeams(workspaceSlug)
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setIsLoading(false));
  }, [workspaceSlug]);

  if (isLoading || teams.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5 px-4 py-2">
      <div className="flex items-center gap-1.5 px-2 py-1 text-caption-sm-semibold text-tertiary uppercase">
        Teams
      </div>
      {teams.map((team) => (
        <div
          key={team.id}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-body-sm-medium text-secondary hover:bg-layer-transparent-hover cursor-pointer transition-colors"
        >
          <Users className="size-4 flex-shrink-0" />
          <span className="truncate">{team.name}</span>
        </div>
      ))}
    </div>
  );
});
