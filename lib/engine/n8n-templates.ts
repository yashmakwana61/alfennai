import type { AgentConfig } from "@/types/agent";

/**
 * Generates a valid, importable n8n workflow JSON from an agent's config.
 * Credentials are never embedded -- every node that needs one gets a
 * clearly-labeled placeholder the user fills in after importing.
 */

interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, { id: string; name: string }>;
}

interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, { main: { node: string; type: string; index: number }[][] }>;
  meta: { instructions: string };
}

function outputNode(channel: AgentConfig["workflowParams"]["outputChannel"], label: string, position: [number, number]): N8nNode {
  switch (channel) {
    case "slack":
      return {
        id: "output", name: label, type: "n8n-nodes-base.slack", typeVersion: 2.2, position,
        parameters: { text: "={{ $json.aiOutput }}", channel: "#PLACEHOLDER-CHANNEL" },
        credentials: { slackApi: { id: "PLACEHOLDER", name: "Slack account (add your own)" } },
      };
    case "email":
      return {
        id: "output", name: label, type: "n8n-nodes-base.emailSend", typeVersion: 2.1, position,
        parameters: { toEmail: "PLACEHOLDER@yourcompany.com", subject: "={{ $json.subject || 'Agent output' }}", text: "={{ $json.aiOutput }}" },
        credentials: { smtp: { id: "PLACEHOLDER", name: "SMTP account (add your own)" } },
      };
    case "whatsapp":
      return {
        id: "output", name: label, type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position,
        parameters: { url: "https://graph.facebook.com/v19.0/PLACEHOLDER-PHONE-ID/messages", method: "POST", jsonBody: "={{ { to: $json.from, type: 'text', text: { body: $json.aiOutput } } }}" },
        credentials: { httpHeaderAuth: { id: "PLACEHOLDER", name: "WhatsApp Business API token (add your own)" } },
      };
    case "crm":
      return {
        id: "output", name: label, type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position,
        parameters: { url: "https://api.hubapi.com/crm/v3/objects/contacts PLACEHOLDER", method: "POST", jsonBody: "={{ $json }}" },
        credentials: { httpHeaderAuth: { id: "PLACEHOLDER", name: "CRM API token -- HubSpot/Airtable/etc (add your own)" } },
      };
    case "sheet":
      return {
        id: "output", name: label, type: "n8n-nodes-base.googleSheets", typeVersion: 4.5, position,
        parameters: { operation: "append", documentId: "PLACEHOLDER-SHEET-ID", sheetName: "Sheet1" },
        credentials: { googleSheetsOAuth2Api: { id: "PLACEHOLDER", name: "Google Sheets account (add your own)" } },
      };
  }
}

function aiNode(label: string, systemPrompt: string, userPromptTemplate: string, position: [number, number]): N8nNode {
  return {
    id: "ai_node",
    name: label,
    type: "@n8n/n8n-nodes-langchain.openAi",
    typeVersion: 1.5,
    position,
    parameters: {
      modelId: "gpt-4o-mini",
      messages: {
        values: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPromptTemplate },
        ],
      },
    },
    credentials: { openAiApi: { id: "PLACEHOLDER", name: "OpenAI (or swap for Anthropic/other LLM node) -- add your own" } },
  };
}

function buildInboundMessageResponse(agent: AgentConfig): N8nWorkflow {
  const { workflowParams: p } = agent;
  const trigger: N8nNode = {
    id: "trigger", name: p.triggerLabel, type: "n8n-nodes-base.webhook", typeVersion: 2,
    position: [0, 0], parameters: { path: agent.slug, httpMethod: "POST" },
  };
  const ai = aiNode(p.aiNodeLabel, agent.systemPrompt, agent.userPromptTemplate, [300, 0]);
  const output = outputNode(p.outputChannel, p.outputLabel, [600, 0]);
  return {
    name: p.workflowName,
    nodes: [trigger, ai, output],
    connections: {
      [trigger.name]: { main: [[{ node: ai.name, type: "main", index: 0 }]] },
      [ai.name]: { main: [[{ node: output.name, type: "main", index: 0 }]] },
    },
    meta: {
      instructions:
        "1. Import into n8n. 2. Set your own credentials on the AI node and the output node (all marked PLACEHOLDER). 3. Point your WhatsApp/webhook source at this workflow's webhook URL. 4. Activate.",
    },
  };
}

