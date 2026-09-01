import { OrientationModule } from '../models/index';

const orientationSeedData = [
  {
    moduleKey: 'visa-and-frro',
    title: 'Student Visa & FRRO Registration Guide',
    category: 'VISA_FRRO' as const,
    description: 'Complete guide on Indian Student Visa (S-Visa) requirements, biometric procedures, and mandatory Foreigners Regional Registration Office (FRRO) registration within 14 days of arrival.',
    order: 1,
    estimatedMinutes: 20,
    badgeName: 'Visa Compliance Verified',
    topics: [
      {
        title: 'Student Visa (S-1 / S-2) Documentation',
        content: 'To travel to India, foreign students must obtain a Student Visa through Indian Visa Online (e-Visa portal) or the nearest Indian Embassy / Consulate. Key documents include your official DRAA Admission Offer Letter, Bonafide Student Certificate, proof of financial solvency, and passport with minimum 6 months validity.',
        keyTakeaway: 'Never travel on a Tourist Visa (T-Visa) for formal degree courses; immigration will require conversion or re-entry.',
      },
      {
        title: 'Mandatory e-FRRO Registration Within 14 Days',
        content: 'All foreign nationals holding student visas valid for more than 180 days must register online at the e-FRRO portal (indianfrro.gov.in) within 14 days of physical arrival in India. You will upload your Form S (issued by your Indian university), residential proof / hostel letter, passport, and visa copy.',
        keyTakeaway: 'The Registration Certificate (RC/RP) is essential for opening Indian bank accounts, extending visas, and domestic security clearance.',
      },
    ],
    checklist: [
      'Original Passport with valid Student Visa sticker/e-Visa copy',
      'Official Provisional Admission Letter with institute seal',
      'Form S from university international student cell',
      'Hostel allotment letter or notarized tenancy lease',
      'Online e-FRRO registration slip submission',
    ],
  },
  {
    moduleKey: 'health-and-safety',
    title: 'Medical Insurance, Vaccinations & Campus Wellness',
    category: 'HEALTH_SAFETY' as const,
    description: 'Essential health precautions, required vaccinations, health insurance coverage, 24/7 emergency helplines, and university campus medical facilities.',
    order: 2,
    estimatedMinutes: 15,
    badgeName: 'Health & Safety Certified',
    topics: [
      {
        title: 'Health Insurance & Cashless Hospitalization',
        content: 'International students in India should possess comprehensive medical insurance covering in-patient hospitalization up to at least ₹5,00,000 (~$6,000 USD). Most partner institutions provide tied-up group health policies upon enrollment with on-campus medical dispensaries for routine consults.',
        keyTakeaway: 'Keep your university health card and emergency contact numbers saved on your phone at all times.',
      },
      {
        title: 'Emergency Contacts & Safety Hotlines',
        content: 'National emergency number in India is 112 (Unified Police, Fire & Medical). National Ambulance is 108. Women Helpline is 1091. All partner campuses maintain 24/7 security gates with biometric student verification.',
        keyTakeaway: 'Register with your country\'s embassy or high commission in New Delhi after arrival.',
      },
    ],
    checklist: [
      'Valid medical health insurance policy certificate',
      'Prescription records for any chronic medication in English',
      'Vaccination certificates (Yellow Fever if traveling from designated endemic regions)',
      'University dispensary emergency contact recorded',
    ],
  },
  {
    moduleKey: 'campus-life-culture',
    title: 'Campus Life, Culture & Academic Norms in India',
    category: 'CAMPUS_LIFE' as const,
    description: 'Understanding academic expectations, grading (UGC 10-point scale), attendance rules, hostel living, dietary preferences, and Indian cultural etiquette.',
    order: 3,
    estimatedMinutes: 18,
    badgeName: 'Cultural Navigator',
    topics: [
      {
        title: 'Academic Structure & Attendance Regulations',
        content: 'Indian universities follow semester systems with continuous internal assessment (quizzes, mid-terms, practical labs) and end-semester examinations. The UGC mandates a minimum of 75% classroom attendance to be eligible to sit for final semester examinations.',
        keyTakeaway: 'Maintain consistent lecture attendance from day one to avoid examination detention.',
      },
      {
        title: 'Hostel Living & Dining Options',
        content: 'Hostels provide furnished rooms (single/twin-sharing) with Wi-Fi, laundry facilities, study lounges, and mess dining providing both vegetarian and non-vegetarian international student meal plans. Many campuses also have international student kitchens.',
        keyTakeaway: 'Follow hostel entry/exit timings and visitor policies strictly for campus safety.',
      },
    ],
    checklist: [
      'Hostel reservation confirmation voucher',
      'Laptop and voltage converter (230V, 50Hz, Type D/M plugs in India)',
      'Academic transcripts and original degree certificates for physical verification',
      'Passport size photographs (minimum 10 copies for campus ID and SIM cards)',
    ],
  },
  {
    moduleKey: 'finance-and-banking',
    title: 'Banking, Currency Exchange & Daily Living Costs',
    category: 'FINANCE_BANKING' as const,
    description: 'Opening an NRO/NRE student bank account, digital UPI payments, currency conversion, and budgeting living expenses in India.',
    order: 4,
    estimatedMinutes: 15,
    badgeName: 'Financial Ready',
    topics: [
      {
        title: 'Opening a Student Bank Account in India',
        content: 'Foreign students can open an NRO (Non-Resident Ordinary) savings bank account in leading banks (SBI, HDFC, ICICI, Canara Bank) with their Passport, Student Visa, FRRO Registration Certificate, University Bonafide Letter, and PAN / Form 60.',
        keyTakeaway: 'Bank accounts provide debit cards enabled for instant UPI (Unified Payments Interface) digital transactions.',
      },
      {
        title: 'Budgeting & Daily Living Expenses',
        content: 'India offers exceptional affordability for international students. Monthly living costs (food, local transport, mobile recharge, leisure) typically range from $150 to $300 USD depending on the city (Tier 1 vs Tier 2/3).',
        keyTakeaway: 'UPI apps like PhonePe and Google Pay are accepted universally from campus cafeterias to metro stations.',
      },
    ],
    checklist: [
      'Initial travel foreign exchange ($200-$400 USD cash/forex card) for arrival week',
      'Bank account opening paperwork ready (Passport, Visa, FRRO, Bonafide letter)',
      'Indian SIM card (Airtel / Jio) obtained at airport or university kiosk',
    ],
  },
];

export async function seedOrientationModules(): Promise<void> {
  for (const moduleData of orientationSeedData) {
    await OrientationModule.updateOne(
      { moduleKey: moduleData.moduleKey },
      { $set: moduleData },
      { upsert: true }
    );
  }
  console.log(`[Seed] ${orientationSeedData.length} pre-departure LMS orientation modules seeded.`);
}
