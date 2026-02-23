/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Users } from "lucide-react";
import { TeamService, type TTeam } from "@/services/team.service";

export type TProjectTeamspaceList = {
  workspaceSlug: string;
  projectId: string;
};

const teamService = new TeamService();

export const ProjectTeamspaceList = observer(function ProjectTeamspaceList(props: TProjectTeamspaceList) {
  const { workspaceSlug } = props;
  const [teams, setTeams] = useState<TTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!workspaceSlug) return;
    teamService
      .listTeams(workspaceSlug)
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setIsLoading(false));
  }, [workspaceSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-body-sm-regular text-tertiary">Loading teams...</span>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-body-sm-regular text-tertiary">No teamspaces assigned to this project.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 py-2">
      {teams.map((team) => (
        <div
          key={team.id}
          className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-layer-1 transition-colors"
        >
          <Users className="size-4 text-tertiary flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-body-sm-medium truncate">{team.name}</span>
            {team.description && (
              <span className="text-caption-md-regular text-tertiary truncate">{team.description}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});
