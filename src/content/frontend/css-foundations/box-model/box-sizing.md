---
id: content-box-sizing-v1
title: Predict the final size
description: Compare content-box and border-box sizing behavior.
domainId: domain-frontend
courseId: course-css-foundations
moduleId: module-box-model
lessonId: lesson-sizing
order: 4
durationMinutes: 15
---

# Predict the final size

`box-sizing` controls what the declared width includes. This one property changes how you reason about every dimension in a layout.

## Content box

With `content-box`, width covers only content. Padding and border are added outside that value.

## Border box

With `border-box`, width includes content, padding, and border. The browser shrinks the content area to keep the declared outer width stable.
