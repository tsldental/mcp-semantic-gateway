export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
  keywords: string[];
  requiredRoles: string[];
  schemaTokenEstimate: number;
  schema: Record<string, unknown>;
}

export interface RouteRequest {
  prompt: string;
  roles: string[];
  maxTools?: number;
  costPer1kTokensUsd?: number;
}

export interface RoutedTool {
  id: string;
  name: string;
  score: number;
  schemaTokenEstimate: number;
  matchedKeywords: string[];
  reason: string;
}

export interface RouteResult {
  prompt: string;
  roles: string[];
  totalToolsInRegistry: number;
  eligibleTools: number;
  selectedTools: RoutedTool[];
  deniedTools: Array<{ id: string; name: string; missingRoles: string[] }>;
  totalSchemaTokensAllTools: number;
  totalSchemaTokensEligibleTools: number;
  totalSchemaTokensSelectedTools: number;
  estimatedTokenSavingsVsAllTools: number;
  estimatedTokenSavingsVsEligibleTools: number;
  estimatedCostSavingsUsdVsAllTools: number;
  estimatedCostSavingsUsdVsEligibleTools: number;
  forwardedContext: {
    prompt: string;
    attachedToolSchemas: Array<{
      id: string;
      name: string;
      schemaTokenEstimate: number;
      schema: Record<string, unknown>;
    }>;
  };
}
