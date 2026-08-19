{import('next').NextConfig}
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/course/1',
        destination: 'https://cursos-online.masterproject.com.br/okr',
        permanent: true,
      },
      {
        source: '/course/2',
        destination: 'https://cursos-online.masterproject.com.br/jira-software',
        permanent: true,
      },
      {
        source: '/course/3',
        destination: 'https://cursos-online.masterproject.com.br/bpmn-com-bizagi',
        permanent: true,
      },
      {
        source: '/course/4',
        destination: 'https://cursos-online.masterproject.com.br/bpm',
        permanent: true,
      },
      {
        source: '/course/5',
        destination: 'https://cursos-online.masterproject.com.br/pmi-da-iniciacao-ao-planejamento',
        permanent: true,
      },
      {
        source: '/course/6',
        destination: 'https://cursos-online.masterproject.com.br/pmi-planejamento-avancado',
        permanent: true,
      },
      {
        source: '/course/7',
        destination: 'https://cursos-online.masterproject.com.br/pmi-execucao-monitoramento-e-controle',
        permanent: true,
      },
      {
        source: '/course/11',
        destination: 'https://cursos-online.masterproject.com.br/aulas-abertas',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;