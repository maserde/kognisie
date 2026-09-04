---
id: content-box-anatomy-v1
title: Anatomy of a box
description: Build an intuition for how content, padding, border, and margin combine.
domainId: domain-frontend
courseId: course-css-foundations
moduleId: module-box-model
lessonId: lesson-box-anatomy
order: 1
durationMinutes: 10
---

# Anatomy of a box

Every visible element on a web page occupies a rectangular box. The browser builds that box from four layers: **content**, **padding**, **border**, and **margin**.

## Start from the inside

The content box holds text, images, or child elements. Padding adds breathing room inside the element, while margin creates distance outside it.

> Before touching the controls, predict which value will change the colored area without moving the neighboring box.

::box-model-explorer{lesson-id="lesson-box-anatomy" widget-id="box-model-primary" :initial-content-width="220" :initial-padding="24" :initial-border="4" :initial-margin="20" :min-spacing="0" :max-spacing="64" :show-computed-size="true"}
::

## Read the result

Increasing **padding** makes the element's rendered box larger unless `box-sizing: border-box` constrains its outer dimensions. Increasing **margin** does not change the element itself; it changes the space between that element and its neighbors.

## Check your intuition

Try to make the visible box wider without changing the content width. Then reset and create more space between the box and its neighbor without changing the colored area.
