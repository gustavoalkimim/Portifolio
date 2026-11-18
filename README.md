# 🎮 Portfólio em interface de console

Portfólio bilíngue (PT/EN) de **Gustavo Henrique Santos e Silva**, estudante de Ciência da Computação na PUC Minas, com uma experiência inspirada em consoles: abertura com marca própria, Início com trilhos de cartões, Guia lateral, biblioteca, vitrine, busca, conquistas e quatro jogos autorais. Feito em **HTML, CSS e JavaScript puros**, sem framework e sem etapa de build, para a disciplina de Desenvolvimento de Interfaces Web (DIW).

Esta versão evolui o portfólio publicado em https://gustavoalkimim.github.io/Portifolio/ seguindo a especificação em [`PLANO_PORTFOLIO_XBOX.md`](PLANO_PORTFOLIO_XBOX.md) e o mapa [`mapa-xbox-portfolio.svg`](mapa-xbox-portfolio.svg).

> Projeto pessoal e acadêmico. **Não é um produto da Microsoft nem do Xbox** e não tem vínculo com essas marcas. Marca, ícones, sons, artes e jogos são próprios; nenhum logo, som, ícone, capa ou recurso oficial foi usado.

## Índice

- [Como rodar](#como-rodar)
- [O que tem no site](#o-que-tem-no-site)
- [Rotas](#rotas)
- [Comandos](#comandos)
- [Arquitetura](#arquitetura)
- [Dados e privacidade](#dados-e-privacidade)
- [Formulário (EmailJS)](#formulário-emailjs)
- [Jogos](#jogos)
- [Testes realizados](#testes-realizados)
- [O que não foi verificado](#o-que-não-foi-verificado)
- [Limitações conhecidas](#limitações-conhecidas)
- [Decisões tomadas](#decisões-tomadas)
- [Publicação no GitHub Pages](#publicação-no-github-pages)
- [Créditos e licenças](#créditos-e-licenças)

## Como rodar

Não há dependências nem build. Como o site usa módulos ES (`<script type="module">`), ele precisa ser aberto por HTTP, não por `file://`.

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abra http://127.0.0.1:8000/. Para simular exatamente o GitHub Pages (site dentro de `/Portifolio/`), rode o comando na **pasta-mãe** e abra http://127.0.0.1:8000/Portifolio/. A extensão Live Server do VS Code também funciona.

Sem JavaScript, o `index.html` mostra uma versão básica com perfil, projetos, experiência e contatos.

## O que tem no site

| Área | O que faz |
| --- | --- |
| Abertura | Animação própria em SVG/CSS (anel, traço e nome). "Pular abertura", "Modo simples" e "Ajuda" existem desde o primeiro quadro; Enter, Espaço, Esc, toque, A ou B pulam. Com movimento reduzido ou "não mostrar abertura", ela é pulada. Uma rota profunda (`#/projetos/hub`) é preservada. |
| Início | Destaque do item em foco, trilho "Fixados e recentes" (ou "Destaques" sem histórico), trilho de atalhos permanentes (Projetos, Sobre mim, Experiências, Contato, Jogos, Ajuda) e grupos: projetos em ordem cronológica, jogos, tecnologias e contato. |
| Biblioteca | Abas Todos/Projetos/Jogos, filtros por tecnologia e ano, ordenação (cronologia, nome, acesso recente), filtro de texto sem acento, contagem real e estado vazio com "Limpar filtros". Filtros e foco são preservados ao voltar de uma ficha. |
| Vitrine | Os mesmos dados da biblioteca em destaque. Nada de preço, compra ou assinatura. |
| Ficha de projeto | Descrição, observação real (dados simulados, MVP, protótipo), aviso de repositório privado (Hub), data com fonte, situação, tecnologias (que filtram a biblioteca), galeria, fixar, compartilhar/copiar link. Campos sem fonte (por exemplo "papel") são omitidos. |
| Ficha de jogo | Objetivo, controles por dispositivo, recordes locais e o botão Jogar, que só então carrega o módulo do jogo. |
| Perfil e Jornada | Foto, apresentação, formação, interesses, objetivos e contatos; experiência e linha do tempo antiga → recente. Formação e experiência só têm o ano na fonte, então ficam numa trilha separada dos projetos (que têm mês). |
| Conquistas | Marcos da trajetória (com fonte) separados das conquistas locais dos jogos, que podem ser apagadas. |
| Capturas | Galeria das imagens reais dos projetos, com origem e licença; visualizador com anterior/próxima, ampliar e fechar por teclado. |
| Contato | E-mail, WhatsApp, LinkedIn e GitHub reais e formulário EmailJS. |
| Guia | Painel lateral com abas Início, Biblioteca, Pessoas, Mensagens, Conquistas, Capturas, Notificações e Perfil/sistema. Foco preso; Esc/B fecha só a camada de cima e devolve o foco. |
| Busca | Local, sem acento e sem maiúsculas, nos dois idiomas; projetos, jogos, experiência, seções e configurações; filtro por tipo; sugestões reais quando vazia. Nada é enviado para fora. |
| Notificações | Só eventos reais da sessão: envio do formulário, conquista, fim de partida, preferências salvas, falha de mídia, armazenamento indisponível, controle conectado/desconectado. Marcar como lida e limpar. |
| Configurações | Idioma, modo (console/simples), tema, cor de realce, contraste, tamanho do texto, duração dos avisos, fundo dinâmico e arte padrão, movimento, abertura, áudio e volumes, zona morta do analógico, lado do Guia e limpeza de dados locais por categoria. Prévia imediata com **Aplicar/Cancelar**; sair com pendências pergunta. |
| Ajuda | Comandos por teclado, controle e toque; ajustes rápidos de acessibilidade; controles de cada jogo; índice com links permanentes. |
| Modo simples | Página convencional com perfil, projetos, experiência e formulário, sem trilhos nem fundos. |

## Rotas

Rotas por hash, compatíveis com GitHub Pages em subpasta. Voltar/avançar do navegador funcionam; o botão Voltar do site segue o caminho percorrido e, na primeira tela visitada, vai para um destino seguro.

`#/inicio` · `#/biblioteca` (aceita `?tipo=projeto|jogo`, `?tec=React`, `?ano=2026`) · `#/vitrine` · `#/projetos/{fisiogrip|petvet|hub}` · `#/jogos/{snake|memoria|nave|labirinto}` · `#/perfil` · `#/experiencias` · `#/conquistas` · `#/capturas` · `#/contato` · `#/ajuda` · `#/configuracoes` (aceita `?secao=…`).

Endereço desconhecido ou ID inexistente abre a página de recuperação com links para Início e Biblioteca. As âncoras do site antigo (`#sobre`, `#projetos`, `#experiencias`, `#contato`) continuam funcionando.

## Comandos

| Ação | Teclado | Controle | Toque |
| --- | --- | --- | --- |
| Navegar | Setas (Tab também) | Direcional ou analógico | Tocar / arrastar |
| Abrir | Enter ou Espaço | A | Tocar |
| Voltar / fechar camada | Esc ou Backspace | B | Botão Voltar |
| Guia | G | Menu ou View | Botão ☰ |
| Busca | / ou Ctrl+K | Y | Botão de busca |
| Opções do cartão | M ou Shift+F10 | X | Botão ⋯ do cartão |
| Trocar aba do Guia | ← → | LB / RB | Tocar na aba |
| Ajuda | ? | — | Link "Ajuda" |

Atalhos de letra não agem enquanto se digita num campo. O botão central do controle não é usado.

## Arquitetura

```text
index.html            Estrutura, abertura, camadas e conteúdo básico (sem JS)
style.css             Tokens, componentes, telas, sobreposições, jogos, responsivo
script.js             Ponto de entrada: liga serviços, entrada e interface
src/
  dados/              Conteúdo e textos (fonte única do que aparece no site)
    perfil.js  projetos.js  experiencias.js  jogos.js  paineis.js  traducoes.js
  servicos/           Lógica sem interface
    armazenamento.js  localStorage versionado, com fallback em memória
    preferencias.js   padrões, normalização, prévia reversível
    rotas.js          roteador por hash com pilha de navegação e guarda de saída
    catalogo.js       projetos + jogos, filtros e busca sem acento
    historico.js      recentes e fixados (só IDs e datas)
    recordes.js       recordes e conquistas locais por jogo/versão/variante
    notificacoes.js   central de eventos reais da sessão
    fundo.js          fundo em duas camadas com invalidação de pedidos
    audio.js          Web Audio, desligado por padrão
    email.js          EmailJS: validação e envio com resultados normalizados
    i18n.js           t(), tx() e formatação de datas/horas
  entrada/            Teclado, Gamepad API, toque e foco espacial
    acoes.js  foco.js  teclado.js  controle.js  toque.js
  interface/          Telas e componentes
    casca.js (cabeçalho, dicas, montagem de telas)  sobreposicoes.js  componentes.js
    home.js  biblioteca.js  vitrine.js  detalhe.js  jogo.js  palco.js  galeria.js
    perfil.js  experiencias.js  conquistas.js  capturas.js  contato.js
    guia.js  busca.js  ajuda.js  configuracoes.js  recuperacao.js  simples.js
    avisos.js  abertura.js  dom.js
  jogos/              Carregados sob demanda (import dinâmico)
    comum.js  snake.js  memoria.js  nave.js  labirinto.js
assets/
  fonts/              Geist e Geist Mono (SIL OFL 1.1)
  images/             Foto e capturas reais dos projetos; fundos/ e jogos/ são artes próprias em SVG
  icons/favicon.svg   Marca própria
docs/                 Licença da captura do Fisiogrip, wireframes e capturas da versão anterior
```

Pontos de projeto:

- **Foco DOM = foco visual.** O controlador espacial (`entrada/foco.js`) move o foco real com `focus()`; o contorno verde é `:focus-visible`. Regiões guardam o último item; faixas horizontais não deixam ← → escapar.
- **Pilha de sobreposições.** Tela → Guia/busca → menu → confirmação. As camadas de baixo ficam `inert`; Esc/B fecha só a de cima; o foco volta ao gatilho.
- **Fundos.** Duas camadas trocadas só por `opacity`; a nova imagem carrega e decodifica antes; cada pedido invalida os anteriores (A → B → C termina em C); falha mantém o fundo anterior.
- **Texto seguro.** Todo conteúdo entra por `textContent`; links passam por uma lista de protocolos permitidos (`http`, `https`, `mailto`) e abrem com `rel="noopener noreferrer"`.
- **Jogos** exportam `meta` e `criar(contexto)`, que devolve `iniciar`, `pausar`, `retomar`, `destruir` e `entrada`. O palco comum cuida de menu, opções, HUD, pausa, resultado, recordes, controles e limpeza.

## Dados e privacidade

Todo o conteúdo veio do portfólio publicado e do seu README/Figma: textos PT/EN, foto, projetos (Fisiogrip, PetVet, Hub de Estudos), experiência, links e IDs do EmailJS. **Nada foi inventado**: não há métricas, avaliações, papéis, datas ou conquistas sem fonte. As datas dos projetos são os meses de apresentação do Figma, e isso aparece na ficha.

O navegador guarda apenas, em `localStorage` (prefixo `portfolio-console.`, com versão): preferências, recentes, fixados, recordes, conquistas e opções dos jogos. Sem cookies, contas, analítica ou rastreadores. **Nada digitado no formulário é guardado.** Se o armazenamento estiver bloqueado, cheio ou com dados inválidos, tudo continua funcionando em memória e o site avisa uma vez. Configurações → Dados locais apaga cada categoria separadamente.

Para adicionar um projeto, inclua um registro em `src/dados/projetos.js` (id, título, descrições PT/EN, data, estado, tecnologias, links, mídias com origem e licença) e a imagem em `assets/images/`. Biblioteca, vitrine, busca, ficha, jornada, galeria e modo simples passam a mostrá-lo.

## Formulário (EmailJS)

A integração e os identificadores públicos são os mesmos do site anterior, agora em `src/servicos/email.js`:

```js
serviceId: 'service_j8x2n98', templateId: 'template_zopdxbp', publicKey: 'DE3aJQUg4Su63Vq9E'
```

O destinatário é definido no template da conta EmailJS, não no código. Não há senha nem chave privada no cliente.

Estados: editando → enviando → aceito | recusado | limitado | sem rede | **resultado desconhecido**. Validação de presença, formato e limites, com erro ao lado de cada campo e foco no primeiro erro; botão desabilitado e campos somente leitura durante o envio (sem duplicar); "Cancelar a espera" explica que não garante cancelar no serviço; em timeout ou falha de rede aparece "Não foi possível confirmar o envio; verifique antes de tentar novamente" e nada é reenviado sozinho. Em erro os campos são preservados (inclusive ao trocar de idioma). Em sucesso a mensagem diz que o serviço **aceitou** — a leitura depende do destinatário — e os campos são limpos. Sair da tela com texto digitado pergunta antes.

## Jogos

Todos são próprios, em Canvas 2D ou DOM, sem Phaser, Three.js ou recursos de terceiros. Cada um tem menu, opções, instruções por dispositivo, pausa (P, Esc, B, botão Pausar, perda de foco da janela, aba oculta e desconexão do controle), retomada só por ação do visitante, reinício e saída com confirmação, vitória/derrota, recorde local e limpeza total de laços, ouvintes, pointer lock e áudio ao sair.

| Jogo | Regras | Opções |
| --- | --- | --- |
| Snake do código | Passo fixo independente da taxa de quadros; fila de direção limitada; sem inversão de 180°; alimento só em célula livre; grade cheia = vitória. | Velocidade (variante do recorde), contraste da grade |
| Memória de tecnologias | Cartas são botões com forma e nome (nunca só cor); terceira carta bloqueada durante a comparação; rótulos acessíveis não revelam cartas fechadas; tempo congela na pausa. | 12/16/20 cartas, temporizador |
| Nave arcade | 5 fases determinísticas (10 + 4×fase obstáculos, mais rápidos); obstáculos resistentes com contorno duplo; vidas; escudo de 2 s sinalizado por anel estável e texto no HUD, sem piscar; limites de entidades. | Fácil/Normal/Difícil |
| Labirinto 2.5D | Raycasting (DDA) em Canvas 2D com correção de perspectiva, texturas procedurais próprias, colisão pelo raio do jogador com deslizamento, 3 chaves, porta e saída. O mapa é verificado por busca em largura antes de cada partida. | Limite de tempo, sensibilidade, inversão do giro, campo de visão, qualidade reduzida, minimapa, mouse opcional (pointer lock só com clique) |

As tecnologias da Memória ilustram o jogo e não comprovam habilidade profissional. Recordes valem só no navegador ("não há ranking online").

## Testes realizados

Feitos em 18/11/2026 no navegador embutido do aplicativo Claude (Chromium), servindo a pasta-mãe para reproduzir o caminho `/Portifolio/` do GitHub Pages.

| Verificação | Resultado |
| --- | --- |
| 25 rotas diretas, incluindo IDs inválidos, caracteres especiais (`%E0%A4%A`, `<script>`) e âncoras antigas | Todas abrem conteúdo ou a recuperação; título da página correto |
| Abertura | "Pular" com foco no primeiro instante; Enter pula; termina sozinha; com movimento reduzido é pulada; rota profunda mantida após recarregar |
| Navegação por teclado | Setas entre cartões e trilhos, Tab, Enter, Esc, G, /, M; foco DOM e contorno verde sincronizados |
| Guia | 8 abas com conteúdo, ← → trocam aba, foco preso, galeria aberta por cima e Esc fechando só ela, foco devolvido ao cartão |
| Busca | "react", "audio", "startup", "saude" (sem acento), sem resultado, consulta restaurada ao reabrir; G não abre o Guia enquanto se digita |
| Biblioteca | Abas, filtros combinados, ordenação, estado vazio, limpar, voltar da ficha com filtro e foco preservados, voltar/avançar do navegador |
| Menu do cartão e fixar | Ações reais apenas; fixar põe o item no início do trilho mantendo o foco |
| Voltar | Cadeia Início → Perfil → Jornada → Hub e volta pelo mesmo caminho; Esc/B depois de abrir um cartão volta ao Início |
| Idiomas | Troca PT/EN em todas as telas e abas do Guia sem nenhum texto de interface remanescente no outro idioma; `lang` e título mudam |
| Configurações | Prévia de tema/contraste/realce sem gravar; Cancelar desfaz; Aplicar grava; sair com pendência pergunta (Continuar/Descartar/Aplicar) |
| Outra aba | Mudança de preferência via evento `storage` refletida sem recarregar |
| Armazenamento bloqueado | `setItem/getItem` lançando erro: preferências, recentes, fixados e recordes seguem em memória; um único aviso |
| JSON inválido no `localStorage` | Ignorado com valores padrão, sem quebrar |
| Fundos | A → B → C rápido termina em C; resposta tardia descartada; imagem 404 mantém o fundo anterior; fundo restaurado ao sair dos cartões; fundo estático ignora prévias; Guia não troca o fundo; ficha fixa a própria arte |
| Imagem 404 num cartão | Cartão vira cor + ícone, continua clicável e gera aviso |
| Formulário (respostas **simuladas**, sem envio real) | Campos vazios, só espaços e e-mail inválido rejeitados; 400, 429, falha de rede, timeout/cancelamento (resultado desconhecido) e sucesso; duplo envio bloqueado; campos preservados no erro e ao trocar idioma; limpos no sucesso; nada no `localStorage` |
| Snake | Partida com robô que lê o canvas: 14 pontos, derrota, recorde e conquista; pausa por P, Esc, botão e perda de foco; sair com confirmação sem deixar laço ativo |
| Memória | Vitória em 12 tentativas com temporizador; terceira carta bloqueada; rótulos acessíveis corretos |
| Nave | Até a fase 3, 410 pontos, escudo sinalizado, derrota e conquista |
| Labirinto | Vitória com 3 chaves, porta aberta e saída (relógio de quadros controlado pelo teste); render do raycasting conferido em captura |
| Controle (Gamepad API **simulada**) | Direcional, analógico com zona morta, repetição ao segurar, A abre, B volta, Menu abre o Guia, RB troca aba, dicas A/B/X/Y aparecem; desconectar pausa o jogo e não retoma sozinho ao reconectar |
| Toque | Direcional virtual da Snake move a cobra; botão Pausar funciona |
| Larguras 320, 375, 768, 1024 e 1600 px | Nenhum transbordamento horizontal em 14 telas |
| Modo simples e conteúdo sem JS | Modo simples com perfil, projetos, experiência e formulário; conteúdo básico visível sem a classe `js` |
| Arquivos | Todos os 18 arquivos de mídia/fonte e todos os módulos respondem 200 |

## O que não foi verificado

- **Envio real pelo EmailJS** e recebimento na caixa de entrada: por decisão, nenhum e-mail de teste foi enviado. O código de envio é o mesmo contrato do site anterior, onde o envio real foi confirmado em 13/10/2026.
- **Controle físico**: só foi testado com uma Gamepad API simulada. Mapeamento e botões variam por navegador e aparelho.
- **Leitor de tela real** (NVDA, VoiceOver, TalkBack): os rótulos, regiões `aria-live`, diálogos e `inert` foram conferidos no DOM, mas não com leitor de tela.
- **Aparelho celular real** e outros navegadores (Firefox, Safari): testado apenas com emulação de tela e toque no Chromium.
- **Zoom de 200%**, Core Web Vitals e desempenho em hardware fraco não foram medidos.
- **Áudio**: os sons são sintetizados e começam desligados; não houve verificação auditiva.
- Animações e transições: no navegador de teste a janela ficava fora de vista, o que suspende quadros; o comportamento lógico foi testado, a suavidade visual não.

## Limitações conhecidas

- O repositório do Hub de Estudos é **privado**; o link pede autorização de acesso (o site avisa isso).
- Recordes, conquistas, recentes e fixados existem só no navegador; não há conta nem sincronização.
- O índice da busca e as conquistas profissionais derivam dos dados existentes; adicionar fontes novas exige editar `src/dados/`.
- Mudar o idioma no meio de uma partida atualiza o HUD, mas o painel de pausa já aberto só muda ao ser reaberto.
- Textos dentro das capturas dos projetos pertencem aos projetos originais e não são traduzidos.
- O Bootstrap do site anterior não é mais carregado; o visual é todo CSS próprio.

## Decisões tomadas

- **Módulos ES** em `src/` (com `index.html`, `style.css` e `script.js` na raiz), como no modelo de arquitetura da especificação.
- **Marca própria** na abertura e no favicon; nenhuma marca, som ou ícone oficial.
- **Vitrine** sem comércio; **Guia** com nomes próprios de abas (adaptação, não reprodução).
- **Jornada** separa formação/experiência (só ano na fonte) dos projetos (mês na fonte), para não inventar ordem.
- **Busca bilíngue**: um termo em inglês encontra o conteúdo mesmo com o site em português, e vice-versa.
- **Notificações em memória**: só da sessão atual, para não guardar histórico de envios.
- **Sucesso do formulário limpa os campos**; erro e resultado desconhecido preservam.
- **Labirinto**: mapa único, verificado por busca em largura antes de cada partida.

## Publicação no GitHub Pages

Repositório: https://github.com/gustavoalkimim/Portifolio — esta versão fica na branch **`xbox-portifolio`**. O GitHub Pages do repositório publica essa branch, na raiz, em:

**https://gustavoalkimim.github.io/Portifolio/**

Para encontrar o link pelo GitHub: abra o repositório → **Settings** → **Pages** (menu lateral, seção "Code and automation"): o endereço aparece em "Your site is live at", com o botão **Visit site**. Também dá para achar pela página inicial do repositório: na coluna da direita, **Deployments** → **github-pages** mostra o último deploy com o link.

Para voltar a publicar a versão anterior, em Settings → Pages troque "Branch" de `xbox-portifolio` para `main` e salve.

## Créditos e licenças

- Código e conteúdo do portfólio: Gustavo Henrique Santos e Silva — licença MIT ([LICENSE](LICENSE)).
- Fontes Geist e Geist Mono (Vercel): SIL Open Font License 1.1 — [assets/fonts/OFL.txt](assets/fonts/OFL.txt).
- Captura do Fisiogrip (FisioGrasp), do repositório [Mavilaa/Fisiogrip](https://github.com/Mavilaa/Fisiogrip): MIT — [docs/licencas/LICENCA_FISIOGRIP.txt](docs/licencas/LICENCA_FISIOGRIP.txt).
- Capturas do PetVet e do Hub de Estudos: feitas pelo titular, com os projetos em execução local.
- Artes de fundo, capas dos jogos, ícones, favicon, marca da abertura, texturas do labirinto e sons: criados para este projeto.
- Referências de design (não usadas como assets): Xbox Wire e Microsoft Learn, listadas na especificação.
- Professor: Prof. Dr. João Paulo Aramuni, pelas orientações do laboratório.
