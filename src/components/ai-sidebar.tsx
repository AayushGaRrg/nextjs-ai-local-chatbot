import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/aisidebar";
import { SidebarTitles } from "./sidebar-titles";
import { ClearChatHistoryButton } from "./clear-chat-history";
import { NewChatButton } from "./new-chat-button";
import { ExportChatButton } from "./export-chat-button";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <NewChatButton />
        <ClearChatHistoryButton />
      </SidebarHeader>
      <SidebarContent>
        <SidebarTitles />
      </SidebarContent>
      <SidebarFooter>
        <ExportChatButton />
      </SidebarFooter>
    </Sidebar>
  );
}
