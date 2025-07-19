import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/aisidebar";
import { Plus } from "lucide-react";
import { SidebarLeftIcon } from "./icons";
import { Tooltip } from "./ui/tooltip";
import { TooltipTrigger } from "./ui/tooltip";
import { TooltipContent } from "./ui/tooltip";

export function NewChatButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => {
        redirect("/");
      }}
    >
      New Chat
    </Button>
  );
}

export function NewChatIconButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-testid="sidebar-toggle-button"
          onClick={() => {
            redirect("/");
          }}
          variant="outline"
          className="md:px-2 md:h-fit"
        >
          <Plus size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">New Chat</TooltipContent>
    </Tooltip>
  );
}
