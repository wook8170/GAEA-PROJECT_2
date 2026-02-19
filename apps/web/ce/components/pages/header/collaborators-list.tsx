import { useState, useEffect } from "react";
// plane editor
import { useCollaboration, type TUserDetails } from "@plane/editor";
// plane ui
import { Avatar, AvatarGroup } from "@plane/ui";
// store
import type { TPageInstance } from "@/store/pages/base-page";

export type TPageCollaboratorsListProps = {
  page: TPageInstance;
};

export function PageCollaboratorsList({ }: TPageCollaboratorsListProps) {
  const { provider } = useCollaboration();
  const [activeUsers, setActiveUsers] = useState<TUserDetails[]>([]);

  useEffect(() => {
    if (!provider) return;

    const handleAwarenessUpdate = () => {
      const states = provider.awareness.getStates();
      const users: TUserDetails[] = [];
      states.forEach((state: any) => {
        if (state.user) {
          // Check if user is already in the list to avoid duplicates (multiple tabs from same user)
          if (!users.find((u) => u.id === state.user.id)) {
            users.push(state.user);
          }
        }
      });
      setActiveUsers(users);
    };

    handleAwarenessUpdate();
    provider.awareness.on("update", handleAwarenessUpdate);

    return () => {
      provider.awareness.off("update", handleAwarenessUpdate);
    };
  }, [provider]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <AvatarGroup max={4} size="base">
        {activeUsers.map((user) => (
          <Avatar
            key={user.id}
            name={user.name}
            src={user.avatar}
            fallbackBackgroundColor={user.color}
          />
        ))}
      </AvatarGroup>
    </div>
  );
}
