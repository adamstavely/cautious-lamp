## Show that work has started

As soon as the request is sent, acknowledge it. Silence after pressing send reads as failure.

- Show the person's message immediately, then a working indicator where the answer will appear.
- Keep the input usable for a follow-up, or explain why it is disabled.
- Offer a "Stop" control while the AI is working.

## Say what is happening

For anything longer than a few seconds, a generic spinner isn't enough.

- Describe the current step in plain words ("Searching your documents", "Reading 4 sources").
- Show steps as they complete, so progress is visible even without a percentage.
- Stream the answer as it is written when the model supports it, so people can start reading.
- If you show the model's reasoning, label it as such and keep it collapsible.

## When it takes too long

- Set an expectation for long tasks ("This usually takes about a minute").
- After a time limit, say so and offer to keep waiting, retry or cancel. See [AI timeouts and disengagement](/guidelines/patterns/ai-disengagement-timeout-error).

## Accessibility

- Announce the working state and the finished answer through a polite live region (`role="status"`), not every streamed word.
- Mark the answer area with `aria-busy="true"` while it streams.
- Respect reduced motion: replace pulsing or typing animations with a static indicator and text.
