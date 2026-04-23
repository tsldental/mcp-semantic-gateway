import express from "express";
import { routePrompt } from "./routing";
import { TOOL_REGISTRY } from "./toolRegistry";
import type { RouteRequest } from "./types";

const app = express();
const port = Number(process.env.PORT ?? "4000");

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/tools", (_req, res) => {
  res.json({
    totalTools: TOOL_REGISTRY.length,
    tools: TOOL_REGISTRY.map((tool) => ({
      id: tool.id,
      name: tool.name,
      requiredRoles: tool.requiredRoles,
      schemaTokenEstimate: tool.schemaTokenEstimate,
      keywords: tool.keywords,
    })),
  });
});

app.post("/route", (req, res) => {
  const body = req.body as Partial<RouteRequest>;

  if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) {
    res.status(400).json({
      error: "invalid_request",
      message: "prompt is required.",
    });
    return;
  }

  if (!Array.isArray(body.roles)) {
    res.status(400).json({
      error: "invalid_request",
      message: "roles must be an array of strings.",
    });
    return;
  }

  const result = routePrompt({
    prompt: body.prompt,
    roles: body.roles.filter((role): role is string => typeof role === "string"),
    maxTools: typeof body.maxTools === "number" ? body.maxTools : undefined,
    costPer1kTokensUsd:
      typeof body.costPer1kTokensUsd === "number" ? body.costPer1kTokensUsd : undefined,
  });

  res.json(result);
});

app.listen(port, () => {
  console.log(`MCP Semantic Gateway listening on http://localhost:${port}`);
});
