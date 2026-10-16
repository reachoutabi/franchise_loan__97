/**
 * EquiCapital - Storage & Mock Database Engine
 * Centralized LocalStorage API, Seed Data, and Session Management
 */

const STORAGE_KEYS = {
  USER: 'equifund_current_user',
  USERS_LIST: 'equifund_registered_users',
  APPLICATIONS: 'equifund_loan_applications',
  DRAFT_APPLICATION: 'equifund_draft_application',
  OFFERS: 'equifund_lender_offers',
  DOCUMENTS: 'equifund_client_documents',
  MESSAGES: 'equifund_broker_messages',
  CALCULATIONS: 'equifund_saved_calculations',
  NOTIFICATIONS: 'equifund_notifications',
  THEME: 'equifund_theme_preference',
  DIR: 'equifund_dir_preference',
  INITIALIZED: 'equifund_data_initialized_v1'
};

// Default Demo User
const DEMO_USER = {
  id: 'usr-98102',
  name: 'Alexander Vance',
  email: 'user@equicapital.com',
  password: '1234',
  phone: '+1 (555) 382-9104',
  businessName: 'Vance Heavy Hauling & Excavation LLC',
  entityType: 'Limited Liability Company (LLC)',
  industry: 'Heavy Construction & Earthmoving',
  yearsInBusiness: 6,
  annualRevenue: '$2,400,000',
  ein: 'XX-XXX4912',
  address: '1480 Industrial Parkway, Suite 300, Chicago, IL 60607',
  assignedBroker: {
    name: 'David Vance',
    title: 'Senior Commercial Finance Advisor',
    email: 'd.vance@equicapital.com',
    phone: '+1 (800) 582-4190 x204',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80'
  }
};

