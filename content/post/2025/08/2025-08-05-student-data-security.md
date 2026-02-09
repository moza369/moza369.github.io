---
title: "Are We Safe When Registering on University Websites?"
date: 2025-08-05
layout: post
tags: [security, education, awareness, student-privacy]
cover: /images/cover.jpeg
---

Every year, thousands of students register for schools and universities through online platforms. These websites often request a lot of personal information, including:

- Full name  
- National ID number  
- Email address  
- Phone number  
- Home address  
- Photo  
- Grades or academic background  

But here's the big question:  
👉 **Is our data really safe when we submit it?**

---

## 🕵️‍♂️ What I Noticed During My Own Registration

While registering on several school websites in **my country**, I began to pay closer attention to how these platforms handled student data.

Out of curiosity — and because I’m passionate about cybersecurity — I noticed something alarming:

> After completing my registration, I received a receipt with a URL containing a number, something like `id=xxx9`. Out of curiosity, I changed that number to `xxx8` — and to my surprise, the page showed **another student’s receipt**, with all of their private information visible.

This kind of issue is known as **IDOR** (Insecure Direct Object Reference). It means that the system does not properly check if a user is allowed to access the data they're requesting.

No authentication, no permission check, no warning — just access to someone else's private file.

---

## 💣 The Real-World Danger: Your Data Could Be Sold

This kind of flaw might seem small, but it opens the door to **mass data leaks**.

If this is possible with one or two ID changes, it could easily be automated by a malicious actor. A black hat hacker could write a simple script that goes through thousands of IDs, collecting private student data.

> Imagine seeing something like this being sold online:  
> 🧨 **“Student database for sale – [My Country] students – X0000+ full profiles”**

And all of it collected from a school website that was supposed to protect our personal data.

---

## ⚠️ Why This Is a Serious Problem

If any random user can access someone else's private documents, the risks are huge:

- Identity theft  
- Phishing or scams using real data  
- Private academic details being exposed  
- Misuse of personal photos  
- Long-term privacy consequences  

And here’s the thing: most students don’t even know their data can be accessed this way. They just fill out forms and upload documents, trusting the system.

---

## 🧠 Why These Issues Exist

Unfortunately, many educational platforms in my country are built **without basic security practices**, such as:

- Proper user access control  
- Secure document delivery methods  
- Encryption and session validation  
- Security testing before launch  

In most cases, these platforms are developed quickly to meet registration deadlines — and security is ignored.

---

## ✅ What Can Be Done

### 🏫 For Schools and Developers:

- Follow basic web security practices (like the **OWASP Top 10**).
- Never allow direct file access without validating the user.
- Use secure tokens or session-based permissions for document downloads.
- Test websites regularly for vulnerabilities before going live.

### 🎓 For Students:

- Be cautious when submitting personal information online.
- If something feels wrong (like being able to view others' data), speak up or report it if it’s allowed.
- Avoid uploading unnecessary documents unless required.
- Protect your data — it’s your right.

---

## 💬 Final Thoughts

Digital education is a great step forward, but **without security, it becomes a risk** — not just for institutions, but for every student.

> As students, developers, and citizens, we should all ask:  
**Are we protecting our future, or exposing it?**

---

🛡️ *This blog is written purely for educational and awareness purposes. No personal data was shared, and all observations were made through public, non-intrusive exploration during normal registration processes.*
