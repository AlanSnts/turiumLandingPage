# Turium — Filme 3: "O lucro começa quando você enxerga onde está perdendo"

Motion graphics de **59,5 s** (16:9, 1920×1080, 30 fps) para a seção **Inteligência de negócios** da landing (`index.html#inteligencia`).

O filme é feito em HTML/JS com o mesmo motor dos filmes 1 e 2. Ele é gravado quadro a quadro e convertido em MP4. O site reproduz só o MP4 e não carrega o motor do filme.

## Estrutura

| Arquivo | O que é |
| --- | --- |
| `assets/motion/perdas.html` | Pré-visualização no navegador, sem áudio (espaço pausa, F tela cheia, `#t=25` pula para 25 s). |
| `assets/motion/js/engine.js`, `kit.js`, `player.js` | Motor, auxiliares e player (compartilhados com os outros filmes). |
| `assets/motion/js/skyline-film.js` | Gráfico 3D. É um porte fiel do *Contribution Skyline* do Dashboard do Turium e contém os **dados ilustrativos**. |
| `assets/motion/js/scenes-perdas.js` | Cenas 1–3: prejuízo invisível, visão panorâmica e gráfico 3D. |
| `assets/motion/js/scenes-perdas-b.js` | Cenas 4–6: logística (conceito), rastreabilidade (conceito) e encerramento. |
| `assets/motion/css/perdas.css` | Estilos próprios do filme 3. |
| `assets/motion/tools/trilha.py` | Gera a trilha original por código. Gera `assets/motion/assets/audio/trilha-perdas.wav` (não fica no site: é recriada em segundos, sempre igual). |
| `assets/motion/tools/mix.py` | Posiciona cada fala da locução no tempo das cenas e mistura com a trilha (a trilha abaixa sob a voz). Gera `assets/motion/assets/audio/mix-perdas.wav`. |
| `assets/motion/assets/audio/narracao-filme3-fenrir.wav` | Locução original (voz Fenrir, 46 s, falas em sequência). |
| `assets/motion/tools/render_frames.py` | Grava os quadros (Playwright + Chromium). |
| `assets/motion/tools/encode.sh` | Monta os MP4 (ffmpeg). |
| `assets/video/filme3-perdas-1080.mp4` / `-720.mp4` (+ `.webm`) | Vídeos finais: MP4 H.264 e, para navegadores sem H.264, WebM VP9. O 720p vai para telas pequenas e economia de dados. |
| `assets/video/filme3-perdas-poster.webp` | Pôster do player. |
| `assets/video/filme3-perdas.pt-BR.vtt` | Legendas sincronizadas da locução. |
| `css/inteligencia.css`, `js/inteligencia.js` | Seção e player da landing. |

## Cenas e tempos

| Cena | Tempo | Conteúdo |
| --- | --- | --- |
| 1 · O prejuízo invisível | 0–9 s | Fragmentos da operação. Parte deles se dissolve em partículas vermelhas, como símbolo, e não como perda calculada. Pergunta: "Onde sua empresa está perdendo dinheiro?" |
| 2 · Visão panorâmica | 9–19 s | As partículas se organizam no **Dashboard real** da base de demonstração, com faturamento, vendas realizadas, mais vendidos, margem bruta e metas ligados por linhas. |
| 3 · Gráfico 3D | 19–33 s | Filtros Período 365 dias, Produto *Cimento CP-II 50 kg* e Métrica *Quantidade*. O mapa de calor vira skyline 3D, os dias de maior saída ficam dourados e o histórico se liga ao planejamento de reposição (decisão do gestor, não previsão). |
| 4 · Logística | 33–45 s | **Conceito de funcionalidade futura:** veículo adequado por carga e percurso, Pedido → Funcionário → Veículo e registro de saída. |
| 5 · Rastreabilidade | 45–52 s | **Conceito de funcionalidade futura:** linha do tempo e uma notificação de multa ilustrativa ligada ao período da saída. O registro apoia a investigação e não prova autoria. |
| 6 · Encerramento | 52–59,5 s | Os elementos se reorganizam e as linhas formam o logotipo. "O lucro começa quando você enxerga onde está perdendo." |