// Initial Pre-Seeded Applications
const SEED_APPLICATIONS = [
  {
    id: 'EQF-2026-8941',
    financingType: 'Equipment Financing',
    amount: 285000,
    downPayment: 35000,
    termMonths: 60,
    rateEstimate: '6.25%',
    monthlyPayment: 5541,
    equipmentCategory: 'Heavy Construction Machinery',
    equipmentDescription: '2024 Caterpillar 336 Next Gen Hydraulic Excavator',
    vendorName: 'Midwest Machinery Equipment Exchange',
    vendorContact: 'sales@midwestmachinery.com',
    businessName: 'Vance Heavy Hauling & Excavation LLC',
    status: 'Offer Issued',
    stageNumber: 4, // 1: Submitted, 2: Under Review, 3: Underwriting, 4: Approved/Offer Issued, 5: Funded
    submittedDate: '2026-03-28',
    lastUpdate: '2026-04-12',
    decisionEstimate: 'Ready for Acceptance',
    brokerNotes: 'Tier-1 lender committee approved with competitive 6.25% APR. Two competing terms issued. Client review pending.',
    timeline: [
      { step: 'Application Submitted', date: 'Mar 28, 2026', done: true },
      { step: 'Documentation Verified', date: 'Mar 30, 2026', done: true },
      { step: 'Lender Underwriting', date: 'Apr 04, 2026', done: true },
      { step: 'Lender Offers Issued', date: 'Apr 11, 2026', done: true },
      { step: 'Closing & Funding', date: 'Estimated 24-48 hrs after offer acceptance', done: false }
    ]
  },
  {
    id: 'EQF-2026-7732',
    financingType: 'Commercial Truck & Fleet Financing',
    amount: 160000,
    downPayment: 20000,
    termMonths: 48,
    rateEstimate: '6.99%',
    monthlyPayment: 3831,
    equipmentCategory: 'Transportation & Logistics',
    equipmentDescription: 'Two (2) 2023 Freightliner Cascadia 126 Sleeper Tractors',
    vendorName: 'Great Lakes Commercial Fleet Inc.',
    vendorContact: 'fleet@greatlakestruck.com',
    businessName: 'Vance Heavy Hauling & Excavation LLC',
    status: 'Underwriting',
    stageNumber: 3,
    submittedDate: '2026-04-02',
    lastUpdate: '2026-04-10',
    decisionEstimate: '24 Hours',
    brokerNotes: 'Bank cash flows and DOT safety compliance verified. Underwriter reviewing commercial vehicle salvage & residual terms.',
    timeline: [
      { step: 'Application Submitted', date: 'Apr 02, 2026', done: true },
      { step: 'Documentation Verified', date: 'Apr 04, 2026', done: true },
      { step: 'Lender Underwriting', date: 'Apr 08, 2026', done: true },
      { step: 'Lender Offers Issued', date: 'Pending Committee Review', done: false },
      { step: 'Closing & Funding', date: 'Pending', done: false }
    ]
  },
  {
    id: 'EQF-2026-6105',
    financingType: 'Working Capital Loan',
    amount: 75000,
    downPayment: 0,
    termMonths: 24,
    rateEstimate: '7.85%',
    monthlyPayment: 3388,
    equipmentCategory: 'Working Capital / Cash Flow',
    equipmentDescription: 'Seasonal Working Capital & Mobilization Payroll Facility',
    vendorName: 'Direct Commercial Treasury',
    vendorContact: 'N/A',
    businessName: 'Vance Heavy Hauling & Excavation LLC',
    status: 'Funded',
    stageNumber: 5,
    submittedDate: '2026-02-14',
    lastUpdate: '2026-02-18',
    decisionEstimate: 'Completed',
    brokerNotes: 'Funds successfully wired directly to business operating account. All documents and UCC-1 filed.',
    timeline: [
      { step: 'Application Submitted', date: 'Feb 14, 2026', done: true },
      { step: 'Documentation Verified', date: 'Feb 15, 2026', done: true },
      { step: 'Lender Underwriting', date: 'Feb 16, 2026', done: true },
      { step: 'Lender Offers Issued', date: 'Feb 17, 2026', done: true },
      { step: 'Closing & Funding', date: 'Feb 18, 2026 (Funded)', done: true }
    ]
  },
  {
    id: 'EQF-2026-9024',
    financingType: 'Equipment Leasing',
    amount: 420000,
    downPayment: 50000,
    termMonths: 72,
    rateEstimate: '6.45%',
    monthlyPayment: 7080,
    equipmentCategory: 'Manufacturing & Precision Machining',
    equipmentDescription: 'Haas UMC-750 5-Axis CNC Vertical Machining Center + Tooling',
    vendorName: 'Apex Precision Machine Tool Distributors',
    vendorContact: 'sales@apexprecision.com',
    businessName: 'Vance Heavy Hauling & Excavation LLC',
    status: 'Under Review',
    stageNumber: 2,
    submittedDate: '2026-04-09',
    lastUpdate: '2026-04-11',
    decisionEstimate: '2 Days',
    brokerNotes: 'Initial intake complete. Equipment specifications and dealer quote verified. Preparing dossier for syndicated capital partners.',
    timeline: [
      { step: 'Application Submitted', date: 'Apr 09, 2026', done: true },
      { step: 'Documentation Verified', date: 'Apr 11, 2026', done: true },
      { step: 'Lender Underwriting', date: 'In Progress', done: false },
      { step: 'Lender Offers Issued', date: 'Pending', done: false },
      { step: 'Closing & Funding', date: 'Pending', done: false }
    ]
  },
  {
    id: 'EQF-2026-4419',
    financingType: 'Equipment Financing',
    amount: 95000,
    downPayment: 10000,
    termMonths: 36,
    rateEstimate: '7.15%',
    monthlyPayment: 2942,
    equipmentCategory: 'Commercial Kitchen & Refrigeration',
    equipmentDescription: 'Complete Commercial Kitchen Line & Walk-In Cold Storage',
    vendorName: 'Midwest Culinary Outfitters',
    vendorContact: 'support@midwestculinary.com',
    businessName: 'Vance Heavy Hauling & Excavation LLC',
    status: 'Additional Documents Required',
    stageNumber: 2,
    submittedDate: '2026-04-05',
    lastUpdate: '2026-04-07',
    decisionEstimate: 'Awaiting Documents',
    brokerNotes: 'Underwriters requested the finalized commercial lease agreement and signed vendor installation quote.',
    timeline: [
      { step: 'Application Submitted', date: 'Apr 05, 2026', done: true },
      { step: 'Documentation Verified', date: 'Pending Client Uploads', done: false },
      { step: 'Lender Underwriting', date: 'Paused', done: false },
      { step: 'Lender Offers Issued', date: 'Pending', done: false },
      { step: 'Closing & Funding', date: 'Pending', done: false }
    ]
  }
];

