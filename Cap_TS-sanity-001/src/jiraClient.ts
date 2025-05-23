import axios from "axios";
import { getEmbedding, cosineSimilarity,summarizeText } from "./openaiUtils";


const TICKET_SEARCH_SPACE_LIMIT = 10
const MATCH_SCORE_THRESHOLD = 0.85

export async function createJiraTicket(issuetype: string,summary: string, description: string, priority: string, brand:string, env:string, components:string): Promise<string> {
      let template  = {
        "fields": {
            "project": {
                "id": "11693"
            },
            "issuetype": {
                "id": "10300"
            },
            "priority": {
                "id": "3",
                "name": "Medium-P2",
                "iconUrl": "https://capillarytech.atlassian.net/images/icons/priorities/major.svg"
            },
            "summary": "test new123",
            "customfield_11997": [
                {
                    "id": "17377",
                    "value": "Abbott_HK_Demo"
                }
            ],
            "customfield_11800": [
                {
                    "id": "14025",
                    "value": "Demo"
                }
            ],
            "components": [
                {
                    "id": "13399",
                    "name": "API"
                }
            ],
            "labels": []
        }
      }
      let payload ={
        fields: {
            project: { id: "11693" },
            issuetype: { id: issuetype },
            summary:summary,
            priority: {
              "id": "3",
              "name": priority,
              "iconUrl": "https://capillarytech.atlassian.net/images/icons/priorities/major.svg"
            },
            description: {
                version: 1,
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: description }] }],
            },
            customfield_11997: [
                {
                    "id": "17377",
                    "value": brand
                }
            ],
            customfield_11800: [
                {
                    "id": "14025",
                    "value": env
                }
            ],
            components: [
              {
                  "id": "13399",
                  "name": components
              }
          ],
        },
      }
        
      const res = await axios.post(
        `${process.env.JIRA_BASE_URL!}/rest/api/3/issue`,
        payload,
        {
            auth: {
                username: process.env.JIRA_EMAIL!,
                password: process.env.JIRA_API_TOKEN!,
            },
        }
    );
    console.log("create ticket response", res.data)
    return res.data.key;
}

export async function findSimilarTickets(text: string): Promise<any[]> {
    const embedding = await getEmbedding(text);

    const jql = 'project = CJ ORDER BY created DESC';
    const res = await axios.get(`${process.env.JIRA_BASE_URL!}/rest/api/3/search`, {
        params: {
            jql,
            fields: [
                "summary",
                "status",
                "assignee",
                "priority"
              ],
            maxResults: TICKET_SEARCH_SPACE_LIMIT,
        },
        auth: {
            username: process.env.JIRA_EMAIL!,
            password: process.env.JIRA_API_TOKEN!,
        },
    });

    const issues = res.data.issues;
    const results: any[] = [];

    for (const issue of issues) {
        const issueEmbedding = await getEmbedding(issue.fields.summary);
        const score = cosineSimilarity(embedding, issueEmbedding);
        if (score > MATCH_SCORE_THRESHOLD) {
            results.push({  
                            ticketId: issue.key,
                            summary: issue.fields.summary,
                            priority: issue.fields.priority.name,
                            status: issue.fields.status.name,
                            assignee: issue.fields.assignee?.emailAddress || "",
                            ticketLink: "https://capillarytech.atlassian.net/jira/software/c/projects/CJ/issues/"+issue.key+"?jql=project%20%3D%20%22CJ%22%20ORDER%20BY%20created%20DESC"
                         });
        }
    }

    console.log("Similar Tickets: ", results)

    return results;
}

export async function summarizeTickets(issues: { key: string; summary: string }[]): Promise<string> {
    const text = issues.map(i => `${i.key}: ${i.summary}`).join("\n");
    return summarizeText(text);
}
