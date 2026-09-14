# Calendar Productivity — StudentOS

> A student-focused productivity system for managing schedules, academic tasks, deadlines, and daily planning.

## 📌 About the Project

**Calendar Productivity** is a core module of **StudentOS**, a long-term portfolio project designed to grow alongside my journey in Software Engineering, Networking, Cloud, and Infrastructure Engineering.

The goal of this module is to create a practical productivity system that helps students organize their academic life in one place.

Instead of building every feature at once, the project follows an iterative engineering approach:

**Requirements → User Stories → Wireframes → Architecture → Database Design → MVP → Infrastructure → Production**

---

## 🎯 Project Goals

Calendar Productivity aims to help students:

* Organize class schedules
* Track assignments and deadlines
* Plan daily and weekly activities
* Understand upcoming workload
* Reduce missed academic tasks
* Manage academic responsibilities from a single dashboard

The project will begin as a simple application and gradually evolve into a production-ready system.

---

## 🧩 Planned Core Features

### 📅 Calendar

* Daily calendar
* Weekly calendar
* Class schedules
* Academic events
* Personal events

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

Students will be able to manage information about their courses, including:

* Course name
* Course code
* Class schedule
* Classroom/location
* Related assignments

### 🏠 Productivity Dashboard

The dashboard will provide a quick overview of:

```text
Today's Classes
Upcoming Deadlines
Pending Tasks
Completed Tasks
Weekly Schedule
```

---

## 👤 Target Users

The initial target user is a university student who needs a simple way to manage:

* Classes
* Assignments
* Deadlines
* Personal schedules
* Academic workload

The first version will focus on solving real student productivity problems before expanding to more users and features.

---

## 📖 Initial User Stories

### Schedule Management

> As a student, I want to store my weekly class schedule so that I can quickly see what classes I have each day.

### Assignment Tracking

> As a student, I want to record assignments and their deadlines so that I do not forget important coursework.

### Daily Planning

> As a student, I want to see my classes and tasks for today so that I know what I need to focus on.

### Course Organization

> As a student, I want tasks to be associated with courses so that my academic work stays organized.

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
                    │  Dashboard        │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │    PostgreSQL     │
                    │     Database      │
                    └───────────────────┘
```

A Modular Monolith is intentionally chosen for the early stages of the project to keep development and deployment manageable while maintaining clear module boundaries.

Microservices will only be considered if future requirements justify the additional complexity.

---

## 🗄️ Initial Data Model

The initial domain model may include:

```text
User
 │
 ├── Semester
 │     │
 │     └── Course
 │            │
 │            ├── ClassSchedule
 │            │
 │            └── Task
 │
 └── PersonalEvent
```

This model is preliminary and will evolve during the database design phase.

---

## 🛠️ Technology Stack

The technology stack is intentionally not finalized yet.

Technology choices will be made based on project requirements rather than adding technologies only for portfolio purposes.

Possible future technologies include:

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

---

## 🚀 Infrastructure Evolution

One of the main purposes of StudentOS is to connect software development with infrastructure engineering.

The infrastructure will evolve gradually.

```text
Local Development
        │
        ▼
Linux Environment
        │
        ▼
Git / GitHub
        │
        ▼
Docker
        │
        ▼
Reverse Proxy
        │
        ▼
CI/CD
        │
        ▼
AWS
        │
        ▼
Terraform
        │
        ▼
Monitoring & Logging
        │
        ▼
Kubernetes
        │
        ▼
Production-ready Infrastructure
```

Each technology will be introduced when there is an engineering reason to use it.

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
* [ ] Daily dashboard

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

Calendar Productivity is intended to become one part of the larger **StudentOS ecosystem**.

Future StudentOS modules may include:

```text
StudentOS
│
├── Calendar & Productivity
├── Academic Management
├── Finance
├── Notes / Knowledge
├── Project & Skill Tracking
└── Infrastructure Platform
```

The long-term objective is not only to build an application, but also to understand how a real system is:

**Designed → Built → Deployed → Operated → Monitored → Recovered → Improved**

---

## 📊 Project Status

```text
Current Stage: Requirement Discovery
Status: 🟡 In Development
```

The project is currently focused on requirements and system design.

Implementation will begin after the MVP requirements and architecture have been clearly defined.

---

## 📚 What I Want to Learn

This project is also a practical environment for developing skills in:

* Software Architecture
* Backend Development
* Frontend Development
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

As the project evolves, technical documentation will be added for:

```text
docs/
├── requirements/
├── architecture/
├── database/
├── api/
├── deployment/
├── infrastructure/
└── decisions/
```

Architecture decisions may also be documented using **Architecture Decision Records (ADR)**.

---

## 🤝 Development Philosophy

StudentOS follows several engineering principles:

**Understand the problem before writing code.**

**Start simple and evolve when requirements demand it.**

**Every technology should solve a real engineering problem.**

**Infrastructure is part of the product, not an afterthought.**

---

## 📜 License

License information will be added as the project develops.
