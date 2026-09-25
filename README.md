# LexiGuide ⚖️

> **AI-Powered Legal Document Understanding & Consultation Assistant**  
> *Transform complex contracts, leases, and agreements into verifiable, evidence-backed, personalized insights.*

---

## ⚠️ Important Legal Notice

**LexiGuide is an educational and document-preparation tool, not a law firm or attorney.**  
LexiGuide helps users read, navigate, and analyze legal documents so they can understand key clauses and have more productive discussions with legal professionals. It does not provide formal legal advice, legal representation, or attorney-client privileged counsel.

---

## 🌟 Key Features

### 1. Visual Trust Architecture & Verifiable Citations
- **Strict Evidence Standard**: Every insight, obligation, risk, and question cites exact verbatim source clauses from the uploaded contracts.
- **Evidence Inspector**: Interactive side-panel providing full provenance—including exact document title, clause section, page number, and line numbers.
- **Visual Distinction**: Clear optical separation between verbatim document quotes, plain-language AI synthesis, external statutory grounding, and information gaps.

### 2. Deep Contract Decomposition
- **Executive Overview**: Parties involved, governing law, and document purpose.
- **Major Obligations**: Categorized by party, priority, and timeline.
- **Rights & Protections**: Explicit safeguards granted to each stakeholder.
- **Financial & Payment Terms**: Compensation, deposits, fee structures, and penalties.
- **Termination & Exit Scenarios**: Notice requirements, break clauses, and post-termination survival terms.
- **Unusual / High-Risk Provisions**: Flags restrictive covenants, non-standard indemnities, unilateral amendment clauses, or IP assignments.

### 3. Personalized Relevance Map ("What Matters to You")
- Ask questions through your specific personal lens (e.g., *"How does this affect my personal side projects?"* or *"What happens to my stock options if I leave before 1 year?"*).
- **Side-by-Side Analysis**: Compares what the contract literally says against what it means for your specific circumstance.
- **Information Gap Detection**: Explicitly identifies what the contract *fails* to address so you aren't misled by assumptions.

### 4. Interactive Q&A ("Ask LexiGuide") with Google Search Grounding
- Natural language queries over uploaded agreements.
- Multi-perspective synthesis with verification matrices.
- Optional real-time Google Search grounding to retrieve current statutory regulations, state laws (e.g., California non-compete statutes), or standard commercial practices.

### 5. Semantic Document Comparison ("What Changed?")
- Compare two versions of an agreement (e.g., standard SaaS MSA v2 vs. counterparty v3, or initial lease vs. renewal addendum).
- Substantive delta highlighting: detects shifts in liability caps, indemnification scopes, termination notices, and IP assignment clauses.

### 6. Prepare & Export: Actionable Legal Pack
- **Attorney Consultation Brief**: Concise, professional brief summarizing key facts, core issues, and prepared questions to maximize the efficiency of billable legal hours.
- **Action Checklist**: Interactive tasks categorized by pre-signing, negotiation, and post-execution timelines.
- **Counterparty Questions Matrix**: Targeted questions organized by recipient (e.g., HR, landlord, legal counsel).
- **Export & Print**: Single-click clipboard copy and formatted print layout.

---

## 📂 Pre-Loaded Sample Bundles

LexiGuide comes with pre-configured legal document sets for testing:
1. **Executive Employment & Equity Package**: Executive Offer Letter, Proprietary Information & Inventions Agreement (PIIA), and Stock Option Plan.
2. **Residential Lease & Rules Agreement**: Standard Residential Tenancy Agreement with Property Rules and Security Deposit Addendum.
3. **Enterprise SaaS Master Services Agreement**: Vendor standard terms (v2.4) vs. proposed customer redlines (v3.0).

Users can also upload custom PDF documents or paste plain text agreements directly.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or Node.js 20+)
- Gemini API Key ([Google AI Studio](https://aistudio.google.com/))
- Firebase Project with Google Authentication & Cloud Firestore (optional for local guest testing; full persistence when configured)

### Installation

```bash
# Clone the repository
git clone https://github.com/AnsariRpa/lexiguide.git
cd lexiguide

# Install dependencies
npm install
```

### Environment & Firebase Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables in `.env`:
   ```env
   # Required for Gemini AI document analysis and extraction
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: Session signing secret for demo/guest token HMAC verification
   SESSION_SECRET=your_secure_random_salt_here

   # Optional client-side Firebase configuration (or configure via firebase-applet-config.json)
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
   VITE_FIREBASE_DATABASE_ID=your-firestore-database-id
   ```

3. **Firebase Applet Configuration File** (Optional):  
   You can also place `firebase-applet-config.json` in the project root based on `firebase-applet-config.example.json`:
   ```json
   {
     "projectId": "your-firebase-project-id",
     "appId": "1:...",
     "apiKey": "AIzaSy...",
     "authDomain": "your-project.firebaseapp.com",
     "firestoreDatabaseId": "your-firestore-database-id",
     "storageBucket": "your-project.firebasestorage.app",
     "messagingSenderId": "...",
     "measurementId": "",
     "oAuthClientId": "..."
   }
   ```
   *(Note: `firebase-applet-config.json` is gitignored to protect sensitive deployment tokens).*

### Firestore Security Rules

To ensure strict zero-trust isolation between users, deploy the security rules defined in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /documents/{documentId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /relevanceMap/{mapId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /answers/{answerId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /comparison/{comparisonId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /actionableOutputs/{outputId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Development Mode

```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### Production Build & Run

```bash
npm run build
npm start
```

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend API Server**: Node.js & Express.js (serving API endpoints and hosting Vite SPA middlewares)
- **Authentication**:
  - Google Identity Sign-In via Firebase Auth
  - Ephemeral HMAC-signed Demo/Guest workspace tokens for instant sandbox evaluation
  - Strict server-side verification using Firebase Admin SDK (`verifyIdToken`)
- **Database & Persistence**: Google Cloud Firestore with zero-trust multi-user collection paths (`users/{uid}/documents/*`, `users/{uid}/answers/*`, etc.) with in-memory store fallback
- **AI / LLM Engine**: `@google/genai` TypeScript SDK (Gemini 2.5 Flash) with server-side key isolation and prompt-injection defense boundaries
- **Document Ingestion**: Custom semantic chunking pipeline with page, section, and line range tracking; `pdf-parse` for PDF processing

---

## 📄 License

Apache-2.0