function buildScheduledSummary(agent: AgentConfig): N8nWorkflow {
  const { workflowParams: p } = agent;
  const trigger: N8nNode = {
    id: "trigger", name: p.triggerLabel, type: "n8n-nodes-base.scheduleTrigger", typeVersion: 1.2,
    position: [0, 0], parameters: { rule: { interval: [{ field: "days", daysInterval: 1 }] } },
  };
  const fetchData: N8nNode = {
    id: "fetch", name: "Fetch source data", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2,
    position: [300, 0], parameters: { url: "https://PLACEHOLDER-your-data-source.com/api", method: "GET" },
    credentials: { httpHeaderAuth: { id: "PLACEHOLDER", name: "Data source API token (add your own)" } },
  };
  const ai = aiNode(p.aiNodeLabel, agent.systemPrompt, agent.userPromptTemplate, [600, 0]);
  const output = outputNode(p.outputChannel, p.outputLabel, [900, 0]);
  return {
    name: p.workflowName,
    nodes: [trigger, fetchData, ai, output],
    connections: {
      [trigger.name]: { main: [[{ node: fetchData.name, type: "main", index: 0 }]] },
      [fetchData.name]: { main: [[{ node: ai.name, type: "main", index: 0 }]] },
      [ai.name]: { main: [[{ node: output.name, type: "main", index: 0 }]] },
    },
    meta: {
      instructions:
        "1. Import into n8n. 2. Replace the 'Fetch source data' node's URL with your actual data source (database, API, or swap for a different node entirely). 3. Set credentials on the AI and output nodes. 4. Adjust the schedule and activate.",
    },
  };
}

function buildFormClassifyCrm(agent: AgentConfig): N8nWorkflow {
  const { workflowParams: p } = agent;
  const trigger: N8nNode = {
    id: "trigger", name: p.triggerLabel, type: "n8n-nodes-base.webhook", typeVersion: 2,
    position: [0, 0], parameters: { path: agent.slug, httpMethod: "POST" },
  };
  const ai = aiNode(p.aiNodeLabel, agent.systemPrompt, agent.userPromptTemplate, [300, 0]);
  const ifNode: N8nNode = {
    id: "if_node", name: "Route by result", type: "n8n-nodes-base.if", typeVersion: 2.2,
    position: [600, 0], parameters: { conditions: { options: {}, conditions: [{ leftValue: "={{ $json.aiOutput }}", rightValue: "qualified", operator: { type: "string", operation: "contains" } }] } },
  };
  const output = outputNode(p.outputChannel, p.outputLabel, [900, -100]);
  const notifyNode: N8nNode = {
    id: "notify", name: "Notify team", type: "n8n-nodes-base.slack", typeVersion: 2.2,
    position: [900, 100], parameters: { text: "={{ $json.aiOutput }}", channel: "#PLACEHOLDER-CHANNEL" },
    credentials: { slackApi: { id: "PLACEHOLDER", name: "Slack account (add your own)" } },
  };
  return {
    name: p.workflowName,
    nodes: [trigger, ai, ifNode, output, notifyNode],
    connections: {
      [trigger.name]: { main: [[{ node: ai.name, type: "main", index: 0 }]] },
      [ai.name]: { main: [[{ node: ifNode.name, type: "main", index: 0 }]] },
      [ifNode.name]: { main: [[{ node: output.name, type: "main", index: 0 }], [{ node: notifyNode.name, type: "main", index: 0 }]] },
    },
    meta: {
      instructions:
        "1. Import into n8n. 2. Point your form/webhook source at this workflow's webhook URL. 3. Set credentials on the AI, CRM and Slack nodes. 4. Adjust the IF condition to match your own classification labels. 5. Activate.",
    },
  };
}

function buildContentDraftApproval(agent: AgentConfig): N8nWorkflow {
  const { workflowParams: p } = agent;
  const trigger: N8nNode = {
    id: "trigger", name: p.triggerLabel, type: "n8n-nodes-base.webhook", typeVersion: 2,
    position: [0, 0], parameters: { path: agent.slug, httpMethod: "POST" },
  };
  const ai = aiNode(p.aiNodeLabel, agent.systemPrompt, agent.userPromptTemplate, [300, 0]);
  const approval: N8nNode = {
    id: "approval", name: "Slack approval", type: "n8n-nodes-base.slack", typeVersion: 2.2,
    position: [600, 0], parameters: { text: "={{ $json.aiOutput }}", channel: "#PLACEHOLDER-CHANNEL", otherOptions: { includeLinkToWorkflow: true } },
    credentials: { slackApi: { id: "PLACEHOLDER", name: "Slack account (add your own)" } },
  };
  const output = outputNode(p.outputChannel, p.outputLabel, [900, 0]);
  return {
    name: p.workflowName,
    nodes: [trigger, ai, approval, output],
    connections: {
      [trigger.name]: { main: [[{ node: ai.name, type: "main", index: 0 }]] },
      [ai.name]: { main: [[{ node: approval.name, type: "main", index: 0 }]] },
      [approval.name]: { main: [[{ node: output.name, type: "main", index: 0 }]] },
    },
    meta: {
      instructions:
        "1. Import into n8n. 2. Set credentials on the AI, Slack and publish nodes. 3. Wire up your own trigger source (CMS webhook, form, schedule). 4. Adjust the publish node for your actual CMS/platform. 5. Activate.",
    },
  };
}

export function buildWorkflowJson(agent: AgentConfig): N8nWorkflow {
  switch (agent.archetype) {
    case "inbound-message-response": return buildInboundMessageResponse(agent);
    case "scheduled-summary": return buildScheduledSummary(agent);
    case "form-classify-crm": return buildFormClassifyCrm(agent);
    case "content-draft-approval": return buildContentDraftApproval(agent);
  }
}
