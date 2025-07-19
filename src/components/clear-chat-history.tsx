import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { clearChatHistory } from "@/tools/chat-store";

export function ClearChatHistoryButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => {
        clearChatHistory();
        redirect("/");
      }}
    >
      Clear Chat History
    </Button>
  );
}
