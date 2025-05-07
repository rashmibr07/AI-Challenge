import { findSimilarTickets, summarizeTickets, createJiraTicket } from "./jiraClient";


const SIMILARITY_THRESHOLD = 0
/**
 * Handles creation of a Jira ticket, checking for similar ones first.
 * Returns a message string to be sent back to Slack.
 */
export async function handleCreateTicket(summary: string, description: string, priority: string, brand:string, env:string, components:string): Promise<string> {
  try {
    // 1. Find similar tickets using OpenAI embeddings + JIRA search
    const similar = await findSimilarTickets(summary);

    // 2. If similar tickets are found, summarize and skip creation
    if (similar.length > SIMILARITY_THRESHOLD) {
      const summary = await summarizeTickets(similar);
      return `:warning: Found similar tickets:\n${summary}\n\nSkipping creation.`;
    }

    // 3. If no similar ticket, create a new one
    const ticketKey = await createJiraTicket(summary, description, priority, brand, env, components);
    return `:white_check_mark: Created ticket *${ticketKey}*`;
  } catch (error) {
    console.error("Error in handleCreateTicket:", error);
    return ":x: Failed to create ticket due to an internal error.";
  }
}
