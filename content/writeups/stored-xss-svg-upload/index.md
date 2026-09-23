---
title: "Stored XSS via SVG Upload"
description: "While testing file upload forms across a platform, I uploaded an SVG with a JavaScript payload — it got served from the CDN without sanitization, triggering stored XSS."
date: 2025-08-04
categories: [Writeups]
tags: [bugbounty, stored-xss, svg, file-upload]
author: MOZA
toc: true
severity: "Medium"
platform: "HackerOne"
report: "https://hackerone.com/reports/3285220"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | Web automation platform |
| **Weakness** | Stored XSS via SVG Upload |
| **Severity** | Medium |
| **Status** | Resolved |
| **Platform** | HackerOne |

## The Story

After finding a CSRF on the same platform's editor, I kept digging. I started collecting all possible file upload forms to test for upload-based vulnerabilities.

The platform's embed interface had a file input that caught my attention. Files uploaded through it were stored and served via a CDN subdomain. I crafted a simple SVG with a JavaScript payload and uploaded it.

No sanitization. No Content-Security-Policy. No `Content-Disposition: attachment`. The SVG executed JavaScript in the browser.

**Stored XSS on a platform subdomain.**

## The Vulnerability

The upload flow worked like this:

1. Navigate to the platform's embed interface at `https://interfaces.example.com/embed/page/[page_id]`
2. Upload a malicious SVG through the file input

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg onload="alert(document.cookie)" xmlns="http://www.w3.org/2000/svg">
</svg>
```

3. The file gets uploaded to the storage service and stored on the platform's CDN
4. Visit the hosted file:

```
https://cdn.example.com/[file-id]/xss.svg
```

The SVG renders in the browser and the `onload` event fires — executing JavaScript in the context of the CDN domain.

Interestingly, the security engineer mentioned this had been reported and fixed before, but **the fix had regressed** — a misconfiguration brought the vulnerability back.

## Impact

- **Stored XSS** on a platform-owned subdomain
- **Cookie theft** — depending on cookie scope, session tokens could be stolen
- **Phishing** — serve convincing fake content from a trusted domain
- **OAuth token theft** — in embedded/integration contexts, could intercept OAuth flows
- **Persistent** — the SVG stays on the CDN until manually removed

## Vendor Response

> *"The team that owns this feature confirmed there was a misconfiguration, and have shipped a fix for this already."*

On severity, the platform classified it as Medium:

> *"We're considering this a Medium, due to the fact that it requires user interaction (supplying a link), and it's on a less-risky subdomain (cdn) than if it was on the main domain."*

## Timeline

| Date | Event |
|------|-------|
| 2025-08-04 | Report submitted |
| 2025-09-29 | Engineer confirms regression — fix was deployed but broke again |
| 2025-10-06 | Triaged, fix shipped, bounty awarded, resolved |

## Takeaways

1. **Test file uploads with SVG** — SVG is the most common vector for upload-based XSS
2. **Fixes can regress** — a vulnerability that was fixed before can come back after deployments or config changes
3. **CDN subdomains still matter** — even "less risky" subdomains can be leveraged in phishing and OAuth contexts
4. **Collect all upload forms** — systematically map every file input across the platform, not just the obvious ones
5. **Keep testing platforms you've reported to** — familiarity with the codebase gives you an edge
