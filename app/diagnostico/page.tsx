"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const perguntas = [
  {
    id: 1,
    titulo: "Qual é a maior dificuldade da sua empresa hoje?",
    opcoes: [
      "Projetos atrasam ou perdem o foco (Escopo/Prazo)",
      "Processos desorganizados e muito trabalho manual",
      "Falta de clareza nos dados para tomar decisões",
      "Equipe precisa de capacitação e ferramentas atualizadas"
    ],
    imagem: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
  },
  {
    id: 2,
    titulo: "Como funciona a gestão de projetos e entregas atualmente?",
    opcoes: [
      "Não temos um método claro (cada um faz de um jeito)",
      "Usamos planilhas básicas, mas falta visibilidade",
      "Tentamos usar métodos ágeis (Jira/Scrum), mas com atritos",
      "Temos métodos, mas falta uma governança estratégica (PMO)"
    ],
    imagem: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 3,
    titulo: "Qual o nível de organização dos seus processos internos?",
    opcoes: [
      "Tudo está na cabeça das pessoas (sem documentação)",
      "Temos algumas regras, mas ninguém segue o fluxo",
      "Temos processos mapeados, mas são lentos e burocráticos",
      "Precisamos automatizar fluxos que já funcionam"
    ],
    imagem: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 4,
    titulo: "Como são feitas as análises financeiras e de metas (OKRs)?",
    opcoes: [
      "No escuro ou com dados muito defasados",
      "Planilhas pesadas em Excel que tomam muito tempo",
      "Temos painéis, mas faltam análises profundas (Power BI)",
      "Já usamos dados estruturados, queremos prever cenários"
    ],
    imagem: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 5,
    titulo: "Sobre tarefas repetitivas, como a equipe lida hoje?",
    opcoes: [
      "Perdemos horas fazendo trabalho de 'copiar e colar'",
      "Usamos integrações básicas, mas quebram muito",
      "Queremos implementar automações visuais (n8n / Power Automate)",
      "Queremos escalar com Inteligência Artificial integrada"
    ],
    imagem: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 6,
    titulo: "A sua equipe técnica atual dá conta das demandas?",
    opcoes: [
      "Não, precisamos terceirizar e alocar profissionais rápidos",
      "Dão conta, mas precisam de treinamento urgente",
      "Falta um líder ou escritório de projetos para guiá-los",
      "Sim, só precisamos otimizar os processos deles"
    ],
    imagem: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 7,
    titulo: "Como você avalia a maturidade de negócios (BPM) na empresa?",
    opcoes: [
      "Não sabemos o que é BPM",
      "Precisamos mapear a operação do zero (Bizagi)",
      "Queremos melhorar o que já temos desenhado",
      "Queremos escalar processos para franquias ou filiais"
    ],
    imagem: "https://images.unsplash.com/photo-1507925922837-326f12d9348d?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 8,
    titulo: "Se pudesse resolver um gargalo em 30 dias, qual seria?",
    opcoes: [
      "Colocar os projetos nos trilhos (Governança/PMO)",
      "Automatizar rotinas chatas e demoradas",
      "Ter um painel gerencial em tempo real",
      "Treinar a equipe para parar de errar o básico"
    ],
    imagem: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 9,
    titulo: "Qual o seu nível de urgência na busca por soluções?",
    opcoes: [
      "Baixo. Estamos apenas explorando ideias.",
      "Médio. Queremos resolver neste semestre.",
      "Alto. Estamos perdendo dinheiro ou clientes agora.",
      "Critico. Precisamos de ajuda especializada imediata."
    ],
    imagem: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 10,
    titulo: "Qual formato de solução melhor se adapta ao momento da empresa?",
    opcoes: [
      "Consultoria completa (vocês fazem pela nossa empresa)",
      "Terceirização de profissionais especialistas",
      "Treinamentos ao vivo para alinhar os líderes",
      "Cursos gravados para capacitação em escala da equipe"
    ],
    imagem: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2340&auto=format&fit=crop"
  },
];

