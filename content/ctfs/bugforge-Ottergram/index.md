---
title: "BugForge – Ottergram"
description: "The Ottergram challenge on BugForge is an easy-level web vulnerability lab centered on exploiting a misconfigured GraphQL endpoint. Players must leverage enabled introspection to map the database schema, identify poor object-level access controls, and perform an IDOR attack by manipulating user identifiers to access administrative accounts and recover a hidden flag."
date: 2026-01-10
categories: [CTF]
tags: [ctf, web, bugforge, graphql, idor]
image: /images/challenges/bugforge/ottergram/cover-ottergram-bugforge.png

author: MOZA
toc: true
---
## Challenge Info

- **Challenge Name:** Ottergram 
- **Platform:** bugforge
- **Category:** Web
- **Difficulty:** Easy
- **Points:** 10
- **Hint:** `GraphQL`

---

##  Challenge Overview

The challenge provides a web application called **Ottergram**. The given hint strongly suggests that the vulnerability lies within a **GraphQL endpoint**.

The application scope allows access to all paths under:

```bash
https://<lab-id>.labs-app.bugforge.io/*
```

![Main Page](/images/challenges/bugforge/ottergram/main-page.png)


---

##  Initial Reconnaissance

While exploring the application, I tested common GraphQL endpoints and discovered that the following endpoint was accessible: 

`/graphql`


Visiting this endpoint revealed a **GraphQL playground / GUI**, allowing direct execution of GraphQL queries.



---

##  GraphQL Introspection

Since introspection was enabled, I executed an introspection query to enumerate the schema.

From the schema, I identified a `user` query that accepted an `id` parameter and returned sensitive fields, including:

* `id`
* `email`
* `password`
* `role`

 **Important Observation:**
Sensitive fields such as **passwords** were directly exposed via GraphQL queries, indicating poor access control.

![Introspection Page](/images/challenges/bugforge/ottergram/introspection-page.png)

---

##  Exploiting IDOR via GraphQL

I initially queried my own user account:

```graphql
query {
  user(id: 4) {
    id
    email
    password
    role
  }
}
```

This returned valid user data.

![UserData Page](/images/challenges/bugforge/ottergram/user-data.png)


Next, I tested for **Insecure Direct Object Reference (IDOR)** by changing the user ID:

```graphql
query {
  user(id: 2) {
    id
    email
    password
    role
  }
}
```

 **Result:**
The response returned data for the **admin user**, including the **admin password**.

![admindata Page](/images/challenges/bugforge/ottergram/admin-data.png)

---

##  Flag Retrieval

The admin password field contained the **flag**, completing the challenge successfully.

---

##  Root Cause Analysis

The vulnerability exists due to:

* Enabled GraphQL introspection in production
* Lack of authorization checks on user queries
* Exposure of sensitive fields (passwords) via GraphQL
* ID-based access control without validation

---

##  Conclusion

This challenge demonstrates how misconfigured GraphQL endpoints can lead to severe data exposure. By leveraging introspection and testing simple ID manipulation, it was possible to access administrative credentials and retrieve the flag.

**Lesson Learned:**
Always disable introspection in production and enforce strict authorization on GraphQL resolvers.

---
