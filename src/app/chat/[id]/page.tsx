"use client";
import { useLoadChat } from "@/tools/chat-store";
import { Chat } from "@/components/Chat";
import { useQuery } from "@tanstack/react-query";
import { redirect, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { id } = useParams();

  console.log("The current id is", id);

  if (!id) {
    redirect("/");
  }

  const messages = useLoadChat(id as string);

  console.log("messages", messages);

  // Show chat component
  return (
    <Chat id={id as string} initialMessages={messages} isReadonly={false} />
  );
}
