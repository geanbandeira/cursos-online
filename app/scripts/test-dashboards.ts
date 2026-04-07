import { getManagerParticipationReport, getDailyCompletionTrend, getActivationByDepartment } from "@/lib/course-actions";

async function runTests() {
  const companyId = 1; // ID que você configurou no banco
  
  console.log("--- Teste Parte A (Participação) ---");
  const partA = await getManagerParticipationReport(companyId);
  console.table(partA);

  console.log("--- Teste Parte B (Tendência Diária) ---");
  const partB = await getDailyCompletionTrend(companyId);
  console.table(partB);

  console.log("--- Teste Parte C (Ativação) ---");
  const partC = await getActivationByDepartment(companyId);
  console.table(partC);
}

runTests();