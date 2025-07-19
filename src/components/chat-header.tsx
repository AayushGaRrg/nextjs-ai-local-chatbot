import { NewChatIconButton } from "./new-chat-button";
import { SidebarToggle } from "./sidebar-toggle";

export function ChatHeader() {
  return (
    <div className="flex flex-row items-center p-4 gap-4">
      <SidebarToggle />
      <NewChatIconButton />
    </div>
  );
}
