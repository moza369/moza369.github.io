---
title: "BugForge- Tanuki – idor"
date: 2026-01-13
categories: [BugForge]
tags: [bugforge, idor, web, writeup]
author: moza
---



# 🩸 First Blood Writeup – Tanuki Scope (Daily Challenge)

**Challenge Name:** Tanuki Scope  
**Difficulty:** Easy  
**Points:** 10  
**Category:** Web / IDOR  
**Status:** ✅ Solved  
**First Blood:** moza369 🩸  

---

## 🧠 Challenge Overview

Tanuki Scope is a daily web challenge that simulates a small learning platform.  
The application allows users to **register and log in**, then study different decks such as *Technology* and *Linux Trivia*.

After logging in, the dashboard displays progress information like:

- Cards studied
- Cards mastered
- Weekly sessions
- Study statistics

The objective was to identify a vulnerability that leads to the flag.

---

## 🔍 Initial Recon

After logging in, the app greets the user with:

![login Page](/assets/img/bugfrog/tunaki/login-page.png)

> *Welcome back, moza!*  
> *Choose a deck to start studying*

Nothing unusual at first glance.  
So the next step was to **open Burp Suite** and monitor the traffic while navigating through the dashboard and stats sections.

![dashboard Page](/assets/img/bugfrog/tunaki/dashboard-page.png)

![explore Page](/assets/img/bugfrog/tunaki/explore-page.png)

---

## 🕵️ Traffic Analysis

While inspecting the requests, I noticed the frontend calling an API endpoint to fetch user statistics:

```http
GET /api/stats/4 HTTP/2
```

The number at the end (`4`) looked like a *user ID*, which immediately raised a red flag 🚩.

This was a classic sign of a potential Insecure Direct Object Reference (IDOR) vulnerability.

![my state Page](/assets/img/bugfrog/tunaki/my-stat-page.png)


---
## 🔓 Exploitation (IDOR)

To test this, I manually modified the request in Burp:
```
GET /api/stats/1 HTTP/2
```

### 🎯 Result

The server responded successfully and returned another user’s data — including the *flag*.

```
{
  "total_cards_studied": 0,
  "cards_mastered": 0,
  "total_reviews": null,
  "sessions_this_week": 0,
  "cards_studied_this_week": 0,
  "achievement_flag": "bug{FLAG_HERE}"

```
No authorization checks. No validation. Just pure IDOR.

![idor Page](/assets/img/bugfrog/tunaki/idor-page.png)

---
## 🧩 Root Cause

The `/api/stats/:id` endpoint trusted user-supplied input and failed to verify whether the authenticated user was authorized to access the requested object.

This allowed any logged-in user to:

- Change the id value

- Access other users’ statistics

- Retrieve sensitive information

---
## 🛡️ Takeaways

- IDOR vulnerabilities are simple but powerful

- Never rely on frontend logic for authorization

- Always enforce object-level access control on the backend

---
## 🩸 Final Thoughts

A clean and straightforward challenge with a textbook IDOR vulnerability.
Managed to grab **First Blood** 🩸 on this one — always a good feeling.

Happy hacking 🚀
— moza369