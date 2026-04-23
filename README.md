# mcp-semantic-gateway

`mcp-semantic-gateway` is a prototype for a policy-aware MCP gateway that **reduces schema bloat before an enterprise agent call reaches the expensive model**.

## What this repository is right now

This repository is a **runnable local MVP**, not a hosted Azure service.

Anyone can clone it, run it locally, and see the routing and cost-savings logic work on their machine. It is meant to demonstrate the product concept, not to pretend that the managed Azure version already exists.

The central idea is simple:

> If an enterprise has hundreds of MCP tools, the model should not see hundreds of tool schemas on every request.

Instead, the gateway:

1. filters the tool catalog by **policy** first
2. ranks the remaining tools by **semantic relevance**
3. forwards only the **few schemas most likely to matter**

That means fewer prompt tokens, lower inference cost, and a smaller security surface.

## Why this matters to Microsoft

Large enterprise AI systems will not fail because they lack tools.
They will fail because they expose **too many** tools to the model at once.

That creates three problems:

1. **Money gets burned on schema tokens**
2. **Tool selection gets worse as context gets noisier**
3. **Unauthorized tools stay visible longer than they should**

Microsoft already has API gateways for traditional traffic.

What is missing is a **semantic gateway for MCP tool routing** that can decide:

- which tools a user is even allowed to know about
- which tools are relevant to the current prompt
- how many prompt tokens can be saved by shrinking the tool set

## The money story

This project is intentionally framed around **cost savings**.

If a request would normally include the schemas for every internal MCP tool, the enterprise pays for all of those prompt tokens whether the model needs them or not.

This gateway prototype estimates:

- total schema tokens in the full registry
- total schema tokens after policy filtering
- total schema tokens after semantic selection
- estimated token savings
- estimated request-cost savings

The point is not just cleaner routing.

The point is:

> **stop paying to send irrelevant tool schemas to expensive models**

## What this prototype does

This MVP is intentionally narrow and measurable:

- maintains a local registry of mock MCP tools
- assigns each tool:
  - required roles
  - semantic keywords
  - approximate schema token size
- accepts a prompt plus user roles
- removes tools the user should not see
- ranks the remaining tools by simple semantic matching
- returns only the top few tool schemas
- estimates the token and dollar savings from not attaching the rest

## Why policy comes first

The safest version of this idea is:

1. **Policy filter first**
2. **Semantic ranking second**

That means security is deterministic.

If a user lacks the `hr` role, the HR tool is removed before the semantic router even runs.
The model never sees that schema.

This is important because the right enterprise story is not:

> “AI decides everything.”

It is:

> “Policy decides what is eligible. Semantic routing decides what is relevant.”

## Example scenario

Prompt:

```text
Check the telemetry logs for the East Coast database and text me the error rate.
```

Roles:

```json
["ops", "sre", "messaging", "data"]
```

Likely selected tools:

- `log-analytics-query`
- `sql-east-coast-database`
- `twilio-send-sms`

Likely denied tools:

- `hr-employee-record`
- `finance-revenue-report`
- `crm-customer-account`

The result is that the model sees **3 schemas instead of 10+**, which is exactly where the savings come from.

## Quick start

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

The server starts on:

```text
http://localhost:4000
```

## API

### `GET /healthz`

Simple health check.

### `GET /tools`

Returns the mock MCP tool registry, required roles, and schema token estimates.

### `POST /route`

Request body:

```json
{
  "prompt": "Check telemetry logs for the East Coast database and text me the error rate",
  "roles": ["ops", "sre", "messaging", "data"],
  "maxTools": 3,
  "costPer1kTokensUsd": 0.003
}
```

Example response shape:

```json
{
  "prompt": "Check telemetry logs for the East Coast database and text me the error rate",
  "roles": ["ops", "sre", "messaging", "data"],
  "totalToolsInRegistry": 10,
  "eligibleTools": 4,
  "selectedTools": [
    {
      "id": "log-analytics-query",
      "name": "Log Analytics Query",
      "score": 3,
      "schemaTokenEstimate": 540,
      "matchedKeywords": ["logs", "telemetry", "error rate"],
      "reason": "Matched keywords: logs, telemetry, error rate"
    }
  ],
  "estimatedTokenSavingsVsAllTools": 3200,
  "estimatedCostSavingsUsdVsAllTools": 0.0096
}
```

## Why this can become a real Azure product

The production version of this concept could evolve into:

- an MCP tool registry
- an Entra-aware policy layer
- a semantic ranking engine
- a schema reduction layer
- a premium Azure middleware service for enterprise agent routing

The MVP here is local and simple on purpose, but the product direction is large:

> **reduce tool-schema cost, reduce model confusion, and reduce unnecessary tool exposure**

## Current limitations

This prototype uses:

- mock tools
- simple keyword matching
- rough schema token estimates

It does **not** yet use:

- embeddings
- vector search
- real MCP upstream servers
- Microsoft Entra integration
- a hosted Azure control plane

That is fine for the prototype.

The purpose of this repo is to prove the economics and routing model first.

## Scripts

- `npm run build`
- `npm start`
- `npm test`
