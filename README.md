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
- Node.js 18+
- Gemini API Key ([Get an API Key](https://aistudio.google.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/AnsariRpa/lexiguide.git
cd lexiguide

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Development Mode

```bash
npm run dev
```
The app runs on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Express.js (serving API endpoints and Vite in development)
- **AI / LLM Engine**: `@google/genai` TypeScript SDK (Gemini 2.5 Flash)
- **Document Ingestion**: Custom semantic chunking pipeline with page, section, and line range tracking; `pdf-parse` for PDF processing
- **Storage**: Multi-user session document store with sample bundles and user-isolated working states

---

## 📄 License

Apache-2.0
