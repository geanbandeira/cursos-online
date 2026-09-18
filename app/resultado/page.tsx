"use client";

import { useEffect, useState } from "react";

type Servico = { nome: string; url: string };

type Recomendacao = {
  titulo: string;
  descricao: string;
  servicos: Servico[];
  resumoParaWhats: string;
};

export default function ResultadoPage() {
  const [recomendacao, setRecomendacao] = useState<Recomendacao | null>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("respostasDiagnostico");
    if (!dadosSalvos) return;

    const respostas = JSON.parse(dadosSalvos);
    const respostasTexto = Object.values(respostas).join(" ").toLowerCase();

    // Formata a mensagem para o WhatsApp com base nas respostas
    let textoWhats = "Olá! Fiz o diagnóstico da Master Project.%0A%0A*Meus principais pontos foram:*%0A";
    Object.entries(respostas).forEach(([key, value]) => {
      textoWhats += `- ${value}%0A`;
    });
    textoWhats += "%0AGostaria de conversar sobre os próximos passos.";

    // Lógica de recomendação baseada em palavras-chave
    if (respostasTexto.includes("dados") || respostasTexto.includes("automatizar") || respostasTexto.includes("inteligência")) {
      setRecomendacao({
        titulo: "Automação e Inteligência de Dados",
        descricao: "Para dar velocidade e clareza à sua operação.",
        servicos: [
          { nome: "Consultoria: Inteligência de Dados", url: "https://masterproject.com.br/consultoria/inteligencia-de-dados" },
          { nome: "Consultoria: Automação", url: "https://masterproject.com.br/consultoria/automatizacaodeprocessos" },
          { nome: "Curso: Power BI", url: "https://masterproject.com.br/curso-aovivo/powerbi" },
          { nome: "Curso: n8n", url: "https://masterproject.com.br/curso-aovivo/n8n" }
        ],
        resumoParaWhats: textoWhats
      });
    } else if (respostasTexto.includes("treinamento") || respostasTexto.includes("capacitação") || respostasTexto.includes("cursos")) {
      setRecomendacao({
        titulo: "Capacitação e Nivelamento",
        descricao: "Para alinhar sua equipe com as melhores práticas de mercado.",
        servicos: [
          { nome: "Trilha Master", url: "https://masterproject.com.br/curso-aovivo/trilhamaster" },
          { nome: "Excel Pro", url: "https://masterproject.com.br/curso-aovivo/excelpro" },
          { nome: "Gestão de Projetos Híbrida", url: "https://masterproject.com.br/curso-aovivo/gestao-projetos-hibrida" },
          { nome: "Cursos Online (PMI, BPMN, OKR)", url: "https://cursos-online.masterproject.com.br/" }
        ],
        resumoParaWhats: textoWhats
      });
    } else {
      setRecomendacao({
        titulo: "Governança e Estruturação (PMO / BPM)",
        descricao: "Para colocar a casa em ordem e garantir entregas e processos fluidos.",
        servicos: [
          { nome: "PMO SaaS Ágil", url: "https://masterproject.com.br/consultoria/pmo-saas-agil" },
          { nome: "Mapeamento de Processos", url: "https://masterproject.com.br/consultoria/analise-mapeamento-de-processos" },
          { nome: "Consultoria Estratégica", url: "https://masterproject.com.br/consultoria/consultoria-estrategica" },
          { nome: "Outsourcing", url: "https://masterproject.com.br/consultoria/outsourcing" }
        ],
        resumoParaWhats: textoWhats
      });
    }
  }, []);

  if (!recomendacao) return <div className="min-h-screen flex items-center justify-center">Analisando respostas...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100 text-center">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Diagnóstico Concluído</h1>
        <p className="text-gray-600 mb-8">Analisamos seu cenário e este é o plano de ação ideal:</p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Caminho Recomendado</h2>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{recomendacao.titulo}</h3>
          <p className="text-gray-700 mb-6">{recomendacao.descricao}</p>
          
          <h4 className="font-semibold text-gray-900 mb-4">Soluções da Master Project para você:</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {recomendacao.servicos.map((servico, i) => (
              <a 
                key={i} 
                href={servico.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-gray-800 bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:border-blue-500 hover:shadow-md transition-all font-medium"
              >
                <span className="text-blue-500 mr-3">➔</span> {servico.nome}
              </a>
            ))}
          </div>
        </div>

        <a 
          href={`https://wa.me/5511995702066?text=${recomendacao.resumoParaWhats}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-lg"
        >
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Enviar Diagnóstico no WhatsApp
        </a>

      </div>
    </main>
  );
}