# Calendar Productivity — StudentOS

> A student-focused productivity and personal management system for organizing schedules, academic tasks, finances, goals, and daily student life.

## 📌 About the Project

**Calendar Productivity — StudentOS** is my long-term portfolio project designed to grow alongside my journey in Software Engineering, Networking, Cloud, and Infrastructure Engineering.

StudentOS aims to bring important parts of student life into one system instead of separating schedules, assignments, finances, notes, and personal goals across multiple applications.

The project follows an iterative engineering approach:

**Requirements → User Stories → Wireframes → Architecture → Database Design → MVP → Infrastructure → Production**

---

## 🎯 Project Goals

StudentOS aims to help students:

* Organize class schedules
* Track assignments and deadlines
* Plan daily and weekly activities
* Manage personal finances
* Control daily spending
* Set and track saving goals
* Understand upcoming academic workload
* Manage student life from a unified dashboard

---

## 🧩 Core Modules

### 📅 Calendar & Productivity

* Daily calendar
* Weekly calendar
* Class schedules
* Academic events
* Personal events
* Daily planning

### ✅ Task Management

* Create, edit, and delete tasks
* Assignment deadlines
* Task priorities
* Task status
* Associate tasks with courses

Possible task states:

```text
TODO
IN_PROGRESS
DONE
```

### 🎓 Course Management

* Course name
* Course code
* Class schedule
* Classroom/location
* Related assignments

### 💰 Finance Management

StudentOS will include a personal finance module designed around student life.

Planned features include:

* Monthly budget
* Income tracking
* Expense tracking
* Expense categories
* Remaining balance
* Saving goals
* Daily spending allowance
* Monthly financial summary

One important feature is the **Daily Spending Calculator**.

For example:

```text
Available Money       = 10,000 THB
Saving Goal           = 3,000 THB
Spendable Money       = 7,000 THB
Days Remaining        = 20

Daily Spending Budget = 350 THB/day
```

When a new expense is recorded, StudentOS can recalculate the recommended daily budget based on the remaining money and remaining days.

### 🎯 Saving Goals

Students can create saving goals such as:

```text
New Laptop
Target: 50,000 THB

Current Savings: 20,000 THB
Progress: 40%
```

Future versions may connect saving goals with the gamification system.

### 🏠 Student Dashboard

The dashboard will combine information from multiple StudentOS modules.

```text
┌─────────────────────────────────────────────┐
│              STUDENT OS                     │
├──────────────────────┬──────────────────────┤
│ Today's Schedule     │ Upcoming Tasks       │
│                      │                      │
│ 09:00 Network        │ Network Lab    1 day │
│ 13:00 OOP            │ OOP Project    3 days│
├──────────────────────┼──────────────────────┤
│ Finance              │ Saving Goal          │
│                      │                      │
│ Balance: ฿7,000      │ Laptop               │
│ Today: ฿350          │ ███████░░░ 70%       │
├──────────────────────┴──────────────────────┤
│              Weekly Overview                │
└─────────────────────────────────────────────┘
```

---

## 👤 Target Users

The initial target user is a university student who wants to manage:

* Classes
* Assignments
* Deadlines
* Personal schedules
* Academic workload
* Daily expenses
* Monthly budgets
* Saving goals

The first version will focus on solving real student problems before expanding to a larger user base.

---

## 📖 Initial User Stories

### Schedule Management

> As a student, I want to store my weekly class schedule so that I can quickly see what classes I have each day.

### Assignment Tracking

> As a student, I want to record assignments and their deadlines so that I do not forget important coursework.

### Daily Planning

> As a student, I want to see my classes and tasks for today so that I know what I need to focus on.

### Finance Management

> As a student, I want to record my expenses so that I can understand where my money is being spent.

### Daily Spending

> As a student, I want StudentOS to calculate how much money I can safely spend each day so that my budget lasts until the end of the month.

### Saving Goals

> As a student, I want to set saving goals and track my progress so that I can manage my long-term financial goals.

---

## 🏗️ Architecture Direction

The initial architecture is planned as a **Modular Monolith**.

```text
                    ┌───────────────────┐
                    │     Frontend      │
                    │  Web Application  │
                    └─────────┬─────────┘
                              │
                            HTTP
                              │
                    ┌─────────▼─────────┐
                    │    Backend API    │
                    │                   │
                    │  Authentication   │
                    │  Calendar         │
                    │  Courses          │
                    │  Tasks            │
                    │  Finance          │
                    │  Dashboard        │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │    PostgreSQL     │
                    └───────────────────┘
```

