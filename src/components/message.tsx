"use client";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
// import { DocumentToolCall, DocumentToolResult } from "./document";
import { PencilEditIcon, SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import equal from "fast-deep-equal";
import { cn, sanitizeText } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MessageEditor } from "./message-editor";
// import { DocumentPreview } from "./document-preview";
import { MessageReasoning } from "./message-reasoning";
import { CustomMessage } from "@/lib/types";
import { Message } from "ai";
import { Bot } from "lucide-react";

// Type narrowing is handled by TypeScript's control flow analysis
// The AI SDK provides proper discriminated unions for tool calls

export function PreviewMessage({
  chatId,
  message,
  isLoading,
  setMessages,
  isReadonly,
  requiresScrollPadding,
  reload,
}: {
  chatId: string;
  message: CustomMessage;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  reload: () => Promise<string | undefined | null>;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.uiMessage.experimental_attachments;

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.uiMessage.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.uiMessage.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.uiMessage.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <Bot size={14} />
              </div>
            </div>
          )}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96":
                message.uiMessage.role === "assistant" && requiresScrollPadding,
            })}
          >
            {attachmentsFromMessage && attachmentsFromMessage.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {attachmentsFromMessage.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={{
                      name: attachment.name ?? "file",
                      contentType: attachment.contentType ?? "",
                      url: attachment.url,
                    }}
                  />
                ))}
              </div>
            )}

            {message.uiMessage.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.uiMessage.id}-part-${index}`;

              if (type === "reasoning" && part.reasoning.length > 0) {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.uiMessage.role === "user" && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4", {
                          "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                            message.uiMessage.role === "user",
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === "edit") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.uiMessage.id}
                        message={message.uiMessage}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-invocation") {
                const { toolCallId, state, toolName } = part.toolInvocation;
                if (toolName === "getWeather") {
                  if (state === "call") {
                    return (
                      <div key={toolCallId} className="skeleton">
                        <Weather />
                      </div>
                    );
                  }

                  if (state === "result") {
                    const { result: output } = part.toolInvocation;
                    return (
                      <div key={toolCallId}>
                        <Weather weatherAtLocation={output} />
                      </div>
                    );
                  }
                }

                // if (toolName === "createDocument") {
                //   if (state === "call") {
                //     return (
                //       <div key={toolCallId}>
                //         <DocumentPreview isReadonly={isReadonly} args={""} />
                //       </div>
                //     );
                //   }

                //   if (state === "result") {
                //     const { result: output } = part.toolInvocation;

                //     if ("error" in output) {
                //       return (
                //         <div
                //           key={toolCallId}
                //           className="text-red-500 p-2 border rounded"
                //         >
                //           Error: {String(output.error)}
                //         </div>
                //       );
                //     }

                //     return (
                //       <div key={toolCallId}>
                //         <DocumentPreview
                //           isReadonly={isReadonly}
                //           result={output}
                //         />
                //       </div>
                //     );
                //   }
                // }

                // if (toolName === "updateDocument") {
                //   if (state === "call") {
                //     const { input } = part.toolInvocation;

                //     return (
                //       <div key={toolCallId}>
                //         <DocumentToolCall
                //           type="update"
                //           args={input}
                //           isReadonly={isReadonly}
                //         />
                //       </div>
                //     );
                //   }

                //   if (state === "result") {
                //     const { result: output } = part.toolInvocation;

                //     if ("error" in output) {
                //       return (
                //         <div
                //           key={toolCallId}
                //           className="text-red-500 p-2 border rounded"
                //         >
                //           Error: {String(output.error)}
                //         </div>
                //       );
                //     }

                //     return (
                //       <div key={toolCallId}>
                //         <DocumentToolResult
                //           type="update"
                //           result={output}
                //           isReadonly={isReadonly}
                //         />
                //       </div>
                //     );
                //   }
                // }

                // if (toolName === "requestSuggestions") {

                //   if (state === "input-available") {
                //     const { input } = part;
                //     return (
                //       <div key={toolCallId}>
                //         <DocumentToolCall
                //           type="request-suggestions"
                //           args={input}
                //           isReadonly={isReadonly}
                //         />
                //       </div>
                //     );
                //   }

                //   if (state === "output-available") {
                //     const { output } = part;

                //     if ("error" in output) {
                //       return (
                //         <div
                //           key={toolCallId}
                //           className="text-red-500 p-2 border rounded"
                //         >
                //           Error: {String(output.error)}
                //         </div>
                //       );
                //     }

                //     return (
                //       <div key={toolCallId}>
                //         <DocumentToolResult
                //           type="request-suggestions"
                //           result={output}
                //           isReadonly={isReadonly}
                //         />
                //       </div>
                //     );
                //   }
                // }
              }
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.uiMessage.id}`}
                chatId={chatId}
                message={message}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
