# EventMate 2.0 AI – Setup & Run Guide

## 📌 Project Overview

Teammates can clone and run this project locally by configuring only environment variables. No source code changes are required.

---

# 🧰 Tech Stack

## Frontend

* React (Vite + TypeScript)

## Backend

* Java 17
* Spring Boot
* Spring Security + JWT
* Maven Wrapper

## Databases

* MySQL (Main Data)
* MongoDB (File Storage)

## Integrations

* Gmail SMTP (Email)
* Google Gemini AI (Optional)

---

# ⚙️ System Requirements

Install before setup:

* Java 17+
* Node.js 18+
* MySQL 8+
* MongoDB
* Git

Check installations:

```
java -version
node -v
npm -v
mysql --version
mongod --version
```

---

# 🚀 Project Setup (Follow Order)

## 1️⃣ Clone Repository

```
git clone <REPO_URL>
cd EventManagement
```

---

## 2️⃣ Database Setup (MySQL)

Open MySQL:

```
mysql -u root -p
```

Create database:

```
CREATE DATABASE event_management_db;
```

Tables will be created automatically by Hibernate.

---

## 3️⃣ Environment Variables (IMPORTANT)

Backend uses environment variable injection.

Format:

```
${VARIABLE_NAME:default_value}
```

Teammates must configure the following.

---

### 🗄️ Database Credentials (REQUIRED)

Windows:

```
setx DB_USERNAME root
setx DB_PASSWORD your_mysql_password
```

Mac/Linux:

```
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
```

---

### 📧 Gmail SMTP Setup (REQUIRED FOR EMAIL FEATURES)

1. Enable 2-Step Verification in Google Account
2. Create App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate password for "Mail"

Add variables:

Windows:

```
setx MAIL_USERNAME yourgmail@gmail.com
setx MAIL_PASSWORD your_app_password
```

Mac/Linux:

```
export MAIL_USERNAME=yourgmail@gmail.com
export MAIL_PASSWORD=your_app_password
```

---

### 🤖 Gemini AI (OPTIONAL)

Get API key:
[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

Windows:

```
setx GEMINI_API_KEY your_api_key
```

Mac/Linux:

```
export GEMINI_API_KEY=your_api_key
```

AI features will be disabled if not provided.

---

### 🔐 JWT Configuration

Already configured with fallback values:

```
app.jwt.secret=${JWT_SECRET:mySuperSecretKey12345678901234567890}
app.jwt.expiration=${JWT_EXPIRATION:86400000}
```

✅ No change required.

---

### 🍃 MongoDB

Install and start MongoDB locally:

```
mongod
```

Default URI already configured:

```
mongodb://localhost:27017/event_mate_files
```

No change needed.

---

## 4️⃣ Run Backend

Open terminal:

```
cd backend
```

Windows:

```
mvnw.cmd spring-boot:run
```

Mac/Linux:

```
./mvnw spring-boot:run
```

Backend URL:

```
http://localhost:8080
```

---

## 5️⃣ Frontend Setup

Open new terminal:

```
cd frontend
npm install
```

Create `.env` file inside frontend folder:

```
VITE_API_BASE_URL=http://localhost:8080
```

Run frontend:

```
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

---

# ▶️ Run Order (Must Follow)

1. Start MySQL
2. Start MongoDB
3. Run Backend
4. Run Frontend
5. Open [http://localhost:5173](http://localhost:5173)

---

# 🛠️ What Teammates MUST Change

| Setting        | Required |
| -------------- | -------- |
| DB_PASSWORD    | ✅ Yes    |
| MAIL_USERNAME  | ✅ Yes    |
| MAIL_PASSWORD  | ✅ Yes    |
| GEMINI_API_KEY | Optional |

---

# ❌ Do NOT Modify

* SecurityConfig
* JWT Filters
* Controllers
* Services
* Entity Classes
* React Source Files

Only environment variables are needed.

---

# ✅ Result

After configuration:

```
clone → set env → run backend → run frontend → project works
```

No additional configuration required.