A Modular Monolith is intentionally chosen for the early stages to keep development and deployment manageable while maintaining clear module boundaries.

Microservices will only be considered when future requirements justify the additional complexity.

---

## 🗄️ Initial Domain Model

```text
User
│
├── Semester
│   └── Course
│       ├── ClassSchedule
│       └── Task
│
├── PersonalEvent
│
└── Finance
    ├── Budget
    │   └── Expense
    │
    └── SavingGoal
```

The data model is preliminary and will evolve during the database design phase.

---

## 🛠️ Technology Stack

The technology stack is intentionally not finalized yet.

```text
Frontend        → TBD
Backend         → TBD
Database        → PostgreSQL
Container       → Docker
Cloud           → AWS
Infrastructure  → Terraform
Orchestration   → Kubernetes
CI/CD           → TBD
```

Technologies will be introduced when they solve a real engineering problem rather than simply being added for portfolio purposes.

---

## 🚀 Infrastructure Evolution

```text
Local Development
        ↓
Linux Environment
        ↓
Git / GitHub
        ↓
Docker
        ↓
Reverse Proxy
        ↓
CI/CD
        ↓
AWS
        ↓
Terraform
        ↓
Monitoring & Logging
        ↓
Kubernetes
        ↓
Production-ready Infrastructure
```

---

## 🗺️ Development Roadmap

### Phase 0 — Requirements 🟡

* [ ] Define problem statement
* [ ] Identify target users
* [ ] Define functional requirements
* [ ] Define non-functional requirements
* [ ] Define MVP scope

### Phase 1 — System Design

* [ ] User stories
* [ ] User flows
* [ ] Wireframes
* [ ] System architecture
* [ ] Database design
* [ ] API design

### Phase 2 — MVP

* [ ] User authentication
* [ ] Course management
* [ ] Class schedule
* [ ] Task management
* [ ] Deadline tracking
* [ ] Finance tracking
* [ ] Monthly budget
* [ ] Daily spending calculation
* [ ] Saving goals
* [ ] Student dashboard

### Phase 3 — Infrastructure

* [ ] Linux deployment environment
* [ ] Dockerize application
* [ ] Reverse proxy
* [ ] Environment configuration
* [ ] Health checks
* [ ] Logging

### Phase 4 — Cloud & Automation

* [ ] AWS deployment
* [ ] CI/CD pipeline
* [ ] Infrastructure as Code with Terraform
* [ ] Monitoring and observability
* [ ] Backup and recovery

### Phase 5 — Production Engineering

* [ ] Security hardening
* [ ] Automated testing
* [ ] Performance testing
* [ ] Reliability improvements
* [ ] Production documentation
* [ ] Evaluate Kubernetes when justified

---

## 🌱 StudentOS Vision

StudentOS is designed to eventually become a collection of connected student-focused modules.

```text
StudentOS
│
├── 📅 Calendar & Productivity
├── 🎓 Academic Management
├── ✅ Tasks & Deadlines
├── 💰 Finance
├── 📝 Notes & Knowledge
├── 🎯 Goals
├── 📊 Progress Tracking
└── ⚙️ Infrastructure Platform
```

Possible future capabilities include notifications, gamification, achievements, saving points, leaderboards, analytics, and other modules based on actual user needs.

The long-term objective is not only to build an application, but also to understand how a real system is:

**Designed → Built → Deployed → Operated → Monitored → Recovered → Improved**

---

## 📊 Project Status

```text
Current Stage: Requirement Discovery
Status: 🟡 In Development
```

StudentOS is currently focused on requirements and system design.

Implementation will begin after the MVP requirements and architecture have been clearly defined.

---

## 📚 Learning Objectives

StudentOS will serve as a practical environment for developing skills in:

* Software Architecture
* Frontend Development
* Backend Development
* Database Design
* Linux
* Computer Networking
* Docker
* Cloud Infrastructure
* Infrastructure as Code
* CI/CD
* Observability
* Reliability Engineering
* Platform Engineering

---

## 📄 Documentation

```text
docs/
├── requirements/
├── user-stories/
├── architecture/
├── database/
├── api/
├── deployment/
├── infrastructure/
└── decisions/
```

Architecture decisions may be documented using **Architecture Decision Records (ADR)**.

---

## 🤝 Development Philosophy

**Understand the problem before writing code.**

**Start simple and evolve when requirements demand it.**

**Every technology should solve a real engineering problem.**

**Infrastructure is part of the product, not an afterthought.**

---

## 📜 License

License information will be added as the project develops.
