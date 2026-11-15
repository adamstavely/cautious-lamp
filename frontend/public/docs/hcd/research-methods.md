## Choosing a method

Start from the question, not the method. Each method answers some questions well and others badly. Two dimensions help:

- **Attitudinal or behavioral:** do you need to know what people *say* (beliefs, preferences, reasons) or what they *do*? People are poor predictors of their own behavior, so prefer behavioral methods when the question is about use.
- **Qualitative or quantitative:** do you need to understand *why* and *how* (small samples, rich detail) or *how many* and *how much* (larger samples, measurement)?

Combining methods is normal: interviews explain what analytics show; a survey sizes a problem that interviews found.

## Methods by question

| Question | Methods |
| --- | --- |
| What do people need, and what gets in their way? | Interviews, contextual inquiry, diary studies |
| How does the whole service work today? | Journey mapping, service blueprinting, service safari |
| How should we organize content? | Card sorting, tree testing |
| Can people use this design? | Usability testing, first-click testing |
| Does it work with assistive technology? | Accessibility testing with assistive technology users |
| Which of two versions performs better? | A/B testing, analytics |
| How many people have this problem? | Surveys, analytics, support data |
| How hard did the task feel? | System Usability Scale, NASA-TLX, single ease question |
| What are the obvious problems before we test? | Heuristic evaluation, cognitive walkthrough |

## Discovery methods

### Interviews

One-to-one conversations about people's experiences, goals and problems. Best for understanding motivations and context. Typically 45 to 60 minutes with 5 to 10 participants per user group. See [Conducting interviews](/hcd/conducting-interviews).

### Contextual inquiry

Watching people do real work in their own setting (an office, a home, a service counter) and asking about it as they go. Reveals workarounds, interruptions and tools people never mention in an interview. Plan for more time and fewer participants than interviews.

### Diary studies

Participants record experiences over days or weeks. Useful for processes that unfold over time, such as applying for and receiving a benefit. Keep entries short and prompts specific, and check in regularly to keep people engaged.

### Journey mapping and service blueprinting

A journey map shows a person's experience across stages and channels, with their actions, thoughts and pain points. A service blueprint adds what happens behind the scenes: staff, systems and policies at each step. Build both from research, not from assumptions. Store them in [Journey maps](/research/journey-maps).

## Evaluative methods

### Usability testing

Participants try realistic tasks with a design while a facilitator observes. Moderated sessions (in person or remote) let you ask follow-up questions; unmoderated sessions reach more people faster but lose the *why*.

- Write tasks as goals, not instructions: "You need to update your mailing address" rather than "Click Profile."
- Five participants per round usually reveal the most frequent problems; run several small rounds rather than one large one.
- Ask participants to think aloud. Don't help unless they are completely stuck.
- Rate issues by severity so the team fixes what matters first.

### Card sorting and tree testing

In a card sort, participants group topics in ways that make sense to them, showing how they think about the content (open sort) or whether a proposed structure fits (closed sort). A tree test checks whether people can find things in a proposed navigation structure without any visual design.

### First-click testing

Shows where people click first to complete a task. A correct first click strongly predicts task success, so this is a quick check on navigation and layout.

### Heuristic evaluation and cognitive walkthrough

Experts review a design against established principles (commonly Nielsen's ten usability heuristics) or step through tasks as a new user would. Fast and cheap, good for finding obvious issues before testing with users, but not a substitute for it. Use the [heuristic evaluation tool](/tools/heuristic-evaluation).

### Accessibility testing

Automated checkers find only some accessibility problems. Test with keyboard only, with screen readers (such as JAWS, NVDA, VoiceOver and TalkBack), with magnification and with voice control, and include people with disabilities as participants. See [Accessibility](/hcd/accessibility).

## Quantitative methods

### Surveys

Good for measuring how common something is, or tracking satisfaction over time. Poor for discovering problems you don't already know about. Keep surveys short, test the questions first, and avoid leading or double-barreled questions. Surveys sent to ten or more members of the public usually need Paperwork Reduction Act clearance.

### Analytics and A/B testing

Analytics show what people do at scale (where they drop out, what they search for) but not why. A/B tests compare versions with live traffic; they need enough traffic to reach a reliable result and a clear measure decided in advance.

### Standard questionnaires

- **System Usability Scale (SUS):** ten questions after a test, scored 0 to 100. A score around 68 is commonly cited as average. Use the [SUS tool](/tools/sus).
- **NASA Task Load Index (NASA-TLX):** rates perceived workload across six dimensions; useful for complex or high-stakes tasks. Use the [NASA-TLX tool](/tools/nasa-tlx).
- **Single ease question:** "Overall, how difficult or easy was this task?" on a seven-point scale, asked after each task.

## How many participants?

There is no single right number. As a guide:

| Method | Typical sample |
| --- | --- |
| Interviews, contextual inquiry | 5 to 10 per distinct user group, until you stop hearing new things |
| Usability testing (qualitative) | About 5 per round, several rounds |
| Card sorting (open) | 15 or more |
| Tree testing, first-click testing | 50 or more |
| Surveys, A/B tests | Depends on the precision you need; calculate it |

Small qualitative samples find problems; they don't tell you how often those problems occur. Don't report percentages from five participants.

## Related guidance

- [User research](/hcd/research)
- [Recruiting users](/hcd/recruiting-users)
- [Research reports](/hcd/research-reports)
