export type TriageLevel = "critical" | "stable" | "discharge";

export type Patient = {
  name: string;
  mrn: string;
  triage: TriageLevel;
  lastVitals: string;
  allergies: string[];
  medications: string[];
  physicianNote: string;
};

export const patients: Patient[] = [
  {
    name: "Eleanor Vance",
    mrn: "MRN-482901",
    triage: "critical",
    lastVitals: "14:22 — BP 88/52, SpO₂ 91%",
    allergies: ["Penicillin", "Sulfa drugs"],
    medications: [
      "Norepinephrine infusion 0.05 mcg/kg/min",
      "Lactated Ringer's IV",
      "Ceftriaxone 2 g IV daily",
    ],
    physicianNote:
      "Dr. Patel (Hospitalist): Suspected sepsis secondary to UTI. MAP goals >65; repeat lactate in 2h. ICU aware if pressor requirement escalates.",
  },
  {
    name: "Marcus Chen",
    mrn: "MRN-771204",
    triage: "stable",
    lastVitals: "13:05 — BP 128/78, HR 76",
    allergies: ["Latex (mild)"],
    medications: [
      "Metoprolol tartrate 25 mg PO BID",
      "Atorvastatin 40 mg PO nightly",
      "Aspirin 81 mg PO daily",
    ],
    physicianNote:
      "Dr. Alvarez (Cardiology): Post-NSTEMI day 3, on guideline-directed therapy. Plan for stress imaging prior to discharge if enzymes remain flat.",
  },
  {
    name: "Priya Desai",
    mrn: "MRN-339018",
    triage: "discharge",
    lastVitals: "12:40 — BP 118/72, afebrile",
    allergies: ["No known drug allergies"],
    medications: [
      "Acetaminophen 650 mg PO q6h PRN",
      "Docusate 100 mg PO BID",
    ],
    physicianNote:
      "Dr. Kim (Hospitalist): Clinically stable after laparoscopic cholecystectomy POD2. Discharge today with GI surgery follow-up in 10 days; return precautions reviewed.",
  },
  {
    name: "James Okonkwo",
    mrn: "MRN-905612",
    triage: "critical",
    lastVitals: "14:18 — HR 112, RR 24",
    allergies: ["Iodinated contrast (anaphylaxis)"],
    medications: [
      "Albuterol-ipratropium nebs q4h",
      "Methylprednisolone 40 mg IV q12h",
      "Heparin infusion per protocol",
    ],
    physicianNote:
      "Dr. Okafor (Pulmonary): Acute hypoxemic respiratory failure likely COPD exacerbation. If work of breathing worsens, discuss step-up to BiPAP with ICU fellow.",
  },
  {
    name: "Sofia Ramirez",
    mrn: "MRN-220447",
    triage: "stable",
    lastVitals: "11:52 — BP 132/84, glucose 142",
    allergies: ["Shellfish"],
    medications: [
      "Insulin glargine 18 units SQ daily",
      "Insulin lispro sliding scale",
      "Metformin 500 mg PO BID (held NPO)",
    ],
    physicianNote:
      "Dr. Nguyen (Endocrine): DKA resolved; transitioning to basal-bolus. Nutrition consult for carb-consistent diet; hypoglycemia protocol at bedside.",
  },
  {
    name: "Daniel Frost",
    mrn: "MRN-664833",
    triage: "discharge",
    lastVitals: "10:15 — orthostatic vitals WNL",
    allergies: ["Codeine"],
    medications: [
      "Ibuprofen 400 mg PO q8h PRN",
      "Ondansetron 4 mg PO q8h PRN",
    ],
    physicianNote:
      "Dr. Ibrahim (Hospitalist): Orthostatic symptoms resolved with fluids. Safe for discharge with primary care in 1 week; avoid NSAIDs if creatinine uptrends.",
  },
];
