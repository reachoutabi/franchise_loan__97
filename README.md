# EquiCapital - Equipment Financing & Commercial Loan Broker HTML Template

**EquiCapital** is a premium, fintech-grade, production-ready HTML5 template engineered specifically for **commercial loan brokers, equipment leasing agencies, capital advisory firms, and multi-branch commercial finance companies**.

Built with an original growth-focused color palette, deep slate obsidian dark mode, RTL layout compatibility, interactive financial calculators powered by Chart.js, and an end-to-end Business Client Dashboard operating seamlessly on frontend LocalStorage.

---

## 🌟 Key Features

* **High-Converting Public Website:**
  * **Home 1 &ndash; Commercial Loan Broker (`index.html`):** Main fintech homepage with floating stats, trust bar with 75+ lender wordmarks, animated counters ($1.4B+ funded), interactive 60-second quick pre-qualification widget, 7 featured solutions, competitive advantage matrix, 4-step animated timeline, 8 industry cards, recent deal spotlights, client testimonials, and interactive FAQ accordion.
  * **Home 2 &ndash; Heavy Machinery & Fleet Leasing (`home-2.html`):** Specialized heavy asset variation featuring an interactive Section 179 tax deduction & lease payment estimator, live underwriting activity ticker, heavy machinery & fleet asset showcase, EFA vs. $1 Buyout comparison matrix, and auction lot pre-approval FAQs. Accessible via the navigation "Home" dropdown.
  * **Funding Solutions (`services.html`):** 12 comprehensive commercial loan & lease cards with live category filters, deep-dive modal for every solution (eligibility benchmarks, required documents, pros/cons), and an interactive **Equipment Loan vs. Lease Comparison Matrix**.
  * **Loan Calculator (`calculator.html`):** 4 tabbed interactive calculation engines:
    1. *Equipment Loan Payment Calculator*
    2. *Equipment Lease Calculator* (with Fair Market Value, 10% PUT, and $1 Buyout models)
    3. *Working Capital / Term Loan Calculator*
    4. *Affordability Capacity Calculator* (backwards calculates maximum borrowing power from target monthly budget)
    * Real-time Chart.js Amortization Line Chart & Capital Allocation Doughnut Chart.
    * Scrollable yearly/monthly schedule table.
    * Side-by-side scenario comparison modal, PDF/Print export, and "Apply With These Terms" wizard forwarding.
  * **Client Authentication Portal (`login.html`):** Split-screen layout, one-click demo credentials autofill, password visibility toggles, live password strength meter, inline validation, and forgot password recovery simulation.
  * **Error 404 (`404.html`):** Polished, on-brand 404 page with quick navigation.

* **Complete Business Client Dashboard (`dashboard.html`):**
  * **Overview:** Pipeline distribution bar chart, live 5-stage approval visual stepper, key metrics, and direct advisor card.
  * **6-Step Commercial Loan Application Wizard:** Solution selection, business profile, equipment details, guarantor info, integrated file upload, and review summary with draft auto-save.
  * **My Applications & Approval Tracking:** Searchable, status-filtered table with slide-over drawer showing animated progress stepper and advisor notes.
  * **Reviewer Simulation Tool:** Built-in "Simulate Status Advance" button to advance underwriting stages in real time without a backend!
  * **Document Upload Center:** Drag-and-drop dropzone, simulated upload progress bar, document completeness radial ring, and file preview modal.
  * **Lender Offers:** Side-by-side comparison of competing term sheets with Accept, Request Changes, and Decline workflows.
  * **Broker Messaging:** Realistic conversation channel with assigned advisor David Vance and simulated auto-replies within 1.2 seconds.
  * **Saved Calculations:** Save and compare scenarios modeled on the calculator.
  * **Profile & Settings:** Edit company info, toggle preferences, and restore initial seed state with one click.

* **Theme & Global Capabilities:**
  * **Dark & Light Modes:** Tailored color contrast, dark slate obsidian styling, and automatic Chart.js palette re-theming upon toggle.
  * **RTL Layout Support:** Full Right-to-Left compatibility for Arabic/Hebrew with instant toggle.
  * **Zero Dead Buttons:** Every button, tab, slider, filter, and modal triggers a meaningful action.
  * **Zero Backend Required:** Powered entirely by HTML5, Tailwind CSS, Vanilla ES6, and LocalStorage.

---

## 🚀 Quick Start & Setup

1. **Open Locally:**
   Simply double-click `index.html` or open any HTML file in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
   
2. **Local Development Server (Recommended):**
   ```bash
   # Using Python 3 built-in HTTP server:
   python -m http.server 8080
   
   # Or using Node.js npx serve:
   npx serve .
   ```
   Navigate to `http://localhost:8080` in your browser.

---

## 🔑 Demo Account Credentials

A pre-seeded demonstration account is configured out-of-the-box:

