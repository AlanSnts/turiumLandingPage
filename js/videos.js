/* =========================================================
   LISTA DE VÍDEOS DO CARROSSEL — edite só este array.

   Cada item vira um cartão 16:9. Tipos aceitos:
     { type: 'embed', src: '...', title: '...', meta: '...' }
        Página HTML num iframe (ex.: o filme narrado). O primeiro filme espera o
        clique; depois do primeiro play, cada filme que chega ao centro começa
        sozinho. O site pausa o filme quando o cartão sai de foco.
     { type: 'video', src: '...mp4', webm: '...webm', poster: '...', title: '...', meta: '...' }
        Arquivo de vídeo: toca mudo, em loop, só quando o cartão está visível.
        Com narrated: true, não toca sozinho: mostra os controles do vídeo e o
        visitante dá o play com som (captions: '...vtt' liga as legendas).
     { type: 'placeholder', title: '...', meta: '...' }
        Cartão "em breve" no estilo Turium (troque por um vídeo depois).

   Caminhos relativos a turium-site/index.html.
   ========================================================= */
window.TURIUM_VIDEOS = [
  {
    type: 'embed',
    src: 'assets/motion/filme-narrado.html?embed=1&v=4',
    title: 'Uma venda real, do balcão ao banco',
    meta: 'Filme com narração · 1min33'
  },
  {
    type: 'embed',
    src: 'assets/motion/equipe.html?embed=1&v=4',
    title: 'Cada função tem um responsável',
    meta: 'Filme com narração · 58 s'
  },
  {
    type: 'embed',
    src: 'assets/motion/perdas-narrado.html?embed=1&v=2',
    title: 'Enxergue onde está perdendo',
    meta: 'Filme com narração · 59 s'
  },
  {
    type: 'embed',
    src: 'assets/motion/pdv-narrado.html?embed=1&v=3',
    title: 'PDV Rápido: do balcão ao caixa',
    meta: 'Filme com narração · 59 s'
  },
  { type: 'placeholder', title: 'Recebimento de mercadoria', meta: 'Em breve' },
  { type: 'placeholder', title: 'Fluxo de caixa sem planilha', meta: 'Em breve' }
];
