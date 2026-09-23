---
title: "Unauthenticated SQL Injection via WordPress 0day — Mars (Royal Canin)"
description: "When a WordPress 0day dropped, I ran it across my target's subdomains and found two vulnerable hosts — leading to unauthenticated database extraction on a Mars (Royal Canin) domain."
date: 2026-07-18
categories: [Writeups]
tags: [bugbounty, rce, sqli, wordpress, 0day]
author: MOZA
toc: true
severity: "Critical"
platform: "HackerOne"
report: "https://hackerone.com/reports/3874756"
---

## Summary

| Detail | Value |
|--------|-------|
| **Target** | Mars (Royal Canin) |
| **Weakness** | Authentication Bypass → SQL Injection (CVE-2026-63030 / CVE-2026-60137) |
| **Severity** | Critical |
| **Status** | Resolved |
| **Platform** | HackerOne |

## The Story

I had Mars in my scope for a while. Subdomains were already enumerated, endpoints mapped — the usual recon groundwork that sits in your notes waiting for the right moment.

That moment came when **wp2shell dropped**.

A 0day targeting WordPress core — specifically a batch-route confusion flaw in `WP_REST_Server::serve_batch_request_v1()` combined with a SQL injection in the `WP_Query` class via the `author__not_in` parameter. An unauthenticated attacker could bypass authentication through the REST API batch endpoint and inject SQL queries directly into the database.

I grabbed the PoC and ran it across all my Mars subdomains.

**Two hits.**

## The Vulnerability

The vulnerability chain works like this:

1. **Batch-route confusion** — the `/wp-json/batch/v1` endpoint processes batched API requests, but a flaw in how it resolves internal routes allows bypassing authentication requirements
2. **SQL Injection** — once past authentication, the `author__not_in` parameter in `WP_Query` is injectable, giving direct database access

```bash
# Step 1: Check if the target is vulnerable
python3 wp2shell.py check https://target.example.co.uk/

# Step 2: Extract database information
python3 wp2shell.py read https://target.example.co.uk/
```

The output confirmed everything:

```
[*] UNION extraction unavailable; trying error-based.
[*] Target does not reflect DB errors; falling back to blind extraction.
[+] MySQL version: 8.0.x
[+] Database user: [REDACTED]
[+] Database name: [REDACTED]
[*] 122 request(s) sent.
```

Full database read access — **unauthenticated**.

The full RCE file-write capabilities (webshell deployment) were blocked by edge hardening on the server, but the SQL injection alone was enough to extract the entire database: user records, metadata, configuration contents — everything.

I submitted one report and got a valid finding. The second hit on a different subdomain was marked as a duplicate of my own report.

## Impact

- **Unauthenticated database extraction** — no credentials needed to dump the entire WordPress database
- **User data exposure** — WordPress user records, emails, hashed passwords
- **Configuration leak** — wp_options table contains API keys, secrets, site configuration
- **Pre-auth attack** — exploitable by anyone on the internet with zero interaction
- **WordPress core vulnerability** — affects the CMS itself, not just a plugin

## Timeline

| Date | Event |
|------|-------|
| 2026-07-18 | Report submitted (0day dropped, ran across scope) |
| 2026-07-19 | Preliminary review passed |
| 2026-07-20 | Analyst asked for full RCE proof — explained edge hardening blocks file-write but SQLi is confirmed |
| 2026-07-21 | Sent to remediation team |
| 2026-08-10 | Triaged |
| 2026-09-02 | Confirmed patched by me |
| 2026-09-11 | Retest completed, fix verified |

## Takeaways

1. **Keep your recon fresh** — having subdomains and scope ready means you can act instantly when a 0day drops
2. **Not every RCE needs a webshell** — database extraction alone is critical severity
3. **Speed matters** — 0days have a short window before patches roll out
4. **Run tools across your entire scope** — one script, multiple targets, two valid findings from a single run
5. **Edge hardening works** — the server blocked file-write, proving defense-in-depth matters even when the app is vulnerable
