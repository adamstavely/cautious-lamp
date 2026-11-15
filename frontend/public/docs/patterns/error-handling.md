## What a good error says

Every error message answers three questions: what happened, why (if it helps), and what the person can do next.

- Write in plain language. "We couldn't save your changes" is better than "Error 500".
- Say how to fix it: "Enter a date in the future", not "Invalid date".
- Don't blame the user, and don't joke.
- Keep technical detail (codes, request ids) available but secondary, for people who contact support.

## Where errors appear

- **Field errors** sit next to the field, are linked with `aria-describedby`, and appear when the field loses focus or on submit, not while the person is still typing.
- **Form errors** that affect the whole form appear above it, with a list of links to each field in error.
- **Page errors** (the page's data didn't load) replace the content with a message and a "Try again" action, and keep the navigation working.
- **Background errors** (a save that failed after the fact) use a persistent banner or a toast that stays until dismissed.

## Recovery

- Keep what the person typed. Never clear a form because one field was wrong.
- Offer a retry when the failure is temporary, and say when it is worth retrying.
- For permission errors, say who can grant access instead of hiding the feature.
- After a failed submit, move focus to the error summary or the first field in error.

## Accessibility

- Use `role="alert"` for errors that appear after an action, so they are announced.
- Don't rely on colour alone: pair the red border with an icon and text.
- Set `aria-invalid="true"` on fields in error.
