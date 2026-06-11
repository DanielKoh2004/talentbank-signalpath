import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────
// SignalPath Career OS — Seed Data
// ─────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding SignalPath Career OS database...\n");

  // ━━━ 1. Clear all data (dependency-safe order) ━━━
  console.log("🗑️  Clearing existing data...");
  await prisma.cohortAggregate.deleteMany();
  await prisma.universityCohort.deleteMany();
  await prisma.reEngagementEvent.deleteMany();
  await prisma.rejectedCandidateContext.deleteMany();
  await prisma.candidateRetentionConsent.deleteMany();
  await prisma.matchScore.deleteMany();
  await prisma.opportunityInteraction.deleteMany();
  await prisma.roleRequirement.deleteMany();
  await prisma.roleBrief.deleteMany();
  await prisma.roleFamily.deleteMany();
  await prisma.skillRelation.deleteMany();
  await prisma.evidenceClaim.deleteMany();
  await prisma.extractionJob.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();
  console.log("   ✅ All tables cleared.\n");

  // ━━━ 2. Users ━━━
  console.log("👤 Creating users...");

  const userAisha = await prisma.user.create({
    data: {
      id: "user_aisha",
      name: "Aisha Razak",
      email: "aisha@demo.signalpath.com",
      role: "candidate",
    },
  });

  const userFarid = await prisma.user.create({
    data: {
      id: "user_farid",
      name: "Farid Lim",
      email: "farid@demo.signalpath.com",
      role: "candidate",
    },
  });

  const userMeiLin = await prisma.user.create({
    data: {
      id: "user_mei_lin",
      name: "Mei Lin Wong",
      email: "mei.lin@demo.signalpath.com",
      role: "candidate",
    },
  });

  const userArjun = await prisma.user.create({
    data: {
      id: "user_arjun",
      name: "Arjun Menon",
      email: "arjun@demo.signalpath.com",
      role: "candidate",
    },
  });

  const userDatacoHR = await prisma.user.create({
    data: {
      id: "user_dataco_hr",
      name: "DataCo HR",
      email: "hr@dataco.demo.signalpath.com",
      role: "employer",
    },
  });

  const userUMAdmin = await prisma.user.create({
    data: {
      id: "user_um_admin",
      name: "UM Admin",
      email: "admin@um.demo.signalpath.com",
      role: "university_admin",
    },
  });
  void userUMAdmin;

  console.log(`   ✅ Created ${6} users.\n`);

  // ━━━ 3. Candidate Profile ━━━
  console.log("📋 Creating candidate profiles...");

  const profileAisha = await prisma.candidateProfile.create({
    data: {
      id: "profile_aisha",
      userId: userAisha.id,
      location: "Kuala Lumpur, Malaysia",
      educationLevel: "Bachelor",
      institution: "University of Malaya",
      targetLocations: JSON.stringify(["Kuala Lumpur", "Singapore"]),
      preferredRoles: JSON.stringify(["Product Analyst", "Data Analyst"]),
      salaryExpectationMin: 3500,
      salaryExpectationMax: 5500,
      visibilityStatus: "private",
    },
  });

  const profileFarid = await prisma.candidateProfile.create({
    data: {
      id: "profile_farid",
      userId: userFarid.id,
      location: "Petaling Jaya, Malaysia",
      educationLevel: "Diploma",
      institution: "Asia Pacific University",
      targetLocations: JSON.stringify(["Kuala Lumpur", "Petaling Jaya", "Remote"]),
      preferredRoles: JSON.stringify(["Frontend Engineer", "Backend API Engineer", "Cloud DevOps Associate"]),
      salaryExpectationMin: 4500,
      salaryExpectationMax: 7500,
      visibilityStatus: "private",
    },
  });

  const profileMeiLin = await prisma.candidateProfile.create({
    data: {
      id: "profile_mei_lin",
      userId: userMeiLin.id,
      location: "Singapore",
      educationLevel: "Bachelor",
      institution: "Taylor's University",
      targetLocations: JSON.stringify(["Singapore", "Kuala Lumpur", "Remote"]),
      preferredRoles: JSON.stringify(["Associate Product Manager", "UX Research Coordinator", "Operations Analyst"]),
      salaryExpectationMin: 5000,
      salaryExpectationMax: 8500,
      visibilityStatus: "private",
    },
  });

  const profileArjun = await prisma.candidateProfile.create({
    data: {
      id: "profile_arjun",
      userId: userArjun.id,
      location: "Cyberjaya, Malaysia",
      educationLevel: "Bachelor",
      institution: "Multimedia University",
      targetLocations: JSON.stringify(["Kuala Lumpur", "Singapore", "Remote"]),
      preferredRoles: JSON.stringify(["Junior Security Analyst", "Cryptographic Infrastructure Analyst"]),
      salaryExpectationMin: 5500,
      salaryExpectationMax: 9500,
      visibilityStatus: "private",
    },
  });

  console.log(`   ✅ Created ${4} candidate profiles.\n`);

  // ━━━ 4. Skills (40+ across 7 categories) ━━━
  console.log("🛠️  Creating canonical skills...");

  const skills = [
    // ── Data ──
    { id: "sql", name: "SQL", category: "Data", aliases: JSON.stringify(["Structured Query Language", "SQL databases"]), parentSkillId: null, level: "specific" },
    { id: "data_visualization", name: "Data Visualization", category: "Data", aliases: JSON.stringify(["data viz", "charting"]), parentSkillId: null, level: "specific" },
    { id: "data_analysis", name: "Data Analysis", category: "Data", aliases: JSON.stringify(["analytics", "data analytics"]), parentSkillId: null, level: "family" },
    { id: "statistical_analysis", name: "Statistical Analysis", category: "Data", aliases: JSON.stringify(["statistics", "stat analysis"]), parentSkillId: null, level: "specific" },
    { id: "data_modeling", name: "Data Modeling", category: "Data", aliases: null, parentSkillId: null, level: "specific" },
    { id: "etl_pipelines", name: "ETL Pipelines", category: "Data", aliases: JSON.stringify(["data pipelines", "ETL"]), parentSkillId: null, level: "specific" },
    { id: "machine_learning", name: "Machine Learning", category: "Data", aliases: JSON.stringify(["ML"]), parentSkillId: null, level: "specific" },
    { id: "python_data", name: "Python for Data", category: "Data", aliases: JSON.stringify(["pandas", "numpy"]), parentSkillId: null, level: "specific" },
    { id: "r_programming", name: "R Programming", category: "Data", aliases: JSON.stringify(["R language", "R stats"]), parentSkillId: null, level: "specific" },
    { id: "big_data", name: "Big Data", category: "Data", aliases: JSON.stringify(["Hadoop", "Spark"]), parentSkillId: null, level: "specific" },

    // ── Product ──
    { id: "product_strategy", name: "Product Strategy", category: "Product", aliases: null, parentSkillId: null, level: "family" },
    { id: "user_research", name: "User Research", category: "Product", aliases: JSON.stringify(["UX research", "user interviews"]), parentSkillId: null, level: "specific" },
    { id: "ab_testing", name: "A/B Testing", category: "Product", aliases: JSON.stringify(["experimentation", "split testing"]), parentSkillId: null, level: "specific" },
    { id: "product_analytics", name: "Product Analytics", category: "Product", aliases: JSON.stringify(["product metrics"]), parentSkillId: null, level: "family" },
    { id: "roadmap_planning", name: "Roadmap Planning", category: "Product", aliases: JSON.stringify(["product roadmap"]), parentSkillId: null, level: "specific" },
    { id: "agile", name: "Agile Methodology", category: "Product", aliases: JSON.stringify(["scrum", "kanban"]), parentSkillId: null, level: "specific" },
    { id: "wireframing", name: "Wireframing", category: "Product", aliases: JSON.stringify(["prototyping", "mockups"]), parentSkillId: null, level: "specific" },

    // ── Communication ──
    { id: "stakeholder_communication", name: "Stakeholder Communication", category: "Communication", aliases: JSON.stringify(["presenting to stakeholders"]), parentSkillId: null, level: "specific" },
    { id: "technical_writing", name: "Technical Writing", category: "Communication", aliases: JSON.stringify(["documentation"]), parentSkillId: null, level: "specific" },
    { id: "presentation_skills", name: "Presentation Skills", category: "Communication", aliases: JSON.stringify(["public speaking"]), parentSkillId: null, level: "specific" },
    { id: "cross_functional", name: "Cross-Functional Collaboration", category: "Communication", aliases: JSON.stringify(["cross-team"]), parentSkillId: null, level: "specific" },
    { id: "client_management", name: "Client Management", category: "Communication", aliases: JSON.stringify(["client relations"]), parentSkillId: null, level: "specific" },

    // ── Technical ──
    { id: "python", name: "Python Programming", category: "Technical", aliases: null, parentSkillId: null, level: "family" },
    { id: "javascript", name: "JavaScript", category: "Technical", aliases: null, parentSkillId: null, level: "family" },
    { id: "typescript", name: "TypeScript", category: "Technical", aliases: null, parentSkillId: null, level: "specific" },
    { id: "react", name: "React", category: "Technical", aliases: JSON.stringify(["React.js"]), parentSkillId: null, level: "specific" },
    { id: "api_design", name: "API Design", category: "Technical", aliases: JSON.stringify(["REST API", "API development"]), parentSkillId: null, level: "specific" },
    { id: "cloud_infrastructure", name: "Cloud Infrastructure", category: "Technical", aliases: JSON.stringify(["AWS", "GCP", "Azure"]), parentSkillId: null, level: "specific" },
    { id: "git", name: "Git", category: "Technical", aliases: JSON.stringify(["version control", "GitHub"]), parentSkillId: null, level: "specific" },
    { id: "database_design", name: "Database Design", category: "Technical", aliases: JSON.stringify(["schema design"]), parentSkillId: null, level: "specific" },
    { id: "system_design", name: "System Design", category: "Technical", aliases: JSON.stringify(["architecture"]), parentSkillId: null, level: "specific" },

    // ── Business ──
    { id: "business_analysis", name: "Business Analysis", category: "Business", aliases: JSON.stringify(["BA"]), parentSkillId: null, level: "family" },
    { id: "market_research", name: "Market Research", category: "Business", aliases: null, parentSkillId: null, level: "specific" },
    { id: "financial_analysis", name: "Financial Analysis", category: "Business", aliases: null, parentSkillId: null, level: "specific" },
    { id: "strategic_planning", name: "Strategic Planning", category: "Business", aliases: null, parentSkillId: null, level: "specific" },
    { id: "project_management", name: "Project Management", category: "Business", aliases: JSON.stringify(["PM"]), parentSkillId: null, level: "specific" },
    { id: "crm", name: "CRM", category: "Business", aliases: JSON.stringify(["customer relationship management", "Salesforce"]), parentSkillId: null, level: "specific" },

    // ── Security ──
    { id: "information_security", name: "Information Security", category: "Security", aliases: JSON.stringify(["infosec"]), parentSkillId: null, level: "family" },
    { id: "cryptography", name: "Cryptography", category: "Security", aliases: JSON.stringify(["encryption"]), parentSkillId: null, level: "specific" },
    { id: "zk_proofs", name: "Zero-Knowledge Proofs", category: "Security", aliases: JSON.stringify(["ZK proofs", "zk-SNARKs"]), parentSkillId: null, level: "specific" },
    { id: "identity_verification", name: "Identity Verification", category: "Security", aliases: JSON.stringify(["identity management"]), parentSkillId: null, level: "specific" },
    { id: "cryptographic_infrastructure", name: "Cryptographic Infrastructure", category: "Security", aliases: null, parentSkillId: null, level: "specific" },

    // ── Operations ──
    { id: "process_optimization", name: "Process Optimization", category: "Operations", aliases: JSON.stringify(["process improvement"]), parentSkillId: null, level: "specific" },
    { id: "supply_chain", name: "Supply Chain Management", category: "Operations", aliases: null, parentSkillId: null, level: "specific" },
    { id: "quality_assurance", name: "Quality Assurance", category: "Operations", aliases: JSON.stringify(["QA", "testing"]), parentSkillId: null, level: "specific" },
    { id: "devops", name: "DevOps", category: "Operations", aliases: JSON.stringify(["CI/CD"]), parentSkillId: null, level: "specific" },
    { id: "monitoring", name: "Monitoring", category: "Operations", aliases: JSON.stringify(["observability"]), parentSkillId: null, level: "specific" },
  ];

  for (const skill of skills) {
    await prisma.skill.create({ data: skill });
  }

  // Now set parentSkillId for skills that have hierarchy via the skill table
  await prisma.skill.update({ where: { id: "python_data" }, data: { parentSkillId: "python" } });
  await prisma.skill.update({ where: { id: "react" }, data: { parentSkillId: "javascript" } });
  await prisma.skill.update({ where: { id: "typescript" }, data: { parentSkillId: "javascript" } });
  await prisma.skill.update({ where: { id: "zk_proofs" }, data: { parentSkillId: "cryptography" } });

  console.log(`   ✅ Created ${skills.length} canonical skills.\n`);

  // ━━━ 5. Skill Relations ━━━
  console.log("🔗 Creating skill relations...");

  const skillRelations = [
    { id: "srel_zk_crypto", sourceSkillId: "zk_proofs", targetSkillId: "cryptography", relationType: "parent", scoringWeight: 1.0 },
    { id: "srel_crypto_infra", sourceSkillId: "cryptography", targetSkillId: "cryptographic_infrastructure", relationType: "adjacent", scoringWeight: 0.7 },
    { id: "srel_da_sql", sourceSkillId: "data_analysis", targetSkillId: "sql", relationType: "prerequisite", scoringWeight: 0.8 },
    { id: "srel_dv_da", sourceSkillId: "data_visualization", targetSkillId: "data_analysis", relationType: "prerequisite", scoringWeight: 0.8 },
    { id: "srel_pa_da", sourceSkillId: "product_analytics", targetSkillId: "data_analysis", relationType: "prerequisite", scoringWeight: 0.8 },
    { id: "srel_ab_stat", sourceSkillId: "ab_testing", targetSkillId: "statistical_analysis", relationType: "prerequisite", scoringWeight: 0.8 },
    { id: "srel_ab_pa", sourceSkillId: "ab_testing", targetSkillId: "product_analytics", relationType: "adjacent", scoringWeight: 0.7 },
    { id: "srel_ml_pydata", sourceSkillId: "machine_learning", targetSkillId: "python_data", relationType: "prerequisite", scoringWeight: 0.8 },
    { id: "srel_ml_stat", sourceSkillId: "machine_learning", targetSkillId: "statistical_analysis", relationType: "prerequisite", scoringWeight: 0.8 },
    { id: "srel_pydata_py", sourceSkillId: "python_data", targetSkillId: "python", relationType: "parent", scoringWeight: 1.0 },
    { id: "srel_react_js", sourceSkillId: "react", targetSkillId: "javascript", relationType: "parent", scoringWeight: 1.0 },
    { id: "srel_ts_js", sourceSkillId: "typescript", targetSkillId: "javascript", relationType: "parent", scoringWeight: 1.0 },
  ];

  for (const rel of skillRelations) {
    await prisma.skillRelation.create({ data: rel });
  }

  console.log(`   ✅ Created ${skillRelations.length} skill relations.\n`);

  // ━━━ 6. Role Family ━━━
  console.log("🏷️  Creating role families...");

  const roleFamilyPA = await prisma.roleFamily.create({
    data: {
      id: "rf_product_analytics",
      name: "Product Analytics",
      description: "Roles focused on analyzing product data, running experiments, and deriving actionable insights to inform product decisions.",
      commonSkills: JSON.stringify(["sql", "data_visualization", "product_analytics", "ab_testing", "data_analysis", "stakeholder_communication"]),
    },
  });

  const roleFamilyDA = await prisma.roleFamily.create({
    data: {
      id: "rf_data_analysis",
      name: "Data Analysis",
      description: "Roles centered on extracting insights from data using statistical methods, SQL, and visualization tools.",
      commonSkills: JSON.stringify(["sql", "data_analysis", "data_visualization", "statistical_analysis", "python_data"]),
    },
  });

  const roleFamilyPM = await prisma.roleFamily.create({
    data: {
      id: "rf_product_management",
      name: "Product Management",
      description: "Roles responsible for product strategy, roadmap planning, and cross-functional collaboration.",
      commonSkills: JSON.stringify(["product_strategy", "roadmap_planning", "user_research", "agile", "stakeholder_communication"]),
    },
  });

  console.log(`   ✅ Created 6 role families.\n`);

  // ━━━ 7. Role Brief (Demo Role: Junior Product Analyst) ━━━
  console.log("📄 Creating role briefs...");

  const roleFamilySoftware = await prisma.roleFamily.create({
    data: {
      id: "rf_software_engineering",
      name: "Software Engineering",
      description: "Roles focused on building web applications, APIs, cloud services, and reliable engineering systems.",
      commonSkills: JSON.stringify(["javascript", "typescript", "react", "api_design", "database_design", "git", "cloud_infrastructure"]),
    },
  });

  const roleFamilySecurity = await prisma.roleFamily.create({
    data: {
      id: "rf_security_engineering",
      name: "Security Engineering",
      description: "Roles focused on information security, identity systems, cryptographic infrastructure, and secure operations.",
      commonSkills: JSON.stringify(["information_security", "identity_verification", "cryptography", "cryptographic_infrastructure", "technical_writing"]),
    },
  });

  const roleFamilyBizOps = await prisma.roleFamily.create({
    data: {
      id: "rf_business_operations",
      name: "Business Operations",
      description: "Roles focused on process improvement, business analysis, market research, and operational decision support.",
      commonSkills: JSON.stringify(["business_analysis", "process_optimization", "project_management", "market_research", "data_analysis"]),
    },
  });

  const roleBriefJPA = await prisma.roleBrief.create({
    data: {
      id: "rb_junior_product_analyst",
      employerId: userDatacoHR.id,
      title: "Junior Product Analyst",
      roleFamilyId: roleFamilyPA.id,
      location: "Kuala Lumpur",
      workMode: "hybrid",
      salaryMin: 4000,
      salaryMax: 6000,
      salaryCurrency: "MYR",
      salarySource: "employer_provided",
      description: "DataCo Analytics is looking for a Junior Product Analyst to join our growing product team. You will analyze user behaviour, run A/B tests, build dashboards, and present data-driven recommendations to stakeholders.",
      status: "active",
    },
  });

  console.log(`   ✅ Created role brief: "${roleBriefJPA.title}".\n`);

  // ━━━ 8. Role Requirements ━━━
  console.log("📌 Creating role requirements...");

  const extraRoleBriefs = [
    {
      id: "rb_data_analyst_fintech",
      employerId: userDatacoHR.id,
      title: "Data Analyst, Fintech",
      roleFamilyId: roleFamilyDA.id,
      location: "Kuala Lumpur",
      workMode: "hybrid",
      salaryMin: 4800,
      salaryMax: 7800,
      salaryCurrency: "MYR",
      salarySource: "employer_provided",
      description: "Analyze payment, wallet, and customer behaviour data using SQL, Python, dashboards, and statistical analysis to support fintech product decisions.",
      status: "active",
    },
    {
      id: "rb_bi_analyst",
      employerId: userDatacoHR.id,
      title: "Business Intelligence Analyst",
      roleFamilyId: roleFamilyDA.id,
      location: "Petaling Jaya",
      workMode: "hybrid",
      salaryMin: 5000,
      salaryMax: 8200,
      salaryCurrency: "MYR",
      salarySource: "employer_provided",
      description: "Build executive dashboards, define metrics, and translate operational data into business recommendations for commercial teams.",
      status: "active",
    },
    {
      id: "rb_associate_product_manager",
      employerId: userDatacoHR.id,
      title: "Associate Product Manager",
      roleFamilyId: roleFamilyPM.id,
      location: "Singapore",
      workMode: "hybrid",
      salaryMin: 5200,
      salaryMax: 8600,
      salaryCurrency: "MYR",
      salarySource: "seeded_estimate",
      description: "Support discovery, roadmap planning, user research, sprint rituals, and stakeholder communication for a regional SaaS product.",
      status: "active",
    },
    {
      id: "rb_ux_research_coordinator",
      employerId: userDatacoHR.id,
      title: "UX Research Coordinator",
      roleFamilyId: roleFamilyPM.id,
      location: "Remote",
      workMode: "remote",
      salaryMin: 4200,
      salaryMax: 6500,
      salaryCurrency: "MYR",
      salarySource: "seeded_estimate",
      description: "Coordinate user interviews, synthesize product feedback, document research insights, and present recommendations to product squads.",
      status: "active",
    },
    {
      id: "rb_frontend_engineer",
      employerId: userDatacoHR.id,
      title: "Frontend Engineer",
      roleFamilyId: roleFamilySoftware.id,
      location: "Kuala Lumpur",
      workMode: "hybrid",
      salaryMin: 5500,
      salaryMax: 9000,
      salaryCurrency: "MYR",
      salarySource: "employer_provided",
      description: "Build React and TypeScript interfaces, integrate APIs, maintain Git workflows, and improve user-facing product quality.",
      status: "active",
    },
    {
      id: "rb_backend_api_engineer",
      employerId: userDatacoHR.id,
      title: "Backend API Engineer",
      roleFamilyId: roleFamilySoftware.id,
      location: "Penang",
      workMode: "hybrid",
      salaryMin: 5800,
      salaryMax: 9800,
      salaryCurrency: "MYR",
      salarySource: "employer_provided",
      description: "Design backend APIs, database schemas, and service architecture for a product analytics platform.",
      status: "active",
    },
    {
      id: "rb_cloud_devops_associate",
      employerId: userDatacoHR.id,
      title: "Cloud DevOps Associate",
      roleFamilyId: roleFamilySoftware.id,
      location: "Singapore",
      workMode: "remote",
      salaryMin: 6000,
      salaryMax: 10000,
      salaryCurrency: "MYR",
      salarySource: "seeded_estimate",
      description: "Support cloud infrastructure, CI/CD, monitoring, and production reliability for regional data products.",
      status: "active",
    },
    {
      id: "rb_junior_security_analyst",
      employerId: userDatacoHR.id,
      title: "Junior Security Analyst",
      roleFamilyId: roleFamilySecurity.id,
      location: "Kuala Lumpur",
      workMode: "onsite",
      salaryMin: 5000,
      salaryMax: 8500,
      salaryCurrency: "MYR",
      salarySource: "employer_provided",
      description: "Monitor security events, document incidents, support identity verification reviews, and improve security operating procedures.",
      status: "active",
    },
    {
      id: "rb_crypto_infra_analyst",
      employerId: userDatacoHR.id,
      title: "Cryptographic Infrastructure Analyst",
      roleFamilyId: roleFamilySecurity.id,
      location: "Singapore",
      workMode: "hybrid",
      salaryMin: 7800,
      salaryMax: 12500,
      salaryCurrency: "MYR",
      salarySource: "seeded_estimate",
      description: "Evaluate cryptographic protocols, zero-knowledge proof systems, and secure infrastructure trade-offs for digital identity products.",
      status: "active",
    },
    {
      id: "rb_operations_analyst",
      employerId: userDatacoHR.id,
      title: "Operations Analyst",
      roleFamilyId: roleFamilyBizOps.id,
      location: "Johor Bahru",
      workMode: "onsite",
      salaryMin: 4200,
      salaryMax: 6800,
      salaryCurrency: "MYR",
      salarySource: "employer_provided",
      description: "Improve operating processes, analyze supply chain data, manage projects, and prepare business recommendations for regional teams.",
      status: "active",
    },
  ];

  for (const role of extraRoleBriefs) {
    await prisma.roleBrief.create({ data: role });
  }

  const roleRequirements = [
    { id: "rr_sql", roleBriefId: roleBriefJPA.id, skillId: "sql", importance: "required", minimumEvidenceStrength: 2, displayLabel: "SQL" },
    { id: "rr_data_viz", roleBriefId: roleBriefJPA.id, skillId: "data_visualization", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Data Visualization" },
    { id: "rr_product_analytics", roleBriefId: roleBriefJPA.id, skillId: "product_analytics", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Product Analytics" },
    { id: "rr_ab_testing", roleBriefId: roleBriefJPA.id, skillId: "ab_testing", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Experimentation (A/B Testing)" },
    { id: "rr_stakeholder", roleBriefId: roleBriefJPA.id, skillId: "stakeholder_communication", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Stakeholder Communication" },
    { id: "rr_data_analysis", roleBriefId: roleBriefJPA.id, skillId: "data_analysis", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "Data Analysis" },
    { id: "rr_python_data", roleBriefId: roleBriefJPA.id, skillId: "python_data", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "Python for Data" },
    { id: "rr_fintech_sql", roleBriefId: "rb_data_analyst_fintech", skillId: "sql", importance: "required", minimumEvidenceStrength: 2, displayLabel: "SQL" },
    { id: "rr_fintech_data_analysis", roleBriefId: "rb_data_analyst_fintech", skillId: "data_analysis", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Data Analysis" },
    { id: "rr_fintech_python", roleBriefId: "rb_data_analyst_fintech", skillId: "python_data", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Python for Data" },
    { id: "rr_fintech_stats", roleBriefId: "rb_data_analyst_fintech", skillId: "statistical_analysis", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Statistical Analysis" },
    { id: "rr_fintech_financial", roleBriefId: "rb_data_analyst_fintech", skillId: "financial_analysis", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "Financial Analysis" },
    { id: "rr_bi_sql", roleBriefId: "rb_bi_analyst", skillId: "sql", importance: "required", minimumEvidenceStrength: 2, displayLabel: "SQL" },
    { id: "rr_bi_viz", roleBriefId: "rb_bi_analyst", skillId: "data_visualization", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Data Visualization" },
    { id: "rr_bi_business", roleBriefId: "rb_bi_analyst", skillId: "business_analysis", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Business Analysis" },
    { id: "rr_bi_stakeholder", roleBriefId: "rb_bi_analyst", skillId: "stakeholder_communication", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Stakeholder Communication" },
    { id: "rr_bi_market", roleBriefId: "rb_bi_analyst", skillId: "market_research", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "Market Research" },
    { id: "rr_apm_strategy", roleBriefId: "rb_associate_product_manager", skillId: "product_strategy", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Product Strategy" },
    { id: "rr_apm_research", roleBriefId: "rb_associate_product_manager", skillId: "user_research", importance: "required", minimumEvidenceStrength: 2, displayLabel: "User Research" },
    { id: "rr_apm_roadmap", roleBriefId: "rb_associate_product_manager", skillId: "roadmap_planning", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Roadmap Planning" },
    { id: "rr_apm_agile", roleBriefId: "rb_associate_product_manager", skillId: "agile", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Agile Methodology" },
    { id: "rr_apm_stakeholder", roleBriefId: "rb_associate_product_manager", skillId: "stakeholder_communication", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Stakeholder Communication" },
    { id: "rr_ux_research", roleBriefId: "rb_ux_research_coordinator", skillId: "user_research", importance: "required", minimumEvidenceStrength: 2, displayLabel: "User Research" },
    { id: "rr_ux_presentation", roleBriefId: "rb_ux_research_coordinator", skillId: "presentation_skills", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Presentation Skills" },
    { id: "rr_ux_writing", roleBriefId: "rb_ux_research_coordinator", skillId: "technical_writing", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Research Documentation" },
    { id: "rr_ux_stakeholder", roleBriefId: "rb_ux_research_coordinator", skillId: "stakeholder_communication", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Stakeholder Communication" },
    { id: "rr_ux_wireframing", roleBriefId: "rb_ux_research_coordinator", skillId: "wireframing", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "Wireframing" },
    { id: "rr_fe_js", roleBriefId: "rb_frontend_engineer", skillId: "javascript", importance: "required", minimumEvidenceStrength: 2, displayLabel: "JavaScript" },
    { id: "rr_fe_ts", roleBriefId: "rb_frontend_engineer", skillId: "typescript", importance: "required", minimumEvidenceStrength: 2, displayLabel: "TypeScript" },
    { id: "rr_fe_react", roleBriefId: "rb_frontend_engineer", skillId: "react", importance: "required", minimumEvidenceStrength: 2, displayLabel: "React" },
    { id: "rr_fe_api", roleBriefId: "rb_frontend_engineer", skillId: "api_design", importance: "required", minimumEvidenceStrength: 1, displayLabel: "API Integration" },
    { id: "rr_fe_git", roleBriefId: "rb_frontend_engineer", skillId: "git", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Git" },
    { id: "rr_be_python", roleBriefId: "rb_backend_api_engineer", skillId: "python", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Python Programming" },
    { id: "rr_be_api", roleBriefId: "rb_backend_api_engineer", skillId: "api_design", importance: "required", minimumEvidenceStrength: 2, displayLabel: "API Design" },
    { id: "rr_be_db", roleBriefId: "rb_backend_api_engineer", skillId: "database_design", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Database Design" },
    { id: "rr_be_system", roleBriefId: "rb_backend_api_engineer", skillId: "system_design", importance: "required", minimumEvidenceStrength: 1, displayLabel: "System Design" },
    { id: "rr_be_git", roleBriefId: "rb_backend_api_engineer", skillId: "git", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Git" },
    { id: "rr_devops_cloud", roleBriefId: "rb_cloud_devops_associate", skillId: "cloud_infrastructure", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Cloud Infrastructure" },
    { id: "rr_devops_devops", roleBriefId: "rb_cloud_devops_associate", skillId: "devops", importance: "required", minimumEvidenceStrength: 2, displayLabel: "DevOps" },
    { id: "rr_devops_monitoring", roleBriefId: "rb_cloud_devops_associate", skillId: "monitoring", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Monitoring" },
    { id: "rr_devops_git", roleBriefId: "rb_cloud_devops_associate", skillId: "git", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Git" },
    { id: "rr_devops_system", roleBriefId: "rb_cloud_devops_associate", skillId: "system_design", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "System Design" },
    { id: "rr_sec_infosec", roleBriefId: "rb_junior_security_analyst", skillId: "information_security", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Information Security" },
    { id: "rr_sec_identity", roleBriefId: "rb_junior_security_analyst", skillId: "identity_verification", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Identity Verification" },
    { id: "rr_sec_monitoring", roleBriefId: "rb_junior_security_analyst", skillId: "monitoring", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Security Monitoring" },
    { id: "rr_sec_writing", roleBriefId: "rb_junior_security_analyst", skillId: "technical_writing", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Incident Documentation" },
    { id: "rr_crypto_crypto", roleBriefId: "rb_crypto_infra_analyst", skillId: "cryptography", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Cryptography" },
    { id: "rr_crypto_infra", roleBriefId: "rb_crypto_infra_analyst", skillId: "cryptographic_infrastructure", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Cryptographic Infrastructure" },
    { id: "rr_crypto_zk", roleBriefId: "rb_crypto_infra_analyst", skillId: "zk_proofs", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Zero-Knowledge Proofs" },
    { id: "rr_crypto_writing", roleBriefId: "rb_crypto_infra_analyst", skillId: "technical_writing", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Technical Writing" },
    { id: "rr_ops_process", roleBriefId: "rb_operations_analyst", skillId: "process_optimization", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Process Optimization" },
    { id: "rr_ops_business", roleBriefId: "rb_operations_analyst", skillId: "business_analysis", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Business Analysis" },
    { id: "rr_ops_project", roleBriefId: "rb_operations_analyst", skillId: "project_management", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Project Management" },
    { id: "rr_ops_data", roleBriefId: "rb_operations_analyst", skillId: "data_analysis", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Data Analysis" },
    { id: "rr_ops_supply", roleBriefId: "rb_operations_analyst", skillId: "supply_chain", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "Supply Chain" },
  ];

  for (const rr of roleRequirements) {
    await prisma.roleRequirement.create({ data: rr });
  }

  console.log(`   ✅ Created ${roleRequirements.length} role requirements.\n`);

  // ━━━ 9. Artifacts ━━━
  console.log("📦 Creating demo artifacts...");

  const artifactCert = await prisma.artifact.create({
    data: {
      id: "artifact_google_cert",
      candidateId: profileAisha.id,
      title: "Google Data Analytics Professional Certificate",
      type: "certificate",
      sourceUrl: null,
      storagePath: "demo/artifacts/google_data_analytics_cert.pdf",
      extractedText: "Google Data Analytics Professional Certificate — Completed all 8 courses covering data analysis, SQL, R, Tableau, and spreadsheets.",
      extractionSource: "manifest",
      demoManifestId: "cert_google_analytics",
      shareable: true,
    },
  });

  const artifactDashboard = await prisma.artifact.create({
    data: {
      id: "artifact_retail_dashboard",
      candidateId: profileAisha.id,
      title: "Retail Analytics Dashboard Project",
      type: "project",
      sourceUrl: null,
      storagePath: "demo/artifacts/retail_dashboard_project.pdf",
      extractedText: "Retail Analytics Dashboard — An interactive dashboard built for a mock retail company tracking sales, inventory, and customer segmentation using SQL, Python, and Tableau.",
      extractionSource: "manifest",
      demoManifestId: "project_retail_dashboard",
      shareable: true,
    },
  });

  const artifactABTest = await prisma.artifact.create({
    data: {
      id: "artifact_ab_testing",
      candidateId: profileAisha.id,
      title: "A/B Testing Project — Checkout Flow Optimization",
      type: "project",
      sourceUrl: null,
      storagePath: "demo/artifacts/ab_testing_project.pdf",
      extractedText: "A/B Testing Project — Designed and executed an A/B test for an e-commerce checkout flow, measuring conversion rate impact with statistical significance testing.",
      extractionSource: "manifest",
      demoManifestId: "project_ab_testing",
      shareable: true,
    },
  });

  console.log(`   ✅ Created 9 demo artifacts.\n`);

  // ━━━ 10. Extraction Jobs ━━━
  console.log("⚙️  Creating extraction jobs...");

  const artifactFaridFrontend = await prisma.artifact.create({
    data: {
      id: "artifact_farid_frontend_portfolio",
      candidateId: profileFarid.id,
      title: "React TypeScript Portfolio Repository",
      type: "repo_link",
      sourceUrl: "https://github.com/demo/farid-react-portfolio",
      storagePath: null,
      extractedText: "React TypeScript Portfolio Repository - Built reusable dashboard components, integrated REST APIs, managed Git workflow, and shipped responsive UI states.",
      extractionSource: "manifest",
      demoManifestId: "repo_farid_frontend",
      shareable: true,
    },
  });

  const artifactFaridApi = await prisma.artifact.create({
    data: {
      id: "artifact_farid_api_infra",
      candidateId: profileFarid.id,
      title: "Inventory API and Cloud Deployment Project",
      type: "project",
      sourceUrl: null,
      storagePath: "demo/artifacts/farid_api_infra_project.pdf",
      extractedText: "Inventory API and Cloud Deployment Project - Designed REST endpoints, database schema, deployment pipeline, monitoring checks, and cloud infrastructure notes.",
      extractionSource: "manifest",
      demoManifestId: "project_farid_api_infra",
      shareable: true,
    },
  });

  const artifactMeiResearch = await prisma.artifact.create({
    data: {
      id: "artifact_mei_user_research",
      candidateId: profileMeiLin.id,
      title: "Student Wallet User Research Case Study",
      type: "case_study",
      sourceUrl: null,
      storagePath: "demo/artifacts/mei_user_research_case_study.pdf",
      extractedText: "Student Wallet User Research Case Study - Conducted interviews, synthesized insights, mapped product opportunities, and presented recommendations to stakeholders.",
      extractionSource: "manifest",
      demoManifestId: "case_mei_user_research",
      shareable: true,
    },
  });

  const artifactMeiOps = await prisma.artifact.create({
    data: {
      id: "artifact_mei_ops_research",
      candidateId: profileMeiLin.id,
      title: "Campus Marketplace Operations Analysis",
      type: "project",
      sourceUrl: null,
      storagePath: "demo/artifacts/mei_ops_market_research.pdf",
      extractedText: "Campus Marketplace Operations Analysis - Analyzed process bottlenecks, market demand, project milestones, and financial trade-offs for campus vendors.",
      extractionSource: "manifest",
      demoManifestId: "project_mei_ops_research",
      shareable: true,
    },
  });

  const artifactArjunSecurity = await prisma.artifact.create({
    data: {
      id: "artifact_arjun_security_lab",
      candidateId: profileArjun.id,
      title: "Identity Verification Security Lab",
      type: "project",
      sourceUrl: null,
      storagePath: "demo/artifacts/arjun_security_lab.pdf",
      extractedText: "Identity Verification Security Lab - Reviewed identity verification flows, documented threat scenarios, configured monitoring checks, and wrote incident notes.",
      extractionSource: "manifest",
      demoManifestId: "project_arjun_security_lab",
      shareable: true,
    },
  });

  const artifactArjunZk = await prisma.artifact.create({
    data: {
      id: "artifact_arjun_zk_research",
      candidateId: profileArjun.id,
      title: "Zero-Knowledge Proofs Research Note",
      type: "case_study",
      sourceUrl: null,
      storagePath: "demo/artifacts/arjun_zk_research.pdf",
      extractedText: "Zero-Knowledge Proofs Research Note - Compared zk-SNARK trade-offs, cryptographic infrastructure risks, and privacy-preserving identity architecture.",
      extractionSource: "manifest",
      demoManifestId: "case_arjun_zk_research",
      shareable: true,
    },
  });

  const extractionJobs = [
    {
      id: "ej_google_cert",
      artifactId: artifactCert.id,
      candidateId: profileAisha.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 3,
      startedAt: new Date("2025-11-15T09:00:00Z"),
      completedAt: new Date("2025-11-15T09:00:05Z"),
    },
    {
      id: "ej_retail_dashboard",
      artifactId: artifactDashboard.id,
      candidateId: profileAisha.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 4,
      startedAt: new Date("2025-11-16T10:00:00Z"),
      completedAt: new Date("2025-11-16T10:00:05Z"),
    },
    {
      id: "ej_ab_testing",
      artifactId: artifactABTest.id,
      candidateId: profileAisha.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 3,
      startedAt: new Date("2025-12-20T14:00:00Z"),
      completedAt: new Date("2025-12-20T14:00:05Z"),
    },
    {
      id: "ej_farid_frontend",
      artifactId: artifactFaridFrontend.id,
      candidateId: profileFarid.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 3,
      startedAt: new Date("2025-12-03T09:00:00Z"),
      completedAt: new Date("2025-12-03T09:00:05Z"),
    },
    {
      id: "ej_farid_api",
      artifactId: artifactFaridApi.id,
      candidateId: profileFarid.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 4,
      startedAt: new Date("2025-12-04T10:00:00Z"),
      completedAt: new Date("2025-12-04T10:00:05Z"),
    },
    {
      id: "ej_mei_research",
      artifactId: artifactMeiResearch.id,
      candidateId: profileMeiLin.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 3,
      startedAt: new Date("2025-12-05T09:00:00Z"),
      completedAt: new Date("2025-12-05T09:00:05Z"),
    },
    {
      id: "ej_mei_ops",
      artifactId: artifactMeiOps.id,
      candidateId: profileMeiLin.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 4,
      startedAt: new Date("2025-12-06T10:00:00Z"),
      completedAt: new Date("2025-12-06T10:00:05Z"),
    },
    {
      id: "ej_arjun_security",
      artifactId: artifactArjunSecurity.id,
      candidateId: profileArjun.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 3,
      startedAt: new Date("2025-12-07T09:00:00Z"),
      completedAt: new Date("2025-12-07T09:00:05Z"),
    },
    {
      id: "ej_arjun_zk",
      artifactId: artifactArjunZk.id,
      candidateId: profileArjun.id,
      status: "completed",
      extractionSource: "manifest",
      progressLabel: "Completed",
      createdClaimCount: 3,
      startedAt: new Date("2025-12-08T10:00:00Z"),
      completedAt: new Date("2025-12-08T10:00:05Z"),
    },
  ];

  for (const ej of extractionJobs) {
    await prisma.extractionJob.create({ data: ej });
  }

  console.log(`   ✅ Created ${extractionJobs.length} extraction jobs.\n`);

  // ━━━ 11. Evidence Claims ━━━
  console.log("🧾 Creating evidence claims...");

  const evidenceClaims = [
    // ── From Google Certificate ──
    {
      id: "ec_cert_01",
      candidateId: profileAisha.id,
      artifactId: artifactCert.id,
      claimText: "Completed Google Data Analytics Professional Certificate",
      normalizedSkillIds: JSON.stringify(["data_analysis"]),
      suggestedSkillNames: JSON.stringify(["Data Analysis"]),
      roleFamilyTags: JSON.stringify(["rf_data_analysis", "rf_product_analytics"]),
      provenanceStatus: "document_backed",
      evidenceQualityScore: 3,
      sourceSpan: "Google Data Analytics Professional Certificate — Completed all 8 courses",
      confidence: 0.85,
      candidateStatus: "accepted",
      visibility: "shareable_summary",
    },
    {
      id: "ec_cert_02",
      candidateId: profileAisha.id,
      artifactId: artifactCert.id,
      claimText: "Applied SQL for data extraction and analysis across multiple datasets",
      normalizedSkillIds: JSON.stringify(["sql", "data_analysis"]),
      suggestedSkillNames: JSON.stringify(["SQL", "Data Analysis"]),
      roleFamilyTags: JSON.stringify(["rf_data_analysis", "rf_product_analytics"]),
      provenanceStatus: "document_backed",
      evidenceQualityScore: 3,
      sourceSpan: "Applied SQL for data extraction and analysis across multiple datasets",
      confidence: 0.80,
      candidateStatus: "accepted",
      visibility: "shareable_summary",
    },
    {
      id: "ec_cert_03",
      candidateId: profileAisha.id,
      artifactId: artifactCert.id,
      claimText: "Created data visualizations using spreadsheets and Tableau",
      normalizedSkillIds: JSON.stringify(["data_visualization"]),
      suggestedSkillNames: JSON.stringify(["Data Visualization"]),
      roleFamilyTags: JSON.stringify(["rf_data_analysis"]),
      provenanceStatus: "document_backed",
      evidenceQualityScore: 2,
      sourceSpan: "Created data visualizations using spreadsheets and Tableau",
      confidence: 0.75,
      candidateStatus: "accepted",
      visibility: "shareable_summary",
    },

    // ── From Retail Dashboard Project ──
    {
      id: "ec_dash_01",
      candidateId: profileAisha.id,
      artifactId: artifactDashboard.id,
      claimText: "Built an interactive retail analytics dashboard tracking sales, inventory, and customer segments",
      normalizedSkillIds: JSON.stringify(["data_visualization", "data_analysis", "sql"]),
      suggestedSkillNames: JSON.stringify(["Data Visualization", "Data Analysis", "SQL"]),
      roleFamilyTags: JSON.stringify(["rf_data_analysis", "rf_product_analytics"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Built an interactive retail analytics dashboard tracking sales, inventory, and customer segments",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_dash_02",
      candidateId: profileAisha.id,
      artifactId: artifactDashboard.id,
      claimText: "Wrote SQL queries to analyze customer purchase patterns and segment high-value customers",
      normalizedSkillIds: JSON.stringify(["sql", "data_analysis"]),
      suggestedSkillNames: JSON.stringify(["SQL", "Data Analysis"]),
      roleFamilyTags: JSON.stringify(["rf_data_analysis"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Wrote SQL queries to analyze customer purchase patterns and segment high-value customers",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_dash_03",
      candidateId: profileAisha.id,
      artifactId: artifactDashboard.id,
      claimText: "Presented dashboard findings and recommendations to retail stakeholders",
      normalizedSkillIds: JSON.stringify(["stakeholder_communication", "presentation_skills"]),
      suggestedSkillNames: JSON.stringify(["Stakeholder Communication", "Presentation Skills"]),
      roleFamilyTags: JSON.stringify(["rf_product_analytics"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "Presented dashboard findings and recommendations to retail stakeholders",
      confidence: 0.80,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_dash_04",
      candidateId: profileAisha.id,
      artifactId: artifactDashboard.id,
      claimText: "Used Python pandas to clean and transform raw sales data",
      normalizedSkillIds: JSON.stringify(["python_data", "data_analysis"]),
      suggestedSkillNames: JSON.stringify(["Python for Data", "Data Analysis"]),
      roleFamilyTags: JSON.stringify(["rf_data_analysis"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "Used Python pandas to clean and transform raw sales data",
      confidence: 0.80,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },

    // ── From A/B Testing Project (gap closer) ──
    {
      id: "ec_ab_01",
      candidateId: profileAisha.id,
      artifactId: artifactABTest.id,
      claimText: "Designed and executed an A/B test for a retail checkout flow, measuring conversion rate impact",
      normalizedSkillIds: JSON.stringify(["ab_testing", "product_analytics"]),
      suggestedSkillNames: JSON.stringify(["A/B Testing", "Product Analytics"]),
      roleFamilyTags: JSON.stringify(["rf_product_analytics"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Designed and executed an A/B test for a retail checkout flow, measuring conversion rate impact",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_ab_02",
      candidateId: profileAisha.id,
      artifactId: artifactABTest.id,
      claimText: "Applied statistical significance testing to validate experiment results",
      normalizedSkillIds: JSON.stringify(["ab_testing", "statistical_analysis"]),
      suggestedSkillNames: JSON.stringify(["A/B Testing", "Statistical Analysis"]),
      roleFamilyTags: JSON.stringify(["rf_product_analytics"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Applied statistical significance testing to validate experiment results",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_ab_03",
      candidateId: profileAisha.id,
      artifactId: artifactABTest.id,
      claimText: "Documented experiment methodology, sample size calculations, and business recommendations",
      normalizedSkillIds: JSON.stringify(["technical_writing", "ab_testing"]),
      suggestedSkillNames: JSON.stringify(["Technical Writing", "A/B Testing"]),
      roleFamilyTags: JSON.stringify(["rf_product_analytics"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "Documented experiment methodology, sample size calculations, and business recommendations",
      confidence: 0.80,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_farid_fe_01",
      candidateId: profileFarid.id,
      artifactId: artifactFaridFrontend.id,
      claimText: "Built reusable React dashboard components with responsive states",
      normalizedSkillIds: JSON.stringify(["react", "javascript", "typescript"]),
      suggestedSkillNames: JSON.stringify(["React", "JavaScript", "TypeScript"]),
      roleFamilyTags: JSON.stringify(["rf_software_engineering"]),
      provenanceStatus: "repo_backed",
      evidenceQualityScore: 5,
      sourceSpan: "Built reusable dashboard components, integrated REST APIs, managed Git workflow",
      confidence: 0.92,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_farid_fe_02",
      candidateId: profileFarid.id,
      artifactId: artifactFaridFrontend.id,
      claimText: "Integrated REST APIs into a TypeScript frontend application",
      normalizedSkillIds: JSON.stringify(["api_design", "typescript", "react"]),
      suggestedSkillNames: JSON.stringify(["API Design", "TypeScript", "React"]),
      roleFamilyTags: JSON.stringify(["rf_software_engineering"]),
      provenanceStatus: "repo_backed",
      evidenceQualityScore: 4,
      sourceSpan: "integrated REST APIs",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_farid_fe_03",
      candidateId: profileFarid.id,
      artifactId: artifactFaridFrontend.id,
      claimText: "Managed Git workflow and pull request reviews for a portfolio repository",
      normalizedSkillIds: JSON.stringify(["git", "technical_writing"]),
      suggestedSkillNames: JSON.stringify(["Git", "Technical Writing"]),
      roleFamilyTags: JSON.stringify(["rf_software_engineering"]),
      provenanceStatus: "repo_backed",
      evidenceQualityScore: 4,
      sourceSpan: "managed Git workflow",
      confidence: 0.88,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_farid_api_01",
      candidateId: profileFarid.id,
      artifactId: artifactFaridApi.id,
      claimText: "Designed REST endpoints and database schema for an inventory API",
      normalizedSkillIds: JSON.stringify(["api_design", "database_design", "system_design"]),
      suggestedSkillNames: JSON.stringify(["API Design", "Database Design", "System Design"]),
      roleFamilyTags: JSON.stringify(["rf_software_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Designed REST endpoints, database schema",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_farid_api_02",
      candidateId: profileFarid.id,
      artifactId: artifactFaridApi.id,
      claimText: "Documented deployment pipeline and cloud infrastructure notes",
      normalizedSkillIds: JSON.stringify(["cloud_infrastructure", "devops", "technical_writing"]),
      suggestedSkillNames: JSON.stringify(["Cloud Infrastructure", "DevOps", "Technical Writing"]),
      roleFamilyTags: JSON.stringify(["rf_software_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "deployment pipeline, monitoring checks, and cloud infrastructure notes",
      confidence: 0.82,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_farid_api_03",
      candidateId: profileFarid.id,
      artifactId: artifactFaridApi.id,
      claimText: "Configured monitoring checks for API reliability",
      normalizedSkillIds: JSON.stringify(["monitoring", "devops"]),
      suggestedSkillNames: JSON.stringify(["Monitoring", "DevOps"]),
      roleFamilyTags: JSON.stringify(["rf_software_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "monitoring checks",
      confidence: 0.80,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_mei_research_01",
      candidateId: profileMeiLin.id,
      artifactId: artifactMeiResearch.id,
      claimText: "Conducted user interviews and synthesized product insights for a student wallet",
      normalizedSkillIds: JSON.stringify(["user_research", "product_strategy"]),
      suggestedSkillNames: JSON.stringify(["User Research", "Product Strategy"]),
      roleFamilyTags: JSON.stringify(["rf_product_management"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Conducted interviews, synthesized insights, mapped product opportunities",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_mei_research_02",
      candidateId: profileMeiLin.id,
      artifactId: artifactMeiResearch.id,
      claimText: "Presented product recommendations to stakeholders after research synthesis",
      normalizedSkillIds: JSON.stringify(["stakeholder_communication", "presentation_skills"]),
      suggestedSkillNames: JSON.stringify(["Stakeholder Communication", "Presentation Skills"]),
      roleFamilyTags: JSON.stringify(["rf_product_management"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "presented recommendations to stakeholders",
      confidence: 0.88,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_mei_research_03",
      candidateId: profileMeiLin.id,
      artifactId: artifactMeiResearch.id,
      claimText: "Documented research findings and product opportunity mapping",
      normalizedSkillIds: JSON.stringify(["technical_writing", "user_research"]),
      suggestedSkillNames: JSON.stringify(["Technical Writing", "User Research"]),
      roleFamilyTags: JSON.stringify(["rf_product_management"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "mapped product opportunities",
      confidence: 0.83,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_mei_ops_01",
      candidateId: profileMeiLin.id,
      artifactId: artifactMeiOps.id,
      claimText: "Analyzed process bottlenecks and proposed operations improvements",
      normalizedSkillIds: JSON.stringify(["process_optimization", "business_analysis"]),
      suggestedSkillNames: JSON.stringify(["Process Optimization", "Business Analysis"]),
      roleFamilyTags: JSON.stringify(["rf_business_operations"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Analyzed process bottlenecks",
      confidence: 0.88,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_mei_ops_02",
      candidateId: profileMeiLin.id,
      artifactId: artifactMeiOps.id,
      claimText: "Prepared market demand and financial trade-off analysis for campus vendors",
      normalizedSkillIds: JSON.stringify(["market_research", "financial_analysis", "business_analysis"]),
      suggestedSkillNames: JSON.stringify(["Market Research", "Financial Analysis", "Business Analysis"]),
      roleFamilyTags: JSON.stringify(["rf_business_operations"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "market demand, project milestones, and financial trade-offs",
      confidence: 0.82,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_mei_ops_03",
      candidateId: profileMeiLin.id,
      artifactId: artifactMeiOps.id,
      claimText: "Managed project milestones for a campus marketplace operations plan",
      normalizedSkillIds: JSON.stringify(["project_management", "business_analysis"]),
      suggestedSkillNames: JSON.stringify(["Project Management", "Business Analysis"]),
      roleFamilyTags: JSON.stringify(["rf_business_operations"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "project milestones",
      confidence: 0.80,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_arjun_sec_01",
      candidateId: profileArjun.id,
      artifactId: artifactArjunSecurity.id,
      claimText: "Reviewed identity verification flows and documented threat scenarios",
      normalizedSkillIds: JSON.stringify(["identity_verification", "information_security"]),
      suggestedSkillNames: JSON.stringify(["Identity Verification", "Information Security"]),
      roleFamilyTags: JSON.stringify(["rf_security_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Reviewed identity verification flows, documented threat scenarios",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_arjun_sec_02",
      candidateId: profileArjun.id,
      artifactId: artifactArjunSecurity.id,
      claimText: "Configured monitoring checks for security event review",
      normalizedSkillIds: JSON.stringify(["monitoring", "information_security"]),
      suggestedSkillNames: JSON.stringify(["Monitoring", "Information Security"]),
      roleFamilyTags: JSON.stringify(["rf_security_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "configured monitoring checks",
      confidence: 0.82,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_arjun_sec_03",
      candidateId: profileArjun.id,
      artifactId: artifactArjunSecurity.id,
      claimText: "Wrote incident notes for identity verification security scenarios",
      normalizedSkillIds: JSON.stringify(["technical_writing", "information_security"]),
      suggestedSkillNames: JSON.stringify(["Technical Writing", "Information Security"]),
      roleFamilyTags: JSON.stringify(["rf_security_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "wrote incident notes",
      confidence: 0.80,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_arjun_zk_01",
      candidateId: profileArjun.id,
      artifactId: artifactArjunZk.id,
      claimText: "Compared zk-SNARK trade-offs for privacy-preserving identity architecture",
      normalizedSkillIds: JSON.stringify(["zk_proofs", "cryptography"]),
      suggestedSkillNames: JSON.stringify(["Zero-Knowledge Proofs", "Cryptography"]),
      roleFamilyTags: JSON.stringify(["rf_security_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "Compared zk-SNARK trade-offs",
      confidence: 0.90,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_arjun_zk_02",
      candidateId: profileArjun.id,
      artifactId: artifactArjunZk.id,
      claimText: "Analyzed cryptographic infrastructure risks for digital identity systems",
      normalizedSkillIds: JSON.stringify(["cryptographic_infrastructure", "cryptography"]),
      suggestedSkillNames: JSON.stringify(["Cryptographic Infrastructure", "Cryptography"]),
      roleFamilyTags: JSON.stringify(["rf_security_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 4,
      sourceSpan: "cryptographic infrastructure risks",
      confidence: 0.88,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
    {
      id: "ec_arjun_zk_03",
      candidateId: profileArjun.id,
      artifactId: artifactArjunZk.id,
      claimText: "Documented privacy-preserving identity architecture recommendations",
      normalizedSkillIds: JSON.stringify(["technical_writing", "identity_verification"]),
      suggestedSkillNames: JSON.stringify(["Technical Writing", "Identity Verification"]),
      roleFamilyTags: JSON.stringify(["rf_security_engineering"]),
      provenanceStatus: "artifact_backed",
      evidenceQualityScore: 3,
      sourceSpan: "privacy-preserving identity architecture",
      confidence: 0.82,
      candidateStatus: "accepted",
      visibility: "shareable_artifact",
    },
  ];

  for (const ec of evidenceClaims) {
    await prisma.evidenceClaim.create({ data: ec });
  }

  console.log(`   ✅ Created ${evidenceClaims.length} evidence claims.\n`);

  // ━━━ 12. Opportunity Interaction ━━━
  console.log("🤝 Creating opportunity interactions...");

  await prisma.opportunityInteraction.create({
    data: {
      id: "oi_aisha_jpa",
      roleBriefId: roleBriefJPA.id,
      candidateId: profileAisha.id,
      candidateStatus: "interested",
      employerStatus: "not_reviewed",
      lastReadinessScore: 0.62,
      lastGapCount: 1,
    },
  });

  const extraInteractions = [
    { id: "oi_farid_frontend", roleBriefId: "rb_frontend_engineer", candidateId: profileFarid.id, candidateStatus: "interested", employerStatus: "not_reviewed", lastReadinessScore: 0.88, lastGapCount: 0 },
    { id: "oi_farid_backend", roleBriefId: "rb_backend_api_engineer", candidateId: profileFarid.id, candidateStatus: "interested", employerStatus: "not_reviewed", lastReadinessScore: 0.72, lastGapCount: 1 },
    { id: "oi_farid_devops", roleBriefId: "rb_cloud_devops_associate", candidateId: profileFarid.id, candidateStatus: "viewed", employerStatus: "not_reviewed", lastReadinessScore: 0.64, lastGapCount: 2 },
    { id: "oi_mei_apm", roleBriefId: "rb_associate_product_manager", candidateId: profileMeiLin.id, candidateStatus: "interested", employerStatus: "not_reviewed", lastReadinessScore: 0.76, lastGapCount: 1 },
    { id: "oi_mei_ux", roleBriefId: "rb_ux_research_coordinator", candidateId: profileMeiLin.id, candidateStatus: "interested", employerStatus: "not_reviewed", lastReadinessScore: 0.84, lastGapCount: 0 },
    { id: "oi_mei_ops", roleBriefId: "rb_operations_analyst", candidateId: profileMeiLin.id, candidateStatus: "interested", employerStatus: "not_reviewed", lastReadinessScore: 0.78, lastGapCount: 1 },
    { id: "oi_mei_bi", roleBriefId: "rb_bi_analyst", candidateId: profileMeiLin.id, candidateStatus: "viewed", employerStatus: "not_reviewed", lastReadinessScore: 0.52, lastGapCount: 2 },
    { id: "oi_arjun_security", roleBriefId: "rb_junior_security_analyst", candidateId: profileArjun.id, candidateStatus: "interested", employerStatus: "not_reviewed", lastReadinessScore: 0.86, lastGapCount: 0 },
    { id: "oi_arjun_crypto", roleBriefId: "rb_crypto_infra_analyst", candidateId: profileArjun.id, candidateStatus: "interested", employerStatus: "not_reviewed", lastReadinessScore: 0.91, lastGapCount: 0 },
    { id: "oi_arjun_devops", roleBriefId: "rb_cloud_devops_associate", candidateId: profileArjun.id, candidateStatus: "viewed", employerStatus: "not_reviewed", lastReadinessScore: 0.38, lastGapCount: 3 },
  ];

  for (const interaction of extraInteractions) {
    await prisma.opportunityInteraction.create({ data: interaction });
  }

  console.log(`   ✅ Created ${1 + extraInteractions.length} opportunity interactions.\n`);

  // ━━━ 13. Match Score ━━━
  console.log("📊 Creating match scores...");

  await prisma.matchScore.create({
    data: {
      id: "ms_aisha_jpa",
      roleBriefId: roleBriefJPA.id,
      candidateId: profileAisha.id,
      totalScore: 0.62,
      roleEvidenceCoverage: 0.71,
      trajectoryFit: 0.65,
      adjacentExperience: 0.50,
      logisticsFit: 0.95,
      growthSignal: 0.70,
      preferenceAlignment: 0.80,
      evidenceQuality: 0.55,
      matrixJson: JSON.stringify({
        version: 1,
        roleId: roleBriefJPA.id,
        candidateId: profileAisha.id,
        totalScore: 0.62,
        breakdown: {
          roleEvidenceCoverage: 0.71,
          trajectoryFit: 0.65,
          adjacentExperience: 0.5,
          logisticsFit: 0.95,
          growthSignal: 0.7,
          preferenceAlignment: 0.8,
          evidenceQuality: 0.55,
        },
        evidenceMatrix: [
          {
            skillId: "sql",
            skillName: "SQL",
            displayLabel: "SQL",
            importance: "required",
            status: "met",
            evidenceStrength: 4,
            minimumRequired: 2,
            matchingClaims: [
              {
                id: "ec_dash_02",
                artifactId: artifactDashboard.id,
                claimText: "Wrote SQL queries to analyze customer purchase patterns and segment high-value customers",
                provenanceStatus: "artifact_backed",
                evidenceQualityScore: 4,
                confidence: 0.9,
                artifactTitle: artifactDashboard.title,
                sourceUrl: artifactDashboard.sourceUrl,
                sourceSpan: "Wrote SQL queries to analyze customer purchase patterns and segment high-value customers",
              },
            ],
          },
          {
            skillId: "data_visualization",
            skillName: "Data Visualization",
            displayLabel: "Data Visualization",
            importance: "required",
            status: "met",
            evidenceStrength: 4,
            minimumRequired: 2,
            matchingClaims: [
              {
                id: "ec_dash_01",
                artifactId: artifactDashboard.id,
                claimText: "Built an interactive retail analytics dashboard tracking sales, inventory, and customer segments",
                provenanceStatus: "artifact_backed",
                evidenceQualityScore: 4,
                confidence: 0.9,
                artifactTitle: artifactDashboard.title,
                sourceUrl: artifactDashboard.sourceUrl,
                sourceSpan: "Built an interactive retail analytics dashboard tracking sales, inventory, and customer segments",
              },
            ],
          },
          {
            skillId: "product_analytics",
            skillName: "Product Analytics",
            displayLabel: "Product Analytics",
            importance: "required",
            status: "gap",
            evidenceStrength: 0,
            minimumRequired: 2,
            matchingClaims: [],
          },
          {
            skillId: "ab_testing",
            skillName: "A/B Testing",
            displayLabel: "Experimentation (A/B Testing)",
            importance: "required",
            status: "gap",
            evidenceStrength: 0,
            minimumRequired: 2,
            matchingClaims: [],
          },
          {
            skillId: "stakeholder_communication",
            skillName: "Stakeholder Communication",
            displayLabel: "Stakeholder Communication",
            importance: "required",
            status: "met",
            evidenceStrength: 3,
            minimumRequired: 1,
            matchingClaims: [
              {
                id: "ec_dash_03",
                artifactId: artifactDashboard.id,
                claimText: "Presented dashboard findings and recommendations to retail stakeholders",
                provenanceStatus: "artifact_backed",
                evidenceQualityScore: 3,
                confidence: 0.8,
                artifactTitle: artifactDashboard.title,
                sourceUrl: artifactDashboard.sourceUrl,
                sourceSpan: "Presented dashboard findings and recommendations to retail stakeholders",
              },
            ],
          },
          {
            skillId: "data_analysis",
            skillName: "Data Analysis",
            displayLabel: "Data Analysis",
            importance: "nice_to_have",
            status: "met",
            evidenceStrength: 4,
            minimumRequired: 1,
            matchingClaims: [
              {
                id: "ec_dash_01",
                artifactId: artifactDashboard.id,
                claimText: "Built an interactive retail analytics dashboard tracking sales, inventory, and customer segments",
                provenanceStatus: "artifact_backed",
                evidenceQualityScore: 4,
                confidence: 0.9,
                artifactTitle: artifactDashboard.title,
                sourceUrl: artifactDashboard.sourceUrl,
                sourceSpan: "Built an interactive retail analytics dashboard tracking sales, inventory, and customer segments",
              },
            ],
          },
          {
            skillId: "python_data",
            skillName: "Python for Data",
            displayLabel: "Python for Data",
            importance: "nice_to_have",
            status: "met",
            evidenceStrength: 3,
            minimumRequired: 1,
            matchingClaims: [
              {
                id: "ec_dash_04",
                artifactId: artifactDashboard.id,
                claimText: "Used Python pandas to clean and transform raw sales data",
                provenanceStatus: "artifact_backed",
                evidenceQualityScore: 3,
                confidence: 0.8,
                artifactTitle: artifactDashboard.title,
                sourceUrl: artifactDashboard.sourceUrl,
                sourceSpan: "Used Python pandas to clean and transform raw sales data",
              },
            ],
          },
        ],
        coverageSummary: {
          metCount: 5,
          partialCount: 0,
          gapCount: 2,
          totalRequired: 5,
          totalNiceToHave: 2,
        },
        audit: {
          removedDuplicateClaims: 0,
          generatedAt: "2025-12-01T09:30:00.000Z",
        },
        memoSource: "matrix_fallback",
      }),
      aiMemo: "Aisha shows strong fundamentals in data analysis, SQL, and visualization. Key gap: no evidence of A/B testing or product analytics experience. Her Google certificate and retail dashboard project demonstrate solid analytical skills. Recommend she close the experimentation gap with a relevant project to significantly boost her match score.",
    },
  });

  console.log(`   ✅ Created match score.\n`);

  // ━━━ 14. Candidate Retention Consent ━━━
  console.log("🔐 Creating retention consents...");

  await prisma.candidateRetentionConsent.create({
    data: {
      id: "crc_aisha_dataco",
      candidateId: profileAisha.id,
      employerId: userDatacoHR.id,
      roleFamilyId: roleFamilyPA.id,
      consentStatus: "active",
      scope: "role_only",
      expiresAt: new Date("2026-12-31T23:59:59Z"),
    },
  });

  console.log(`   ✅ Created retention consent.\n`);

  // ━━━ 15. Rejected Candidate Context ━━━
  console.log("❌ Creating rejected candidate context...");

  await prisma.rejectedCandidateContext.create({
    data: {
      id: "rcc_aisha_jpa",
      candidateId: profileAisha.id,
      roleBriefId: roleBriefJPA.id,
      rejectionReason: "Insufficient evidence of A/B testing / experimentation skills. Strong in data analysis fundamentals but missing key product analytics competencies.",
      missingSkills: JSON.stringify(["ab_testing", "product_analytics"]),
      scoreAtRejection: 0.62,
      baselineScore: 62,
      baselineMissingSkillIds: JSON.stringify(["ab_testing", "product_analytics"]),
      baselineMatrixJson: JSON.stringify({
        capturedAt: "2025-12-01T09:30:00.000Z",
        rows: [
          { skillId: "sql", status: "met", evidenceCount: 2 },
          { skillId: "data_visualization", status: "met", evidenceCount: 2 },
          { skillId: "product_analytics", status: "partial", evidenceCount: 0 },
          { skillId: "ab_testing", status: "gap", evidenceCount: 0 },
        ],
      }),
    },
  });

  console.log(`   ✅ Created rejected candidate context.\n`);

  // ━━━ 16. Re-Engagement Event ━━━
  console.log("🔄 Creating re-engagement events...");

  await prisma.reEngagementEvent.create({
    data: {
      id: "ree_aisha_jpa",
      candidateId: profileAisha.id,
      roleBriefId: roleBriefJPA.id,
      previousScore: 0.62,
      currentScore: 0.85,
      deltaExplanation: "Aisha uploaded a new A/B testing project artifact that closes the experimentation gap. Her evidence now covers ab_testing (quality 4) and product_analytics (quality 4). Total match score increased from 0.62 to 0.85.",
      deltaSummaryJson: JSON.stringify({
        baselineScore: 62,
        liveScore: 85,
        scoreDelta: 23,
        closedSkillIds: ["ab_testing", "product_analytics"],
        stillMissingSkillIds: [],
        newEvidenceClaimIds: ["ec_ab_01", "ec_ab_02", "ec_ab_03"],
        triggerReasons: ["score_delta_threshold"],
        generatedAt: "2025-12-20T14:00:00.000Z",
      }),
      triggerType: "new_evidence",
      status: "pending",
      draftMessage: "Hi DataCo team — Aisha Razak, a previously reviewed candidate for the Junior Product Analyst role, has uploaded new evidence of A/B testing experience. Her match score has improved from 62% to 85%. Would you like to reconsider her application?",
    },
  });

  console.log(`   ✅ Created re-engagement event.\n`);

  // ━━━ 17. University Cohort ━━━
  console.log("🎓 Creating university cohort...");

  const cohortUM = await prisma.universityCohort.create({
    data: {
      id: "cohort_um_cs_2025",
      universityName: "University of Malaya",
      facultyName: "Faculty of Computing",
      programName: "Computer Science",
      year: 2025,
      studentCount: 75,
    },
  });

  console.log(`   ✅ Created university cohort: ${cohortUM.universityName} — ${cohortUM.programName} ${cohortUM.year}.\n`);

  // ━━━ 18. Cohort Aggregates ━━━
  console.log("📈 Creating cohort aggregates...");

  const cohortAggregates = [
    {
      id: "ca_readiness_pa",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: null,
      metricType: "readiness_distribution",
      metricValue: 0.32,
      metricLabel: "Mean readiness score for Product Analytics roles",
      denominator: 75,
    },
    {
      id: "ca_readiness_da",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyDA.id,
      skillId: null,
      metricType: "readiness_distribution",
      metricValue: 0.58,
      metricLabel: "Mean readiness score for Data Analysis roles",
      denominator: 75,
    },
    {
      id: "ca_readiness_pm",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPM.id,
      skillId: null,
      metricType: "readiness_distribution",
      metricValue: 0.27,
      metricLabel: "Mean readiness score for Product Management roles",
      denominator: 75,
    },
    {
      id: "ca_missing_ab",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: "ab_testing",
      metricType: "missing_skill",
      metricValue: 0.0,
      metricLabel: "Students with artifact-backed A/B Testing evidence",
      denominator: 75,
    },
    {
      id: "ca_missing_pa",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: "product_analytics",
      metricType: "missing_skill",
      metricValue: 0.15,
      metricLabel: "Students with artifact-backed Product Analytics evidence",
      denominator: 75,
    },
    {
      id: "ca_missing_stakeholder",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: "stakeholder_communication",
      metricType: "missing_skill",
      metricValue: 0.41,
      metricLabel: "Students with artifact-backed Stakeholder Communication evidence",
      denominator: 75,
    },
    {
      id: "ca_missing_python_data",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyDA.id,
      skillId: "python_data",
      metricType: "missing_skill",
      metricValue: 0.52,
      metricLabel: "Students with artifact-backed Python for Data evidence",
      denominator: 75,
    },
    {
      id: "ca_evidence_coverage",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: null,
      metricType: "evidence_coverage",
      metricValue: 0.45,
      metricLabel: "Mean evidence coverage across required skills",
      denominator: 75,
    },
    {
      id: "ca_evidence_coverage_da",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyDA.id,
      skillId: null,
      metricType: "evidence_coverage",
      metricValue: 0.63,
      metricLabel: "Mean evidence coverage across Data Analysis required skills",
      denominator: 75,
    },
    {
      id: "ca_evidence_coverage_pm",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPM.id,
      skillId: null,
      metricType: "evidence_coverage",
      metricValue: 0.29,
      metricLabel: "Mean evidence coverage across Product Management required skills",
      denominator: 75,
    },
    {
      id: "ca_demand_ab",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: "ab_testing",
      metricType: "market_demand",
      metricValue: 0.61,
      metricLabel: "Product Analyst role briefs requiring experimentation evidence",
      denominator: 18,
    },
    {
      id: "ca_demand_product_analytics",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: "product_analytics",
      metricType: "market_demand",
      metricValue: 0.54,
      metricLabel: "Product Analyst role briefs requiring product analytics evidence",
      denominator: 18,
    },
    {
      id: "ca_demand_stakeholder",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: "stakeholder_communication",
      metricType: "market_demand",
      metricValue: 0.39,
      metricLabel: "Product Analyst role briefs requiring stakeholder communication",
      denominator: 18,
    },
    {
      id: "ca_internship_readiness",
      cohortId: cohortUM.id,
      roleFamilyId: roleFamilyPA.id,
      skillId: null,
      metricType: "internship_readiness",
      metricValue: 0.38,
      metricLabel: "Mean internship readiness score",
      denominator: 75,
    },
  ];

  for (const ca of cohortAggregates) {
    await prisma.cohortAggregate.create({ data: ca });
  }

  console.log(`   ✅ Created ${cohortAggregates.length} cohort aggregates.\n`);

  // ━━━ Done ━━━
  console.log("═══════════════════════════════════════════");
  console.log("🎉 Seed complete! Summary:");
  console.log("   • 6 users (4 candidates, 1 employer, 1 university_admin)");
  console.log("   • 4 candidate profiles");
  console.log(`   • ${skills.length} canonical skills across 7 categories`);
  console.log(`   • ${skillRelations.length} skill relations`);
  console.log("   • 6 role families");
  console.log("   • 11 role briefs with 55 requirements");
  console.log("   • 9 artifacts with 9 extraction jobs");
  console.log(`   • ${evidenceClaims.length} evidence claims`);
  console.log("   • 11 opportunity interactions + 1 precomputed match score");
  console.log("   • 1 retention consent");
  console.log("   • 1 rejected candidate context");
  console.log("   • 1 re-engagement event");
  console.log(`   • 1 university cohort with ${cohortAggregates.length} aggregates`);
  console.log("═══════════════════════════════════════════");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
