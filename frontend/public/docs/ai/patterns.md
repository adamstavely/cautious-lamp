## About these patterns

AI features behave differently from the rest of an interface: answers take time to arrive, vary from one request to the next, and can be wrong in confident-sounding ways. These patterns describe how to design for that, so people stay informed, in control and able to check what the system tells them.

Each pattern below links to its full page. Start with the foundations, then use the patterns that match the feature you are building.

## Foundations for every AI feature

These apply whatever the feature does.

- **Say when AI is involved.** Label AI-generated content and AI-driven actions clearly and consistently, so people can decide how much to rely on them.
- **Keep people in control.** Let people review, edit, undo or reject what the AI produces, and require confirmation before it takes actions with consequences (submitting, sending, deleting, paying).
- **Show the basis for answers.** Link to sources, show what data was used, and make it easy to verify.
- **Be honest about limits.** Say what the feature can't do, and say so when it doesn't know rather than guessing.
- **Offer a path that doesn't use AI.** People must be able to get the service another way, including people for whom an AI interface is not accessible or appropriate.
- **Protect privacy.** Tell people what is kept, for how long and why, and let them see and delete it.
- **Design for failure.** Plan what people see when the model is slow, unavailable or returns something unusable.

Agency teams should also follow their agency's AI policy and current OMB guidance on federal use of AI, and can use the NIST AI Risk Management Framework (AI RMF 1.0) and its Generative AI Profile (NIST AI 600-1) to identify and manage risks.

## Interaction patterns

### AI thinking states

How to show that the AI is working: progress, what it is doing, how long it might take, and how to stop it. Prevents people from abandoning a request or submitting it twice.
[Read AI thinking states](/guidelines/patterns/ai-thinking-states)

### Agent-oriented onboarding

How to introduce people to what an AI agent can do, set expectations about its limits, and get them to a first successful result.
[Read agent-oriented onboarding](/guidelines/patterns/agent-oriented-onboarding)

### AI disengagement, timeout and error

What to do when a request times out, the person walks away mid-task or the service fails: save work, explain what happened and offer a way to continue.
[Read AI disengagement, timeout and error](/guidelines/patterns/ai-disengagement-timeout-error)

### Multi-agent orchestration

How to present work done by several agents together: who is doing what, how their results combine, and where a person needs to decide.
[Read multi-agent orchestration](/guidelines/patterns/multi-agent-orchestration)

## General patterns that matter most for AI

- [Empty and loading states](/guidelines/patterns/empty-loading-states): starting points and suggested prompts for a blank conversation; loading feedback while results stream in.
- [Error handling](/guidelines/patterns/error-handling): clear, recoverable errors when a request fails.
- [New features and experiences](/guidelines/patterns/new-features-experiences): introducing an AI feature to people who already know the product.

## AI design guidance

Deeper guidance on designing AI experiences:

| Topic | Covers |
| --- | --- |
| [Designing for generative AI](/guidelines/ai/designing-for-generative-ai) | Interfaces that create text, images and other content |
| [Designing for agentic experiences](/guidelines/ai/designing-for-agentic-experiences) | Agents that act on a person's behalf |
| [Human-machine teaming](/guidelines/ai/human-machine-teaming) | Dividing work between people and AI |
| [Agent roles and mental models](/guidelines/ai/agent-roles-mental-models) | How people understand what an agent is and does |
| [Identity and persona](/guidelines/ai/identity-persona) | How an AI presents itself, and why to be careful with human-like personas |
| [Content and microcopy](/guidelines/ai/content-microcopy) | Writing labels, prompts, disclaimers and responses |
| [Feedback and observability](/guidelines/ai/feedback-observability) | Showing system status and collecting feedback |
| [Fallback and error states](/guidelines/ai/fallback-error-states) | Graceful failure |
| [Memory and personalization](/guidelines/ai/memory-personalization) | What the AI remembers, and the controls people need |
| [Safe exploration](/guidelines/ai/safe-exploration) | Letting people try things without harmful consequences |
| [Designing for MCP UI](/guidelines/ai/designing-for-mcp-ui) | Interfaces built on the Model Context Protocol |

## Choosing a pattern

| If your feature… | Start with |
| --- | --- |
| Takes more than a second or two to respond | AI thinking states |
| Is new to the people who will use it | Agent-oriented onboarding, New features and experiences |
| Can time out, or runs long tasks people may leave | AI disengagement, timeout and error |
| Uses several agents or tools in one task | Multi-agent orchestration |
| Takes actions for the person | Designing for agentic experiences, Human-machine teaming |
| Generates content people will publish or rely on | Designing for generative AI, Feedback and observability |

## Building AI features with the design system

Build AI interfaces from the same components as the rest of the product, so they are accessible and consistent. [AI components](/ai/components) describes the building blocks of an AI interface and how to make each one from the design system.
