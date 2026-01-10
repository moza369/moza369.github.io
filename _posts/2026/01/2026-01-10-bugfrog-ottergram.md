---
title: "BugForge-Shady Ottergram – graphql idor "
date: 2026-01-10
categories: [BugForge]
tags: [bugforge, graphql, web, writeup]
author: moza
---

# Ottergram – Web Challenge Writeup

**Challenge Name:** Ottergram
**Difficulty:** Easy
**Category:** Web
**Hint Provided:** GraphQL

---

##  Challenge Overview

The challenge provides a web application called **Ottergram**. The given hint strongly suggests that the vulnerability lies within a **GraphQL endpoint**.

The application scope allows access to all paths under:

```
https://<lab-id>.labs-app.bugforge.io/*
```

![Main Page](/assets/img/bugfrog/ottergram/main-page.png)


---

##  Initial Reconnaissance

While exploring the application, I tested common GraphQL endpoints and discovered that the following endpoint was accessible:

```
/graphql
```

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

![Introspection Page](/assets/img/bugfrog/ottergram/introspection-page.png)

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

![UserData Page](/assets/img/bugfrog/ottergram/user-data.png)


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

![admindata Page](/assets/img/bugfrog/ottergram/admin-data.png)

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

🩸 *First Blood: m0ri4rty*
🏁 *Challenge Solved*

