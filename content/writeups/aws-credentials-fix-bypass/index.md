---
title: "AWS Firehose Credentials Fix Bypass"
description: "A previously reported AWS credentials leak was marked as resolved, but the credentials were never rotated. I verified they still worked and could inject data into the production logging stream."
date: 2026-01-12
categories: [Writeups]
tags: [bugbounty, information-disclosure, aws, fix-bypass]
author: MOZA
toc: true
severity: "Medium"
platform: "HackerOne"
report: "https://hackerone.com/reports/3508285"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | REACTED |
| **Weakness** | Information Disclosure — Fix Bypass |
| **Severity** | Medium |
| **Status** | Triaged |
| **Platform** | HackerOne |

## The Story

I was reading through disclosed HackerOne reports when I came across a publicly disclosed vulnerability about exposed AWS Firehose credentials on a DoD system. The report had been marked **"Resolved"** back in February 2025.

But resolved doesn't always mean fixed properly.

I grabbed the credentials from the original disclosure and tested them. They still worked.

## The Vulnerability

The original report exposed AWS IAM credentials for a Firehose delivery stream. The "fix" apparently addressed the disclosure vector — how the credentials were exposed — but **nobody ever rotated the actual credentials**.

I verified this in two steps:

**Step 1 — Identity verification:**

```bash
aws sts get-caller-identity
```

```json
{
    "UserId": "[REDACTED]",
    "Account": "[REDACTED]",
    "Arn": "arn:aws:iam::[REDACTED]:user/[REDACTED]"
}
```

The IAM user was still active. Not deactivated, not rotated — fully functional.

**Step 2 — Data injection:**

```bash
aws firehose put-record \
  --delivery-stream-name [REDACTED] \
  --record '{"Data":"[base64-encoded-test-payload]"}' \
  --region us-west-2
```

```json
{
    "RecordId": "2htXYcgZwLwg8VfkSWaVAk...",
    "Encrypted": false
}
```

I successfully pushed a test record into the production Firehose delivery stream. Write access confirmed — **unauthenticated, using publicly disclosed credentials**.

## Impact

The failure to rotate these credentials means anyone who viewed the original public disclosure now has valid write access to internal logging infrastructure:

- **Log poisoning** — inject fake events to disrupt security monitoring and SIEM alerts
- **Financial impact** — flood the stream to inflate AWS usage costs
- **Persistent backdoor** — publicly documented credentials that still work, months after "resolution"
- **Data integrity** — Firehose streams often feed data lakes, analytics, and compliance systems

## Timeline

| Date | Event |
|------|-------|
| 2025-02-06 | Original report marked as "Resolved" |
| 2026-01-12 | I test the credentials — still active, submitted fix bypass report |
| 2026-01-13 | Triaged by DoD VDP team within 24 hours |

## Takeaways

1. **"Resolved" doesn't mean "fixed"** — always verify that credentials are actually rotated after a leak
2. **Read disclosed reports** — they're a goldmine for finding fix bypasses and incomplete remediations
3. **Credential rotation is mandatory** — removing the exposure vector without rotating the credentials is not a fix
4. **AWS IAM keys should be deactivated immediately** — then rotated, not just "addressed" in the application layer