// Pre-Seeded Lender Offers for EQF-2026-8941
const SEED_OFFERS = [
  {
    id: 'OFFER-8941-A',
    applicationId: 'EQF-2026-8941',
    lenderName: 'Summit Commercial Bank',
    lenderLogo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=128&q=80',
    amount: 285000,
    apr: 6.25,
    termMonths: 60,
    monthlyPayment: 5541.20,
    originationFee: '1.0% ($2,850)',
    prepaymentPenalty: 'None after 12 months',
    expiryHours: 36,
    status: 'Available', // Available, Accepted, Declined
    highlights: ['Best APR available', '90-day seasonal payment relief option', 'Section 179 tax deduction eligible']
  },
  {
    id: 'OFFER-8941-B',
    applicationId: 'EQF-2026-8941',
    lenderName: 'CrestLine Equipment Capital',
    lenderLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=128&q=80',
    amount: 285000,
    apr: 6.75,
    termMonths: 72,
    monthlyPayment: 4818.50,
    originationFee: '0.75% ($2,137)',
    prepaymentPenalty: 'Zero penalty anytime',
    expiryHours: 64,
    status: 'Available',
    highlights: ['Extended 72-month tenure for lower monthly cash outflow', 'No lien on business receivables', 'Quick direct wire closing']
  }
];

// Pre-Seeded Documents Metadata
const SEED_DOCUMENTS = [
  {
    id: 'doc-01',
    name: 'Business_Bank_Statements_Last_6_Months.pdf',
    category: 'Bank Statements',
    size: '4.8 MB',
    type: 'PDF',
    uploadedDate: '2026-03-28',
    status: 'Accepted', // Not Uploaded, Uploaded, Under Review, Accepted, Rejected
    reviewNote: 'Verified 6 consecutive months of positive operating cash flow.'
  },
  {
    id: 'doc-02',
    name: 'Corporate_Tax_Returns_2024_2025.pdf',
    category: 'Tax Returns',
    size: '8.2 MB',
    type: 'PDF',
    uploadedDate: '2026-03-29',
    status: 'Accepted',
    reviewNote: 'Gross revenue and bottom line profitability corroborated.'
  },
  {
    id: 'doc-03',
    name: 'Caterpillar_336_Dealer_Official_Invoice.pdf',
    category: 'Equipment Invoice / Quote',
    size: '2.1 MB',
    type: 'PDF',
    uploadedDate: '2026-03-28',
    status: 'Accepted',
    reviewNote: 'Authorized dealer itemized quote and serial specification confirmed.'
  },
  {
    id: 'doc-04',
    name: 'Interim_P&L_Statement_Q1_2026.xlsx',
    category: 'Profit & Loss Statement',
    size: '840 KB',
    type: 'XLSX',
    uploadedDate: '2026-04-06',
    status: 'Under Review',
    reviewNote: 'Currently with credit committee risk assessment.'
  },
  {
    id: 'doc-05',
    name: 'Owner_Government_ID_Alexander_Vance.jpg',
    category: 'Owner Identification',
    size: '1.4 MB',
    type: 'JPG',
    uploadedDate: '2026-03-28',
    status: 'Accepted',
    reviewNote: 'Identity and Beneficial Ownership verified (100% owner).'
  },
  {
    id: 'doc-06',
    name: 'Articles_of_Organization_State_Filing.pdf',
    category: 'Business License & Legal Filing',
    size: '1.9 MB',
    type: 'PDF',
    uploadedDate: '2026-03-28',
    status: 'Accepted',
    reviewNote: 'Good standing certificate active in Illinois.'
  },
  {
    id: 'doc-07',
    name: 'Commercial_Inland_Marine_Insurance_Certificate.pdf',
    category: 'Proof of Insurance',
    size: '1.2 MB',
    type: 'PDF',
    uploadedDate: '2026-04-03',
    status: 'Rejected',
    reviewNote: 'Lender loss payee clause missing. Please upload revised binder listing Summit Commercial Bank as additional insured.'
  },
  {
    id: 'doc-08',
    name: 'AR_Aging_Report_March_2026.pdf',
    category: 'Accounts Receivable Aging',
    size: '950 KB',
    type: 'PDF',
    uploadedDate: '2026-04-10',
    status: 'Uploaded',
    reviewNote: 'Awaiting broker review.'
  }
];