## Dados

- **Dashboard (cena 2):** captura real da base de demonstração *Prumo Materiais* (qa-homolog), com dados fictícios.
- **Gráfico 3D (cena 3):** série sintética de 365 dias (09/10/2025 a 08/10/2026), gerada por semente fixa. É sempre igual em todas as reproduções. O filme mostra o selo "Dados ilustrativos · loja fictícia". Para mudar produto, período, sazonalidade ou semente, edite `DATA_CFG` em `skyline-film.js`.
- **Cenas 4 e 5:** pedidos, nomes (Carlos Souza) e veículos (Utilitário 01) são fictícios.
- Nada no filme ou no site se conecta a banco de dados.

## Pré-visualizar

Abra `assets/motion/perdas.html` no navegador. Por `file://` funciona. Para o player do site com legendas, sirva a pasta do site, por exemplo com `npx serve .` ou `python -m http.server`, porque os navegadores bloqueiam o arquivo `.vtt` por `file://`.

## Alterar textos, cores e tempos

- **Textos:** estão nas funções `build` de cada cena (`scenes-perdas*.js`). Os textos do gráfico vêm de `F.sky.stats`.
- **Cores:** ficam em `css/tokens.css` (paleta oficial) e `css/perdas.css`. O dourado do gráfico é `GOLD` em `scenes-perdas.js`.
- **Tempos:** cada cena tem `start`/`dur`, e `render(t)` usa o tempo local da cena.

## Trocar a imagem do Dashboard

Substitua `assets/motion/assets/film/dashboard-dark.webp` por outra captura de **2560×1032**. Se o layout mudar, ajuste os retângulos `W2` e `CIM` (px nativos) em `scenes-perdas.js`.

## Renderizar o vídeo final

Requisitos: Python 3 com `playwright` (Chromium), `numpy`, `scipy` e `ffmpeg`.

```sh
cd assets/motion
python tools/trilha.py                      # gera assets/audio/trilha-perdas.wav (5 s; determinística)
python tools/mix.py                         # voz + trilha → assets/audio/mix-perdas.wav
python tools/render_frames.py /tmp/quadros  # 1.785 quadros JPG (cerca de 5 min)
sh tools/encode.sh /tmp/quadros             # gera ../../assets/video/filme3-perdas-{1080,720}.{mp4,webm}
```

Para trocar o pôster, extraia um quadro: `ffmpeg -ss 25.8 -i ../../assets/video/filme3-perdas-1080.mp4 -frames:v 1 -vf scale=1280:-1 poster.webp`.

## Locução e trilha

- **Locução:** voz Fenrir (`assets/motion/assets/audio/narracao-filme3-fenrir.wav`). `tools/mix.py` coloca cada fala no instante da sua cena; a lista `PIECES` diz o trecho da voz e onde ele entra no filme. As legendas (`.vtt`) seguem esses mesmos tempos.
- **Trilha:** original, sintetizada por código (`tools/trilha.py`), sem amostras nem músicas de terceiros. Abaixa sob a voz.
- **Trocar a voz:** substitua o WAV, ajuste `PIECES` (início/fim de cada fala no novo arquivo) e rode:

```sh
python tools/trilha.py && python tools/mix.py
sh tools/encode.sh /tmp/quadros     # usa assets/audio/mix-perdas.wav
```

Se só o áudio mudou, não é preciso gravar os quadros de novo: troque só a faixa de áudio com `ffmpeg -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac ...`.

## Atual × futuro

| Mostrado | Situação |
| --- | --- |
| Dashboard, indicadores, margem, metas | Implementado (tela real). |
| Painel "Produtos mais vendidos" e gráfico 2D/3D | Implementado no ERP. O filme reproduz a lógica com dados ilustrativos. |
| Pedido → Funcionário → Veículo, registro de saída com veículo e multas | **Conceito de funcionalidade futura**, marcado na tela o tempo todo. |
