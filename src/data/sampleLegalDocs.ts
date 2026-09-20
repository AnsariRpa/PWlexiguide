/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleDocDefinition {
  id: string;
  title: string;
  category: 'employment' | 'lease' | 'service';
  bundleName: string;
  totalPages: number;
  text: string;
}

export const SAMPLE_DOCUMENT_BUNDLES: {
  id: string;
  name: string;
  description: string;
  documents: SampleDocDefinition[];
  sampleConcerns: string[];
}[] = [
  {
    id: 'bundle-employment-equity',
    name: 'Employment Offer, Invention & Equity Agreement',
    description: 'Tech startup offer letter, proprietary rights/non-compete agreement, and stock option incentive plan.',
    sampleConcerns: [
      'What happens to my compensation, unvested stock options, and health benefits if I leave the company or get laid off?',
      'Can I work on personal open-source software or side projects on weekends without the company claiming ownership?',
      'Does the agreement contain non-compete or non-solicitation restrictions after I depart, and are they enforceable?'
    ],
    documents: [
      {
        id: 'doc-offer-letter',
        title: 'Nexus Technologies — Executive Offer Letter (Senior Staff Engineer)',
        category: 'employment',
        bundleName: 'Employment & Equity Package',
        totalPages: 2,
        text: `--- Page 1 ---
NEXUS TECHNOLOGIES, INC.
OFFER OF EMPLOYMENT & KEY COMPENSATION TERMS
Date: October 14, 2025

Dear Alex Morgan,

Section 1. Position & Duties
Nexus Technologies, Inc. ("Company") is pleased to offer you employment as Senior Staff Platform Engineer, reporting to the VP of Engineering. This is an exempt, full-time position located at our San Francisco office, with hybrid flexibility permitting remote work up to two (2) days per work week.

Section 2. Compensation & Payroll
2.1 Base Salary: Your beginning annual base salary will be $225,000, payable semi-monthly in accordance with the Company's standard payroll practices, subject to statutory tax withholdings and deductions.
2.2 Discretionary Performance Bonus: You will be eligible to participate in the Annual Executive Bonus Plan with a target incentive of 20% of your annual base salary ($45,000), contingent upon individual performance metrics and corporate milestone attainment as determined by the Board of Directors. Bonuses are not guaranteed and require active employment on the scheduled distribution date (March 15 of each fiscal year).

Section 3. Equity Incentive Grant
Subject to Board of Directors approval, you will be granted an option to purchase 40,000 shares of the Company's Common Stock under the 2024 Equity Incentive Plan.
3.1 Vesting Schedule: The option shares shall vest over a four (4) year period: twenty-five percent (25%) of the shares shall vest on the one-year anniversary of your Employment Commencement Date ("One-Year Cliff"), and the remaining seventy-five percent (75%) shall vest in thirty-six (36) equal monthly installments thereafter, provided you maintain continuous service.
3.2 Change in Control Acceleration: In the event of a Change of Control of the Company followed by an involuntary termination without Cause within twelve (12) months ("Double-Trigger"), fifty percent (50%) of all then-unvested option shares shall immediately accelerate and become fully exercisable.

--- Page 2 ---
Section 4. Health, Retirement & Welfare Benefits
You shall be eligible to participate in the standard benefit programs established by the Company for full-time employees, including group medical, dental, and vision insurance (Company pays 90% of employee premiums and 75% of dependent premiums), standard 401(k) retirement plan with up to 4% employer matching after six (6) months of tenure, and flexible paid time off (PTO) under the Company's Discretionary Time Off policy.

Section 5. At-Will Employment & Notice
5.1 At-Will Relationship: Your employment with the Company is for no specified term and is strictly "at-will." Both you and the Company reserve the right to terminate the employment relationship at any time, with or without Cause, and with or without advance notice.
5.2 Resignation Notice: While employment is at-will, the Company requests as a professional courtesy a minimum of two (2) weeks' advance written notice prior to voluntary resignation.
5.3 Severance Eligibility: In the event your employment is terminated by the Company without Cause (and not due to death, Disability, or voluntary resignation), you will be eligible for two (2) months of continuing base salary and COBRA premium reimbursement, contingent upon your timely execution and non-revocation of a standard mutual separation agreement and general release of claims.

Section 6. Conditions of Offer
This offer is contingent upon: (a) verification of legal authorization to work in the United States; (b) successful completion of background checks; and (c) your execution of the Company's Proprietary Information and Inventions Agreement.`
      },
      {
        id: 'doc-inventions-agreement',
        title: 'Nexus Technologies — Proprietary Information, Inventions & Restrictive Covenants',
        category: 'employment',
        bundleName: 'Employment & Equity Package',
        totalPages: 3,
        text: `--- Page 1 ---
NEXUS TECHNOLOGIES, INC.
PROPRIETARY INFORMATION, INVENTIONS ASSIGNMENT, AND RESTRICTIVE COVENANTS AGREEMENT

Section 1. Recognition of Company Property & Confidentiality
1.1 Confidential Information: Employee acknowledges that during employment, Employee will develop, access, and receive proprietary trade secrets, unreleased platform source code, algorithm models, financial projections, customer rosters, and strategic plans ("Confidential Information").
1.2 Non-Disclosure: Employee agrees to hold all Confidential Information in strictest confidence and shall not disclose, reproduce, or distribute such information to any third party without express prior written authorization from the Chief Executive Officer. This obligation survives termination indefinitely for trade secrets and for five (5) years for general business information.

Section 2. Assignment of Inventions
2.1 Inventions Defined: "Inventions" includes all computer software, technical architectures, neural network prompts, patents, trademarks, works of authorship, designs, and discoveries made, conceived, or reduced to practice by Employee solely or jointly with others.
2.2 Mandatory Assignment: Employee hereby assigns to Company all right, title, and interest in and to any and all Inventions created: (a) during the period of employment; (b) using Company equipment, servers, cloud infrastructure, or confidential facilities; or (c) resulting from or suggested by any work performed for Company.
2.3 Statutory Carve-Out (California Labor Code § 2870 Notice): The assignment requirement in Section 2.2 does NOT apply to an invention for which no equipment, supplies, facility, or trade secret information of the employer was used and which was developed entirely on the employee's own time, UNLESS the invention relates directly to the business of the employer, or the employer's actual or demonstrably anticipated research or development, or results from any work performed by the employee for the employer.

--- Page 2 ---
Section 3. Pre-Existing Inventions & Personal Projects
3.1 Exhibit A Exclusion: Attached hereto as Exhibit A is a complete list of all inventions, software repositories, and patents developed by Employee prior to the Commencement Date. Inventions listed on Exhibit A are excluded from this Agreement. If no Exhibit A is attached, Employee warrants that no such prior inventions exist.
3.2 Side Projects: Any personal coding or freelance work undertaken while employed requires prior written disclosure and clearance through the Open Source & Outside Business Activities Committee to ensure absence of conflict with Company roadmap.

Section 4. Post-Employment Restrictive Covenants
4.1 Non-Solicitation of Employees: For a period of twelve (12) months following the termination of employment for any reason, Employee shall not directly or indirectly solicit, induce, recruit, or encourage any employee or contractor of the Company to terminate their engagement with the Company.
4.2 Non-Solicitation of Customers: For a period of twelve (12) months following termination, Employee shall not solicit any customer or client of the Company with whom Employee had personal contact or accessed Confidential Information regarding during the final eighteen (18) months of tenure.
4.3 Non-Competition: To the maximum extent permitted by applicable state law, Employee agrees not to engage in or provide software engineering services to any direct competitor developing distributed edge-compute orchestration platforms for a period of six (6) months post-termination within a 50-mile radius. (Note: Under California Business and Professions Code § 16600, covenants not to compete are generally void as against public policy; enforceability depends upon the governing state jurisdiction).

--- Page 3 ---
Section 5. Dispute Resolution & Mandatory Arbitration
5.1 Arbitration: Any controversy, claim, or dispute arising out of or relating to this Agreement or Employee's employment shall be resolved by final and binding confidential arbitration administered by JAMS in San Francisco, California, pursuant to the JAMS Employment Arbitration Rules.
5.2 Class Action Waiver: Employee and Company agree to bring claims solely in their individual capacity, and not as a plaintiff or class member in any purported class, collective, or representative proceeding.
5.3 Injunctive Relief: Notwithstanding Section 5.1, either party may seek temporary restraining orders or preliminary injunctive relief in a court of competent jurisdiction to prevent irreparable harm relating to intellectual property theft or breach of confidentiality.`
      },
      {
        id: 'doc-option-plan',
        title: 'Nexus Technologies — 2024 Stock Incentive Plan & Option Award Agreement',
        category: 'employment',
        bundleName: 'Employment & Equity Package',
        totalPages: 2,
        text: `--- Page 1 ---
NEXUS TECHNOLOGIES, INC.
2024 EQUITY INCENTIVE PLAN — NOTICE OF STOCK OPTION GRANT & AWARD AGREEMENT

Section 1. Summary of Option Grant
Optionee: Alex Morgan
Number of Option Shares: 40,000 shares of Common Stock
Exercise Price Per Share: $2.15 (Fair Market Value as determined by latest 409A Independent Valuation)
Grant Date: November 1, 2025
Option Type: Incentive Stock Option (ISO) to the maximum extent permissible under Section 422 of the Internal Revenue Code; balance designated as Non-Qualified Stock Option (NSO).

Section 2. Vesting & Exercise Mechanics
2.1 Standard Vesting: Options vest over 48 months: 25% on the first anniversary of Vesting Commencement Date; remaining 75% in 36 equal monthly installments.
2.2 Early Exercise: This option grant does NOT permit early exercise of unvested shares. Only vested shares may be exercised.
2.3 Payment Method: The aggregate exercise price may be satisfied by cash, certified bank check, or, if approved by the Plan Administrator, a cashless net-exercise mechanism.

--- Page 2 ---
Section 3. Post-Termination Exercise Window
3.1 Voluntary Resignation or Involuntary Termination Without Cause: In the event Optionee ceases to provide continuous service for any reason other than death, Disability, or termination for Cause, Optionee may exercise all then-vested options within ninety (90) days following the effective termination date. All options unexercised at the expiration of this 90-day window shall automatically terminate and revert to the Plan pool.
3.2 Termination for Cause: If Optionee's service is terminated for Cause (including fraud, willful misconduct, felony conviction, or material breach of confidentiality), all options (both vested and unvested) shall immediately terminate and be cancelled upon delivery of notice.
3.3 Death or Permanent Disability: Optionee or Optionee's legal estate may exercise vested options within twelve (12) months following death or disability termination.

Section 4. Transfer Restrictions & Right of First Refusal (ROFR)
4.1 ROFR: Prior to any proposed sale, pledge, or transfer of shares acquired upon option exercise, the shareholder must provide written notice to Company, granting Company the right to purchase the shares on the same financial terms.
4.2 Market Stand-Off / Lock-Up: Optionee agrees in connection with any initial public offering (IPO) of Company stock to enter into a standard 180-day underwriter lock-up agreement restricting the sale or disposition of shares.`
      }
    ]
  },
  {
    id: 'bundle-lease-residential',
    name: 'Residential Lease Agreement & Building Rules Addendum',
    description: '12-month standard urban apartment lease, security deposit terms, maintenance duties, and rules addendum.',
    sampleConcerns: [
      'How much notice must I give before moving out, and what conditions must be met to get my full $3,200 deposit back?',
      'Who is responsible for plumbing and appliance repairs, and can the landlord enter without notice?',
      'Can the landlord raise my rent after the first year, and is there a cap?'
    ],
    documents: [
      {
        id: 'doc-lease-agreement',
        title: 'Pinecrest Apartments — Residential Tenancy Agreement',
        category: 'lease',
        bundleName: 'Residential Lease Package',
        totalPages: 2,
        text: `--- Page 1 ---
RESIDENTIAL LEASE AGREEMENT
Landlord: Pinecrest Holdings LLC / Managing Agent: Metro Property Group
Tenant: Jordan Reed & Taylor Reed
Premises: Apartment 4B, 742 Evergreen Terrace, Portland, OR 97201
Term: Twelve (12) Months commencing September 1, 2025, and expiring August 31, 2026.

Section 1. Monthly Rent & Payment Terms
1.1 Rent Amount: Tenant agrees to pay monthly rent of $2,400.00, payable on or before the first (1st) calendar day of each month.
1.2 Late Fee: If rent is not received by 11:59 PM on the fifth (5th) day of the month, Tenant shall incur a late charge of $100.00 plus $10.00 for each additional day rent remains unpaid.
1.3 Rent Increases: Landlord may not increase rent during the initial 12-month lease term. If tenancy continues month-to-month thereafter, Landlord must provide at least ninety (90) days advance written notice of any rent adjustment, subject to applicable state and municipal rent stabilization statutes.

Section 2. Security Deposit
2.1 Deposit Held: Tenant has deposited $3,200.00 as security deposit.
2.2 Return Period: In accordance with Oregon Revised Statutes (ORS 90.300), Landlord shall return the security deposit, or deliver an itemized written accounting of any deductions, within thirty-one (31) calendar days following termination of tenancy and return of keys.
2.3 Allowable Deductions: Deductions may be made for unpaid rent, late charges, and physical damage exceeding normal wear and tear. Landlord may not deduct for routine painting, minor carpet wear, or pre-existing move-in conditions documented on the Move-In Inspection Checklist.

--- Page 2 ---
Section 3. Maintenance, Repairs & Alterations
3.1 Landlord Obligations: Landlord shall maintain plumbing, electrical, heating, weatherproofing, roof integrity, and major built-in kitchen appliances (refrigerator, oven, dishwasher) in good operable condition. Emergency repairs affecting habitability shall be initiated within twenty-four (24) hours of notice.
3.2 Tenant Responsibilities: Tenant shall keep the apartment clean, sanitary, and safely ventilated. Tenant is responsible for lightbulb replacements, smoke detector battery replacement, clearing drain clogs caused by hair or foreign objects, and repairing damage caused by Tenant's negligence or invitees.
3.3 Alterations: Tenant shall not paint walls, drill masonry, install satellite dishes, or replace locksets without prior written consent from Landlord.

Section 4. Landlord Right of Entry
4.1 Advance Notice: Landlord or Landlord's agents may enter the premises for routine maintenance, inspections, or prospective tenant showings only after providing at least twenty-four (24) hours written notice, specifying a reasonable window between 8:00 AM and 6:00 PM.
4.2 Emergency Exception: Landlord may enter without advance notice in the event of an imminent emergency threatening life, structural safety, or active water/gas leakage.

Section 5. Termination & Renewal
5.1 Non-Renewal Notice: Either party may terminate tenancy at the expiration of the initial lease term by serving at least sixty (60) days advance written notice.
5.2 Early Termination Fee: If Tenant terminates this lease prior to August 31, 2026, Tenant shall forfeit the security deposit and pay an early termination fee equal to one and one-half (1.5) months' rent ($3,600.00), unless early departure is excused under statutory domestic violence or active military relocation provisions.`
      },
      {
        id: 'doc-lease-rules-addendum',
        title: 'Pinecrest Apartments — Rules, Regulations & Pet Addendum',
        category: 'lease',
        bundleName: 'Residential Lease Package',
        totalPages: 2,
        text: `--- Page 1 ---
PINECREST APARTMENTS — COMMUNITY POLICIES & ADDENDUM
Building: 742 Evergreen Terrace

Rule 1. Quiet Hours & Noise Standards
1.1 Quiet Hours: Quiet hours are strictly enforced between 10:00 PM and 8:00 AM Sunday through Thursday, and 11:00 PM and 9:00 AM Friday through Saturday. Television, audio systems, and social gatherings must be kept at a decibel level that does not disturb adjacent residents.
1.2 Musical Instruments: Acoustic drums, amplified electric instruments, and brass instruments are prohibited at all times within residential units.

Rule 2. Pets & Animal Policy
2.1 Permitted Animals: Maximum of two (2) domesticated pets (cats or dogs under 45 lbs) per unit, subject to prior registration and breed approval.
2.2 Pet Fee & Deposit: Tenant has paid a one-time refundable pet deposit of $400.00 and agrees to pay $35.00 monthly pet rent per registered animal.
2.3 Common Area Restrictions: Dogs must remain leashed at all times in hallways, elevators, courtyard, and lobby. Waste must be bagged immediately.

--- Page 2 ---
Rule 3. Subletting, Airbnb & Short-Term Guests
3.1 Short-Term Rentals Prohibited: Subletting through Airbnb, VRBO, or any home-sharing platform is strictly prohibited. Engaging in short-term rental activity constitutes a non-curable material breach of tenancy and grounds for immediate eviction proceedings.
3.2 Long-Term Guests: Any guest staying longer than fourteen (14) consecutive nights or twenty-eight (28) nights within any six-month period must complete a tenant background application and be added to the lease as an authorized occupant.

Rule 4. Smoking & Hazardous Substances
4.1 Smoke-Free Campus: Smoking, vaping, and e-cigarette usage of any substance (including tobacco and cannabis) is strictly prohibited inside apartments, on private balconies, and within twenty-five (25) feet of all building entrances.`
      }
    ]
  },
  {
    id: 'bundle-saas-comparison',
    name: 'Enterprise SaaS MSA (Version 2.4 vs Proposed Version 3.0)',
    description: 'Compare current active enterprise cloud agreement against vendor proposed renewal terms.',
    sampleConcerns: [
      'What changed regarding liability caps, data breach notification deadlines, and price increases?',
      'Has the vendor removed our right to terminate for convenience or reduced service level credits?',
      'How does the new indemnification clause expose our company to greater risk?'
    ],
    documents: [
      {
        id: 'doc-saas-v2',
        title: 'CloudScale Enterprise Master Services Agreement (v2.4 - Current Active)',
        category: 'service',
        bundleName: 'Enterprise SaaS MSA Bundle',
        totalPages: 2,
        text: `--- Page 1 ---
CLOUDSCALE SYSTEMS, INC.
MASTER SERVICES AGREEMENT (VERSION 2.4 - EXECUTED 2024)

Section 4. Fees, Invoicing & Price Caps
4.1 Subscription Fees: Customer shall pay Annual Recurring Fees of $85,000 net 30 days from invoice date.
4.2 Renewal Price Protection: Upon renewal of the Initial Order Term, subscription fees shall not increase by more than three percent (3%) per annum over the preceding term rate.

Section 8. Data Protection & Security Breach
8.1 Security Safeguards: CloudScale shall maintain SOC 2 Type II compliance and AES-256 encryption for data at rest and in transit.
8.2 Security Breach Notification: CloudScale shall notify Customer in writing within twenty-four (24) hours of discovering or reasonably suspecting any confirmed or suspected unauthorized access, acquisition, or breach of Customer Data ("Security Incident"). CloudScale shall bear all costs of forensics and consumer notification.

--- Page 2 ---
Section 10. Limitation of Liability
10.1 Direct Damages Cap: Except for Excluded Liabilities under Section 10.3, each party's maximum aggregate liability arising out of or related to this Agreement shall be capped at two times (2x) the total fees paid by Customer in the preceding twelve (12) months ($170,000).
10.2 Consequential Damages: Neither party shall be liable for lost profits or punitive damages.
10.3 Excluded Liabilities: The liability cap in Section 10.1 shall NOT apply to breaches of confidentiality, gross negligence, willful misconduct, or CloudScale's indemnification obligations.

Section 12. Term & Termination
12.1 Term: The initial term is twenty-four (24) months.
12.2 Termination for Convenience: Customer may terminate this Agreement or any Order Form for convenience at any time upon sixty (60) days advance written notice, with a pro-rata refund of any unearned prepaid fees.`
      },
      {
        id: 'doc-saas-v3',
        title: 'CloudScale Enterprise Master Services Agreement (v3.0 - Proposed Renewal)',
        category: 'service',
        bundleName: 'Enterprise SaaS MSA Bundle',
        totalPages: 2,
        text: `--- Page 1 ---
CLOUDSCALE SYSTEMS, INC.
MASTER SERVICES AGREEMENT (VERSION 3.0 - PROPOSED RENEWAL 2026)

Section 4. Fees, Invoicing & Price Adjustments
4.1 Subscription Fees: Customer shall pay Annual Recurring Fees of $115,000 net 30 days from invoice date.
4.2 Renewal Price Adjustments: CloudScale reserves the right to increase list subscription fees upon sixty (60) days notice prior to the start of any Renewal Term by up to eight percent (8%) or the Consumer Price Index (CPI), whichever is higher.

Section 8. Data Protection & Incident Response
8.1 Security Safeguards: CloudScale shall maintain commercial industry standard security measures.
8.2 Security Incident Notification: In the event of a verified unauthorized access that materially compromises Customer Data, CloudScale shall notify Customer without undue delay, and in no event later than seventy-two (72) hours after confirmation. Each party shall bear its own internal investigation costs.

--- Page 2 ---
Section 10. Limitation of Liability
10.1 Direct Damages Cap: The total aggregate liability of either party for all claims arising out of or related to this Agreement shall under no circumstances exceed the total amounts actually paid by Customer in the twelve (12) months preceding the incident ($115,000).
10.2 Consequential Damages: Neither party shall be liable for indirect, incidental, or lost profit damages.
10.3 Super-Cap Exception: Liability for data breaches shall be subject to a separate "Super-Cap" equal to two times (2x) fees paid, replacing unlimited liability.

Section 12. Term & Termination
12.1 Term: The renewal term shall be thirty-six (36) months, renewing automatically unless ninety (90) days notice of non-renewal is provided.
12.2 Termination for Convenience: Termination for convenience is NOT permitted by either party during the 36-month committed term. Early cancellation requires payment of all remaining fees through the end of the committed term.`
      }
    ]
  }
];
