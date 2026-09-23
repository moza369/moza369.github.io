---
title: "HTML Injection in Email Notifications via Seller Form"
description: "A car marketplace contact form rendered HTML in email notifications — I hesitated to report it, but it turned out to be a valid finding."
date: 2025-11-13
categories: [Writeups]
tags: [bugbounty, html-injection, email, xss]
author: MOZA
toc: true
platform: "HackerOne"
report: "https://hackerone.com/reports/3425055"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | Car marketplace platform |
| **Weakness** | HTML Injection in Email |
| **Status** | Triaged |
| **Platform** | HackerOne |

## The Story

I found this one while testing a car seller form on a marketplace platform. The `First Name` field caught my attention — when I submitted HTML tags, they got **rendered in the email notification** I received.

At first, I didn't report it. HTML injection in emails often gets closed as informative, and I didn't want to waste anyone's time.

But after thinking about it, I realized the impact was real — these emails come from a **trusted company domain**. A phishing link injected through this form would look completely legitimate to the recipient. So I submitted it.

Good thing I did.

## The Vulnerability

The car seller contact form had multiple fields that were vulnerable:

| Field | Payload | Result |
|-------|---------|--------|
| First Name | `<h1>moza</h1>` | Heading rendered in email |
| Last Name | `<u>Moza</u>` | Underlined text in email |
| "Tell us about your car" | `<img src="...">` | External image loaded in email |

None of the fields sanitized HTML before including them in the email notification template.

The most dangerous payload was anchor tag injection:

```html
<a href="https://evil.com">Click here to verify your account</a>
```

This renders as a clickable link in the seller's email — coming from the platform's own trusted email servers.

## Impact

- **Phishing via trusted domain** — emails come from the platform's real servers, bypassing spam filters and building trust
- **Content spoofing** — inject fake notices, urgency messages, or fake login prompts
- **Image injection** — load external images for tracking or social engineering
- **Link injection** — redirect sellers to malicious sites

## Vendor Response

> *"Thanks so much for the submission! This is a good finding but technically relies on phishing which we normally don't award bounties for. I'm awarding you a bounty since it is from a trusted domain."*

## Takeaways

1. **Don't dismiss findings too quickly** — what seems "informative" might be valid with the right framing
2. **Email rendering is often overlooked** — developers sanitize web output but forget email templates
3. **Trusted sender domain matters** — HTML injection in emails from trusted domains is more impactful than on random sites
4. **Test all input fields** — not just the obvious ones, but every field that might appear in notifications
