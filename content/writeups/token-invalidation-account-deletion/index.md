---
title: "Token Not Invalidated After Account Deletion"
description: "Inspired by another report, I deleted my own account and replayed saved Burp requests — the bearer token was still valid, allowing post-deletion modifications."
date: 2025-06-07
categories: [Writeups]
tags: [bugbounty, authentication, token, api]
author: MOZA
toc: true
platform: "HackerOne"
report: "https://hackerone.com/reports/3182643"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | Roblox |
| **Weakness** | Improper Authentication |
| **Severity** | Low (adjusted by vendor) |
| **Status** | Resolved |
| **Platform** | HackerOne |

## The Story

I was reading through HackerOne reports when I came across one about testing whether platform functions still work after you delete your account. Simple concept, but nobody was testing it.

So I tried it on a community platform.

I created an account, set up a server, and used Burp Suite to capture a `PATCH /v4/communities/{id}` request. Then I deleted my account via `DELETE /v4/users/@me`, waited some time, and replayed the saved PATCH request.

**It worked.** The server details were updated — by a deleted account.

## The Vulnerability

The API did not invalidate bearer tokens upon account deletion. After sending:

```http
DELETE /v4/users/@me
Authorization: Bearer <token>
```

The account was deleted, but the same token could still be used:

```http
PATCH /v4/communities/{id}
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Still modifies server name, description, URLs, images...
```

A deleted user could continue editing server configurations, injecting links, changing metadata — all while their account no longer existed.

## The Battle

This report had a bumpy ride.

**First closure — Informative:** The HackerOne analyst closed it, arguing it only affects your own account and there's no privilege escalation.

**My pushback:** I explained that a deleted account modifying live, public-facing content is a real security concern. Deleted users shouldn't be able to inject phishing links into community descriptions. The expectation is that deletion = full access revocation.

**Reopened by the program:** The program engineer reopened the report and asked me to retest after they deployed a fix.

**Retest passed:** I replayed the same requests — the token returned `401 Unauthorized`. Fix confirmed.

## Impact

- **Post-deletion persistence** — deleted accounts retain API access
- **Data tampering** — modify server metadata, descriptions, external links
- **Phishing vector** — inject malicious links into public community content
- **Trust violation** — users expect account deletion to fully revoke access

## Timeline

| Date | Event |
|------|-------|
| 2025-06-07 | Report submitted |
| 2025-06-10 | Closed as Informative by analyst |
| 2025-06-10 | Pushed back with detailed impact explanation |
| 2025-06-18 | Reopened by program, invited for retest |
| 2025-06-18 | Retest completed — fix confirmed (401 Unauthorized) |
| 2025-06-19 | Resolved |
| 2025-06-24 | Bounty awarded |

## Takeaways

1. **Test account deletion flows** — it's a rarely tested area with high potential for findings
2. **Save requests in Burp before deleting** — you need those captured requests to replay after deletion
3. **Don't accept Informative closures blindly** — push back with clear impact if you believe the finding is valid
4. **Read other researchers' reports for inspiration** — a simple concept from someone else's report turned into a valid finding
5. **Wait before replaying** — give the system time to process the deletion, then test token validity
