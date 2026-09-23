---
title: "Premium Feature Bypass via PATCH Request"
description: "While editing a post, I noticed the imageUrls parameter was already in the request body — empty. Non-premium users shouldn't be able to set it, but the API accepted it without checking."
date: 2025-06-13
categories: [Writeups]
tags: [bugbounty, access-control, api, premium-bypass]
author: MOZA
toc: true
platform: "HackerOne"
report: "https://hackerone.com/reports/3199466"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | Roblox |
| **Weakness** | Improper Access Control |
| **Severity** | Low (adjusted by vendor) |
| **Status** | Resolved |
| **Platform** | HackerOne |

## The Story

I was editing one of my server listings on the platform when I intercepted the PATCH request in Burp Suite. Something caught my eye — the request body already contained an `imageUrls` parameter, sitting there empty alongside other fields:

```
data=test&imageUrls=[]&...
```

According to the UI, uploading images was **"Premium Only"** — the frontend showed a clear message: *"Uploading images is only available to premium servers."*

But the parameter was right there in the request. Already present. Just empty.

I filled it with an external image URL and forwarded the request. The API accepted it. The image appeared on my community profile.

**No premium subscription. No payment. Full premium feature — for free.**

## The Vulnerability

The frontend correctly blocked non-premium users from uploading images. But the API had no server-side check. The `imageUrls` parameter was already included in every PATCH request — the frontend just kept it empty for non-premium users.

```http
PATCH /v4/communities/{id}
Authorization: Bearer <non-premium-user-token>
Content-Type: application/json

{
  "imageURLs": ["https://external-image.example.com/image.png"]
}
```

Response: **200 OK.** The image was set successfully.

The premium restriction was purely a **frontend check**. The API blindly accepted any value for the field without verifying the user's subscription status.

## The Battle

Same pattern as the token report — initially closed, then reopened.

**First closure — Informative:** The analyst said premium feature bypass doesn't cause "direct security impact" and that similar reports were all closed as Informative.

**My pushback:** I attached screenshots showing:
1. The UI explicitly labeling image upload as **"Premium Only"**
2. The error message when trying through the frontend: *"Uploading images is only available to premium servers"*

I argued this wasn't just a frontend quirk — it's a **server-side access control failure** that could cause monetary loss if abused at scale.

**Reopened by the program:** The program engineer reopened, deployed a fix, and invited me to retest.

**Retest passed:** The API now returns:
```json
{"error": "Uploading images is only available to premium servers."}
```

## Impact

- **Premium feature bypass** — non-paying users get paid functionality for free
- **Revenue loss** — undermines the premium subscription model at scale
- **Server-side access control failure** — not just a UI bug, the API doesn't enforce authorization
- **Scalable abuse** — could be automated to provision premium features across many accounts

## Timeline

| Date | Event |
|------|-------|
| 2025-06-13 | Report submitted with PoC |
| 2025-06-17 | Closed as Informative by analyst |
| 2025-06-17 | Pushed back with screenshots showing "Premium Only" UI restriction |
| 2025-06-18 | Reopened by program, invited for retest |
| 2025-06-18 | Retest completed — fix confirmed |
| 2025-06-19 | Resolved |
| 2025-06-24 | Bounty awarded |

## Takeaways

1. **Read every parameter in the request** — the `imageUrls` was already there, just empty — I didn't add it, I just filled it
2. **Frontend restrictions are not security controls** — authorization must be enforced server-side
3. **Push back on Informative closures** — screenshots and clear impact explanations can reopen reports
4. **Test every parameter** — unexpected values in existing fields often reveal access control issues
5. **Two reports, same platform, same pattern** — both reports were initially closed as Informative, both were reopened after pushback
