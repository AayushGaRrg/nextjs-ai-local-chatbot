import { generateId, UIMessage } from "ai";
import db from "@/lib/chatDatabase";
import { useLiveQuery } from "dexie-react-hooks";
import { CustomMessage } from "@/lib/types";

export async function createChat(): Promise<string> {
  const id = generateId(); // generate a unique chat ID
  const chatHeader = "New Chat";
  const messages: CustomMessage[] = [];
  await db.chats.add({ id, chatHeader, messages });
  return id;
}

export function useLoadChat(id: string): CustomMessage[] {
  const chat = useLiveQuery(() => db.chats.get(id));
  return chat?.messages || [];
}

export async function clearChatHistory(): Promise<void> {
  await db.chats.clear();
}

export async function updateChatTitle(
  chatId: string,
  title: string
): Promise<void> {
  await db.chats.update(chatId, { chatHeader: title });
}

export async function updateChatMessages(
  chatId: string,
  messages: CustomMessage[]
): Promise<void> {
  await db.chats.update(chatId, { messages });
}

export async function updateMessageVote(
  chatId: string,
  messageId: string,
  vote: "None" | "UpVote" | "DownVote"
): Promise<void> {
  const chat = await db.chats.get(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }

  const messages = chat.messages;
  const message = messages.find((m) => m.uiMessage.id === messageId);
  if (!message) {
    throw new Error("Message not found");
  }

  const newMessages = messages.map((m) =>
    m.uiMessage.id === messageId ? { ...m, vote } : m
  );

  await db.chats.update(chatId, { messages: newMessages });
}