// Pre-Seeded Broker Chat Messages
const SEED_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'broker',
    senderName: 'David Vance',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    text: 'Good morning Alexander! I reviewed your application for the 2024 Caterpillar 336 excavator. The financials look very solid with a strong 1.62x debt-service coverage ratio.',
    timestamp: 'Yesterday at 10:14 AM'
  },
  {
    id: 'msg-2',
    sender: 'client',
    senderName: 'Alexander Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    text: 'Thanks David! We have a municipal excavation contract starting in 4 weeks, so we want to lock down the best rate and term promptly.',
    timestamp: 'Yesterday at 11:30 AM'
  },
  {
    id: 'msg-3',
    sender: 'broker',
    senderName: 'David Vance',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    text: 'Understood. We secured two competitive offers: Summit Bank at 6.25% APR for 60 months, and CrestLine at 6.75% for 72 months. Check the "Offers" tab to compare them side by side. I am here if you have any questions!',
    timestamp: 'Today at 09:05 AM'
  }
];

// Pre-Seeded Saved Calculator Scenarios
const SEED_CALCULATIONS = [
  {
    id: 'calc-101',
    title: 'Cat 336 Excavator (60M Term)',
    type: 'Equipment Loan',
    loanAmount: 285000,
    downPayment: 35000,
    apr: 6.25,
    termMonths: 60,
    paymentFrequency: 'Monthly',
    monthlyPayment: 5541.20,
    totalInterest: 47472.00,
    totalCost: 332472.00,
    createdDate: '2026-03-27'
  },
  {
    id: 'calc-102',
    title: 'Freightliner Tandem Fleet (FMV Lease)',
    type: 'Equipment Lease',
    loanAmount: 160000,
    downPayment: 20000,
    apr: 6.99,
    termMonths: 48,
    paymentFrequency: 'Monthly',
    monthlyPayment: 3831.50,
    totalInterest: 23912.00,
    totalCost: 183912.00,
    createdDate: '2026-04-01'
  }
];

// Pre-Seeded Notifications
const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New Lender Offers Available',
    message: 'Summit Commercial Bank and CrestLine Capital have issued loan offers for Application EQF-2026-8941.',
    type: 'offer',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Status Advanced to Underwriting',
    message: 'Your Commercial Truck Fleet financing (EQF-2026-7732) is now in active lender underwriting.',
    type: 'status',
    timestamp: '1 day ago',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Document Approved',
    message: 'Business Tax Returns (2024-2025) were reviewed and accepted by broker compliance.',
    type: 'doc',
    timestamp: '2 days ago',
    read: true
  }
];

/**
 * Storage Controller Helper Functions
 */
class EquiFundStorage {
  constructor() {
    this.init();
  }

