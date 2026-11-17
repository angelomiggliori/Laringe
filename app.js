(() => {
  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

  // Identificação automática do sistema e da categoria do dispositivo.
  // A disposição visual continua sendo controlada por CSS responsivo,
  // enquanto estes dados permitem personalizar a navegação e a interface.
  const agente = navigator.userAgent || "";
  const plataformaNativa = navigator.userAgentData?.platform || navigator.platform || "";
  function identificarPlataforma() {
    const texto = `${plataformaNativa} ${agente}`.toLowerCase();
    let sistema = "Sistema não identificado";
    if (/iphone|ipad|ipod/.test(texto) || (/macintosh/.test(texto) && navigator.maxTouchPoints > 1)) sistema = "iOS / iPadOS";
    else if (/android/.test(texto)) sistema = "Android";
    else if (/win/.test(texto)) sistema = "Windows";
    else if (/mac|darwin/.test(texto)) sistema = "macOS";
    else if (/cros/.test(texto)) sistema = "ChromeOS";
    else if (/linux/.test(texto)) sistema = "Linux";

    const tablet = /ipad|tablet|playbook|silk/.test(texto) || (/macintosh/.test(texto) && navigator.maxTouchPoints > 1);
    const celular = navigator.userAgentData?.mobile === true || /iphone|ipod|android.*mobile|windows phone/.test(texto);
    const largura = window.innerWidth || document.documentElement.clientWidth;
    const toque = window.matchMedia?.("(pointer: coarse)").matches || navigator.maxTouchPoints > 1;
    const dispositivo = tablet ? "Tablet" : celular ? "Celular" : (toque && largura <= 860 ? "Dispositivo móvel" : "Computador");

    document.documentElement.dataset.plataforma = sistema.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    document.documentElement.dataset.dispositivo = dispositivo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    document.body.dataset.plataforma = document.documentElement.dataset.plataforma;
    document.body.dataset.dispositivo = document.documentElement.dataset.dispositivo;
    const identificacao = $("#identificacao-plataforma");
    if (identificacao) identificacao.textContent = `Acesso identificado: ${dispositivo} · ${sistema}`;
  }
  identificarPlataforma();
  window.addEventListener("resize", identificarPlataforma, { passive: true });
  window.addEventListener("orientationchange", identificarPlataforma, { passive: true });

  // Menu compacto para celular e tablet; fecha após a seleção ou com Escape.
  const botaoMenu = $("#abrir-menu");
  const menuMobile = $("#menu-mobile");
  if (botaoMenu && menuMobile) {
    const fecharMenu = () => {
      menuMobile.hidden = true;
      botaoMenu.setAttribute("aria-expanded", "false");
      botaoMenu.setAttribute("aria-label", "Abrir navegação");
    };
    botaoMenu.addEventListener("click", () => {
      const abrir = menuMobile.hidden;
      menuMobile.hidden = !abrir;
      botaoMenu.setAttribute("aria-expanded", String(abrir));
      botaoMenu.setAttribute("aria-label", abrir ? "Fechar navegação" : "Abrir navegação");
    });
    $$("a", menuMobile).forEach((link) => link.addEventListener("click", fecharMenu));
    document.addEventListener("keydown", (evento) => { if (evento.key === "Escape") fecharMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 860) fecharMenu(); }, { passive: true });
  }

  // Barra de progresso e indicação da seção atual.
  const barra = $("#progresso");
  const secoes = $$(".secao[id]");
  const pontos = $$(".indice-lateral .ponto");
  const atualizarRolagem = () => {
    const altura = document.documentElement.scrollHeight - window.innerHeight;
    const percentual = altura > 0 ? (window.scrollY / altura) * 100 : 0;
    barra.style.width = `${Math.min(100, percentual)}%`;
  };
  window.addEventListener("scroll", atualizarRolagem, { passive: true });
  atualizarRolagem();

  const observadorSecoes = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const indice = secoes.findIndex((secao) => secao.id === entrada.target.id);
      pontos.forEach((ponto, i) => ponto.classList.toggle("ativo", i === indice));
    });
  }, { rootMargin: "-42% 0px -42% 0px" });
  secoes.forEach((secao) => observadorSecoes.observe(secao));

  // Animação discreta de entrada dos blocos.
  const observadorRevelar = new IntersectionObserver((entradas, observador) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.08 });
  $$(".revelar").forEach((elemento) => observadorRevelar.observe(elemento));

  // Modo apresentação: reduz elementos de navegação e deixa o conteúdo em destaque.
  $("#alternar-modo").addEventListener("click", () => {
    document.body.classList.toggle("modo-apresentacao");
    const ligado = document.body.classList.contains("modo-apresentacao");
    $("#alternar-modo").innerHTML = ligado ? "<span aria-hidden='true'>◉</span> Sair da apresentação" : "<span aria-hidden='true'>◉</span> Modo apresentação";
    mostrarAviso(ligado ? "Modo apresentação ativado" : "Modo de leitura ativado");
  });



  // Visualizador de fotografias: abre a imagem original em tamanho ampliado.
  // Funciona com clique, toque e teclado (Enter/Espaço).
  const imagensAmpliaveis = $$("main img").filter((img) =>
    !img.closest(".marca") && !img.closest("#qr-imagem") && !img.hasAttribute("data-sem-ampliacao")
  );
  const visualizador = document.createElement("div");
  visualizador.className = "visualizador-foto";
  visualizador.id = "visualizador-foto";
  visualizador.setAttribute("role", "dialog");
  visualizador.setAttribute("aria-modal", "true");
  visualizador.setAttribute("aria-label", "Visualização ampliada da imagem");
  visualizador.setAttribute("aria-hidden", "true");
  visualizador.innerHTML = `
    <div class="visualizador-painel">
      <button class="visualizador-fechar" type="button" aria-label="Fechar imagem ampliada">×</button>
      <div class="visualizador-conteudo"><img class="visualizador-imagem" alt=""></div>
      <p class="visualizador-legenda"></p>
      <span class="visualizador-ajuda">Toque fora da imagem ou pressione Esc para fechar</span>
    </div>`;
  document.body.appendChild(visualizador);
  const imagemAmpliada = $(".visualizador-imagem", visualizador);
  const legendaAmpliada = $(".visualizador-legenda", visualizador);
  const fecharAmpliacao = $(".visualizador-fechar", visualizador);
  let imagemAnterior = null;

  function fecharVisualizador() {
    if (visualizador.getAttribute("aria-hidden") === "true") return;
    visualizador.classList.remove("aberto");
    visualizador.setAttribute("aria-hidden", "true");
    document.body.classList.remove("imagem-ampliada-aberta");
    imagemAmpliada.removeAttribute("src");
    if (imagemAnterior) imagemAnterior.focus();
  }
  function abrirVisualizador(img) {
    imagemAnterior = img;
    imagemAmpliada.src = img.currentSrc || img.src;
    imagemAmpliada.alt = img.alt || "Fotografia ampliada";
    const legenda = img.closest("figure")?.querySelector("figcaption");
    legendaAmpliada.textContent = legenda
      ? legenda.querySelector("strong")?.textContent || legenda.textContent.trim()
      : (img.alt || "Imagem ampliada");
    legendaAmpliada.hidden = !legendaAmpliada.textContent;
    visualizador.classList.add("aberto");
    visualizador.setAttribute("aria-hidden", "false");
    document.body.classList.add("imagem-ampliada-aberta");
    fecharAmpliacao.focus();
  }
  imagensAmpliaveis.forEach((img) => {
    img.classList.add("imagem-clicavel");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-haspopup", "dialog");
    img.setAttribute("aria-label", `${img.alt || "Imagem"} — abrir imagem completa`);
    img.addEventListener("click", () => abrirVisualizador(img));
    img.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); abrirVisualizador(img); }
    });
  });
  fecharAmpliacao.addEventListener("click", fecharVisualizador);
  visualizador.addEventListener("click", (evento) => { if (evento.target === visualizador) fecharVisualizador(); });
  document.addEventListener("keydown", (evento) => { if (evento.key === "Escape") fecharVisualizador(); });


  // Questionário interativo.
  const perguntas = [
    { pergunta: "Quantas cartilagens formam o esqueleto laríngeo clássico?", opcoes: ["Seis", "Nove", "Doze", "Dez"], correta: 1, explicacao: "São três cartilagens ímpares e três pares: três mais seis, totalizando nove." },
    { pergunta: "Qual osso fica acima da laringe, mas não faz parte das nove cartilagens?", opcoes: ["Osso hioide", "Esterno", "Mandíbula", "Clavícula"], correta: 0, explicacao: "O osso hioide fica superiormente relacionado à laringe e conecta-se a ela por membranas e músculos." },
    { pergunta: "Qual cartilagem forma um anel completo ao redor da via aérea?", opcoes: ["Tireóidea", "Epiglote", "Cricóidea", "Aritenóidea"], correta: 2, explicacao: "A cricóidea é a única cartilagem laríngea que circunda completamente a via aérea." },
    { pergunta: "Qual articulação permite movimentos que ajustam a tensão das pregas vocais?", opcoes: ["Cricoaritenóidea", "Cricotireóidea", "Temporomandibular", "Atlantoaxial"], correta: 1, explicacao: "A articulação cricotireóidea permite inclinação e deslizamento entre as cartilagens tireóidea e cricóidea." },
    { pergunta: "Qual estrutura vibra para produzir a fonte sonora da voz habitual?", opcoes: ["Epiglote", "Traqueia", "Pregas vocais verdadeiras", "Cartilagem tireóidea"], correta: 2, explicacao: "As pregas vocais verdadeiras aproximam-se e vibram com a passagem do ar expiratório." },
    { pergunta: "Qual músculo intrínseco é o único abdutor direto das pregas vocais?", opcoes: ["Cricotireóideo", "Cricoaritenóideo posterior", "Tireoaritenóideo", "Cricoaritenóideo lateral"], correta: 1, explicacao: "O cricoaritenóideo posterior promove a abdução, isto é, abre a glote." },
    { pergunta: "Qual hábito aumenta o risco de lesões por fonotrauma?", opcoes: ["Fazer pausas", "Usar amplificação", "Gritar e falar sobre ruído", "Hidratar-se"], correta: 2, explicacao: "Gritar e competir com ruídos elevam a carga vocal e podem favorecer lesões por esforço repetido." },
    { pergunta: "Qual fator é um dos principais riscos para câncer de laringe?", opcoes: ["Tabagismo", "Leitura em voz alta", "Beber água", "Falar baixo"], correta: 0, explicacao: "O tabagismo e o consumo excessivo de álcool são fatores de risco importantes para câncer de laringe." },
    { pergunta: "Qual é a principal fonte de energia para a fonação?", opcoes: ["Movimento da língua", "Epiglote", "Fluxo de ar expiratório", "Cavidade nasal"], correta: 2, explicacao: "O ar expiratório fornece a energia aerodinâmica que sustenta a vibração das pregas vocais." },
    { pergunta: "Quando a rouquidão persistente merece avaliação médica?", opcoes: ["Somente depois de meses", "Quando passa de três semanas", "Nunca, se não houver febre", "Apenas em cantores"], correta: 1, explicacao: "Rouquidão por mais de três semanas, sobretudo sem resfriado, deve ser avaliada. Dificuldade respiratória ou para engolir exige atenção imediata." }
  ];
  let perguntaAtual = 0;
  let respostaEscolhida = null;
  let pontuacao = 0;
  const perguntaTexto = $("#pergunta-texto");
  const opcoesArea = $("#opcoes");
  const explicacao = $("#explicacao");
  const botaoProximo = $("#proxima-pergunta");
  const contador = $("#contador-quiz");
  const progressoQuiz = $("#quiz-progresso");

  function montarPergunta() {
    const item = perguntas[perguntaAtual];
    respostaEscolhida = null;
    contador.textContent = `${String(perguntaAtual + 1).padStart(2, "0")} / ${String(perguntas.length).padStart(2, "0")}`;
    progressoQuiz.style.width = `${((perguntaAtual + 1) / perguntas.length) * 100}%`;
    perguntaTexto.textContent = item.pergunta;
    explicacao.hidden = true;
    explicacao.textContent = "";
    botaoProximo.disabled = true;
    botaoProximo.textContent = "Responder";
    opcoesArea.innerHTML = "";
    item.opcoes.forEach((opcao, indice) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "opcao";
      botao.innerHTML = `<span class="letra-opcao">${String.fromCharCode(65 + indice)}</span><span></span>`;
      $("span:last-child", botao).textContent = opcao;
      botao.addEventListener("click", () => {
        if (respostaEscolhida !== null) return;
        respostaEscolhida = indice;
        $$(".opcao", opcoesArea).forEach((el, i) => el.classList.toggle("selecionada", i === indice));
        botaoProximo.disabled = false;
        botaoProximo.textContent = "Conferir resposta";
      });
      opcoesArea.appendChild(botao);
    });
  }

  botaoProximo.addEventListener("click", () => {
    const item = perguntas[perguntaAtual];
    if (respostaEscolhida === null) return;
    if (botaoProximo.textContent === "Conferir resposta") {
      const acertou = respostaEscolhida === item.correta;
      if (acertou) pontuacao++;
      $$(".opcao", opcoesArea).forEach((el, i) => {
        el.disabled = true;
        if (i === item.correta) el.classList.add("correta");
        if (i === respostaEscolhida && !acertou) el.classList.add("incorreta");
      });
      explicacao.textContent = `${acertou ? "Muito bem!" : "Vamos revisar."} ${item.explicacao}`;
      explicacao.hidden = false;
      botaoProximo.textContent = perguntaAtual === perguntas.length - 1 ? "Ver resultado" : "Próxima pergunta";
    } else if (perguntaAtual < perguntas.length - 1) {
      perguntaAtual++;
      montarPergunta();
    } else {
      $("#pergunta-area").hidden = true;
      const resultado = $("#resultado-quiz");
      resultado.hidden = false;
      resultado.innerHTML = `<div class="resultado-final"><strong>${pontuacao}/${perguntas.length}</strong><h3>${pontuacao === perguntas.length ? "Excelente domínio!" : pontuacao >= 7 ? "Bom trabalho!" : "Hora de revisar!"}</h3><p>${pontuacao === perguntas.length ? "Você dominou os conceitos essenciais da estrutura laríngea, da prevenção e da produção vocal." : "Volte aos tópicos destacados e tente novamente. A compreensão vem com a revisão."}</p><button class="botao botao-destaque" id="refazer-quiz" type="button">Refazer questionário</button></div>`;
      $("#refazer-quiz").addEventListener("click", () => {
        perguntaAtual = 0; pontuacao = 0;
        resultado.hidden = true;
        $("#pergunta-area").hidden = false;
        montarPergunta();
      });
    }
  });
  montarPergunta();

  // código QR: usa o endereço atual quando o site estiver publicado.
  const campoUrl = $("#url-publica");
  const areaQr = $("#qr-imagem");
  const botaoBaixar = $("#baixar-qr");
  let qrAtual = null;
  if (location.protocol === "https:" || location.protocol === "http:") {
    campoUrl.value = location.href.split("#")[0];
  }

  function gerarQr() {
    const endereco = campoUrl.value.trim();
    if (!endereco) {
      mostrarAviso("Cole o endereço público da página primeiro.");
      campoUrl.focus();
      return;
    }
    try {
      const url = new URL(endereco);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Endereço inválido");
      if (typeof QRCode === "undefined") {
        mostrarAviso("Não foi possível carregar o gerador de código QR. Verifique sua conexão.");
        return;
      }
      areaQr.innerHTML = "";
      qrAtual = new QRCode(areaQr, { text: url.href, width: 190, height: 190, colorDark: "#18221c", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
      botaoBaixar.disabled = false;
      mostrarAviso("código QR gerado!");
    } catch (erro) {
      mostrarAviso("Confira se o endereço começa com https://");
    }
  }
  $("#gerar-qr").addEventListener("click", gerarQr);
  campoUrl.addEventListener("keydown", (evento) => { if (evento.key === "Enter") gerarQr(); });
  botaoBaixar.addEventListener("click", () => {
    const canvas = $("canvas", areaQr);
    const imagem = $("img", areaQr);
    const fonte = canvas ? canvas.toDataURL("image/png") : imagem ? imagem.src : null;
    if (!fonte) return;
    const link = document.createElement("a");
    link.href = fonte;
    link.download = "qr-code-laringe-e-voz.png";
    link.click();
  });
  $("#copiar-endereco").addEventListener("click", async () => {
    const endereco = campoUrl.value.trim();
    if (!endereco) { mostrarAviso("Informe o endereço público primeiro."); return; }
    try {
      await navigator.clipboard.writeText(endereco);
      mostrarAviso("Endereço copiado!");
    } catch {
      campoUrl.select();
      mostrarAviso("Selecione e copie o endereço.");
    }
  });

  let temporizadorAviso;
  function mostrarAviso(mensagem) {
    const aviso = $("#aviso");
    aviso.textContent = mensagem;
    aviso.classList.add("visivel");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove("visivel"), 2600);
  }
})();
