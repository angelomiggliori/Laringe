# Laringe & Voz — Anatomia e Fisiologia

Site didático interativo, em português brasileiro, com rolagem longa, ilustrações vetoriais próprias, modo apresentação, questionário e gerador de QR Code.

## Como visualizar

1. Extraia o arquivo ZIP.
2. Abra `index.html` no navegador.
3. Para testar o QR Code, publique o projeto primeiro ou cole um endereço público no campo da seção **Uma leitura. Um QR Code.**

O site usa HTML, CSS e JavaScript nativos. Não precisa instalar dependências nem executar um processo de compilação. As ilustrações anatômicas estão desenhadas em SVG dentro da página e têm legendas em português.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `laringe-e-voz`.
2. Envie os arquivos `index.html`, `styles.css`, `app.js` e `README.md` para a raiz do repositório.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`, depois salve.
6. Aguarde a publicação. O endereço normalmente será:
   `https://SEU-USUARIO.github.io/laringe-e-voz/`
7. Abra o endereço publicado. Na seção do QR Code, o endereço atual já será preenchido. Clique em **Gerar** e depois em **Baixar QR Code**.

Se o repositório tiver outro nome, o endereço terá esse nome no final.

## Recursos

- Rolagem contínua com indicador de progresso e navegação por seções.
- Modo apresentação para destacar o conteúdo.
- Ilustrações SVG próprias, com textos em português brasileiro.
- Questionário de revisão com correção e explicação.
- Geração e download de QR Code após a publicação.
- Layout responsivo para celular, tablet e computador.

## Observações

- As ilustrações são esquemáticas e didáticas, não estão em escala anatômica.
- O gerador de QR Code carrega uma pequena biblioteca externa por CDN; por isso, a geração do código exige conexão com a internet.
- As fontes tipográficas também são carregadas pela internet. Sem conexão, o conteúdo continua acessível com fontes alternativas do sistema.
- Material educacional de apoio; não substitui atlas anatômicos, bibliografia especializada ou avaliação profissional.
