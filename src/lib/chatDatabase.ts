import { Chat } from "./types";
import Dexie, { EntityTable } from "dexie";

const chatDatabase = new Dexie("chatDatabase") as Dexie & {
  chats: EntityTable<Chat, "id">;
};

chatDatabase.version(1).stores({
  chats: "id, chatHeader, messages",
});

export type { Chat };
export default chatDatabase;
