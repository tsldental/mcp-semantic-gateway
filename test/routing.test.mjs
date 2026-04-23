import assert from "node:assert/strict";
import test from "node:test";

import { routePrompt } from "../dist/routing.js";

test("routePrompt filters tools by role and trims schemas to relevant tools", () => {
  const result = routePrompt({
    prompt: "Check telemetry logs for the East Coast database and text me the error rate",
    roles: ["ops", "sre", "messaging", "data"],
    maxTools: 3,
  });

  assert.equal(result.totalToolsInRegistry >= 10, true);
  assert.equal(result.selectedTools.length > 0, true);
  assert.equal(result.selectedTools.some((tool) => tool.id === "log-analytics-query"), true);
  assert.equal(result.selectedTools.some((tool) => tool.id === "twilio-send-sms"), true);
  assert.equal(result.selectedTools.some((tool) => tool.id === "sql-east-coast-database"), true);
  assert.equal(result.deniedTools.some((tool) => tool.id === "hr-employee-record"), true);
  assert.equal(result.estimatedTokenSavingsVsAllTools > 0, true);
  assert.equal(result.estimatedCostSavingsUsdVsAllTools > 0, true);
});
