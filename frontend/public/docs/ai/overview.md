## Designing AI features with the design system

AI features change how an interface behaves: answers take time to arrive, differ from one request to the next, and can be wrong while sounding sure. People need to know when they are dealing with AI, what it can do, how far to trust it, and how to stay in control. The AI guidance covers how to design for that using the same components, tokens and accessibility standards as the rest of the product.

The guidance has four parts:

- **[Components](/ai/components)**: the building blocks most AI interfaces need (prompt input, suggested prompts, responses, sources, feedback, loading and error states) and which design system components to build each from.
- **[Patterns](/ai/patterns)**: how those building blocks fit together in common AI interactions, such as thinking states, onboarding, disengagement and errors, and multi-agent work.
- **[AI tokens](/tokens/ai-builder)**: tokens for agent identity, confidence, explainability and other AI states.
- **Guidelines**: the principles behind both, listed below.

## Guidelines

### Kinds of AI experience

- [Designing for generative AI](/guidelines/ai/designing-for-generative-ai): interfaces that create text, images and other content.
- [Designing for agentic experiences](/guidelines/ai/designing-for-agentic-experiences): agents that act on someone's behalf.
- [Designing for MCP UI](/guidelines/ai/designing-for-mcp-ui): interfaces that work with Model Context Protocol tools and resources.
- [Human-machine teaming](/guidelines/ai/human-machine-teaming): people and AI working on a task together.

### The agent people talk to

- [Agent roles and mental models](/guidelines/ai/agent-roles-mental-models): the roles an agent can take and what people expect of each.
- [Identity and persona](/guidelines/ai/identity-persona): a consistent, honest identity for an AI agent.
- [Memory and personalisation](/guidelines/ai/memory-personalization): using what an agent remembers while respecting privacy.

### Trust, safety and recovery

- [Feedback and observability](/guidelines/ai/feedback-observability): showing what the system is doing and why.
- [Safe exploration](/guidelines/ai/safe-exploration): letting people experiment without harmful or irreversible results.
- [Fallback and error states](/guidelines/ai/fallback-error-states): what to do when the AI is slow, unsure, wrong or unavailable.
- [Content and microcopy](/guidelines/ai/content-microcopy): writing the words around AI features.

## Principles that apply everywhere

- **Say when it's AI.** Label generated content and agent actions, so people can judge them accordingly.
- **Keep people in control.** Let them review, edit, undo or stop what the AI does, and ask before anything that can't be undone.
- **Show your sources and limits.** Point to where an answer came from, and say plainly what the feature can't do.
- **Fail honestly.** When the AI is unavailable or unsure, say so and offer a way forward. Never fill the gap with made-up results.
- **Build from the system.** Use the design system's components and tokens, so AI features are accessible and look like the rest of the product.

## AI in this platform

The platform's own AI features follow this guidance:

- **Eero**, the design system assistant, answers questions about the design system; open it from the top bar.
- **[AI suggestions](/ai-suggestions)** reviews a piece of code against the design system and suggests components and accessibility fixes.
- **[Alt text generator](/tools/alt-text-generator)** drafts alt text for an image for you to review.

They use the Claude API. When the server has no Claude API key, they say they aren't set up rather than showing sample answers.
