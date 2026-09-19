import type { Major } from "@/lib/types";

/**
 * PLACEHOLDER DATA — used by the backend route until real
 * College Scorecard data is wired in (step 8). Verify before demo.
 */
export const majors: Major[] = [
  // Engineering & Computing
  { id: "computer-science", name: "Computer Science", category: "Engineering & Computing", earlySalary: 80000, midSalary: 122000, unemployment: 6.1, gradSchoolShare: 33, avgDebt: 27500 },
  { id: "computer-engineering", name: "Computer Engineering", category: "Engineering & Computing", earlySalary: 80000, midSalary: 122000, unemployment: 7.5, gradSchoolShare: 40, avgDebt: 28100 },
  { id: "electrical-engineering", name: "Electrical Engineering", category: "Engineering & Computing", earlySalary: 80000, midSalary: 125000, unemployment: 3.2, gradSchoolShare: 49, avgDebt: 28400 },
  { id: "chemical-engineering", name: "Chemical Engineering", category: "Engineering & Computing", earlySalary: 80000, midSalary: 133000, unemployment: 2.0, gradSchoolShare: 46, avgDebt: 29200 },
  { id: "mechanical-engineering", name: "Mechanical Engineering", category: "Engineering & Computing", earlySalary: 77000, midSalary: 120000, unemployment: 5.3, gradSchoolShare: 37, avgDebt: 28600 },
  { id: "civil-engineering", name: "Civil Engineering", category: "Engineering & Computing", earlySalary: 71000, midSalary: 100000, unemployment: 1.0, gradSchoolShare: 39, avgDebt: 27900 },
  { id: "aerospace-engineering", name: "Aerospace Engineering", category: "Engineering & Computing", earlySalary: 78000, midSalary: 125000, unemployment: 6.4, gradSchoolShare: 49, avgDebt: 29600 },
  { id: "information-systems", name: "Information Systems", category: "Engineering & Computing", earlySalary: 66000, midSalary: 100000, unemployment: 5.6, gradSchoolShare: 24, avgDebt: 27200 },
  // Health
  { id: "nursing", name: "Nursing", category: "Health", earlySalary: 75000, midSalary: 98000, unemployment: 1.4, gradSchoolShare: 30, avgDebt: 23400 },
  { id: "health-services", name: "Health Services & Administration", category: "Health", earlySalary: 50000, midSalary: 70000, unemployment: 3.3, gradSchoolShare: 32, avgDebt: 26800 },
  { id: "nutrition", name: "Nutrition Sciences", category: "Health", earlySalary: 45000, midSalary: 65000, unemployment: 3.1, gradSchoolShare: 41, avgDebt: 25900 },
  // Business
  { id: "finance", name: "Finance", category: "Business", earlySalary: 70000, midSalary: 115000, unemployment: 3.7, gradSchoolShare: 29, avgDebt: 26400 },
  { id: "accounting", name: "Accounting", category: "Business", earlySalary: 60000, midSalary: 90000, unemployment: 2.7, gradSchoolShare: 28, avgDebt: 25800 },
  { id: "economics", name: "Economics", category: "Business", earlySalary: 70000, midSalary: 120000, unemployment: 4.9, gradSchoolShare: 41, avgDebt: 26100 },
  { id: "business-management", name: "Business Management", category: "Business", earlySalary: 57000, midSalary: 95000, unemployment: 4.6, gradSchoolShare: 24, avgDebt: 26300 },
  { id: "marketing", name: "Marketing", category: "Business", earlySalary: 55000, midSalary: 85000, unemployment: 4.9, gradSchoolShare: 20, avgDebt: 26600 },
  // Sciences & Math
  { id: "mathematics", name: "Mathematics", category: "Sciences & Math", earlySalary: 65000, midSalary: 108000, unemployment: 5.8, gradSchoolShare: 52, avgDebt: 26700 },
  { id: "physics", name: "Physics", category: "Sciences & Math", earlySalary: 70000, midSalary: 110000, unemployment: 7.8, gradSchoolShare: 68, avgDebt: 27300 },
  { id: "chemistry", name: "Chemistry", category: "Sciences & Math", earlySalary: 55000, midSalary: 85000, unemployment: 3.7, gradSchoolShare: 65, avgDebt: 27000 },
  { id: "biology", name: "Biology", category: "Sciences & Math", earlySalary: 50000, midSalary: 80000, unemployment: 3.0, gradSchoolShare: 62, avgDebt: 27600 },
  { id: "environmental-studies", name: "Environmental Studies", category: "Sciences & Math", earlySalary: 48000, midSalary: 78000, unemployment: 4.5, gradSchoolShare: 36, avgDebt: 27400 },
  // Social Sciences
  { id: "political-science", name: "Political Science", category: "Social Sciences", earlySalary: 55000, midSalary: 95000, unemployment: 4.8, gradSchoolShare: 55, avgDebt: 28200 },
  { id: "psychology", name: "Psychology", category: "Social Sciences", earlySalary: 45000, midSalary: 70000, unemployment: 4.9, gradSchoolShare: 51, avgDebt: 28500 },
  { id: "sociology", name: "Sociology", category: "Social Sciences", earlySalary: 45000, midSalary: 68000, unemployment: 9.0, gradSchoolShare: 36, avgDebt: 28700 },
  { id: "criminal-justice", name: "Criminal Justice", category: "Social Sciences", earlySalary: 48000, midSalary: 70000, unemployment: 3.6, gradSchoolShare: 24, avgDebt: 28900 },
  { id: "public-policy", name: "Public Policy", category: "Social Sciences", earlySalary: 50000, midSalary: 80000, unemployment: 5.4, gradSchoolShare: 48, avgDebt: 29100 },
  // Arts & Humanities
  { id: "english", name: "English Language & Literature", category: "Arts & Humanities", earlySalary: 44000, midSalary: 76000, unemployment: 4.9, gradSchoolShare: 48, avgDebt: 28800 },
  { id: "history", name: "History", category: "Arts & Humanities", earlySalary: 48000, midSalary: 80000, unemployment: 5.5, gradSchoolShare: 51, avgDebt: 29000 },
  { id: "communications", name: "Communications", category: "Arts & Humanities", earlySalary: 50000, midSalary: 80000, unemployment: 4.5, gradSchoolShare: 24, avgDebt: 28300 },
  { id: "journalism", name: "Journalism", category: "Arts & Humanities", earlySalary: 45000, midSalary: 75000, unemployment: 5.0, gradSchoolShare: 28, avgDebt: 29400 },
  { id: "graphic-design", name: "Graphic Design", category: "Arts & Humanities", earlySalary: 45000, midSalary: 70000, unemployment: 3.3, gradSchoolShare: 12, avgDebt: 30100 },
  { id: "fine-arts", name: "Fine Arts", category: "Arts & Humanities", earlySalary: 42000, midSalary: 65000, unemployment: 7.0, gradSchoolShare: 22, avgDebt: 31200 },
  { id: "architecture", name: "Architecture", category: "Arts & Humanities", earlySalary: 55000, midSalary: 85000, unemployment: 1.9, gradSchoolShare: 40, avgDebt: 31800 },
  { id: "elementary-education", name: "Elementary Education", category: "Arts & Humanities", earlySalary: 43000, midSalary: 52000, unemployment: 1.8, gradSchoolShare: 50, avgDebt: 27700 },
];
