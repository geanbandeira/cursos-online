import Link from "next/link";

interface PageProps {
  searchParams?: Promise<{ period?: string }> | { period?: string };
}

function getDateFilter(period: string) {
  const now = new Date();
  const until = now.toISOString().split("T")[0];
  let since = "";

  if (period === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    since = d.toISOString().split("T")[0];
  } else if (period === "30d") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    since = d.toISOString().split("T")[0];
  } else if (period === "mes") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    since = d.toISOString().split("T")[0];
  } else if (period === "mes_anterior") {
    const firstPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastPrev = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      since: firstPrev.toISOString().split("T")[0],
      until: lastPrev.toISOString().split("T")[0]
    };
  }

  return { since, until };
}

async function getVercelStats(projectId: string, period: string, isTeamProject: boolean) {
  const token = process.env.VERCEL_TOKEN;
  const teamId = "team_2AawUv732IPVhoMRiPXEVVKz";

  if (!token || !projectId) return { visitors: 0, pageviews: 0, error: "Credenciais ausentes" };

  const { since, until } = getDateFilter(period);

  const queryApi = async (withTeam: boolean) => {
    let url = `https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=${projectId}`;
    if (withTeam && teamId) url += `&teamId=${teamId}`;
    if (since && until) url += `&since=${since}&until=${until}`;

    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  };

  try {
    let res = await queryApi(isTeamProject);

    if (!res.ok && res.status === 404) {
      const fallback = await queryApi(!isTeamProject);
      if (fallback.ok) res = fallback;
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        visitors: 0,
        pageviews: 0,
        error: errJson?.error?.message || `Erro ${res.status}`
      };
    }

    const data = await res.json();
    return {
      visitors: data?.data?.visitors ?? 0,
      pageviews: data?.data?.pageviews ?? 0,
      error: undefined,
    };
  } catch (err: any) {
    return { visitors: 0, pageviews: 0, error: err.message };
  }
}

async function getHostgatorStats() {
  try {
    const res = await fetch("https://www.masterproject.com.br/stats.php", {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json : null;
  } catch {
    return null;
  }
}

export default async function EstatisticasPage(props: PageProps) {
  const searchParams = props.searchParams instanceof Promise
    ? await props.searchParams
    : props.searchParams;

  const currentPeriod = searchParams?.period || "30d";
  const [statsCursos, statsAcademy, hostgatorData] = await Promise.all([
    getVercelStats("prj_vF69Ypt95xtLU4GAXoHoiclQCNhA", currentPeriod, true),  // Team
    getVercelStats("prj_0s9XcvnoyOyzyXS3aPS3XfJb5E4K", currentPeriod, false), // Conta pessoal (Hobby)
    getHostgatorStats(),
  ]);

  const periods = [
    { key: "7d", label: "Últimos 7 dias" },
    { key: "30d", label: "Últimos 30 dias" },
    { key: "mes", label: "Mês Atual" },
    { key: "mes_anterior", label: "Mês Anterior" },
    { key: "all", label: "Todo o Período" },
  ];

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      {/* CABEÇALHO E FILTROS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Painel de Tráfego & Estatísticas</h1>
          <p className="text-sm text-gray-500">Métricas consolidadas do ecossistema Master Project.</p>
        </div>

        <div className="inline-flex bg-gray-100 p-1 rounded-lg border">
          {periods.map((p) => (
            <Link
              key={p.key}
              href={`/admin/users/estatisticas?period=${p.key}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                currentPeriod === p.key
                  ? "bg-white text-gray-900 shadow-sm font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* CARDS VERCEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cursos Online */}
        <div className="p-5 border rounded-xl shadow-sm bg-white">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Vercel Analytics</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">cursos-online</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mt-1">Cursos Online</h2>
          {statsCursos.error ? (
            <p className="mt-3 text-xs text-red-500">{statsCursos.error}</p>
          ) : (
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-3xl font-extrabold text-blue-600">{statsCursos.visitors.toLocaleString("pt-BR")}</p>
                <span className="text-xs text-gray-500">Visitantes únicos</span>
              </div>
              <div className="border-l pl-6">
                <p className="text-2xl font-semibold text-gray-700">{statsCursos.pageviews.toLocaleString("pt-BR")}</p>
                <span className="text-xs text-gray-500">Visualizações</span>
              </div>
            </div>
          )}
        </div>

        {/* Academy */}
        <div className="p-5 border rounded-xl shadow-sm bg-white">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Vercel Analytics</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">academy</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mt-1">Academy</h2>
          {statsAcademy.error ? (
            <p className="mt-3 text-xs text-red-500">{statsAcademy.error}</p>
          ) : (
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-3xl font-extrabold text-indigo-600">{statsAcademy.visitors.toLocaleString("pt-BR")}</p>
                <span className="text-xs text-gray-500">Visitantes únicos</span>
              </div>
              <div className="border-l pl-6">
                <p className="text-2xl font-semibold text-gray-700">{statsAcademy.pageviews.toLocaleString("pt-BR")}</p>
                <span className="text-xs text-gray-500">Visualizações</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HOSTGATOR CARDS */}
      <div className="p-5 border rounded-xl shadow-sm bg-white flex flex-col gap-5">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">HostGator (AWStats)</span>
            <h2 className="text-lg font-bold text-gray-800 mt-0.5">Master Project (Site Principal)</h2>
          </div>
          <a
            href="https://masterproject.com.br/cpanel"
            target="_blank"
            rel="noreferrer"
            className="text-xs bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Abrir cPanel ↗
          </a>
        </div>

        {/* MÊS ATUAL E MÊS ANTERIOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Mês Atual</h3>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-2xl font-extrabold text-emerald-700">{hostgatorData?.current?.visitors ?? 0}</p>
                <span className="text-[11px] text-gray-500 font-medium">Visitantes</span>
              </div>
              <div className="border-l pl-3">
                <p className="text-2xl font-bold text-gray-800">{hostgatorData?.current?.pageviews ?? 0}</p>
                <span className="text-[11px] text-gray-500 font-medium">Páginas</span>
              </div>
              <div className="border-l pl-3">
                <p className="text-2xl font-bold text-gray-700">{hostgatorData?.current?.hits ?? 0}</p>
                <span className="text-[11px] text-gray-500 font-medium">Hits</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border rounded-lg">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Mês Anterior</h3>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-2xl font-extrabold text-gray-700">{hostgatorData?.previous?.visitors ?? 0}</p>
                <span className="text-[11px] text-gray-500 font-medium">Visitantes</span>
              </div>
              <div className="border-l pl-3">
                <p className="text-2xl font-bold text-gray-800">{hostgatorData?.previous?.pageviews ?? 0}</p>
                <span className="text-[11px] text-gray-500 font-medium">Páginas</span>
              </div>
              <div className="border-l pl-3">
                <p className="text-2xl font-bold text-gray-700">{hostgatorData?.previous?.hits ?? 0}</p>
                <span className="text-[11px] text-gray-500 font-medium">Hits</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP PÁGINAS DO SITE */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">🏆 Páginas mais acessadas no mês</h3>
          {hostgatorData?.current?.top_pages?.length ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Página / URL</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Visualizações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {hostgatorData.current.top_pages.map((item: { url: string; views: number }, index: number) => (
                    <tr key={index} className="hover:bg-gray-50/80">
                      <td className="py-2 px-4 font-mono text-gray-800">{item.url}</td>
                      <td className="py-2 px-4 text-right font-semibold text-emerald-700">
                        {item.views.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Nenhum dado de página registrado no mês até o momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}