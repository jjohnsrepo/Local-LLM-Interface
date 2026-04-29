# justinGPT

A one-off side project. Using the LM Studio API, I built this so I can interact with my local models in a weirdly custom environment.

Hand-coded, minimal AI assistance.

## What it does

- Lists the models available in LM Studio and lets you pick one
- Sends prompts to the local `/api/v1/chat` endpoint and renders the reply
- Keeps conversation context via `previous_response_id`
- Copy-to-clipboard on each response
- Unload the active model when you're done

## Stack

Plain HTML, CSS, and JS. No framework, no build step.

## Running it

1. Start LM Studio and enable the local server (default `http://127.0.0.1:1234`).
2. Load at least one model so it shows up in `/api/v1/models`.
3. Open `index.html` in a browser.