export default function DiagnosticoPage() {
  const router = useRouter();
  const [passoAtual, setPassoAtual] = useState(-1);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [lead, setLead] = useState({ nome: "", email: "" });

  const perguntaAtual = perguntas[passoAtual];
  const progresso = passoAtual >= 0 ? ((passoAtual + 1) / perguntas.length) * 100 : 0;

  const selecionarOpcao = (opcao: string) => {
    setRespostas({ ...respostas, [perguntaAtual.id]: opcao });
    setTimeout(proximoPasso, 400); 
  };

  const proximoPasso = () => {
    if (passoAtual < perguntas.length - 1) {
      setPassoAtual(passoAtual + 1);
    } else {
      localStorage.setItem("respostasDiagnostico", JSON.stringify(respostas));
      router.push("/resultado");
    }
  };

  const finalizar = () => {
    localStorage.setItem("respostasDiagnostico", JSON.stringify(respostas));
    localStorage.setItem("leadDiagnostico", JSON.stringify(lead));
    router.push("/resultado");
  };

  // 1. TELA INICIAL
  if (passoAtual === -1) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2340&auto=format&fit=crop')" }}></div>
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-12 bg-white">
          <div className="max-w-md w-full">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Descubra o próximo passo da sua empresa</h1>
            <p className="text-lg text-gray-600 mb-8">Faça um diagnóstico rápido de 2 minutos e receba um plano de ação estratégico para projetos, processos e dados.</p>
            <button onClick={() => setPassoAtual(0)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-all">
              Começar Diagnóstico Gratuito
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CAPTURA DE LEAD (ÚLTIMO PASSO)
  if (passoAtual === perguntas.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Diagnóstico concluído!</h2>
          <p className="text-gray-600 mb-6">Para onde devemos enviar seu plano de ação estratégico?</p>
          <input 
            type="text" 
            placeholder="Seu nome" 
            value={lead.nome} 
            onChange={(e) => setLead({ ...lead, nome: e.target.value })} 
            className="w-full mb-4 p-4 border rounded-xl" 
          />
          <input 
            type="email" 
            placeholder="Seu e-mail corporativo" 
            value={lead.email} 
            onChange={(e) => setLead({ ...lead, email: e.target.value })} 
            className="w-full mb-6 p-4 border rounded-xl" 
          />
          <button 
            onClick={finalizar} 
            disabled={!lead.nome || !lead.email} 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
          >
            Ver Meu Resultado Agora
          </button>
        </div>
      </div>
    );
  }

  // 3. TELA DAS PERGUNTAS
  return (
    <div className="min-h-screen flex">
      <div 
        className="hidden lg:flex w-1/2 bg-cover bg-center transition-all duration-700" 
        style={{ backgroundImage: `url('${perguntaAtual.imagem}')` }}
      >
        <div className="w-full h-full bg-black/30"></div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 bg-gray-50">
        <div className="max-w-xl w-full mx-auto">
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }}></div>
            </div>
            <span className="text-sm font-medium text-gray-500">Passo {passoAtual + 1} de {perguntas.length}</span>
          </div>

          <h2 className="text-3xl font-semibold text-gray-800 mb-8">{perguntaAtual.titulo}</h2>
          
          <div className="space-y-4">
            {perguntaAtual.opcoes.map((opcao, index) => {
              const selecionado = respostas[perguntaAtual.id] === opcao;
              return (
                <button
                  key={index}
                  onClick={() => selecionarOpcao(opcao)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 text-lg ${
                    selecionado
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                      : "border-transparent bg-white shadow-sm hover:border-blue-500 hover:shadow-md text-gray-700"
                  }`}
                >
                  {opcao}
                </button>
              );
            })}
          </div>

          <button onClick={() => setPassoAtual(passoAtual - 1)} className="mt-8 text-gray-500 hover:text-gray-800 font-medium">
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}