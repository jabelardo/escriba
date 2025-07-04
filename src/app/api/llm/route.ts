import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken || !session.user?.username) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { selectedContextFiles, currentContent, promptType, userPrompt, llmConfig, projectName } = await req.json();
  const { openRouterApiKey, systemPrompt, continuePrompt, reviewPrompt } = llmConfig;

  // Determine which LLM provider to use based on configuration
  let llmApiUrl = "";
  let llmApiKey = "";

  if (openRouterApiKey) {
    llmApiUrl = "https://openrouter.ai/api/v1/chat/completions";
    llmApiKey = openRouterApiKey;
  } else {
    return new Response("No LLM provider configured", { status: 400 });
  }

  // Fetch content of selectedContextFiles
  const octokit = new Octokit({
    auth: session.accessToken,
  });

  let contextContent = "";
  if (selectedContextFiles && selectedContextFiles.length > 0) {
    const fileContentsPromises = selectedContextFiles.map(async (filePath: string) => {
      try {
        const { data } = await octokit.repos.getContent({
          owner: session.user?.username as string,
          repo: projectName,
          path: filePath,
        });
        if ("content" in data && data.content) {
          return `--- ${filePath} ---\n${Buffer.from(data.content, "base64").toString("utf8")}\n`;
        }
      } catch (error) {
        console.error(`Error fetching content for ${filePath}:`, error);
      }
      return "";
    });
    contextContent = (await Promise.all(fileContentsPromises)).join("\n");
  }

  // Construct the full prompt
  let fullPrompt = systemPrompt || "You are a helpful AI assistant.";
  if (contextContent) {
    fullPrompt += "\n\nHere is some context from the user's project:\n" + contextContent;
  }
  if (currentContent) {
    fullPrompt += "\n\nHere is the current content you are working on:\n" + currentContent;
  }
  if (promptType === "continue") {
    fullPrompt += "\n\n" + (continuePrompt || "Please continue writing from the last sentence.");
  }
  else if (promptType === "review") {
    fullPrompt += "\n\n" + (reviewPrompt || "Please review the above content for grammar, style, and coherence.");
  }
  if (userPrompt) {
    fullPrompt += "\n\nUser's specific request: " + userPrompt;
  }

  // Prepare the request to the LLM (this is a simplified example)
  const messages = [
    { role: "system", content: fullPrompt },
    { role: "user", content: userPrompt || "" }, // User's specific request or empty
  ];

  try {
    const response = await fetch(llmApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(llmApiKey && { Authorization: `Bearer ${llmApiKey}` }),
      },
      body: JSON.stringify({
        model: "openrouter/auto", // This needs to be dynamic based on selected LLM
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("LLM API Error:", errorData);
      return new Response(`LLM API Error: ${errorData.message || response.statusText}`, { status: response.status });
    }

    const data = await response.json();
    // Extract the generated text (this depends on the LLM API response format)
    const generatedText = data.choices[0]?.message?.content || "No response from LLM.";
    return NextResponse.json({ generatedText });
  } catch (error) {
    console.error("Error calling LLM API:", error);
    return new Response("Internal Server Error when calling LLM", { status: 500 });
  }
}
