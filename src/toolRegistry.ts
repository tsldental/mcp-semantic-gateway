import type { ToolDefinition } from "./types";

export const TOOL_REGISTRY: ToolDefinition[] = [
  buildTool("log-analytics-query", "Log Analytics Query", ["ops", "sre"], 540, [
    "logs",
    "telemetry",
    "errors",
    "error rate",
    "kusto",
    "database",
  ]),
  buildTool("incident-open", "Incident Management", ["ops", "sre"], 430, [
    "incident",
    "sev",
    "page",
    "outage",
    "on-call",
  ]),
  buildTool("twilio-send-sms", "Twilio SMS", ["messaging", "ops"], 280, [
    "text",
    "sms",
    "message",
    "notify",
    "phone",
  ]),
  buildTool("teams-send-message", "Teams Notification", ["messaging"], 310, [
    "teams",
    "message",
    "channel",
    "notify",
  ]),
  buildTool("hr-employee-record", "HR Employee Record", ["hr"], 600, [
    "employee",
    "salary",
    "promotion",
    "manager",
    "hr",
  ]),
  buildTool("finance-revenue-report", "Finance Revenue Report", ["finance"], 620, [
    "revenue",
    "finance",
    "budget",
    "forecast",
    "spend",
  ]),
  buildTool("crm-customer-account", "CRM Customer Account", ["sales"], 510, [
    "customer",
    "account",
    "opportunity",
    "deal",
    "sales",
  ]),
  buildTool("sql-east-coast-database", "East Coast Database", ["ops", "data"], 560, [
    "east coast",
    "database",
    "sql",
    "replica",
    "latency",
  ]),
  buildTool("billing-cost-analyzer", "Cloud Cost Analyzer", ["finance", "ops"], 470, [
    "cost",
    "spend",
    "billing",
    "savings",
    "azure",
  ]),
  buildTool("knowledge-search", "Enterprise Knowledge Search", ["employee"], 350, [
    "search",
    "wiki",
    "docs",
    "knowledge",
    "policy",
  ]),
];

function buildTool(
  id: string,
  name: string,
  requiredRoles: string[],
  schemaTokenEstimate: number,
  keywords: string[],
): ToolDefinition {
  return {
    id,
    name,
    description: `${name} MCP tool`,
    tags: keywords.slice(0, 3),
    keywords,
    requiredRoles,
    schemaTokenEstimate,
    schema: {
      type: "object",
      title: name,
      description: `${name} tool schema placeholder for routing demos.`,
      properties: {
        query: {
          type: "string",
          description: "Input query or command for the selected tool.",
        },
      },
      required: ["query"],
    },
  };
}
