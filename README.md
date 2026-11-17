# Laringe & Voz — Grau Técnico | Radiologia

Portal acadêmico responsivo em português brasileiro, com identidade visual baseada na capa autoral de Radiologia do Grau Técnico enviada para o projeto.

## Importante: prepare as fotografias antes de publicar

Este pacote é o **preparador da versão 5.0**. As imagens foram selecionadas e as páginas já apontam para arquivos locais em `assets/fotos/`, mas o ambiente em que este pacote foi montado não conseguiu transferir os arquivos binários da internet para dentro do ZIP. Para não fingir que as fotografias estão incorporadas quando ainda não estão, incluí um instalador de imagens que faz essa etapa no Windows.

1. Extraia o pacote em uma pasta.
2. Dê dois cliques em `PREPARAR-IMAGENS.bat` (ou execute o comando abaixo).
3. O script baixa as fotografias das fontes indicadas, substitui as identificações originais em inglês das peças anatômicas por rótulos em português, grava os títulos e as legendas em português brasileiro diretamente nos arquivos de imagem e valida os caminhos locais.
4. Ao terminar, ele cria `laringe-e-voz-v5-pronto-github.zip` na pasta acima do projeto.
5. **É esse segundo ZIP, gerado pelo script, que deve ser publicado no GitHub Pages.**

Comando alternativo no PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\baixar-e-preparar-imagens.ps1
```

O script `.ps1` está salvo em UTF-8 com BOM para que o Windows PowerShell 5.1 interprete corretamente os acentos (sem transformar `Â`, `Ã` etc. em caracteres inválidos). Execute preferencialmente `PREPARAR-IMAGENS.bat` ou use o comando `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\baixar-e-preparar-imagens.ps1`.

O script requer Windows PowerShell 5.1 ou PowerShell 7 no Windows e conexão com a internet apenas durante a primeira preparação. Depois de geradas, as fotografias ficam dentro de `assets/fotos/` e o site não depende mais do Wikimedia Commons para exibi-las.

## Identidade visual

- Verde principal: `#39A670`
- Verde escuro: `#1B824A`
- Verde vivo: `#00B151`
- Verde profundo: `#376C41`
- Amarelo de destaque: `#FEC000`
- Branco: `#FFFFFF`

O amarelo é usado como cor de destaque. Textos em fundos verdes usam branco ou amarelo; o verde-escuro fica reservado para superfícies claras. O logotipo Grau Técnico está em `assets/grau-tecnico-logo.png`.

## Conteúdo revisado

1. Visão geral, localização e funções da laringe.
2. As nove cartilagens laríngeas: três ímpares e três pares.
3. Osso hioide, arcabouço cartilaginoso, calcificação e ossificação.
4. Articulações, membranas e ligamentos.
5. Supraglote, glote e subglote.
6. Pregas vocais, cobertura, corpo e onda mucosa.
7. Musculatura intrínseca e extrínseca.
8. Inervação pelo nervo vago e seus ramos laríngeos.
9. Doenças e alterações inflamatórias, estruturais, neurológicas, funcionais e oncológicas.
10. Fotografias clínicas de laringite, edema de Reinke e epiglotite.
11. Prevenção, preservação e sinais de alerta.
12. Produção da voz e características acústicas.
13. Curiosidades, demonstração e questionário.

## Fotografias locais previstas

O script prepara dez imagens finais em `assets/fotos/`:

- `laringe-vista-posterior.jpg` — vista posterior de peça anatômica humana dissecada; rótulos originais em inglês cobertos e substituídos por identificações em PT-BR nos mesmos pontos da fotografia.
- `laringe-peca-disecada.jpg` — peça anatômica humana com epiglote e osso hioide; identificações em PT-BR incorporadas diretamente à fotografia.
- `radiografia-ossificacao-laringea.jpg` — radiografia lateral real do pescoço, com calcificação/ossificação da cartilagem tireóidea identificada em PT-BR.
- `laringoscopia-normal.jpg` — imagem endoscópica de laringe em condição habitual, com os sete números originais explicados em português brasileiro dentro da própria fotografia.
- `pregas-inspiracao.jpg` e `pregas-fonacao.jpg` — fotografias endoscópicas reais recortadas da composição original, sem os desenhos e rótulos em inglês.
- `lesoes-pregas-vocais.jpg` — registros clínicos de alterações císticas e cicatriciais.
- `laringite.jpg`, `edema-reinke.jpg` e `epiglotite.jpg` — fotografias clínicas endoscópicas.

