# Intelify - AI Workflow Studio

A full stack, multi-agent content pipeline with a dark operations dashboard.

The system accepts user input, generates structured content with OpenRouter, runs a compliance pass with web evidence, calculates a trust score, and returns a full workflow trace. The frontend presents real-time execution states, streaming output, and saved workflow history.

## Core Capabilities

- Content generation agent using OpenRouter chat completions
- Compliance agent that:
  - extracts factual claims
  - verifies claims with LangSearch evidence + LLM classification
  - computes normalized trust score
- Orchestrated pipeline with step logs
- Debug endpoint for search verification
- Dashboard with:
  - run pipeline action
  - live streaming output
  - agent state transitions
  - workflow library with trace modal
  - Supabase auth and workflow persistence

## Tech Stack

- Backend: FastAPI, Requests, python-dotenv
- Frontend: Vite-served HTML + Tailwind CDN + Vanilla JavaScript
- Auth and persistence: Supabase (Google OAuth + `workflows` table)
- LLM provider: OpenRouter
- Web evidence: LangSearch

## Project Structure

```text
backend/
  agents/
    orchestrator.py
  routes/
    process.py
    debug.py
  services/
    llm.py
    compliance.py
    search.py
  main.py
  requirements.txt

frontend/
  index.html
  package.json
```

## Backend Flow

`POST /process` executes:

1. `content_agent` -> `generate_content(input_text)`
2. `compliance_agent` -> `run_compliance_check(generated_content)`
3. returns:
   - `generated_content`
   - `compliance` (`claims`, `trust_score`)
   - `logs` (agent execution metadata)

## API Contract

### `POST /process`

Request:

```json
{
  "text": "AI is changing marketing and automation workflows"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "generated_content": "....",
    "compliance": {
      "claims": [
        {
          "text": "....",
          "status": "SUPPORTED",
          "reason": "....",
          "evidence": [
            {
              "title": "....",
              "url": "....",
              "summary": "...."
            }
          ]
        }
      ],
      "trust_score": 0.72
    },
    "logs": [
      {
        "agent": "content_agent",
        "input": "....",
        "output": "...."
      },
      {
        "agent": "compliance_agent",
        "input": "....",
        "output": {
          "claims": [],
          "trust_score": 0.0
        }
      }
    ]
  }
}
```

### `GET /debug/test-search`

Quick validation route for LangSearch integration.

Response includes query, result count, and normalized search results.

## Environment Variables

Create `backend/.env`:

```env
OPENROUTER_API_KEY=
LANGSEARCH_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
```

Create `frontend/.env` (if needed for local references):

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

Notes:

- Backend reads env via `python-dotenv`.
- Never commit real keys.
- The frontend dashboard currently calls `http://127.0.0.1:8000/process` directly in `index.html`.

## Supabase Requirements

### Authentication

- Enable Google provider in Supabase Auth.
- Add your local origin to allowed URLs in Supabase Auth settings.

### Table

Create a `workflows` table with at least:

- `id` (uuid, primary key, default)
- `user_id` (uuid)
- `prompt` (text)
- `output` (text)
- `trust_score` (float8)
- `created_at` (timestamptz, default now)

Optional but supported by UI:

- `trace` (text or json/jsonb)

If `trace` is missing, inserts gracefully fall back without trace payload.

## Local Development

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

- `http://127.0.0.1:8000`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

- `http://localhost:5173`

## Verification Checklist

1. Open frontend and sign in with Google.
2. Enter prompt and run pipeline.
3. Confirm:
   - streaming output appears progressively
   - agent states move `IDLE -> RUNNING -> DONE`
   - trust score and claims render
   - success toast appears
4. Open Workflows tab and confirm saved items are listed.
5. Click a workflow card to open trace modal.
6. Test search health:
   - `GET http://127.0.0.1:8000/debug/test-search`

## Operational Notes

- CORS is currently open (`allow_origins=["*"]`) for development speed.
- Compliance confidence is heuristic and bounded to `0.0..1.0`.
- The search service logs request and raw response for debugging in current implementation.
- Error handling returns clean fallback states for agent verification failures.

## Roadmap

- Move frontend from static `index.html` runtime to componentized React runtime
- Replace Tailwind CDN usage with build-time Tailwind pipeline
- Add structured server-side logging and request correlation IDs
- Add tests for service adapters and orchestrator flow
