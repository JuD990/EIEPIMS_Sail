# EIEPIMS – English Immersive Environment Implementation Management System

> **Note on Migration:** This repository represents a modernized migration of the original EIEPIMS project to a containerized environment using **Laravel Sail** and **Docker**.  
> **Original Repository:** [JuD990/EIEPIMS](https://github.com/JuD990/EIEPIMS.git)

An enterprise management system for tracking English proficiency performance across college departments.

## 🎯 Overview
EIEPIMS is a full-stack web application developed in collaboration with university administrators and faculty. It streamlines evaluation workflows, generates analytics, and maintains audit-ready performance records for the EIE program in the University of Nueva Caceres.

## ✨ Features
- **6-tier Role-Based Access Control:** Secure authentication via Laravel Sanctum.
- **Complex Data Architecture:** 23-table MySQL database with intricate relationships.
- **Real-time Analytics:** Interactive dashboards powered by Chart.js.
- **Reporting:** PDF/CSV export capabilities for compliance reporting.
- **Data Integrity:** Immutable audit logging for transparency.

## 🏗️ Modernized Tech Stack
* **Core:** Laravel 11, PHP 8.3, MySQL
* **Infrastructure:** Laravel Sail (Docker), Nginx Reverse Proxy
* **Frontend:** React, Tailwind CSS, Chart.js, daisyUI
* **Operating Environment:** WSL2 (Ubuntu/Linux)

---

## 🚀 Quick Start (Sail Environment)

To run this version of the project, you need **Docker Desktop** and **WSL2** installed.

### 1. Setup
```bash
# Clone and enter the repo
git clone [https://github.com/JuD990/EIEPIMS_Sail.git](https://github.com/JuD990/EIEPIMS_Sail.git)
cd EIEPIMS_Sail
```
---
## Setup Environment
cp .env.example .env
---
## Install dependencies (if PHP is not installed locally)
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd):/var/www/html" -w /var/www/html laravelsail/php8.3-composer:latest composer install --ignore-platform-reqs

### 2. Automation
We have included a custom script to launch the Docker containers and the Vite development server simultaneously:
```bash
chmod +x start.sh
./start.sh
```

## Web Access: **http://localhost**
Alias Tip: It is recommended to add **alias sail='[ -f sail ] && sh sail || sh vendor/bin/sail'** to your **~/.bashrc**.

📊 Project Scale
Designed to support 500+ students and 20+ faculty across 8+ college departments.

🎓 Project Context
Capstone project completed from June 2024 to May 2025.

👨‍💻 Developer
Jude Adolfo Email: judea3264@gmail.com