  init(force = false) {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED) || force) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify([DEMO_USER]));
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(SEED_APPLICATIONS));
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(SEED_OFFERS));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(SEED_DOCUMENTS));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(SEED_MESSAGES));
      localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(SEED_CALCULATIONS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // User & Auth
  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      // Default to DEMO_USER so dashboard is immediately accessible without requiring sign in
      return DEMO_USER;
    }
    try {
      const u = JSON.parse(raw);
      let changed = false;
      if (u?.assignedBroker?.email && u.assignedBroker.email.includes('equifund')) {
        u.assignedBroker.email = u.assignedBroker.email.replace(/equifund(capital)?\.com/g, 'equicapital.com');
        changed = true;
      }
      if (u?.assignedBroker?.phone && u.assignedBroker.phone.includes('ext.')) {
        u.assignedBroker.phone = u.assignedBroker.phone.replace('ext.', 'x');
        changed = true;
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
      }
      return u;
    } catch {
      return DEMO_USER;
    }
  }

  login(email, password) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_LIST) || '[]');
    const matched = users.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase() && u.password === password);
    if (matched) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(matched));
      return { success: true, user: matched };
    }
    // Also allow default and demo credentials
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    if (
      (cleanEmail === 'user@equicapital.com' && cleanPass === '1234') ||
      (cleanEmail === DEMO_USER.email.toLowerCase() && cleanPass === DEMO_USER.password) ||
      (cleanEmail === 'client@equicapital-demo.com' && (cleanPass === '1234' || cleanPass === 'Client@123')) ||
      (cleanEmail === 'client@equifund-demo.com' && (cleanPass === '1234' || cleanPass === 'Client@123'))
    ) {
      const activeUser = {
        ...DEMO_USER,
        email: cleanEmail === 'user@equicapital.com' ? 'user@equicapital.com' : DEMO_USER.email
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(activeUser));
      return { success: true, user: activeUser };
    }
    return { success: false, message: 'Invalid credentials. Default login: user@equicapital.com / 1234' };
  }

  loginWithSSO(provider = 'Google') {
    const ssoUser = {
      ...DEMO_USER,
      email: 'user@equicapital.com',
      authProvider: provider
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(ssoUser));
    return { success: true, user: ssoUser, provider };
  }

  register(userData) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_LIST) || '[]');
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'An account with this email address already exists.' };
    }
    const newUser = {
      ...DEMO_USER,
      ...userData,
      id: 'usr-' + Math.floor(10000 + Math.random() * 90000),
      assignedBroker: DEMO_USER.assignedBroker
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return { success: true, user: newUser };
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  updateProfile(profileData) {
    const current = this.getCurrentUser();
    if (!current) return false;
    const updated = { ...current, ...profileData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  }

  // Applications
  getApplications() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
  }

  getApplication(id) {
    return this.getApplications().find(app => app.id === id);
  }

  saveDraftApplication(data) {
    localStorage.setItem(STORAGE_KEYS.DRAFT_APPLICATION, JSON.stringify(data));
  }

  getDraftApplication() {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFT_APPLICATION);
    return raw ? JSON.parse(raw) : null;
  }

  clearDraftApplication() {
    localStorage.removeItem(STORAGE_KEYS.DRAFT_APPLICATION);
  }

  createApplication(formData) {
    const apps = this.getApplications();
    const newId = 'EQF-2026-' + Math.floor(1000 + Math.random() * 9000);
    const dateNow = new Date().toISOString().split('T')[0];

    const newApp = {
      id: newId,
      financingType: formData.financingType || 'Equipment Financing',
      amount: Number(formData.amount) || 150000,
      downPayment: Number(formData.downPayment) || 0,
      termMonths: Number(formData.termMonths) || 60,
      rateEstimate: '6.25% - 7.50%',
      monthlyPayment: Math.round((Number(formData.amount) || 150000) * 0.0195),
      equipmentCategory: formData.equipmentCategory || 'Commercial Equipment',
      equipmentDescription: formData.equipmentDescription || 'Equipment Assets',
      vendorName: formData.vendorName || 'Independent Vendor',
      vendorContact: formData.vendorContact || 'N/A',
      businessName: formData.businessName || 'Business Client LLC',
      status: 'Submitted',
      stageNumber: 1,
      submittedDate: dateNow,
      lastUpdate: dateNow,
      decisionEstimate: '2-4 Business Hours',
      brokerNotes: 'Application received via online wizard. Initial compliance check passed. Broker review underway.',
      timeline: [
        { step: 'Application Submitted', date: dateNow, done: true },
        { step: 'Documentation Verified', date: 'In Progress', done: false },
        { step: 'Lender Underwriting', date: 'Pending', done: false },
        { step: 'Lender Offers Issued', date: 'Pending', done: false },
        { step: 'Closing & Funding', date: 'Pending', done: false }
      ]
    };

    apps.unshift(newApp);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    this.clearDraftApplication();

    // Add notification
    this.addNotification(
      'Application Submitted Successfully',
      `Application ${newId} for $${newApp.amount.toLocaleString('en-US')} was received. Review has begun.`,
      'status'
    );

    return newApp;
  }

  advanceApplicationStatus(appId) {
    const apps = this.getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) return null;

    const stages = [
      { status: 'Submitted', stageNumber: 1, note: 'Application received and logged.' },
      { status: 'Under Review', stageNumber: 2, note: 'Broker reviewing credit and equipment appraisal.' },
      { status: 'Underwriting', stageNumber: 3, note: 'Submitted to credit committee for formal approval.' },
      { status: 'Offer Issued', stageNumber: 4, note: 'Lender term sheet issued! Please view under Offers.' },
      { status: 'Funded', stageNumber: 5, note: 'Loan closed and transaction wire completed!' }
    ];

    const currentIndex = stages.findIndex(s => s.status === app.status);
    const nextIndex = (currentIndex + 1) % stages.length;
    const nextStage = stages[nextIndex];

    app.status = nextStage.status;
    app.stageNumber = nextStage.stageNumber;
    app.lastUpdate = new Date().toISOString().split('T')[0];
    app.brokerNotes = nextStage.note;

    // Update timeline steps
    app.timeline.forEach((step, idx) => {
      step.done = idx < app.stageNumber;
    });

    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    this.addNotification(
      `Status Updated: ${app.id}`,
      `Application status changed to "${app.status}".`,
      'status'
    );

    return app;
  }

  withdrawApplication(appId) {
    const apps = this.getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) return false;
    app.status = 'Withdrawn';
    app.brokerNotes = 'Withdrawn by client request.';
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    return true;
  }

  // Documents
  getDocuments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
  }

  addDocument(docData) {
    const docs = this.getDocuments();
    const newDoc = {
      id: 'doc-' + Date.now(),
      name: docData.name || 'Uploaded_Document.pdf',
      category: docData.category || 'General Financial',
      size: docData.size || '1.5 MB',
      type: docData.type || 'PDF',
      uploadedDate: new Date().toISOString().split('T')[0],
      status: 'Uploaded',
      reviewNote: 'Awaiting compliance officer evaluation.'
    };
    docs.unshift(newDoc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));

    this.addNotification(
      'Document Uploaded',
      `"${newDoc.name}" has been uploaded and queued for verification.`,
      'doc'
    );
    return newDoc;
  }

  deleteDocument(docId) {
    let docs = this.getDocuments();
    docs = docs.filter(d => d.id !== docId);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    return true;
  }

  // Offers
  getOffers(appId = null) {
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]');
    return appId ? offers.filter(o => o.applicationId === appId) : offers;
  }

  acceptOffer(offerId) {
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return false;
    offer.status = 'Accepted';
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));

    // Update application to Approved / Closing
    const apps = this.getApplications();
    const app = apps.find(a => a.id === offer.applicationId);
    if (app) {
      app.status = 'Closing in Progress';
      app.stageNumber = 4;
      app.brokerNotes = `Client accepted ${offer.lenderName} term sheet ($${offer.amount.toLocaleString('en-US')} at ${offer.apr}% APR). Closing docs dispatched.`;
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    }

    this.addNotification(
      'Offer Accepted!',
      `You accepted the financing offer from ${offer.lenderName}. Closing documents are being prepared.`,
      'offer'
    );

    return true;
  }

  declineOffer(offerId) {
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]');
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return false;
    offer.status = 'Declined';
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    return true;
  }

  // Messages
  getMessages() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  }

  sendMessage(text) {
    const messages = this.getMessages();
    const user = this.getCurrentUser() || DEMO_USER;
    const now = new Date();
    const timeString = 'Today at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'client',
      senderName: user.name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      text: text,
      timestamp: timeString
    };

    messages.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    return newMsg;
  }

  simulateBrokerReply(callback) {
    setTimeout(() => {
      const messages = this.getMessages();
      const replies = [
        "Thank you for the update! I have reviewed this and will push it directly to our lead underwriter for fast-track processing.",
        "Got it! I am reviewing the figures now. Should have an update or revised term sheet for you by this afternoon.",
        "Understood. Everything looks compliant with lender credit guidelines. I will notify you the moment the docs are ready.",
        "Thanks Alexander! I've attached your note to the file. Feel free to call me directly if you need anything urgent."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const now = new Date();
      const timeString = 'Today at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const brokerMsg = {
        id: 'msg-' + Date.now(),
        sender: 'broker',
        senderName: 'David Vance',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
        text: randomReply,
        timestamp: timeString
      };

      messages.push(brokerMsg);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

      this.addNotification(
        'New Message from Broker',
        'David Vance replied to your message.',
        'msg'
      );

      if (callback) callback(brokerMsg);
    }, 1200);
  }

  // Saved Calculations
  getCalculations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CALCULATIONS) || '[]');
  }

  saveCalculation(calc) {
    const list = this.getCalculations();
    const newCalc = {
      ...calc,
      id: 'calc-' + Date.now(),
      createdDate: new Date().toISOString().split('T')[0]
    };
    list.unshift(newCalc);
    localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(list));
    return newCalc;
  }

  deleteCalculation(id) {
    let list = this.getCalculations();
    list = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(list));
    return true;
  }

  // Notifications
  getNotifications() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  }

  addNotification(title, message, type = 'info') {
    const notifs = this.getNotifications();
    const newNotif = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return newNotif;
  }

  markAllNotificationsRead() {
    const notifs = this.getNotifications();
    notifs.forEach(n => n.read = true);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return true;
  }

  // Reset Demo Data
  resetDemoData() {
    this.init(true);
    return true;
  }
}

// Global Storage Instance
window.storage = new EquiFundStorage();
