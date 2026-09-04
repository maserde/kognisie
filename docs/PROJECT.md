# Kognisie Project Definition

## Product vision

Kognisie is an interactive e-learning platform that helps students build practical intuition for difficult IT concepts. Learners should understand a concept by manipulating it, predicting outcomes, seeing immediate feedback, and applying what they discovered, not by passively consuming long explanations.

The initial curriculum covers:

- Frontend development
- Backend development

The curriculum model must remain domain-agnostic so future tracks such as DevOps, cloud engineering, data, security, and other technical disciplines can be added without redesigning the learning engine.

## Product promise

**Make difficult IT concepts click through guided interaction.**

A lesson should turn an abstract concept into something observable and manipulable. For example, a CSS box-model lesson can let a learner adjust margin, border, and padding while seeing element dimensions, spacing relationships, and layout consequences update in real time.

## Inspiration from Brilliant

Kognisie takes inspiration from Brilliant's learning model, not its branding or exact product implementation. The useful principles are:

- Learn by doing instead of relying on videos or text-heavy lectures.
- Build intuition through visual, direct manipulation.
- Guide learners step by step rather than reveal answers immediately.
- Give immediate, contextual feedback based on learner actions.
- Progress from simple cases to variations and edge cases.
- Measure mastery of concepts, not merely lesson completion.
- Keep sessions focused enough to support consistent practice.

Brilliant's strongest lesson for Kognisie is that the interactive itself is part of the pedagogy. It cannot be decorative or an illustration added after the explanation.

## Learning experience principles

1. **Interaction before explanation**: Let learners inspect, predict, manipulate, and observe before presenting the formal rule.
2. **One learning objective per activity**: Every interaction must target an explicit concept or misconception.
3. **Immediate meaningful feedback**: Explain the consequence of an action without simply exposing the final answer.
4. **Guided discovery**: Use prompts and constraints that make the learner perform the reasoning.
5. **Progressive difficulty**: Move from a canonical example to variations, combinations, and edge cases.
6. **Safe experimentation**: Every interactive must be resettable and encourage trial and error.
7. **Transfer, not memorization**: End with a new context that verifies whether the learner can apply the concept.
8. **Accessible by default**: Interactions require keyboard support, visible focus, clear labels, sufficient contrast, and non-visual alternatives where needed.

## Core learning loop

Each concept should support this sequence where applicable:

1. **Orient**: State the goal and show the system being explored.
2. **Predict**: Ask what will happen before the learner changes anything.
3. **Manipulate**: Let the learner change relevant variables directly.
4. **Observe**: Visualize the result and important relationships immediately.
5. **Explain**: Connect the observed behavior to the underlying concept.
6. **Challenge**: Ask the learner to reach a target state or solve a variation.
7. **Reflect**: Ask the learner to articulate or choose the rule they discovered.
8. **Transfer**: Apply the same concept in a different context.
9. **Review**: Revisit weak concepts with targeted practice.

## Content hierarchy

```text
Domain → Track → Course → Module → Lesson → Activity
```

- **Domain**: A broad discipline. The MVP supports Frontend and Backend.
- **Track**: A specialization within a domain.
- **Course**: A structured path toward a meaningful capability.
- **Module**: A group of related concepts.
- **Lesson**: A focused learning objective and its guided sequence.
- **Activity**: An explanation, question, challenge, or interactive widget instance.

## Reusable interactive widgets

Interactive widgets are first-class learning primitives. A widget should be reusable across lessons through configuration rather than duplicated for each topic.

Each widget must define:

- A stable widget type and version.
- A serializable configuration schema.
- Initial state and deterministic reset behavior.
- Observable learner actions and outcomes.
- Validation and feedback rules.
- Completion and mastery signals.
- Keyboard and screen-reader behavior.
- Responsive behavior for supported screen sizes.
- A separation between widget mechanics and lesson content.

Likely initial widget families include:

- Numeric and range manipulators
- Box-model and layout visualizers
- Code execution and output prediction
- Drag-and-drop sequencing
- State-machine and request-flow visualizers
- Component hierarchy and data-flow explorers
- Color, spacing, typography, and contrast experiments
- Matching, classification, and debugging challenges

Do not create a generic widget abstraction before at least two concrete lessons prove the shared contract. Reuse must follow validated learning needs, not speculative architecture.

## Initial product scope

The first product slice should prove the complete learning loop with one high-quality frontend concept, preferably the CSS box model:

- A course and lesson shell
- A configurable interactive widget
- Prediction and challenge activities
- Immediate contextual feedback
- Reset and retry behavior
- Lesson progress persistence
- Basic mastery evidence
- Responsive and accessible interaction

This vertical slice is more valuable than building a broad catalog of passive content.

## Non-goals for the first slice

- Covering every IT discipline
- A marketplace for third-party courses
- Live classrooms or video conferencing
- AI-generated lessons without human review
- Gamification that rewards clicks rather than understanding
- A universal widget engine designed before real lesson requirements exist

## Product success signals

Measure whether learners understand and return, not just whether they opened a lesson:

- Challenge success after exploration
- Success on transfer problems
- Attempts and meaningful state changes before completion
- Misconceptions encountered and resolved
- Time to first successful outcome
- Retention of mastered concepts during review
- Lesson completion and voluntary return rate

## Open product decisions

- Primary learner age range and prerequisite level
- Initial language and localization strategy
- Whether the first release targets independent learners, schools, or both
- Authoring workflow for curriculum and widget configuration
- Authentication, progress sync, and offline expectations
- Mastery model and review scheduling
- Free and paid boundaries
