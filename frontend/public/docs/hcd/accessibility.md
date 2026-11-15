## Why accessibility matters

About one in four adults in the United States reports having a disability, and almost everyone has a temporary or situational limitation at some point: a broken arm, bright sunlight on a screen, a noisy room. Accessible products work for all of them. For a government agency it is also the law: the public has a right to equal access to our information and services, and our staff have a right to accessible tools.

Accessibility is part of human-centered design, not a separate check at the end. It is cheapest when built in from the start.

## The requirements

- **Section 508 of the Rehabilitation Act** requires federal agencies to make the information and communication technology they develop, buy, maintain or use accessible to people with disabilities, both members of the public and federal employees. The Revised 508 Standards incorporate WCAG 2.0 Level A and AA success criteria by reference.
- **WCAG 2.2** (Web Content Accessibility Guidelines, W3C, 2023) is the current version of the standard and adds criteria that matter for mobile and cognitive accessibility, such as minimum target size, focus not obscured, accessible authentication and redundant entry. **Products using this design system aim for WCAG 2.2 Level AA**, which also satisfies the 2.0 AA criteria that Section 508 references.
- **The 21st Century Integrated Digital Experience Act** requires agency websites and digital services to be accessible.
- Agency policy may add requirements, such as an accessibility conformance report (ACR) for purchased products. Ask your Section 508 program manager.

## The four principles (POUR)

WCAG is organized around four principles. Content must be:

| Principle | Means | Examples |
| --- | --- | --- |
| **Perceivable** | People can see or hear it in some form | Text alternatives for images, captions and transcripts, sufficient contrast, content that reflows at 400% zoom |
| **Operable** | People can use it with the input they have | Everything works by keyboard, visible focus, enough time, no flashing, targets big enough to hit |
| **Understandable** | People can understand content and how it behaves | Plain language, consistent navigation, clear labels and error messages, no unexpected changes of context |
| **Robust** | It works with assistive technology, now and later | Valid, semantic HTML; correct names, roles and states for custom controls |

## Designing accessibly

- **Contrast.** Text needs a contrast ratio of at least 4.5:1 (3:1 for large text); icons, focus indicators and control borders at least 3:1. Check with the [color contrast checker](/tools/color-contrast). See [Color contrast](/guidelines/color-contrast).
- **Don't rely on color alone.** Pair color with text, icons or patterns for status, errors and chart series.
- **Focus.** Design a visible focus state for every interactive element. See [Focus](/guidelines/focus).
- **Target size.** Make targets at least 24 by 24 CSS pixels (WCAG 2.2), and larger for primary actions on touch screens.
- **Text.** Use real text, not images of text; support resizing and reflow. See [Text and graphics](/guidelines/text-graphics).
- **Motion and flashing.** Avoid flashing content and respect the user's reduced-motion setting. See [Flashing](/guidelines/flashing) and [Multimedia and animation](/guidelines/multimedia-animation).
- **Forms.** Every field needs a visible label. Explain errors in text next to the field and say how to fix them. Don't ask for the same information twice.
- **Time limits.** Warn before a session times out and let people extend it. See [Time](/guidelines/time).
- **Content.** Write in plain language, use headings that describe the content, and write link text that makes sense on its own.

## Building accessibly

- **Use the design system components.** They are built with keyboard support, focus management and accessible names; changing their markup can break that.
- **Use semantic HTML first.** A `<button>` is accessible by default; a clickable `<div>` is not. Use ARIA only when HTML can't express what you need, and follow the ARIA Authoring Practices for custom widgets.
- **Structure.** One `h1` per page, headings in order, landmarks (`header`, `nav`, `main`, `footer`), lists for lists and tables for tabular data.
- **Keyboard.** Every action works with a keyboard alone, in a logical order, with no keyboard traps. See [Keyboard and gestures](/guidelines/keyboard-gestures).
- **Dynamic content.** Announce important updates (form errors, search results, saved changes) with a live region, and move focus deliberately when opening and closing dialogs.
- **Images.** Give informative images alt text that conveys their purpose, and decorative images an empty `alt`. The [alt text generator](/tools/alt-text-generator) can help draft it; always review the result.
- **Media.** Provide captions for video, transcripts for audio and audio description where visual information isn't spoken.

## Testing

No single test is enough. Combine:

1. **Automated checks** in development and continuous integration. They are fast but find only some kinds of problems.
2. **Manual checks:** keyboard-only use, zoom to 200% and 400%, reflow at 320 pixels wide, high-contrast modes, and reduced motion.
3. **Screen reader testing** with the common combinations: JAWS and NVDA with Chrome or Edge on Windows, VoiceOver with Safari on macOS and iOS, and TalkBack with Chrome on Android.
4. **Photosensitivity checks** for video and animation, using the [photosensitivity tool](/tools/photosensitivity).
5. **Research with people with disabilities.** Conformance doesn't guarantee usability. Include assistive technology users in every round of usability testing (see [Recruiting users](/hcd/recruiting-users)).

Record results, track issues to resolution and treat a barrier that blocks a task as a release blocker.

## Accessibility checklist

- [ ] Every page has one `h1`, a meaningful title and headings in order.
- [ ] Everything works with a keyboard, with visible focus and no traps.
- [ ] Text and interactive elements meet contrast requirements.
- [ ] Images have appropriate alt text; decorative images have empty alt.
- [ ] Form fields have visible labels; errors are described in text.
- [ ] Content reflows at 320 pixels wide and zooms to 400% without loss.
- [ ] Video has captions; audio has transcripts.
- [ ] Nothing flashes more than three times per second.
- [ ] Tested with at least one screen reader on desktop and one on mobile.
- [ ] People with disabilities took part in usability testing.

## Related guidance

- [HCD principles](/hcd/principles)
- [Research methods](/hcd/research-methods)
- [Color contrast](/guidelines/color-contrast)
- [Keyboard and gestures](/guidelines/keyboard-gestures)
