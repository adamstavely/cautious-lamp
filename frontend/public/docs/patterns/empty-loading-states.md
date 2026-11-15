## Empty states

An empty state is the first thing many people see in a new feature. Use it to explain what will appear here and how to get started.

- Say what the area is for in one sentence ("Projects you create or join appear here").
- Offer the one action that fills it ("Create a project"), and only that action.
- Tell apart "nothing yet", "nothing matches your filters" and "you don't have access"; each needs a different way out.
- When a search or filter returns nothing, show what was searched for and a way to clear it.
- Never fill an empty area with sample records that look real.

## Loading states

People tolerate waiting when they can see that something is happening and roughly how long it will take.

- Show nothing for the first few hundred milliseconds; a spinner that flashes for an instant feels slower than none.
- Use a skeleton that matches the layout for content that arrives in one go, and a spinner for short actions.
- Use a progress bar with a real percentage for long operations such as uploads and exports.
- Keep the page usable while one part loads, and keep what was already on screen instead of blanking it.
- Disable the button that started an action while it runs, so it can't be sent twice.

## Accessibility

- Announce that content is loading with `role="status"`, and announce again when it has arrived.
- Mark a region that is updating with `aria-busy="true"`.
- Respect reduced motion: replace shimmering skeletons with a still placeholder.
- Give loading indicators a text label ("Loading projects…"), not only an animation.