* **Email:** `client@equicapital-demo.com`
* **Password:** `Client@123`
* **Applicant:** Alexander Vance (Vance Heavy Hauling & Excavation LLC)
* **Assigned Broker:** David Vance (Senior Commercial Advisor)

> 💡 On the login page (`login.html`), click the **"Autofill Demo"** button to populate these credentials in one click.

---

## 📂 File & Directory Architecture

```
franchise_loan/
├── index.html              # Main Home Page
├── services.html           # 12 Funding Solutions & Comparison Matrix
├── calculator.html         # Interactive Loan & Lease Calculator + Charts
├── login.html              # Client Authentication Portal (Login, Register, Forgot)
├── dashboard.html          # Full Business Client Dashboard (Multi-View)
├── 404.html                # Custom 404 Not Found Page
├── css/
│   └── style.css           # Design tokens, CSS variables, glassmorphism, animations & RTL
├── js/
│   ├── storage.js          # Centralized LocalStorage API, seed data, session & mock DB
│   ├── app.js              # Theme switcher, RTL toggle, mobile drawer, toasts & modals
│   ├── calculator.js       # Financial formulas, Chart.js charts, schedule generator
│   └── dashboard.js        # Dashboard routing, 6-step wizard, drawer tracker, uploader
└── README.md               # Documentation & customization guide
```

---

## 💾 LocalStorage Data Schema

All client-side state is persisted under clear, namespaced keys in `js/storage.js`:

| LocalStorage Key | Purpose |
| :--- | :--- |
| `equifund_current_user` | Currently authenticated user session object |
| `equifund_registered_users` | Registered accounts list |
| `equifund_loan_applications` | Array of loan applications with underwriting status (1-5) |
| `equifund_draft_application` | Auto-saved in-progress wizard draft |
| `equifund_lender_offers` | Syndicated term sheets issued by partner lenders |
| `equifund_client_documents` | Metadata records of uploaded financial documents |
| `equifund_broker_messages` | Conversation history with assigned loan officer |
| `equifund_saved_calculations` | Scenarios saved from the loan calculator |
| `equifund_notifications` | Notification alerts (new offers, status changes, doc approvals) |
| `equifund_theme_preference` | Theme mode: `'light'` or `'dark'` |
| `equifund_dir_preference` | Layout direction: `'ltr'` or `'rtl'` |

To restore the original pre-seeded data state at any time, navigate to **Dashboard &rarr; Settings &rarr; Reset Demo to Seed State**, or call `storage.resetDemoData()` in the browser developer console.

---

## 🎨 Customizing Brand, Colors & Fonts

### 1. Brand Name & Logo
* Change `"EquiCapital"` across the `<title>`, `<header>`, and `<footer>` tags in the HTML files.
* Update the brand name in `js/storage.js` (`DEMO_USER.assignedBroker.email`).

### 2. Color Palette
The primary color tokens are defined in `css/style.css`:
```css
:root {
  --brand-navy: #0F172A;        /* Primary Dark / Slate */
  --brand-emerald: #10B981;     /* Primary Growth Accent */
  --brand-emerald-hover: #059669;
  --brand-gold: #F59E0B;        /* Ratings & Warning Badges */
  --brand-blue: #2563EB;        /* Institutional Trust Blue */
}
```
Tailwind classes also mirror these tokens via `tailwind.config` in each HTML document header.

### 3. Typography
Google Fonts `Plus Jakarta Sans` and `Space Grotesk` are loaded in `css/style.css`. To substitute with another font family (e.g. `Outfit` or `Inter`), change the `@import` url in `css/style.css` and the `fontFamily` definition in `tailwind.config`.

---

## 🔌 Connecting to a Real Backend (Production API)

`js/storage.js` is structured as a drop-in service layer. To connect to an actual REST or GraphQL backend:

1. Replace `localStorage.setItem` and `localStorage.getItem` methods in `js/storage.js` with standard `fetch()` or `axios` calls to your API endpoints (e.g., `POST /api/v1/applications`, `POST /api/v1/auth/login`).
2. Replace the simulated document upload progress bar in `js/dashboard.js` (`handleFileUpload`) with a direct multipart upload to your AWS S3 presigned URL or Azure Blob Storage.
3. Replace the simulated broker auto-reply with a real WebSocket or Pusher channel for live advisor messaging.

---

## 📱 Cross-Browser & Device Compatibility

Tested across modern desktop, tablet, and mobile breakpoints:
* **Mobile:** 320px, 375px, 425px
* **Tablet:** 768px, 992px
* **Desktop:** 1200px, 1440px, 1920px (Full HD & 4K)
* **Browsers:** Chrome, Firefox, Safari, Edge, Opera

---

## 📄 License & Commercial Distribution

Crafted for direct client deployment, ThemeForest, and TemplateMonster. All images utilized are curated royalty-free photography from Unsplash. All scripts use standard open-source libraries (Tailwind CSS, Bootstrap Icons, Chart.js).
