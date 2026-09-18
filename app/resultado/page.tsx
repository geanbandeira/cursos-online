"use client";

import { useEffect, useState } from "react";

type Servico = { nome: string; url: string };
type Recomendacao = { titulo: string; descricao: string; servicos: Servico[]; resumoParaWhats: string; };

export default function ResultadoPage() {
  const [recomendacao, setRecomendacao] = useState<Recomendacao | null>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("respostasDiagnostico");
    if (!dadosSalvos) return;

    const respostas = JSON.parse(dadosSalvos);
    const respostasTexto = Object.values(respostas).join(" ").toLowerCase();

    // Monta a mensagem do WhatsApp formatada
    let textoWhats = "Olá! Fiz o diagnóstico da Master Project.\n\n*Meus principais pontos foram:*\n";
    Object.entries(respostas).forEach(([key, value]) => {
      textoWhats += `- ${value}\n`;
    });
    textoWhats += "\nGostaria de conversar sobre os próximos passos.";
    const linkWhats = `https://wa.me/5511995702066?text=${encodeURIComponent(textoWhats)}`;

    // Sistema de pontuação para evitar resultados fixos
    const palavrasDados = ["dados", "automatizar", "automaç", "inteligência", "painel", "n8n", "prever", "power bi"];
    const palavrasCapacitacao = ["capacitação", "treinamento", "cursos", "ensinar", "básico", "alinhar"];
    
    let scoreDados = palavrasDados.filter(p => respostasTexto.includes(p)).length;
    let scoreCapacitacao = palavrasCapacitacao.filter(p => respostasTexto.includes(p)).length;

    // Lógica de distribuição baseada na pontuação
    if (scoreDados > scoreCapacitacao && scoreDados >= 2) {
      setRecomendacao({
        titulo: "Automação e Inteligência de Dados",
        descricao: "Foco em dar velocidade, previsibilidade e eliminar processos manuais.",
        resumoParaWhats: linkWhats,
        servicos: [
          { nome: "Consultoria: Inteligência de Dados", url: "https://masterproject.com.br/consultoria/inteligencia-de-dados" },
          { nome: "Consultoria: Automação", url: "https://masterproject.com.br/consultoria/automatizacaodeprocessos" },
          { nome: "Curso Ao Vivo: Power BI", url: "https://masterproject.com.br/curso-aovivo/powerbi" },
          { nome: "Curso Ao Vivo: n8n", url: "https://masterproject.com.br/curso-aovivo/n8n" },
          { nome: "Curso Ao Vivo: Power Automate", url: "https://masterproject.com.br/curso-aovivo/power-automate" },
          { nome: "Curso Ao Vivo: Inteligência Artificial", url: "https://masterproject.com.br/curso-aovivo/inteligencia-artificial" }
        ]
      });
    } else if (scoreCapacitacao >= 2 || respostasTexto.includes("gravados")) {
      setRecomendacao({
        titulo: "Capacitação e Nivelamento",
        descricao: "Foco em qualificar sua equipe com frameworks e ferramentas de mercado.",
        resumoParaWhats: linkWhats,
        servicos: [
          { nome: "Ao Vivo: Trilha Master", url: "https://masterproject.com.br/curso-aovivo/trilhamaster" },
          { nome: "Ao Vivo: Gestão Híbrida", url: "https://masterproject.com.br/curso-aovivo/gestao-projetos-hibrida" },
          { nome: "Ao Vivo: Excel Pro", url: "https://masterproject.com.br/curso-aovivo/excelpro" },
          { nome: "Online: PMI Iniciação ao Planejamento", url: "https://masterproject.com.br/curso/gerenciamento-projetos-pmi-iniciacao" },
          { nome: "Online: PMI Execução e Controle", url: "https://masterproject.com.br/curso/gerenciamento-projetos-pmi-execucao" },
          { nome: "Online: Jira Software & OKR", url: "https://masterproject.com.br/curso/jira-soft" }
        ]
      });
    } else {
      setRecomendacao({
        titulo: "Governança e Estruturação de Processos",
        descricao: "Foco em colocar a casa em ordem, mapear processos e gerenciar projetos.",
        resumoParaWhats: linkWhats,
        servicos: [
          { nome: "Consultoria: PMO SaaS Ágil", url: "https://masterproject.com.br/consultoria/pmo-saas-agil" },
          { nome: "Consultoria: Mapeamento de Processos", url: "https://masterproject.com.br/consultoria/analise-mapeamento-de-processos" },
          { nome: "Consultoria: Estratégica", url: "https://masterproject.com.br/consultoria/consultoria-estrategica" },
          { nome: "Consultoria: Outsourcing", url: "https://masterproject.com.br/consultoria/outsourcing" },
          { nome: "Online: Análise de Negócio BPM", url: "https://masterproject.com.br/curso/analise-negocio-bpm" },
          { nome: "Online: BPMN com Bizagi", url: "https://masterproject.com.br/curso/bpmn-bizagi" }
        ]
      });
    }
  }, []);

  if (!recomendacao) return <div className="min-h-screen flex items-center justify-center font-semibold">Analisando respostas...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100 text-center">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Diagnóstico Concluído</h1>
        <p className="text-gray-600 mb-8">Com base nas suas respostas, desenhamos o plano de ação ideal:</p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Caminho Recomendado</h2>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{recomendacao.titulo}</h3>
          <p className="text-gray-700 mb-6">{recomendacao.descricao}</p>
          
          <h4 className="font-semibold text-gray-900 mb-4">Soluções da Master Project sugeridas:</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {recomendacao.servicos.map((servico, i) => (
              <a 
                key={i} 
                href={servico.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-800 bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:border-blue-500 hover:shadow-md transition-all font-medium text-sm"
              >
                <span className="text-blue-500 mr-3 text-lg">➔</span> {servico.nome}
              </a>
            ))}
          </div>
        </div>

        <a 
          href={recomendacao.resumoParaWhats}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-lg shadow-lg hover:shadow-xl"
        >
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Enviar Diagnóstico no WhatsApp
        </a>

        <div className="mt-6">
          <a href="https://masterproject.com.br/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 underline text-sm transition-colors">
            Acessar site principal da Master Project
          </a>
        </div>

      </div>
    </main>
  );
}