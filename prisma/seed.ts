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

  console.log(`   ✅ Created ${3} users.\n`);

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

  console.log(`   ✅ Created candidate profile for Aisha.\n`);

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

  console.log(`   ✅ Created 3 role families.\n`);

  // ━━━ 7. Role Brief (Demo Role: Junior Product Analyst) ━━━
  console.log("📄 Creating role briefs...");

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

  const roleRequirements = [
    { id: "rr_sql", roleBriefId: roleBriefJPA.id, skillId: "sql", importance: "required", minimumEvidenceStrength: 2, displayLabel: "SQL" },
    { id: "rr_data_viz", roleBriefId: roleBriefJPA.id, skillId: "data_visualization", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Data Visualization" },
    { id: "rr_product_analytics", roleBriefId: roleBriefJPA.id, skillId: "product_analytics", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Product Analytics" },
    { id: "rr_ab_testing", roleBriefId: roleBriefJPA.id, skillId: "ab_testing", importance: "required", minimumEvidenceStrength: 2, displayLabel: "Experimentation (A/B Testing)" },
    { id: "rr_stakeholder", roleBriefId: roleBriefJPA.id, skillId: "stakeholder_communication", importance: "required", minimumEvidenceStrength: 1, displayLabel: "Stakeholder Communication" },
    { id: "rr_data_analysis", roleBriefId: roleBriefJPA.id, skillId: "data_analysis", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "Data Analysis" },
    { id: "rr_python_data", roleBriefId: roleBriefJPA.id, skillId: "python_data", importance: "nice_to_have", minimumEvidenceStrength: 1, displayLabel: "Python for Data" },
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

  console.log(`   ✅ Created 3 demo artifacts.\n`);

  // ━━━ 10. Extraction Jobs ━━━
  console.log("⚙️  Creating extraction jobs...");

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

  console.log(`   ✅ Created opportunity interaction.\n`);

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
  console.log("   • 3 users (candidate, employer, university_admin)");
  console.log("   • 1 candidate profile");
  console.log(`   • ${skills.length} canonical skills across 7 categories`);
  console.log(`   • ${skillRelations.length} skill relations`);
  console.log("   • 3 role families");
  console.log("   • 1 role brief with 7 requirements");
  console.log("   • 3 artifacts with 3 extraction jobs");
  console.log(`   • ${evidenceClaims.length} evidence claims`);
  console.log("   • 1 opportunity interaction + 1 match score");
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
