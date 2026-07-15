# 77. Project Document Generator

## 1. Purpose

This document defines the repeatable pipeline for generating, reviewing and approving MIPs and LP task sets with Codex.

## 2. Pipeline

```text
Select Module
→ Prepare Source Package
→ Generate MIP
→ Generate LP Tasks
→ Self-Review
→ Independent Review
→ Apply Corrections
→ Final Review
→ Approve MIP
→ Mark LP Tasks Draft
→ Start Implementation
```

## 3. Required Inputs

Before generation:

- module number;
- module name;
- authoritative Blueprint documents;
- authoritative Engineering documents;
- relevant previous MIPs;
- Event Catalog;
- API Contract;
- Data Model;
- Permission Matrix;
- UAT references;
- output path.

## 4. Generation Command

Use the prompt from:

`75-agent-document-generation-prompt.md`

One Codex session generates the files.

## 5. Independent Review

Use a separate Codex session with:

`76-agent-document-review-prompt.md`

The generator must not approve its own output.

## 6. Correction Cycle

When findings exist:

1. create a documentation correction task;
2. apply exact edits;
3. rerun review;
4. repeat until approved.

## 7. Approval Gate

A MIP is approved only when:

- no P0;
- no open P1;
- all required sections exist;
- all references work;
- ownership is unambiguous;
- task set covers the module;
- final review returns `APPROVED` or accepted `APPROVED WITH FOLLOW-UP`.

## 8. Folder Structure

```text
implementation/
├── mip/
│   ├── MIP-000-platform-foundation.md
│   ├── MIP-001-authentication.md
│   └── ...
└── tasks/
    ├── platform-foundation/
    ├── authentication/
    └── ...
```

Each task folder contains:

- `TASK-INDEX.md`
- LP task files

## 9. Recommended Module Order

1. Platform Foundation
2. Authentication
3. Customer
4. Business
5. Brand
6. Location
7. Employee
8. Loyalty Program
9. Membership
10. Customer Mobile Foundation
11. Employee Mobile Foundation
12. Receipt
13. Reward
14. XP
15. Visit
16. Status
17. Benefit
18. Redemption
19. Reward Goal
20. Instant Reward
21. Automation
22. Notification
23. Analytics
24. AI Recommendation
25. Loyalty Network
26. Platform Administration
27. Business Portal
28. Mobile Build and Distribution
29. Production Hardening

## 10. Codex Usage with Subscription Limits

Work in bounded sessions.

Recommended pattern:

1. one session generates MIP;
2. stop when usage limit is reached;
3. continue later using existing files as source;
4. one separate session reviews;
5. one correction session applies findings;
6. commit after approved package.

Each prompt must instruct Codex to:

- inspect existing files first;
- continue rather than regenerate approved sections;
- return changed files;
- avoid unrelated changes;
- preserve task numbering.

## 11. Version Control

For every generated module package:

- create one branch;
- commit source generation files;
- commit MIP and LP files;
- run review;
- commit corrections;
- merge only after approval.

Recommended branch:

`agent/documentation/MIP-003-business`

## 12. Completion Record

For every module record:

- MIP version;
- generation prompt version;
- source document versions;
- generator session;
- reviewer session;
- findings;
- corrections;
- approval;
- LP range;
- approval date.

## 13. Definition of Generator Ready

The document generation system is ready when:

- standards 72–74 exist;
- prompts 75–76 exist;
- output folders exist;
- module order is approved;
- one module completes the full generation and review cycle successfully.