Os títulos e as identificações em português são gravados diretamente nas fotografias pelo script. Nas peças dissecadas, os rótulos em inglês são substituídos nos pontos originais; nas demais imagens, é aplicada uma faixa verde-escura com texto branco e detalhe amarelo. Assim, as legendas continuam legíveis em telas pequenas e não dependem de uma sobreposição HTML para aparecer.

## Créditos e licenças das fotografias

Consulte `ASSETS-CREDITOS.md`. As fotografias são baixadas de suas páginas de origem no Wikimedia Commons. Os arquivos adaptados mantêm a licença aplicável à respectiva obra; os créditos e as alterações (recorte e identificação em PT-BR) são documentados.

## Responsividade e identificação da plataforma

- Layout fluido para computador, tablet e celular.
- CSS responsivo define a disposição conforme a largura disponível; não depende apenas da identificação do sistema operacional.
- O JavaScript identifica sistema operacional e categoria provável do dispositivo quando o navegador fornece dados suficientes.
- Menu compacto em telas menores, suporte a toque, teclado e tecla Escape.
- Modo apresentação, barra de progresso, navegação por seções, questionário e gerador de código QR.

## Como publicar no GitHub Pages

1. Extraia o pacote preparador.
2. Execute `PREPARAR-IMAGENS.bat` e aguarde a mensagem de sucesso.
3. Abra o arquivo `laringe-e-voz-v5-pronto-github.zip` gerado pelo script e confira se ele contém a pasta `assets/fotos/` com as dez imagens.
4. Extraia o ZIP final e envie o conteúdo para a raiz do repositório (incluindo `index.html`, `styles.css`, `app.js` e `assets/`).
5. Em **Settings → Pages**, selecione **Deploy from a branch**, branch `main` e pasta `/ (root)`.
6. Depois da publicação, abra a página, vá até a seção do código QR e gere o código com o endereço público.

## Observações acadêmicas

- A laringe tem arcabouço cartilaginoso; o osso hioide fica superiormente relacionado a ela, mas não integra as nove cartilagens laríngeas.
- A radiografia apresentada demonstra calcificação/ossificação acentuada da cartilagem tireóidea. O achado, isoladamente, não estabelece doença.
- A proteção da via aérea durante a deglutição é coordenada: elevação do complexo hio-laríngeo, fechamento laríngeo e mecanismos faríngeos atuam em conjunto. Não se deve atribuir todo o fechamento apenas à epiglote.
- Fotografias estáticas não demonstram a onda mucosa em movimento. Para avaliar a vibração, pode ser indicada videolaringoestroboscopia.
- As informações sobre doenças e sinais de alerta não substituem avaliação médica ou fonoaudiológica.

## Dependências externas remanescentes

As fotografias deixam de depender de servidores externos depois da preparação. As fontes tipográficas e a biblioteca de código QR ainda são carregadas por serviços externos; o site continua funcionando com fontes de sistema se a tipografia remota não carregar, mas a geração do QR depende da biblioteca de QR Code.


## Downloads e erro HTTP 429

O preparador reutiliza imagens validas que ja estejam em `.imagens-originais-temporarias`, aguarda entre requisicoes e repete falhas temporarias (incluindo HTTP 429) com espera progressiva. Se uma imagem continuar indisponivel, os arquivos ja baixados sao preservados. Execute `PREPARAR-IMAGENS.bat` novamente mais tarde para continuar sem baixar tudo de novo.


## Revisão visual das fotografias

Nesta revisão, as fotografias anatômicas anotadas passam a ser exibidas integralmente, sem zoom/corte que esconda rótulos. As imagens de inspiração e fonação também preservam a identificação já incorporada. O acabamento usa os verdes e o amarelo da identidade Grau Técnico.
