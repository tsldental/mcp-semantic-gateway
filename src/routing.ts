import { TOOL_REGISTRY } from "./toolRegistry";
import type { RouteRequest, RouteResult, RoutedTool, ToolDefinition } from "./types";

const DEFAULT_MAX_TOOLS = 3;
const DEFAULT_COST_PER_1K_TOKENS_USD = 0.003;

export function routePrompt(input: RouteRequest): RouteResult {
  const prompt = input.prompt.trim();
  const roles = normalizeRoles(input.roles);
  const maxTools = Math.max(1, Math.min(input.maxTools ?? DEFAULT_MAX_TOOLS, 10));
  const costPer1kTokensUsd = input.costPer1kTokensUsd ?? DEFAULT_COST_PER_1K_TOKENS_USD;

  const deniedTools = TOOL_REGISTRY.filter((tool) => !hasRequiredRoles(tool, roles)).map((tool) => ({
    id: tool.id,
    name: tool.name,
    missingRoles: tool.requiredRoles.filter((role) => !roles.includes(role)),
  }));

  const eligibleTools = TOOL_REGISTRY.filter((tool) => hasRequiredRoles(tool, roles));
  const selectedTools = eligibleTools
    .map((tool) => scoreTool(tool, prompt))
    .filter((tool) => tool.score > 0)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .slice(0, maxTools);

  const fallbackSelection =
    selectedTools.length > 0
      ? selectedTools
      : eligibleTools
          .slice()
          .sort((left, right) => left.schemaTokenEstimate - right.schemaTokenEstimate)
          .slice(0, Math.min(maxTools, eligibleTools.length))
          .map((tool) => ({
            id: tool.id,
            name: tool.name,
            score: 0.1,
            schemaTokenEstimate: tool.schemaTokenEstimate,
            matchedKeywords: [],
            reason: "Low-confidence fallback set chosen from policy-eligible tools.",
          }));

  const totalSchemaTokensAllTools = sumTokens(TOOL_REGISTRY);
  const totalSchemaTokensEligibleTools = sumTokens(eligibleTools);
  const totalSchemaTokensSelectedTools = fallbackSelection.reduce(
    (total, tool) => total + tool.schemaTokenEstimate,
    0,
  );

  return {
    prompt,
    roles,
    totalToolsInRegistry: TOOL_REGISTRY.length,
    eligibleTools: eligibleTools.length,
    selectedTools: fallbackSelection,
    deniedTools,
    totalSchemaTokensAllTools,
    totalSchemaTokensEligibleTools,
    totalSchemaTokensSelectedTools,
    estimatedTokenSavingsVsAllTools: totalSchemaTokensAllTools - totalSchemaTokensSelectedTools,
    estimatedTokenSavingsVsEligibleTools:
      totalSchemaTokensEligibleTools - totalSchemaTokensSelectedTools,
    estimatedCostSavingsUsdVsAllTools: estimateCostSavings(
      totalSchemaTokensAllTools - totalSchemaTokensSelectedTools,
      costPer1kTokensUsd,
    ),
    estimatedCostSavingsUsdVsEligibleTools: estimateCostSavings(
      totalSchemaTokensEligibleTools - totalSchemaTokensSelectedTools,
      costPer1kTokensUsd,
    ),
    forwardedContext: {
      prompt,
      attachedToolSchemas: fallbackSelection.map((tool) => {
        const fullTool = TOOL_REGISTRY.find((candidate) => candidate.id === tool.id);
        if (!fullTool) {
          throw new Error(`Missing tool definition for ${tool.id}`);
        }

        return {
          id: fullTool.id,
          name: fullTool.name,
          schemaTokenEstimate: fullTool.schemaTokenEstimate,
          schema: fullTool.schema,
        };
      }),
    },
  };
}

function scoreTool(tool: ToolDefinition, prompt: string): RoutedTool {
  const normalizedPrompt = prompt.toLowerCase();
  const matchedKeywords = tool.keywords.filter((keyword) => normalizedPrompt.includes(keyword));
  const score = matchedKeywords.length + tool.tags.filter((tag) => normalizedPrompt.includes(tag)).length * 0.5;

  return {
    id: tool.id,
    name: tool.name,
    score,
    schemaTokenEstimate: tool.schemaTokenEstimate,
    matchedKeywords,
    reason:
      matchedKeywords.length > 0
        ? `Matched keywords: ${matchedKeywords.join(", ")}`
        : "Eligible by policy but no direct semantic match.",
  };
}

function hasRequiredRoles(tool: ToolDefinition, roles: string[]): boolean {
  return tool.requiredRoles.every((role) => roles.includes(role));
}

function normalizeRoles(roles: string[]): string[] {
  return [...new Set(roles.map((role) => role.trim().toLowerCase()).filter(Boolean))];
}

function sumTokens(tools: Array<Pick<ToolDefinition, "schemaTokenEstimate">>): number {
  return tools.reduce((total, tool) => total + tool.schemaTokenEstimate, 0);
}

function estimateCostSavings(tokenCount: number, costPer1kTokensUsd: number): number {
  return Number(((tokenCount / 1000) * costPer1kTokensUsd).toFixed(4));
}
