## Building AI interfaces from the design system

AI features don't need a separate component library. An AI interface is made of the same parts as any other: text fields, buttons, alerts, cards, tags and loading indicators, arranged for a conversation or a generated result. Building from the design system's [components](/components) keeps AI features accessible, consistent with the rest of the product and maintained in one place.

This page describes the building blocks that most AI interfaces need, what each must do, and which components and patterns to build it from.

## The building blocks

### Prompt input (composer)

Where people type or dictate a request.

- Build from a **text area** with a visible label, plus a **primary button** to send. Enter to send and Shift+Enter for a new line is a common convention; say so in the hint text.
- Keep the label visible; placeholder text disappears and is not a label.
- Show limits (length, file types) before people hit them, and explain any that are reached in text.
- Disable sending while a request is in progress, or turn the send button into a stop button.
- Don't clear what people typed if sending fails.

### Suggested prompts

Starting points for a blank conversation or follow-ups after an answer.

- Build from **buttons** (secondary or ghost) or **chips**. Each one fills or sends a complete, realistic request.
- Keep them few (three or four) and specific to the person's context.
- See [Empty and loading states](/guidelines/patterns/empty-loading-states).

### Response

The AI's answer, in a message list or a result panel.

- Render generated text as structured content (headings, lists, links), sanitized before display.
- Label the response as AI-generated. A short, consistent label with an icon works better than a long disclaimer on every message.
- In a conversation, use a list with each message's author identified for screen readers, and keep the reading order chronological.
- Make text selectable and copyable.

### Progress and streaming

What people see between sending and the complete answer.

- Use a **loading indicator** with a text label that says what is happening ("Searching policy documents…"), not just an animation.
- Announce the start and end of a response to screen readers with a polite live region. Don't announce every streamed word.
- Offer **Stop** for long responses.
- See [AI thinking states](/guidelines/patterns/ai-thinking-states).

### Sources and citations

Links to the material an answer is based on.

- Build from **links** or **cards** that show the source title and where it comes from. Place citations next to the statement they support.
- Make it clear when an answer has no source.
- Open sources so people can check them, and prefer authoritative agency content.

### Feedback controls

How people say whether a response helped.

- Build from **icon buttons** with accessible names ("Helpful", "Not helpful") and a pressed state.
- Optionally follow with a short form asking what went wrong. Keep it optional.
- Tell people what feedback is used for. See [Feedback and observability](/guidelines/ai/feedback-observability).

### Actions on results

Copy, edit, regenerate, insert into a document, or apply a suggested change.

- Build from **buttons** grouped near the result.
- Require confirmation in a **dialog** before an action with consequences (sending, submitting, deleting), and show what will happen.
- Support undo where possible.

### Notices and disclaimers

Telling people the limits of the feature and how their data is handled.

- Build from **alerts** (informational tone) or short inline text. Put the important part first and link to more detail.
- Show privacy and data-use information before people share anything, not after.
- Use [content and microcopy guidance](/guidelines/ai/content-microcopy) for wording.

### Errors and fallbacks

What people see when a request fails or the answer can't be trusted.

- Build from **alerts** with a clear message and a next step: retry, rephrase, or use another route to the service.
- Keep the person's request so they don't have to retype it.
- See [Error handling](/guidelines/patterns/error-handling) and [Fallback and error states](/guidelines/ai/fallback-error-states).

### Handoff to a person

A way to reach a human when the AI can't help.

- Build from a **link** or **button** that is always available, not only after several failures.
- Pass the context along so people don't have to start again.

### Memory and history controls

What the AI remembers between sessions.

- Show what is stored, and let people view, edit and delete it.
- Build from **lists**, **switches** and **buttons**, with confirmation before deleting.
- See [Memory and personalization](/guidelines/ai/memory-personalization).

## Accessibility requirements

AI interfaces must meet the same standard as the rest of the product (WCAG 2.2 AA). Points that are easy to miss:

- Streaming text must not move focus or interrupt screen reader users mid-sentence.
- Every icon-only control (copy, feedback, stop) needs an accessible name.
- Generated content must use real headings, lists and links, not visual formatting alone.
- People must be able to complete the task without the AI feature.
- Time limits on sessions need a warning and a way to extend.

See [Accessibility](/hcd/accessibility).

## Related guidance

- [AI patterns](/ai/patterns): how these blocks fit together in common AI interactions.
- [Designing for generative AI](/guidelines/ai/designing-for-generative-ai)
- [Designing for agentic experiences](/guidelines/ai/designing-for-agentic-experiences)
- [Human-machine teaming](/guidelines/ai/human-machine-teaming)
- [Forms](/patterns/forms) and [Feedback](/patterns/feedback) patterns
