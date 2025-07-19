import { UIMessage } from "ai";

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}
export interface CustomMessage {
  uiMessage: UIMessage;
  vote: "None" | "UpVote" | "DownVote";
}

export interface Chat {
  id: string;
  chatHeader: string;
  messages: CustomMessage[];
}
