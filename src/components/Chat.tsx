"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { generateUUID } from "@/lib/utils";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";
import { updateChatMessages, updateChatTitle } from "@/tools/chat-store";
import { CustomMessage } from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/chatDatabase";
import { ChatHeader } from "./chat-header";

export function Chat({
  id,
  initialMessages,
  isReadonly,
}: {
  id: string;
  initialMessages: CustomMessage[];
  isReadonly: boolean;
}) {
  const {
    messages,
    setMessages,
    status,
    stop,
    reload,
    handleSubmit,
    handleInputChange,
    input,
    setInput,
  } = useChat({
    id,
    initialMessages: initialMessages.map((m) => m.uiMessage),
    generateId: generateUUID,
  });

  const hasInitialized = useRef(false);

  // Reset initialization flag when chat ID changes
  useEffect(() => {
    hasInitialized.current = false;
  }, [id]);

  const handleMessageSubmit = async () => {
    handleSubmit();
    if (messages.length > 0) return;
    const titleResponse = await fetch("/api/chat/chattitle", {
      method: "POST",
      body: JSON.stringify({ input }),
    });

    if (titleResponse.ok) {
      const titleData = await titleResponse.json();
      console.log("The Title Provided is: ", titleData.title);
      updateChatTitle(id, titleData.title);
    } else {
      console.error("Failed to generate title:", titleResponse.statusText);
    }
  };

  const messagesFromDatabase = useLiveQuery(() => db.chats.get(id));

  const customMessages: CustomMessage[] = messages.map((m): CustomMessage => {
    return {
      uiMessage: m,
      vote:
        messagesFromDatabase?.messages.find(
          (message) => message.uiMessage.id === m.id
        )?.vote || "None",
    };
  });

  useEffect(() => {
    if (status === "ready" && id && !hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    if (
      status === "ready" &&
      id &&
      hasInitialized.current &&
      messages.length > 0
    ) {
      updateChatMessages(id, customMessages);
    }
  }, [status, id, messages]);

  return (
    <div id="Chat" className="flex flex-col min-w-0 h-screen bg-background">
      <ChatHeader />

      <Messages
        chatId={id}
        status={status}
        messages={customMessages}
        setMessages={setMessages}
        isReadonly={isReadonly}
        reload={reload}
      />
      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        {!isReadonly && (
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            status={status}
            stop={stop}
            messages={messages}
            setMessages={setMessages}
            handleSubmit={handleMessageSubmit}
            onChange={handleInputChange}
          />
        )}
      </form>
    </div>
  );
}
