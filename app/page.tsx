"use client"
import { useEffect } from 'react';
import Link from 'next/link'; // Importar Link do Next.js se for usar para navegação interna

export default function HomePage() {

  useEffect(() => {
    // Efeito de scroll no header
    const handleScroll = () => {
      const header = document.querySelector('.premium-header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };

    // Scroll suave para links âncora
    const smoothScroll = (e: MouseEvent) => {
      e.preventDefault();
      const targetId = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      // Verifica se o href existe e não é apenas "#"
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          // Ajusta o offset para compensar a altura do header fixo
          top: (targetElement as HTMLElement).offsetTop - 100,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', smoothScroll as EventListener);
    });

    // Função de limpeza para remover os event listeners quando o componente desmontar
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', smoothScroll as EventListener);
      });
    };
  }, []); // Array vazio significa que este efeito roda apenas uma vez, similar ao componentDidMount

  // Script do formulário da newsletter
  useEffect(() => {
    const newsletterForm = document.getElementById('newsletterForm');
    if (!newsletterForm) return; // Sai se o formulário não for encontrado

    const handleSubmit = (e: Event) => {
      e.preventDefault(); // Previne o envio padrão do formulário
      const form = e.target as HTMLFormElement;
      const submitButton = document.getElementById('newsletterSubmit');
      if (!submitButton) return; // Sai se o botão não for encontrado

      const originalIcon = submitButton.innerHTML; // Guarda o ícone original

      // Desabilita o botão e mostra um spinner
      submitButton.setAttribute('disabled', 'true');
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      // Envia os dados do formulário usando Fetch API
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { // Adiciona header necessário para FormSubmit via AJAX
          'Accept': 'application/json'
        }
      })
        .then(response => {
          if (response.ok) {
            // Sucesso: mostra ícone de check e redireciona
            submitButton.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
              const nextUrlInput = form.querySelector('input[name="_next"]') as HTMLInputElement;
              // Redireciona para a página de obrigado
              if (nextUrlInput && nextUrlInput.value) {
                window.location.href = nextUrlInput.value;
              } else {
                form.reset(); // Ou apenas limpa o formulário
                submitButton.removeAttribute('disabled');
                submitButton.innerHTML = originalIcon;
              }
            }, 1500); // Espera 1.5s antes de redirecionar
          } else {
            // Falha na resposta do servidor
            throw new Error('Erro na resposta do servidor');
          }
        })
        .catch(error => {
          // Erro no envio: mostra ícone de erro e reabilita o botão
          console.error("Erro ao enviar newsletter:", error);
          submitButton.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
          setTimeout(() => {
            submitButton.removeAttribute('disabled');
            submitButton.innerHTML = originalIcon; // Restaura o ícone original
          }, 2000); // Mostra o erro por 2s
        });
    };

    // Adiciona o event listener ao formulário
    newsletterForm.addEventListener('submit', handleSubmit);

    // Função de limpeza: remove o event listener quando o componente desmontar
    return () => {
      newsletterForm.removeEventListener('submit', handleSubmit);
    };
  }, []); // Array vazio para rodar apenas uma vez


  return (

    <>

      <div className="homepage-styles">
        {/* Header */}
        {/* Note a troca de 'class' por 'className' */}
        <header className="premium-header">
          <div className="container">
            <div className="header-content">
              {/* Imagens na pasta public são acessadas diretamente pela raiz '/' */}
              <a href="https://masterproject.com.br" className="logo-holographic">
                <img src="/logo-principal-site2.png" alt="Master Project" className="logo-image" />
              </a>
              <ul className="nav-links">
                <li><a href="#cursos">Cursos</a></li>
                <li><a href="#instrutor">Instrutor</a></li>
                <li><a href="#diferenciais">Diferenciais</a></li>
                <li><a href="https://api.whatsapp.com/send/?phone=5511995702066&text=Quero+saber+mais+sobre+os+seus+cursos+online.&type=phone_number&app_absent=0">Contato</a></li>
              </ul>
              <div className="flex items-center gap-4"> {/* Agrupa os botões */}
                <a href="#cta" className="cta-button">Começar Agora</a>
                <a href="/auth/login" className="login-button">
                    Login
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Courses Section */}
        <section id="cursos" className="courses-section">
          <div className="container">
            <div className="section-header"> <br />
              <h2 className="section-title">Nossos Cursos Online</h2>
              <p className="section-subtitle">Escolha o curso que mais se adequa aos seus objetivos profissionais e dê um salto na sua carreira</p>
            </div>
            <div className="courses-grid">

              {/* Curso 1: Análise de Negócio - BPM */}
              <div className="course-card">
                {/* Estilos inline são convertidos para objetos JS */}
                <div className="course-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')" }}>
                  <span className="course-badge">Gestão & Negócios</span>
                </div>
                <div className="course-content">
                  <h3 className="course-title">Análise de Negócio - BPM</h3>
                  <p className="course-description">Conheça o Business Process Management - BPM para transformar negócios. Compreenda todo o processo de identificação de oportunidades e resolução de problemas empresariais.</p>
                  <ul className="course-features">
                    <li className="course-feature"><i className="fas fa-clock"></i> 12 horas de conteúdo</li>
                    <li className="course-feature"><i className="fas fa-certificate"></i> Certificado Master Project</li>
                    <li className="course-feature"><i className="fas fa-users"></i> +281 alunos inscritos</li>
                    <li className="course-feature"><i className="fas fa-play-circle"></i> Acesso por 1 ano</li>
                  </ul>
                  <div className="course-price">
                    <div>
                      <div className="price-original">De R$ 333,32</div>
                      <div className="price-current">R$ 249,99</div>
                    </div>
                    <div className="price-installments">ou 3x de R$ 83,33</div>
                  </div>
                  {/* Links para páginas internas do Next.js podem usar o componente <Link> */}
                  {/* Links externos continuam como <a> */}
                  {/* Ajuste o href para o caminho relativo dentro do seu app ou URL completa */}
                  <a href="/course/4" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Assistir 1° Aula Grátis </a>
                  {/* Tags <br> precisam ser auto-fechadas: <br /> */}
                  <br /> <br />
                  <a href="https://pag.ae/814jCRAYJ" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Comprar Agora</a>
                </div>
              </div>

              {/* Curso 2: BPMN com Bizagi */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')" }}>
                  <span className="course-badge">Processos & Modelagem</span>
                </div>
                <div className="course-content">
                  <h3 className="course-title">BPMN com Bizagi</h3>
                  <p className="course-description">Aprenda Business Process Model and Notation (BPMN) para transformar sua representação de processos. Domine a modelagem com uma das soluções mais destacadas do mercado.</p>
                  <ul className="course-features">
                    <li className="course-feature"><i className="fas fa-clock"></i> 11 horas de conteúdo</li>
                    <li className="course-feature"><i className="fas fa-certificate"></i> Certificado Master Project</li>
                    <li className="course-feature"><i className="fas fa-users"></i> +68 alunos inscritos</li>
                    <li className="course-feature"><i className="fas fa-play-circle"></i> Acesso por 1 ano</li>
                  </ul>
                  <div className="course-price">
                    <div>
                      <div className="price-original">De R$ 333,99</div>
                      <div className="price-current">R$ 249,99</div>
                    </div>
                    <div className="price-installments">ou 3x de R$ 83,33</div>
                  </div>
                  <a href="/course/3" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Assistir 1° Aula Grátis</a>
                  <br /> <br />
                  <a href="https://pag.ae/814jDsSb6" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Comprar Agora</a>
                </div>
              </div>

              {/* Curso 3: Jira Software */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80')" }}>
                  <span className="course-badge">Ferramentas & Tecnologia</span>
                </div>
                <div className="course-content">
                  <h3 className="course-title">Jira Software - Gestão Ágil de Projetos e Operações</h3>
                  <p className="course-description">Aprenda a fazer Gestão Ágil de Projetos e Operações com o Jira Software. Domine quadros Kanban, Scrum, relatórios e automações.</p>
                  <ul className="course-features">
                    <li className="course-feature"><i className="fas fa-clock"></i> 11 horas de conteúdo</li>
                    <li className="course-feature"><i className="fas fa-certificate"></i> Certificado Master Project</li>
                    <li className="course-feature"><i className="fas fa-users"></i> +127 alunos inscritos</li>
                    <li className="course-feature"><i className="fas fa-play-circle"></i> Acesso por 1 ano</li>
                  </ul>
                  <div className="course-price">
                    <div>
                      <div className="price-original">De R$ 399,99</div>
                      <div className="price-current">R$ 199,99</div>
                    </div>
                    <div className="price-installments">ou 4x de R$ 49,99</div>
                  </div>
                  <a href="/course/2" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Assistir 1° Aula Grátis</a>
                  <br /> <br />
                  <a href="https://pag.ae/814jBMHHJ" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Comprar Agora</a>
                </div>
              </div>

              {/* Curso 4: Gerenciamento de Projetos PMI - Iniciação ao Planejamento */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1725400817468-ddb0135d865d?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvamVjdCUyMG1hbmFnZXJ8ZW58MHx8MHx8fDA%3D&ixlib=rb-4.1.0&q=60&w=3000')" }}>
                  <span className="course-badge">Gestão & Liderança</span>
                </div>
                <div className="course-content">
                  <h3 className="course-title">Gerenciamento de Projetos PMI - Iniciação ao Planejamento</h3>
                  <p className="course-description">Domine as práticas do PMI e PMBOK para gerenciar projetos do início ao planejamento. Ideal para certificações PMP e CAPM.</p>
                  <ul className="course-features">
                    <li className="course-feature"><i className="fas fa-clock"></i> 21 horas de conteúdo</li>
                    <li className="course-feature"><i className="fas fa-certificate"></i> Certificado Master Project</li>
                    <li className="course-feature"><i className="fas fa-users"></i> +1.2K alunos inscritos</li>
                    <li className="course-feature"><i className="fas fa-play-circle"></i> Acesso por 1 ano</li>
                  </ul>
                  <div className="course-price">
                    <div>
                      <div className="price-original">De R$ 1110,67</div>
                      <div className="price-current">R$ 833,00</div>
                    </div>
                    <div className="price-installments">ou 3x de R$ 227,66</div>
                  </div>
                  <a href="/course/5" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Assistir 1° Aula Grátis</a>
                  <br /> <br />
                  <a href="https://pag.ae/814juuYQo" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Comprar Agora</a>
                </div>
              </div>

              {/* Curso 5: Gerenciamento de Projetos PMI - Planejamento Avançado */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80')" }}>
                  <span className="course-badge">Gestão & Liderança</span>
                </div>
                <div className="course-content">
                  <h3 className="course-title">Gerenciamento de Projetos PMI - Planejamento Avançado</h3>
                  <p className="course-description">Uma verdadeira imersão na gestão de qualidade em projetos. Domine as boas práticas do PMI em recursos, comunicação, partes interessadas, riscos e aquisições.</p>
                  <ul className="course-features">
                    <li className="course-feature"><i className="fas fa-clock"></i> 38 horas de conteúdo</li>
                    <li className="course-feature"><i className="fas fa-certificate"></i> Certificado Master Project</li>
                    <li className="course-feature"><i className="fas fa-users"></i> +147 alunos inscritos</li>
                    <li className="course-feature"><i className="fas fa-play-circle"></i> Acesso por 1 ano</li>
                  </ul>
                  <div className="course-price">
                    <div>
                      <div className="price-original">De R$ 1110,67</div>
                      <div className="price-current">R$ 833,00</div>
                    </div>
                    <div className="price-installments">ou 3x de R$ 277,66</div>
                  </div>
                  <a href="/course/6" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Assistir 1° Aula Grátis</a>
                  <br /> <br />
                  <a href="https://pag.ae/814jwrcpr" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Comprar Agora</a>
                </div>
              </div>

              {/* Curso 6: Gerenciamento de Projetos PMI - Execução, Monitoramento e Controle */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1658506729016-b0beeebda208?q=80&w=417&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
                  <span className="course-badge">Gestão & Liderança</span>
                </div>
                <div className="course-content">
                  <h3 className="course-title">Gerenciamento de Projetos PMI - Execução, Monitoramento e Controle</h3>
                  <p className="course-description">Garanta o sucesso do projeto aplicando os processos de controle do PMI para lidar com mudanças, riscos e qualidade.</p>
                  <ul className="course-features">
                    <li className="course-feature"><i className="fas fa-clock"></i> 14 horas de conteúdo</li>
                    <li className="course-feature"><i className="fas fa-certificate"></i> Certificado Master Project</li>
                    <li className="course-feature"><i className="fas fa-users"></i> +135 alunos inscritos</li>
                    <li className="course-feature"><i className="fas fa-play-circle"></i> Acesso por 1 ano</li>
                  </ul>
                  <div className="course-price">
                    <div>
                      <div className="price-original">De R$ 1110,67</div>
                      <div className="price-current">R$ 833,00</div>
                    </div>
                    <div className="price-installments">ou 3x de R$ 277,66</div>
                  </div>
                  <a href="/course/7" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Assistir 1° Aula Grátis</a>
                  <br /> <br />
                  <a href="https://pag.ae/814jz9kxQ" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Comprar Agora</a>
                </div>
              </div>

              {/* Curso 7: Dominando OKR */}
              <div className="course-card">
                <div className="course-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')" }}>
                  <span className="course-badge">Metodologias Ágeis</span>
                </div>
                <div className="course-content">
                  <h3 className="course-title">Dominando OKR</h3>
                  <p className="course-description">Implemente as metodologias ágeis do OKR para gerenciar seus projetos. Aprenda a criar objetivos estratégicos e métricas de resultados.</p>
                  <ul className="course-features">
                    <li className="course-feature"><i className="fas fa-clock"></i> 12 horas de conteúdo</li>
                    <li className="course-feature"><i className="fas fa-certificate"></i> Certificado Master Project</li>
                    <li className="course-feature"><i className="fas fa-users"></i> Novas turmas em formação</li>
                    <li className="course-feature"><i className="fas fa-play-circle"></i> Acesso por 1 ano</li>
                  </ul>
                  <div className="course-price">
                    <div>
                      <div className="price-original">De R$ 399,99</div>
                      <div className="price-current">R$ 199,99</div>
                    </div>
                    <div className="price-installments">ou 3x de R$ 66,66</div>
                  </div>
                  <a href="/course/1" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Assistir 1° Aula Grátis</a>
                  <br /> <br />
                  <a href="https://pag.ae/814jt1P13" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>Comprar Agora</a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Hero Section */}
        {/* Background image continua sendo via CSS (colocado no globals.css) */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <span className="hero-badge">Cursos Online</span>
              <h1 className="hero-title">Domine as Metodologias Mais Requisitadas do Mercado</h1>
              <p className="hero-subtitle">Aprenda com especialistas renomados e transforme sua carreira com certificações de alto nível em Gestão de Projetos, BPM, OKR, BPMN e muito mais.</p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div>3.000+</div>
                  <div className="hero-stat-label">Alunos Formados</div>
                </div>
                <div className="hero-stat">
                  <div >98%</div>
                  <div className="hero-stat-label">Satisfação</div>
                </div>
                <div className="hero-stat">
                  <div>100+</div>
                  <div className="hero-stat-label">Empresas Parceiras</div>
                </div>
              </div>
              {/* Ícones do Font Awesome continuam funcionando se o link CSS estiver no layout.tsx */}
              <a href="#cursos" className="cta-button">Ver Cursos <i className="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </section>

        {/* Instructor Section */}
        <section id="instrutor" className="instructor-section">
          <div className="container">
            <div className="instructor-container">
              <div className="instructor-image">
                <img src="/Img-MarceloSansini.jpg" alt="Marcelo Sansini" />
              </div>
              <div className="instructor-info">
                <h2 className="instructor-name">Marcelo Sansini</h2>
                <div className="instructor-title">Marcelo Sansini Terra, Ph.D</div>
                <p className="instructor-bio">
                  Consultor em Tecnologias Digitais, PMO, Governança, Processos e Transformação de Negócios.
                  Professor na Fundação Getulio Vargas, Universidade Presbiteriana Mackenzie e Impacta Tecnologia.
                  Sócio-fundador da Master Project, possui mais de 18 anos de experiência em diferentes setores, como
                  consultoria de TI, saúde, varejo, automotivo e químico.
                  Certificado PMP e PMI-ACP, é pesquisador em Transformação Digital e palestrante em temas
                  de gestão de projetos, processos e inovação, ajudando organizações a prosperarem na era digital.
                </p>
                <a href="#cursos" className="cta-buttonn">Ver Cursos do Instrutor</a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="diferenciais" className="stats-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Por Que Escolher a Master Project</h2>
              <p className="section-subtitle">Nossa trajetória e resultados falam por si só. Junte-se a milhares de profissionais que transformaram suas carreiras conosco.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Pronto para Transformar Sua Carreira?</h2>
              <p className="cta-subtitle">Junte-se a milhares de profissionais que já elevaram seu potencial com nossos cursos premium. Invista no seu futuro hoje.</p>
              <a href="#cursos" className="cta-button">Escolher Meu Curso</a>
            </div>
          </div>
        </section>

        {/* Rodapé */}
        <footer className="footer-2025">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-brand">
                <a href="/" className="footer-logo">
                  <span>Master Project</span>
                </a>
                <p className="footer-description">Consultoria em transformação digital e gestão de projetos com tecnologias emergentes.</p>
                <div className="footer-social">
                  <a href="https://www.instagram.com/masterprojectoficial" className="social-link" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://api.whatsapp.com/send/?phone=5511970849396&text=Olá+Master+Project " target="_blank" className="social-link" aria-label="WhatsApp">
                    <i className="fab fa-whatsapp"></i>
                  </a>
                  <a href="http://linkedin.com/company/master-project/" className="social-link" aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="https://youtu.be/NheN_7jDABs?feature=shared" className="social-link" aria-label="YouTube">
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a href="#" className="social-link" aria-label="Metaverso">
                    <i className="fas fa-vr-cardboard"></i>
                  </a>
                </div>
              </div>
              <div className="footer-links">
                <h3 className="footer-title">Serviços</h3>
                <ul>
                  <li><a href="https://masterproject.com.br/consultoria/pmo-saas-agil.html">Escritório de Projetos como Serviço</a></li>
                  <li><a href="https://masterproject.com.br/consultoria/analise-mapeamento-de-processos.html">Otimização de Processos</a></li>
                  <li><a href="https://masterproject.com.br/consultoria/inteligencia-de-dados.html">Transforme Dados em Decisões Estratégicas</a></li>
                  <li><a href="https://masterproject.com.br/consultoria/automatizacaodeprocessos.html">Automação Inteligente</a></li>
                  <li><a href="https://masterproject.com.br/consultoria/consultoria-estrategica.html">Governança Estratégica de Projetos</a></li>
                  <li><a href="https://masterproject.com.br/consultoria/outsourcing.html">Alocação Estratégica de Profissionais</a></li>
                </ul>
              </div>
              <div className="footer-links">
                <h3 className="footer-title">Cursos</h3>
                <ul>
                  <li><a href="https://masterproject.com.br/curso/gestao-projetos-hibrida.html">Gestão de Projetos Híbrida</a></li>
                  <li><a href="https://masterproject.com.br/curso/powerbi.html">Ciência de Dados com Power BI</a></li>
                  <li><a href="https://masterproject.com.br/curso/excelpro.html">Excel Pro</a></li>
                  <li><a href="https://masterproject.com.br/curso/trilhamaster.html">Trilha Master</a></li>
                </ul>
              </div>
              <div className="footer-newsletter">
                <h3 className="footer-title">Newsletter</h3>
                <p>Assine para receber insights exclusivos sobre o futuro dos negócios.</p>
                {/* Tag <input> auto-fechada */}
                <form className="newsletter-form" id="newsletterForm" action="https://formsubmit.co/ajax/contato@masterproject.com.br" method="POST">
                  <input type="email" name="email" placeholder="Seu e-mail" required />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_next" value="https://masterproject.com.br/obrigado.html" />
                  <input type="hidden" name="_subject" value="Novo Inscrito na Newsletter - Master Project" />
                  <input type="hidden" name="_autoresponse" value="Obrigado por assinar nossa newsletter! Você receberá nossos melhores insights sobre o futuro dos negócios." />
                  <input type="hidden" name="_template" value="table" />
                  <input type="hidden" name="_tags" value="newsletter" />
                  <button type="submit" id="newsletterSubmit">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-legal">
                <p>Av. dos Autonomistas, 2561 - Vila Yara, Osasco - SP, 06090-020 | CNPJ: 23.275.311/0001-69, Santer Consultoria</p>
                <div className="legal-links">
                  <a href="https://masterproject.com.br/politicadeprivacidade.html">Política de Privacidade</a>
                </div>
                <div className="footer-content">
                  <p className="copyright">&copy; 2025 Master Project. Todos os direitos reservados.</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Scripts foram movidos para useEffects acima */}
    </>
  );
}