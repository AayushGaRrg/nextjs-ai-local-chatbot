import { generateText, streamText } from "ai";
import { azure } from "@ai-sdk/azure";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { input } = await req.json();
  console.log("The Input is: ", input);

  const result = await generateText({
    model: azure(process.env.AZURE_MODEL_NAME || ""),
    system:
      "Based on the messages, provide a title for the chat. The title should be a single sentence. The title should be no more than 10 words. Don't answer the question, just provide the title. The title should ideally be only with 20 characters.",
    prompt: input,
  });

  console.log("The Text is: ", result.text);

  return Response.json({ title: result.text });
}
