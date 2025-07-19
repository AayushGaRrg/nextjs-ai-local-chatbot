"use client";

import { createChat } from "@/tools/chat-store";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const loadChat = async () => {
      const id = await createChat();
      console.log(id);
      redirect(`/chat/${id}`); // redirect to chat page, see below
    };
    loadChat();
  }, []);

  return <div>Loading...</div>;
}
