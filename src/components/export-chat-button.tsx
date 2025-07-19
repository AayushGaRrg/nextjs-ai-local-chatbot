import { Button } from "./ui/button";
import chatDatabase from "@/lib/chatDatabase";
import { toast } from "sonner";

export function ExportChatButton() {
  const handleExport = async () => {
    try {
      // Get all chats from IndexedDB
      const chats = await chatDatabase.chats.toArray();

      if (chats.length === 0) {
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
        totalChats: chats.length,
        chats: chats,
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-chat-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${chats.length} chat(s)!`);
    } catch (error) {
      console.error("Error exporting chats:", error);
      toast.error("Failed to export chats. Please try again.");
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleExport}>
      Export All Chats
    </Button>
  );
}
