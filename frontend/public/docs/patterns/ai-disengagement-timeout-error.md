## Timeouts

Some AI requests take too long or never finish. Plan for both.

- Set a time limit for each kind of request, and tell the person what happens when it's reached.
- When the limit is reached, keep any partial answer, say it is incomplete, and offer to continue or retry.
- Don't retry silently in a loop; one automatic retry is enough, then let the person decide.
- Explain the likely cause in plain words ("The service is busy" or "This request is very large") when you know it.

## Disengagement

People switch tabs, walk away or close the window while an AI works.

- Keep long tasks running in the background when that's safe, and show the result when they return.
- Tell them where to find the result ("We'll put the report in Recent").
- If a task needs input to continue, pause it and say what is needed, instead of guessing.
- For sessions that expire, warn before signing out and keep the conversation so nothing is lost.

## Errors

- Separate "the AI couldn't answer this" from "the service failed"; the first needs a better question, the second needs a retry.
- Keep the person's request in the input after a failure, so they can resend or edit it.
- Never show a made-up answer to hide an error.

## Accessibility

- Announce timeouts and failures with `role="alert"`.
- Give warnings before a session ends enough time to respond, and a way to extend it (WCAG 2.2.1).
- Make retry and cancel controls keyboard accessible and clearly labelled.
