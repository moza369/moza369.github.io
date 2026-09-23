---
title: "CampusVoice"
description: "A secure, anonymized university feedback & evaluation platform built with Flask and deployed on Microsoft Azure."
date: 2026-05-01
categories: [Projects]
tags: [flask, azure, cloud, python, security]
author: MOZA
tech: ["Python", "Flask", "Azure App Service", "Azure SQL", "Gunicorn"]
github: "https://github.com/moza369/campusvoice"
status: "Completed"
toc: true
---

## Overview

**CampusVoice** is a secure, anonymized feedback collection platform built for universities. It allows students to submit honest evaluations of courses and instructors without any login, while providing professors and administrators with actionable insights through a protected dashboard.

Built as a **Cloud Computing mini-project** for the Master's program in AI & Emerging Technologies at FPN Nador.

## Key Features

- **Anonymous Student Submissions** — No login required, anonymity-first design
- **Role-Based Access Control** — Separate interfaces for students, professors, and administrators
- **Real-time Dashboard** — Filter, analyze, and export feedback data as CSV
- **Anti-Spam** — One feedback per professor per day per IP, rate limiting (5 attempts / 60s)
- **Cloud-Native** — Deployed on Microsoft Azure (PaaS architecture)

## Architecture

A 3-tier design:

1. **Presentation Layer** — Flask web app with Jinja2 templates
2. **Application Layer** — Business logic, authentication, rate limiting
3. **Data Layer** — Azure SQL Database with encrypted connections

```
Web Browser (HTTPS)
       │
Azure App Service (Flask + Gunicorn)
  - CSRF Protection (Flask-WTF)
  - Rate Limiting (Flask-Limiter)
  - Security Headers
  - Session Management (HttpOnly + Secure)
       │
  TLS/Encrypted Channel
       │
Azure SQL Database
  - Tables: Users, Professors, Feedbacks
  - Firewall Rules (App Service only)
  - Encrypted connections
```

## Security

| Feature | Purpose | Technology |
|---------|---------|-----------|
| CSRF Protection | Prevent cross-site requests | Flask-WTF |
| Rate Limiting | Block brute force & spam | Flask-Limiter |
| Anti-Spam | 1 feedback/professor/day/IP | Custom logic |
| Secure Headers | XSS, clickjacking, MIME-sniffing | CSP, HSTS, X-Frame-Options |
| Session Security | HttpOnly + Secure + SameSite | Flask session config |
| Input Sanitization | XSS prevention | markupsafe.escape() |
| TLS 1.2+ | Encrypted communications | Azure |
| SQL Firewall | Only App Service connects to DB | Azure |

## User Roles

- **Students** — Anonymous feedback submission (no account needed), rate 1-5 stars + comment
- **Professors** — Authenticated dashboard, view only their own feedback, filter & export
- **Admins** — Full access to all feedback, manage professor accounts, system-wide reporting

## Future Enhancements

- Replace MD5 with bcrypt/Argon2 password hashing
- Azure Key Vault for secrets management
- Microsoft Entra ID (Azure AD) SSO
- Analytics dashboard with charts
- Sentiment analysis on feedback comments
- ML-based spam detection

## Team

- **Mohamed Zahir**
- **Mohammed Boujaada**

Institution: FPN Nador — Master's Program (AI & Emerging Technologies)
