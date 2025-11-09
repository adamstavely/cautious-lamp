// Laws of UX detailed content
// Based on content from https://lawsofux.com/

export const lawsOfUXData = {
  'aesthetic-usability': {
    id: 'aesthetic-usability',
    name: 'Aesthetic-Usability Effect',
    description: 'Users often perceive aesthetically pleasing design as design that\'s more usable.',
    icon: 'aesthetic',
    content: {
      overview: 'The aesthetic-usability effect is a phenomenon where users perceive more aesthetically pleasing designs as easier to use than less aesthetically pleasing designs, regardless of their actual usability.',
      explanation: 'This effect demonstrates that aesthetic design has a significant impact on user perception. When users encounter a visually appealing interface, they tend to be more tolerant of minor usability issues and are more likely to believe the system works better than it actually does.',
      applications: [
        'Prioritize visual design alongside functional design',
        'Use consistent, polished visual elements throughout the interface',
        'Invest in high-quality graphics, typography, and color schemes',
        'Ensure visual hierarchy guides users effectively',
        'Balance aesthetics with actual usability testing'
      ],
      examples: [
        'Apple products are often cited as examples where aesthetic appeal enhances perceived usability',
        'Well-designed landing pages that convert better due to visual appeal',
        'Mobile apps with polished UI that users rate higher even with similar functionality'
      ],
      references: [
        'Kurosu, M., & Kashimura, K. (1995). Apparent usability vs. inherent usability: experimental analysis on the determinants of the apparent usability.',
        'Tractinsky, N. (1997). Aesthetics and apparent usability: empirically assessing cultural and methodological issues.'
      ]
    }
  },
  'choice-overload': {
    id: 'choice-overload',
    name: 'Choice Overload',
    description: 'The tendency for people to get overwhelmed when they are presented with a large number of options, often used interchangeably with the term paradox of choice.',
    icon: 'choice',
    content: {
      overview: 'Choice overload occurs when users are presented with too many options, leading to decision paralysis, decreased satisfaction, and reduced likelihood of making any choice at all.',
      explanation: 'While having options is generally good, too many choices can be counterproductive. Users may experience anxiety, spend excessive time deciding, or avoid making a decision entirely. This is particularly problematic in e-commerce, forms, and navigation menus.',
      applications: [
        'Limit options to 5-7 items when possible',
        'Use progressive disclosure to reveal options gradually',
        'Provide smart defaults and recommendations',
        'Group related options into categories',
        'Use filters and search to help users narrow choices',
        'Highlight recommended or popular options'
      ],
      examples: [
        'Restaurant menus that are too long can reduce customer satisfaction',
        'E-commerce sites with too many product options may see lower conversion rates',
        'Form dropdowns with hundreds of options should use search or categorization'
      ],
      references: [
        'Iyengar, S. S., & Lepper, M. R. (2000). When choice is demotivating: Can one desire too much of a good thing?',
        'Schwartz, B. (2004). The Paradox of Choice: Why More Is Less.'
      ]
    }
  },
  'chunking': {
    id: 'chunking',
    name: 'Chunking',
    description: 'A process by which individual pieces of an information set are broken down and then grouped together in a meaningful whole.',
    icon: 'chunking',
    content: {
      overview: 'Chunking is a cognitive strategy that breaks down information into smaller, manageable pieces and groups them into meaningful units, making information easier to process and remember.',
      explanation: 'The human brain can only hold a limited amount of information in working memory. By organizing information into chunks, we can effectively increase the amount of information we can process. This principle is fundamental to effective information design.',
      applications: [
        'Break long forms into multiple steps or sections',
        'Group related menu items together',
        'Organize content into logical sections with clear headings',
        'Use visual grouping (spacing, borders) to create chunks',
        'Limit the number of items in navigation menus',
        'Present phone numbers and credit card numbers in chunks'
      ],
      examples: [
        'Phone numbers displayed as (555) 123-4567 instead of 5551234567',
        'Multi-step checkout processes that break forms into logical sections',
        'Navigation menus organized into categories and subcategories'
      ],
      references: [
        'Miller, G. A. (1956). The magical number seven, plus or minus two: some limits on our capacity for processing information.',
        'Baddeley, A. D. (1994). The magical number seven: still magic after all these years?'
      ]
    }
  },
  'cognitive-bias': {
    id: 'cognitive-bias',
    name: 'Cognitive Bias',
    description: 'A systematic error of thinking or rationality in judgment that influence our perception of the world and our decision-making ability.',
    icon: 'bias',
    content: {
      overview: 'Cognitive biases are systematic patterns of deviation from norm or rationality in judgment, where individuals create their own subjective reality from their perception of the input.',
      explanation: 'These biases affect how users perceive and interact with interfaces. Understanding common biases helps designers create interfaces that work with, rather than against, natural human tendencies.',
      applications: [
        'Use confirmation bias to show users information that confirms their choices',
        'Leverage anchoring bias by showing high-value options first',
        'Address loss aversion by emphasizing what users might lose',
        'Use social proof to show what others are doing',
        'Design for recency bias by placing important information at the end',
        'Account for availability bias in how information is presented'
      ],
      examples: [
        'E-commerce sites showing "Only 3 left in stock" to create urgency',
        'Social media platforms using confirmation bias in content algorithms',
        'Pricing pages that anchor users to premium options'
      ],
      references: [
        'Kahneman, D. (2011). Thinking, Fast and Slow.',
        'Tversky, A., & Kahneman, D. (1974). Judgment under uncertainty: Heuristics and biases.'
      ]
    }
  },
  'cognitive-load': {
    id: 'cognitive-load',
    name: 'Cognitive Load',
    description: 'The amount of mental resources needed to understand and interact with an interface.',
    icon: 'load',
    content: {
      overview: 'Cognitive load refers to the total amount of mental effort being used in working memory. Interfaces should minimize unnecessary cognitive load to help users focus on their primary tasks.',
      explanation: 'There are three types of cognitive load: intrinsic (complexity of the task), extraneous (how information is presented), and germane (effort to create schemas). Designers should minimize extraneous load and optimize for germane load.',
      applications: [
        'Simplify interfaces by removing unnecessary elements',
        'Use progressive disclosure to reveal information gradually',
        'Provide clear visual hierarchy and organization',
        'Use familiar patterns and conventions',
        'Minimize the number of decisions users need to make',
        'Provide helpful defaults and smart suggestions',
        'Use whitespace effectively to reduce visual clutter'
      ],
      examples: [
        'Clean, minimal interfaces like Google\'s homepage',
        'Wizard-style forms that break complex tasks into steps',
        'Dashboard designs that prioritize important information'
      ],
      references: [
        'Sweller, J. (1988). Cognitive load during problem solving: Effects on learning.',
        'Chandler, P., & Sweller, J. (1991). Cognitive load theory and the format of instruction.'
      ]
    }
  },
  'doherty-threshold': {
    id: 'doherty-threshold',
    name: 'Doherty Threshold',
    description: 'Productivity soars when a computer and its users interact at a pace (<400ms) that ensures that neither has to wait on the other.',
    icon: 'doherty',
    content: {
      overview: 'The Doherty Threshold states that productivity increases dramatically when computer response time is under 400ms, creating a seamless interaction where users feel they are directly manipulating the interface.',
      explanation: 'When system response time exceeds 400ms, users notice the delay and their flow is interrupted. Below this threshold, interactions feel instantaneous and users remain engaged and productive.',
      applications: [
        'Optimize system response times to be under 400ms',
        'Use loading states and progress indicators for longer operations',
        'Implement optimistic UI updates for perceived performance',
        'Preload content and use caching strategies',
        'Provide immediate feedback for user actions',
        'Use skeleton screens instead of blank loading states'
      ],
      examples: [
        'Google Search provides instant results as you type',
        'Modern text editors show changes immediately',
        'Social media feeds that load content progressively'
      ],
      references: [
        'Doherty, W. J., & Thadani, A. J. (1982). The economic value of rapid response time.',
        'Miller, R. B. (1968). Response time in man-computer conversational transactions.'
      ]
    }
  },
  'fitts-law': {
    id: 'fitts-law',
    name: 'Fitts\'s Law',
    description: 'The time to acquire a target is a function of the distance to and size of the target.',
    icon: 'fitts',
    content: {
      overview: 'Fitts\'s Law predicts that the time required to move to a target area is a function of the distance to the target and the size of the target. Larger, closer targets are easier to acquire.',
      explanation: 'This law has profound implications for interface design. Buttons and interactive elements should be appropriately sized, and frequently used controls should be positioned where they\'re easy to reach.',
      applications: [
        'Make clickable targets large enough (minimum 44x44px on mobile)',
        'Place frequently used controls in easily accessible areas',
        'Increase target size for important actions',
        'Reduce distance between related controls',
        'Use larger touch targets on mobile devices',
        'Position primary actions in corners or edges (infinite target size)'
      ],
      examples: [
        'Mobile app navigation bars with large, easy-to-tap icons',
        'Desktop applications with toolbars positioned at screen edges',
        'Web forms with large, clearly defined submit buttons'
      ],
      references: [
        'Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement.',
        'MacKenzie, I. S. (1992). Fitts\' law as a research and design tool in human-computer interaction.'
      ]
    }
  },
  'flow': {
    id: 'flow',
    name: 'Flow',
    description: 'The mental state in which a person performing some activity is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity.',
    icon: 'flow',
    content: {
      overview: 'Flow is a state of complete absorption in an activity where users lose track of time and experience deep enjoyment. Designing for flow creates more engaging and productive user experiences.',
      explanation: 'Flow occurs when there\'s a balance between challenge and skill level, clear goals, immediate feedback, and a sense of control. Interfaces that facilitate flow keep users engaged and productive.',
      applications: [
        'Provide clear goals and progress indicators',
        'Offer immediate feedback for user actions',
        'Balance challenge with user skill level',
        'Minimize distractions and interruptions',
        'Create a sense of control and agency',
        'Use gamification elements appropriately',
        'Design for focused, uninterrupted work sessions'
      ],
      examples: [
        'Video games that adjust difficulty to maintain engagement',
        'Productivity apps that show progress and achievements',
        'Learning platforms that provide immediate feedback'
      ],
      references: [
        'Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience.',
        'Nakamura, J., & Csikszentmihalyi, M. (2009). The concept of flow.'
      ]
    }
  },
  'goal-gradient': {
    id: 'goal-gradient',
    name: 'Goal-Gradient Effect',
    description: 'The tendency to approach a goal increases with proximity to the goal.',
    icon: 'goal',
    content: {
      overview: 'The goal-gradient effect describes how motivation and effort increase as users get closer to completing a goal. Users accelerate their behavior as they approach the finish line.',
      explanation: 'This psychological principle shows that people are more motivated when they can see progress toward a goal. The closer they get, the more effort they\'re willing to expend.',
      applications: [
        'Show clear progress indicators for multi-step processes',
        'Use progress bars that fill as users complete tasks',
        'Display "X steps remaining" to show proximity to completion',
        'Provide visual feedback showing advancement',
        'Use completion percentages or milestones',
        'Celebrate progress milestones along the way'
      ],
      examples: [
        'Checkout processes showing "Step 2 of 3"',
        'Progress bars in onboarding flows',
        'Loyalty programs showing points toward next reward',
        'Fitness apps showing progress toward daily goals'
      ],
      references: [
        'Hull, C. L. (1932). The goal-gradient hypothesis and maze learning.',
        'Kivetz, R., Urminsky, O., & Zheng, Y. (2006). The goal-gradient hypothesis resurrected: Purchase acceleration, illusionary goal progress, and customer retention.'
      ]
    }
  },
  'hick-law': {
    id: 'hick-law',
    name: 'Hick\'s Law',
    description: 'The time it takes to make a decision increases with the number and complexity of choices.',
    icon: 'hick',
    content: {
      overview: 'Hick\'s Law states that the time required to make a decision increases logarithmically with the number of choices available. More options mean longer decision times.',
      explanation: 'This law emphasizes the importance of reducing choices to speed up decision-making. While it doesn\'t mean we should always minimize options, it highlights the need to organize and prioritize choices effectively.',
      applications: [
        'Limit the number of options in navigation menus',
        'Use categorization to organize many options',
        'Prioritize and highlight most common choices',
        'Provide smart defaults to reduce decision burden',
        'Use progressive disclosure for complex choices',
        'Simplify forms by removing unnecessary fields',
        'Group related options together'
      ],
      examples: [
        'Restaurant menus organized into categories (appetizers, entrees, desserts)',
        'E-commerce sites with filtered navigation',
        'Software settings organized into logical groups',
        'Mobile apps with bottom navigation limited to 3-5 items'
      ],
      references: [
        'Hick, W. E. (1952). On the rate of gain of information.',
        'Hyman, R. (1953). Stimulus information as a determinant of reaction time.'
      ]
    }
  },
  'jakob-law': {
    id: 'jakob-law',
    name: 'Jakob\'s Law',
    description: 'Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know.',
    icon: 'jakob',
    content: {
      overview: 'Jakob\'s Law emphasizes that users prefer familiar interfaces. Since users spend most of their time on other websites, they expect your site to follow established conventions.',
      explanation: 'Users bring expectations from other sites they\'ve used. Deviating from these conventions creates cognitive load and frustration. Following established patterns makes interfaces more intuitive.',
      applications: [
        'Follow established UI patterns and conventions',
        'Use familiar navigation structures (top nav, sidebar)',
        'Place common elements where users expect them (logo top-left, search top-right)',
        'Use standard iconography (hamburger menu, shopping cart)',
        'Follow platform-specific guidelines (iOS, Android, Web)',
        'Maintain consistency with industry standards',
        'Only innovate when it provides clear value'
      ],
      examples: [
        'E-commerce sites following standard checkout flows',
        'Social media platforms using familiar feed layouts',
        'Mobile apps following platform design guidelines',
        'Websites using standard header/footer patterns'
      ],
      references: [
        'Nielsen, J. (2000). Designing Web Usability: The Practice of Simplicity.',
        'Krug, S. (2014). Don\'t Make Me Think: A Common Sense Approach to Web Usability.'
      ]
    }
  },
  'common-region': {
    id: 'common-region',
    name: 'Law of Common Region',
    description: 'Elements tend to be perceived into groups if they are sharing an area with a clearly defined boundary.',
    icon: 'region',
    content: {
      overview: 'The Law of Common Region states that elements within the same bounded region are perceived as grouped together. This is one of the Gestalt principles of visual perception.',
      explanation: 'Visual boundaries create strong grouping cues. Elements contained within borders, backgrounds, or other visual containers are perceived as related, regardless of their proximity or similarity.',
      applications: [
        'Use borders and backgrounds to group related content',
        'Create card-based layouts to group information',
        'Use subtle background colors to define regions',
        'Group form fields within clearly defined sections',
        'Separate navigation areas with visual boundaries',
        'Use whitespace and containers to organize content'
      ],
      examples: [
        'Card-based designs that group related information',
        'Form sections with background colors or borders',
        'Dashboard widgets contained in defined boxes',
        'Navigation menus with clear visual boundaries'
      ],
      references: [
        'Palmer, S. E., & Rock, I. (1994). Rethinking perceptual organization: The case of uniform connectedness.',
        'Wertheimer, M. (1923). Laws of organization in perceptual forms.'
      ]
    }
  },
  'proximity': {
    id: 'proximity',
    name: 'Law of Proximity',
    description: 'Objects that are near, or proximate to each other, tend to be grouped together.',
    icon: 'proximity',
    content: {
      overview: 'The Law of Proximity is a Gestalt principle stating that objects placed close together are perceived as grouped or related, while objects farther apart are perceived as separate.',
      explanation: 'Spatial relationships are powerful grouping cues. Designers can use proximity to create visual hierarchy, organize information, and guide user attention.',
      applications: [
        'Group related elements close together',
        'Use spacing to separate unrelated content',
        'Create visual hierarchy through proximity',
        'Place labels close to their corresponding inputs',
        'Group navigation items with consistent spacing',
        'Use whitespace strategically to organize content'
      ],
      examples: [
        'Form labels positioned directly above input fields',
        'Related buttons grouped together with less spacing between them',
        'Navigation menus with items spaced consistently',
        'Card layouts where related information is grouped closely'
      ],
      references: [
        'Wertheimer, M. (1923). Laws of organization in perceptual forms.',
        'Palmer, S. E. (1999). Vision Science: Photons to Phenomenology.'
      ]
    }
  },
  'pragnanz': {
    id: 'pragnanz',
    name: 'Law of Prägnanz',
    description: 'People will perceive and interpret ambiguous or complex images as the simplest form possible, because it is the interpretation that requires the least cognitive effort of us.',
    icon: 'pragnanz',
    content: {
      overview: 'The Law of Prägnanz (also known as the Law of Good Figure or Simplicity) states that people naturally perceive things in the simplest way possible. We interpret ambiguous or complex images as simple, regular forms.',
      explanation: 'This principle emphasizes the importance of simplicity in design. Users will interpret complex interfaces in the simplest way possible, which may not always match the designer\'s intent.',
      applications: [
        'Design simple, clear interfaces',
        'Avoid unnecessary complexity',
        'Use familiar, recognizable shapes and patterns',
        'Ensure icons and graphics are unambiguous',
        'Simplify navigation structures',
        'Remove visual clutter and distractions',
        'Use clear visual hierarchy'
      ],
      examples: [
        'Simple, recognizable icons that are easy to interpret',
        'Clean interfaces with minimal visual elements',
        'Clear navigation that doesn\'t require explanation',
        'Unambiguous form layouts'
      ],
      references: [
        'Wertheimer, M. (1923). Laws of organization in perceptual forms.',
        'Koffka, K. (1935). Principles of Gestalt Psychology.'
      ]
    }
  },
  'similarity': {
    id: 'similarity',
    name: 'Law of Similarity',
    description: 'The human eye tends to perceive similar elements as a complete picture, shape, or group, even if those elements are separated.',
    icon: 'similarity',
    content: {
      overview: 'The Law of Similarity states that elements that share visual characteristics (color, shape, size, orientation) are perceived as grouped together, even if they\'re not adjacent.',
      explanation: 'Similarity is a powerful grouping principle. Elements with shared visual properties are automatically perceived as related, creating visual organization without explicit boundaries.',
      applications: [
        'Use consistent styling for related elements',
        'Apply the same color to elements in the same category',
        'Use consistent icon styles throughout',
        'Maintain uniform button styles for similar actions',
        'Group form fields with similar styling',
        'Use typography consistently to show relationships'
      ],
      examples: [
        'Navigation items with consistent styling appear as a group',
        'Form fields with the same styling are perceived as related',
        'Buttons with similar colors and shapes indicate similar functions',
        'Icons with consistent style create visual cohesion'
      ],
      references: [
        'Wertheimer, M. (1923). Laws of organization in perceptual forms.',
        'Palmer, S. E. (1999). Vision Science: Photons to Phenomenology.'
      ]
    }
  },
  'uniform-connectedness': {
    id: 'uniform-connectedness',
    name: 'Law of Uniform Connectedness',
    description: 'Elements that are visually connected are perceived as more related than elements with no connection.',
    icon: 'connected',
    content: {
      overview: 'The Law of Uniform Connectedness states that elements connected by visual properties (lines, colors, shapes) are perceived as more related than elements without such connections.',
      explanation: 'Visual connections create stronger grouping cues than proximity or similarity alone. Connected elements are seen as a single unit or system.',
      applications: [
        'Use lines or connectors to show relationships',
        'Apply shared background colors to related elements',
        'Use borders to connect related content',
        'Create visual flows with connecting lines',
        'Use consistent styling to show connections',
        'Group related controls with visual links'
      ],
      examples: [
        'Flowcharts and diagrams with connecting lines',
        'Form sections connected by shared backgrounds',
        'Navigation menus with visual connectors',
        'Timeline interfaces with connecting lines',
        'Related buttons grouped with shared styling'
      ],
      references: [
        'Palmer, S. E., & Rock, I. (1994). Rethinking perceptual organization: The case of uniform connectedness.',
        'Wertheimer, M. (1923). Laws of organization in perceptual forms.'
      ]
    }
  },
  'mental-model': {
    id: 'mental-model',
    name: 'Mental Model',
    description: 'A compressed model based on what we think we know about a system and how it works.',
    icon: 'mental',
    content: {
      overview: 'A mental model is a user\'s internal representation of how a system works. It\'s based on their prior experiences, assumptions, and understanding of similar systems.',
      explanation: 'Users develop mental models to predict system behavior. When interfaces match users\' mental models, they\'re intuitive. When they don\'t, users become confused and frustrated.',
      applications: [
        'Design interfaces that match user expectations',
        'Use familiar metaphors and analogies',
        'Follow established conventions and patterns',
        'Test designs with real users to validate mental models',
        'Provide clear feedback that confirms or corrects mental models',
        'Use consistent behavior throughout the interface',
        'Provide onboarding to help users build accurate mental models'
      ],
      examples: [
        'Trash/delete icons that match real-world concepts',
        'Shopping cart metaphors in e-commerce',
        'File folder structures that mirror physical organization',
        'Calendar interfaces that match familiar calendar layouts'
      ],
      references: [
        'Norman, D. A. (1988). The Design of Everyday Things.',
        'Johnson-Laird, P. N. (1983). Mental Models: Towards a Cognitive Science of Language, Inference, and Consciousness.'
      ]
    }
  },
  'miller-law': {
    id: 'miller-law',
    name: 'Miller\'s Law',
    description: 'The average person can only keep 7 (plus or minus 2) items in their working memory.',
    icon: 'miller',
    content: {
      overview: 'Miller\'s Law states that the average person can hold 7±2 items in their working memory at once. This has important implications for information architecture and interface design.',
      explanation: 'While the exact number has been debated, the principle remains: humans have limited working memory capacity. Interfaces should be designed to respect these limitations.',
      applications: [
        'Limit navigation items to 5-9 options',
        'Break information into chunks of 5-7 items',
        'Use progressive disclosure for complex information',
        'Group related items to reduce cognitive load',
        'Prioritize and highlight most important items',
        'Use visual organization to aid memory',
        'Provide clear structure and hierarchy'
      ],
      examples: [
        'Navigation menus with 5-7 main items',
        'Phone numbers displayed as chunks: (555) 123-4567',
        'Multi-step processes broken into manageable sections',
        'Dashboard widgets limited to key metrics'
      ],
      references: [
        'Miller, G. A. (1956). The magical number seven, plus or minus two: some limits on our capacity for processing information.',
        'Cowan, N. (2001). The magical number 4 in short-term memory: A reconsideration of mental storage capacity.'
      ]
    }
  },
  'occam-razor': {
    id: 'occam-razor',
    name: 'Occam\'s Razor',
    description: 'Among competing hypotheses that predict equally well, the one with the fewest assumptions should be selected.',
    icon: 'occam',
    content: {
      overview: 'Occam\'s Razor (also known as the Law of Parsimony) states that when multiple solutions work equally well, the simplest one is usually the best. In design, this means favoring simplicity over complexity.',
      explanation: 'Simpler solutions are easier to understand, maintain, and use. They require fewer assumptions and are less likely to have hidden problems. This principle guides designers to remove unnecessary complexity.',
      applications: [
        'Remove unnecessary features and elements',
        'Simplify navigation structures',
        'Use minimal, clean interfaces',
        'Eliminate redundant information',
        'Choose the simplest solution that works',
        'Avoid over-engineering',
        'Focus on essential functionality'
      ],
      examples: [
        'Google\'s minimalist homepage',
        'Simple, focused mobile apps',
        'Clean, uncluttered interfaces',
        'Streamlined checkout processes',
        'Minimalist design systems'
      ],
      references: [
        'Thorburn, W. M. (1918). The Myth of Occam\'s Razor.',
        'Sober, E. (2015). Ockham\'s Razors: A User\'s Manual.'
      ]
    }
  },
  'paradox-active-user': {
    id: 'paradox-active-user',
    name: 'Paradox of the Active User',
    description: 'Users never read manuals but start using the software immediately.',
    icon: 'paradox',
    content: {
      overview: 'The Paradox of the Active User describes how users prefer to learn by doing rather than reading documentation. They jump into using software immediately, often skipping tutorials and help text.',
      explanation: 'Users want to be productive immediately and are reluctant to invest time in learning. Interfaces must be discoverable and self-explanatory, allowing users to learn through interaction.',
      applications: [
        'Design self-explanatory interfaces',
        'Use progressive disclosure to reveal features gradually',
        'Provide contextual help and tooltips',
        'Use familiar patterns that don\'t require explanation',
        'Make features discoverable through interaction',
        'Provide inline guidance rather than separate documentation',
        'Use clear visual cues and affordances'
      ],
      examples: [
        'Modern software with intuitive interfaces that don\'t require manuals',
        'Mobile apps that guide users through first-time experiences',
        'Web applications with tooltips and contextual help',
        'Interfaces that reveal functionality through exploration'
      ],
      references: [
        'Carroll, J. M., & Rosson, M. B. (1987). Paradox of the active user.',
        'Nielsen, J. (1993). Usability Engineering.'
      ]
    }
  },
  'pareto': {
    id: 'pareto',
    name: 'Pareto Principle',
    description: 'The Pareto principle states that, for many events, roughly 80% of the effects come from 20% of the causes.',
    icon: 'pareto',
    content: {
      overview: 'The Pareto Principle (80/20 rule) suggests that a small number of causes often produce most of the effects. In design, this means focusing on the features and content that provide the most value.',
      explanation: 'Not all features are equally important. A small subset of functionality typically accounts for most user needs. Designers should prioritize these high-impact elements.',
      applications: [
        'Focus design effort on the 20% of features used 80% of the time',
        'Prioritize content that serves most users',
        'Optimize the most common user paths',
        'Highlight primary actions and features',
        'Use analytics to identify high-impact areas',
        'Simplify by removing rarely-used features',
        'Design for the common case, not edge cases'
      ],
      examples: [
        'E-commerce sites optimizing checkout flow (high conversion impact)',
        'Software focusing on core features used by most users',
        'Content strategies prioritizing high-traffic pages',
        'Navigation highlighting most-visited sections'
      ],
      references: [
        'Juran, J. M. (1975). The non-Pareto principle; Mea culpa.',
        'Koch, R. (1998). The 80/20 Principle: The Secret to Achieving More with Less.'
      ]
    }
  },
  'parkinson': {
    id: 'parkinson',
    name: 'Parkinson\'s Law',
    description: 'Any task will inflate until all of the available time is spent.',
    icon: 'parkinson',
    content: {
      overview: 'Parkinson\'s Law states that work expands to fill the time available for its completion. In design, this relates to how users perceive and use available space and time.',
      explanation: 'This principle suggests that users will use whatever time or space is available, whether they need it or not. Designers should provide appropriate constraints to guide efficient use.',
      applications: [
        'Set appropriate time limits for time-sensitive tasks',
        'Use progress indicators to show time remaining',
        'Limit form length to what\'s necessary',
        'Provide clear constraints and boundaries',
        'Use deadlines and time limits strategically',
        'Design for efficiency, not just completion',
        'Set expectations about time requirements'
      ],
      examples: [
        'Forms with progress indicators showing completion time',
        'Time-limited offers that create urgency',
        'Onboarding flows with estimated completion times',
        'Task management tools with time tracking'
      ],
      references: [
        'Parkinson, C. N. (1955). Parkinson\'s Law: The Pursuit of Progress.',
        'Ariely, D. (2008). Predictably Irrational: The Hidden Forces That Shape Our Decisions.'
      ]
    }
  },
  'peak-end': {
    id: 'peak-end',
    name: 'Peak-End Rule',
    description: 'People judge an experience largely based on how they felt at its peak and at its end, rather than the total sum or average of every moment of the experience.',
    icon: 'peak',
    content: {
      overview: 'The Peak-End Rule states that people evaluate experiences based on the most intense point (peak) and the final moment (end), rather than the overall average of the experience.',
      explanation: 'This means that a few standout moments can define the entire experience. Designers should focus on creating positive peaks and ensuring strong endings.',
      applications: [
        'Create memorable peak moments in user journeys',
        'Ensure positive endings to processes and flows',
        'Design delightful micro-interactions',
        'End onboarding with celebration or achievement',
        'Complete checkout with confirmation and next steps',
        'Finish tasks with satisfying feedback',
        'Create moments of surprise and delight'
      ],
      examples: [
        'Onboarding flows that end with a celebration',
        'Checkout processes with satisfying confirmation pages',
        'Apps that celebrate user achievements',
        'Interfaces with delightful micro-interactions',
        'Completion screens that feel rewarding'
      ],
      references: [
        'Kahneman, D., Fredrickson, B. L., Schreiber, C. A., & Redelmeier, D. A. (1993). When more pain is preferred to less: Adding a better end.',
        'Fredrickson, B. L., & Kahneman, D. (1993). Duration neglect in retrospective evaluations of affective episodes.'
      ]
    }
  },
  'postel': {
    id: 'postel',
    name: 'Postel\'s Law',
    description: 'Be liberal in what you accept, and conservative in what you send.',
    icon: 'postel',
    content: {
      overview: 'Postel\'s Law (also known as the Robustness Principle) suggests that systems should be flexible in accepting input while being strict and consistent in output.',
      explanation: 'This principle, originally from network protocol design, applies to interface design: accept various input formats from users, but provide consistent, predictable output.',
      applications: [
        'Accept multiple input formats (phone numbers, dates, etc.)',
        'Be forgiving of user input variations',
        'Provide consistent, predictable system responses',
        'Use smart defaults and auto-formatting',
        'Validate input flexibly but clearly',
        'Normalize user input behind the scenes',
        'Provide helpful error messages when input is invalid'
      ],
      examples: [
        'Forms that accept phone numbers in various formats',
        'Date pickers that accept multiple date formats',
        'Search that handles typos and variations',
        'Email inputs that are case-insensitive',
        'Systems that auto-format user input'
      ],
      references: [
        'Postel, J. (1981). Transmission Control Protocol. RFC 793.',
        'Nielsen, J. (1999). Tolerance: The Forgotten Usability Principle.'
      ]
    }
  },
  'selective-attention': {
    id: 'selective-attention',
    name: 'Selective Attention',
    description: 'The process of focusing our attention only to a subset of stimuli in an environment — usually those related to our goals.',
    icon: 'attention',
    content: {
      overview: 'Selective attention is the cognitive process of focusing on specific information while ignoring other stimuli. Users naturally filter information based on their goals and expectations.',
      explanation: 'Users can\'t process all information simultaneously. They focus on what\'s relevant to their current task. Designers should make important information stand out and reduce distractions.',
      applications: [
        'Use visual hierarchy to guide attention',
        'Highlight important information',
        'Reduce visual clutter and distractions',
        'Use contrast to make key elements stand out',
        'Provide clear focus states',
        'Minimize competing elements',
        'Design for task-focused workflows'
      ],
      examples: [
        'Forms that highlight the current field',
        'Interfaces that dim background content when modals appear',
        'Dashboards that emphasize key metrics',
        'Navigation that highlights the current section'
      ],
      references: [
        'Broadbent, D. E. (1958). Perception and Communication.',
        'Treisman, A. M. (1964). Selective attention in man.'
      ]
    }
  },
  'serial-position': {
    id: 'serial-position',
    name: 'Serial Position Effect',
    description: 'Users have a propensity to best remember the first and last items in a series.',
    icon: 'serial',
    content: {
      overview: 'The Serial Position Effect describes how people best remember items at the beginning (primacy effect) and end (recency effect) of a list, while items in the middle are less memorable.',
      explanation: 'This effect has important implications for information architecture. Important items should be placed at the beginning or end of lists, menus, and sequences.',
      applications: [
        'Place most important items at the beginning of lists',
        'Put secondary important items at the end',
        'Use the middle positions for less critical items',
        'Structure navigation with key items first and last',
        'Design onboarding flows with strong start and finish',
        'Organize content with important information at top and bottom',
        'Use this principle in menu design'
      ],
      examples: [
        'Navigation menus with primary items first',
        'Onboarding flows that start and end strongly',
        'Product lists with featured items at top',
        'Form layouts with important fields first',
        'Dashboard widgets with key metrics at top and bottom'
      ],
      references: [
        'Murdock, B. B. (1962). The serial position effect of free recall.',
        'Glanzer, M., & Cunitz, A. R. (1966). Two storage mechanisms in free recall.'
      ]
    }
  },
  'tesler': {
    id: 'tesler',
    name: 'Tesler\'s Law',
    description: 'Tesler\'s Law, also known as The Law of Conservation of Complexity, states that for any system there is a certain amount of complexity which cannot be reduced.',
    icon: 'tesler',
    content: {
      overview: 'Tesler\'s Law states that every system has inherent complexity that cannot be eliminated. The question is where that complexity lives: in the system itself or in the user interface.',
      explanation: 'Complexity must be managed, not eliminated. Designers can simplify interfaces by moving complexity to the system (automation, smart defaults) rather than burdening users.',
      applications: [
        'Move complexity from users to the system',
        'Use automation to handle complex tasks',
        'Provide smart defaults and intelligent suggestions',
        'Simplify interfaces while maintaining functionality',
        'Use progressive disclosure for complex features',
        'Handle edge cases automatically',
        'Design for the common case, automate the complex'
      ],
      examples: [
        'Email clients that automatically categorize messages',
        'Form autofill that reduces user input',
        'Smart defaults in software settings',
        'Automated workflows that handle complexity',
        'AI-powered features that simplify tasks'
      ],
      references: [
        'Tesler, L. (1981). The Smalltalk Environment.',
        'Norman, D. A. (2013). The Design of Everyday Things: Revised and Expanded Edition.'
      ]
    }
  },
  'von-restorff': {
    id: 'von-restorff',
    name: 'Von Restorff Effect',
    description: 'The Von Restorff effect, also known as The Isolation Effect, predicts that when multiple similar objects are present, the one that differs from the rest is most likely to be remembered.',
    icon: 'restorff',
    content: {
      overview: 'The Von Restorff Effect (Isolation Effect) states that items that stand out from their surroundings are more likely to be remembered. Distinctive elements capture attention and are better recalled.',
      explanation: 'When items are similar, the one that differs stands out and is more memorable. Designers can use this to highlight important information, calls-to-action, or key features.',
      applications: [
        'Make important elements visually distinct',
        'Use contrast to highlight key actions',
        'Break patterns to draw attention',
        'Use color, size, or shape to make items stand out',
        'Highlight primary CTAs differently from secondary actions',
        'Make error states visually distinct',
        'Use isolation to emphasize important information'
      ],
      examples: [
        'Primary buttons that stand out from secondary buttons',
        'Error messages with distinct styling',
        'Featured content that breaks the normal layout',
        'Call-to-action buttons with unique styling',
        'Important notifications that stand out visually'
      ],
      references: [
        'Von Restorff, H. (1933). Über die Wirkung von Bereichsbildungen im Spurenfeld.',
        'Hunt, R. R. (1995). The subtlety of distinctiveness: What von Restorff really did.'
      ]
    }
  },
  'working-memory': {
    id: 'working-memory',
    name: 'Working Memory',
    description: 'A cognitive system that temporarily holds and manipulates information needed to complete tasks.',
    icon: 'memory',
    content: {
      overview: 'Working memory is the cognitive system responsible for temporarily holding and manipulating information during complex tasks. It has limited capacity and is easily overloaded.',
      explanation: 'Understanding working memory limitations is crucial for design. Interfaces should minimize the amount of information users need to hold in memory, provide external memory aids, and reduce cognitive load.',
      applications: [
        'Minimize information users must remember',
        'Provide visible context and reminders',
        'Use clear labels and instructions',
        'Show progress and current state',
        'Break complex tasks into smaller steps',
        'Provide external memory aids (tooltips, help text)',
        'Use visual organization to reduce memory load'
      ],
      examples: [
        'Breadcrumbs showing navigation path',
        'Progress indicators in multi-step processes',
        'Form validation that shows errors inline',
        'Contextual help that appears when needed',
        'Dashboards that display all relevant information',
        'Shopping carts that persist across sessions'
      ],
      references: [
        'Baddeley, A. D., & Hitch, G. (1974). Working memory.',
        'Cowan, N. (2008). What are the differences between long-term, short-term, and working memory?'
      ]
    }
  },
  'zeigarnik': {
    id: 'zeigarnik',
    name: 'Zeigarnik Effect',
    description: 'People remember uncompleted or interrupted tasks better than completed tasks.',
    icon: 'zeigarnik',
    content: {
      overview: 'The Zeigarnik Effect states that people remember incomplete or interrupted tasks better than completed ones. Unfinished tasks create psychological tension that keeps them in memory.',
      explanation: 'This effect explains why users remember incomplete forms, unfinished purchases, or interrupted workflows. Designers can leverage this to encourage task completion.',
      applications: [
        'Show progress for incomplete tasks',
        'Use visual indicators for unfinished items',
        'Provide save/draft functionality',
        'Send reminders for incomplete actions',
        'Show what\'s left to complete',
        'Use progress bars and checklists',
        'Highlight incomplete sections'
      ],
      examples: [
        'E-commerce sites showing incomplete carts',
        'Progress bars in onboarding flows',
        'Draft indicators in email and document editors',
        'Task lists that highlight incomplete items',
        'Form progress indicators',
        'Achievement systems showing incomplete goals'
      ],
      references: [
        'Zeigarnik, B. (1927). Über das Behalten von erledigten und unerledigten Handlungen.',
        'Ovsiankina, M. (1928). Die Wiederaufnahme von unterbrochenen Handlungen.'
      ]
    }
  }
};

