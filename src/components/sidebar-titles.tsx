import db, { Chat } from "@/lib/chatDatabase";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuAction,
  SidebarMenu,
} from "./ui/aisidebar";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
} from "date-fns";
import { UIMessage } from "ai";
import { Button } from "./ui/button";
import {
  DownloadIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";
import { CheckCircleFillIcon } from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import chatDatabase from "@/lib/chatDatabase";

interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
}

const handleExport = async (chatId: string) => {
  try {
    // Get all chats from IndexedDB
    const chats = await chatDatabase.chats.get(chatId);

    if (!chats) {
      toast.error("No chats found to export.");
      return;
    }

    // Create the export data
    const exportData = {
      exportDate: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      chats: chats,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-chat-export-${
      chats.chatHeader
    }-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);

    toast.success(`Successfully exported ${chats.chatHeader} chat(s)!`);
  } catch (error) {
    console.error("Error exporting chats:", error);
    toast.error("Failed to export chats. Please try again.");
  }
};

const groupChatsByTime = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const grouped: GroupedChats = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };

  if (!chats || chats.length === 0) return grouped;

  chats.forEach((chat) => {
    if (chat.messages.length === 0) {
      grouped.today.push(chat);
      return;
    }

    const lastMessage = chat.messages[chat.messages.length - 1].uiMessage;
    const lastMessageDate = new Date(lastMessage.createdAt!);

    if (isToday(lastMessageDate)) {
      grouped.today.push(chat);
    } else if (isYesterday(lastMessageDate)) {
      grouped.yesterday.push(chat);
    } else if (isThisWeek(lastMessageDate)) {
      grouped.lastWeek.push(chat);
    } else if (isThisMonth(lastMessageDate)) {
      grouped.lastMonth.push(chat);
    } else {
      grouped.older.push(chat);
    }
  });

  return grouped;
};

export function SidebarTitles() {
  const chats = useLiveQuery(() => db.chats.toArray());

  const groupedChats = groupChatsByTime(chats || []);

  console.log(groupedChats);

  const renderChatGroup = (title: string, chats: Chat[]) => {
    if (chats.length === 0) return null;

    return (
      <SidebarGroup key={title}>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {chats?.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton asChild key={chat.id}>
                  <Link href={`/chat/${chat.id}`}>
                    <span className="truncate w-full">{chat.chatHeader}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu modal={true}>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
                      showOnHover={true}
                    >
                      <MoreHorizontalIcon />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        handleExport(chat.id);
                      }}
                    >
                      <DownloadIcon />
                      <span>Export</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                      onSelect={() => db.chats.delete(chat.id)}
                    >
                      <TrashIcon />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <>
      {renderChatGroup("Today", groupedChats.today)}
      {renderChatGroup("Yesterday", groupedChats.yesterday)}
      {renderChatGroup("Last Week", groupedChats.lastWeek)}
      {renderChatGroup("Last Month", groupedChats.lastMonth)}
      {renderChatGroup("Older", groupedChats.older)}
    </>
  );
}
