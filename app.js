(() => {
  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

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

  // Questionário interativo.
  const perguntas = [
    { pergunta: "Quantas cartilagens formam a laringe?", opcoes: ["Seis", "Nove", "Doze", "Dez"], correta: 1, explicacao: "São três cartilagens ímpares e três pares: três mais seis, totalizando nove." },
    { pergunta: "Qual estrutura vibra para produzir a fonte sonora da voz habitual?", opcoes: ["Epiglote", "Traqueia", "Pregas vocais verdadeiras", "Cartilagem tireóidea"], correta: 2, explicacao: "As pregas vocais verdadeiras aproximam-se e vibram com a passagem do ar expiratório." },
    { pergunta: "Qual músculo intrínseco é o único abdutor direto das pregas vocais?", opcoes: ["Cricotireóideo", "Cricoaritenóideo posterior", "Tireoaritenóideo", "Cricoaritenóideo lateral"], correta: 1, explicacao: "O cricoaritenóideo posterior promove a abdução, isto é, abre a glote." },
    { pergunta: "Qual é a principal fonte de energia para a fonação?", opcoes: ["Movimento da língua", "Epiglote", "Fluxo de ar expiratório", "Cavidade nasal"], correta: 2, explicacao: "O ar expiratório fornece a energia aerodinâmica que, em interação com os tecidos e a musculatura, sustenta a vibração." },
    { pergunta: "Qual parâmetro está diretamente relacionado à percepção de voz grave ou aguda?", opcoes: ["Frequência fundamental", "Formato dos lábios", "Intensidade", "Comprimento da língua"], correta: 0, explicacao: "A frequência fundamental corresponde à repetição dos ciclos vibratórios e está relacionada à altura vocal percebida." }
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
    contador.textContent = `${String(perguntaAtual + 1).padStart(2, "0")} / 05`;
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
      resultado.innerHTML = `<div class="resultado-final"><strong>${pontuacao}/5</strong><h3>${pontuacao === 5 ? "Excelente domínio!" : pontuacao >= 3 ? "Bom trabalho!" : "Hora de revisar!"}</h3><p>${pontuacao === 5 ? "Você dominou os conceitos essenciais da laringe e da produção vocal." : "Volte aos tópicos destacados e tente novamente. A compreensão vem com a revisão."}</p><button class="botao botao-destaque" id="refazer-quiz" type="button">Refazer questionário</button></div>`;
      $("#refazer-quiz").addEventListener("click", () => {
        perguntaAtual = 0; pontuacao = 0;
        resultado.hidden = true;
        $("#pergunta-area").hidden = false;
        montarPergunta();
      });
    }
  });
  montarPergunta();

  // QR Code: usa o endereço atual quando o site estiver publicado.
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
        mostrarAviso("Não foi possível carregar o gerador de QR Code. Verifique sua conexão.");
        return;
      }
      areaQr.innerHTML = "";
      qrAtual = new QRCode(areaQr, { text: url.href, width: 190, height: 190, colorDark: "#18221c", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
      botaoBaixar.disabled = false;
      mostrarAviso("QR Code gerado!");
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
