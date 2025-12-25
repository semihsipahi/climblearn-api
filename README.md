# ClimbLearn AI Learning Flow - SaaS 2.0

ClimbLearn is an AI-driven adaptive learning platform that integrates with Dify Cloud to provide a dynamic, step-by-step educational experience. This backend uses a state-machine architecture to guide students through a personalized learning journey.

---

## 🚀 Features

- **Dynamic AI Flow**: Intelligent state transitions (Welcoming -> Ready Check -> Topic Initiation -> Learning Loop).
- **Dual-Layer Security**:
  - **Admin JWT Auth**: Protects administrative logs and dashboards.
  - **Client API Key**: Secures student-facing AI flow endpoints.
- **Real-time Pulse**: Live interaction broadcasting via **Socket.io** for concurrent admin monitoring.
- **Hybrid Dify Integration**: Real Dify Cloud workflows combined with smart mock fallbacks for rapid development.
- **Auto-generated Documentation**: Fully compliant Swagger UI and comprehensive Postman collection.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js / Express
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **AI**: Dify.ai API
- **Docs**: Swagger JSDoc / Postman

---

## ⚙️ Installation & Setup

### 1. Requirements

- Node.js installed.
- MongoDB running locally or on Atlas.

### 2. Environment Variables (`.env`)

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/climblearn_db

# Security
JWT_SECRET=your_jwt_secret
CLIENT_API_KEY=your_client_api_key
ADMIN_PASSWORD=your_admin_password

# Dify Keys
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_KEY_WELCOMING=...
DIFY_KEY_READY_CHECK=...
```

### 3. Run

```bash
npm install
npm start
```

Access Swagger UI at: `http://localhost:5000/api-docs`

---

## 🔒 Security Architecture

| Access Level   | Protected By | Header                          | Description                             |
| -------------- | ------------ | ------------------------------- | --------------------------------------- |
| **Admin**      | JWT Token    | `Authorization: Bearer <token>` | Access to student logs & live analytics |
| **Client/App** | Static Key   | `x-api-key: <key>`              | Access to AI Learning Flow endpoints    |

---

## 📚 AI Learning Flow Lifecycle

The system moves through the following stages automatically:

### 1. **Welcoming** (`/flow/start`)

- Initial greeting.
- **Input**: `externalStudentId`.
- **Dify Flow**: Real (Cloud).

### 2. **Ready Check** (`/flow/next`)

- Verifies if the student is focused and ready to start.
- **Input**: `{"text": "Evet Hazırım"}`.
- **Dify Flow**: Real (Cloud).

### 3. **Topic & Name Initiation** (`/flow/next`)

- Sets the subject and registers the student's name.
- **Input**: `{"topic": "...", "name": "..."}`.
- **Dify Flow**: Mock Fallback.
- **Result**: Generates 5 sub-topics using `<topics>` tags for frontend categorization.

### 4. **Learning Loop** (`/flow/next`)

- **Step A (Question)**: AI asks a question about the current sub-topic.
- **Step B (Evaluation)**: AI scores the answer (4-10 scale).
- **Step C (Transition)**:
  - Score >= 5: Moves to the next sub-topic.
  - Score < 5: Triggers **Re-Lesson** (AI explains the topic again).

---

## 📡 Real-time Monitoring (Pulse)

Admins can observe student interactions concurrently without refreshing the page.

1. **Connect**: `ws://localhost:5000` via Socket.io.
2. **Action**: Emit event `join_admin_room`.
3. **Observation**: Listen for event `new_interaction`.
   ```json
   {
     "sessionId": "...",
     "type": "explanation",
     "prompt": "...",
     "response": "...",
     "createdAt": "..."
   }
   ```

---

## 📁 Project Structure

- `src/config`: Db, Swagger, and Socket initializations.
- `src/modules/ai`: The heart of the platform (State machine & Flow logic).
- `src/modules/auth`: Lightweight Admin security module.
- `ClimbLearn_API.postman_collection.json`: Complete workspace for rapid testing.
