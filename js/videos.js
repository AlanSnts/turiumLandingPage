/* =========================================================
   LISTA DE VÍDEOS DO CARROSSEL — edite só este array.

   Cada item vira um cartão 16:9. Tipos aceitos:
     { type: 'embed', src: '...', title: '...', meta: '...' }
        Página HTML num iframe (ex.: o filme narrado). O próprio filme
        controla o play; o site só o pausa quando o cartão sai de foco.
     { type: 'video', src: '...mp4', webm: '...webm', poster: '...', title: '...', meta: '...' }
        Arquivo de vídeo: toca mudo, em loop, só quando o cartão está visível.
     { type: 'placeholder', title: '...', meta: '...' }
        Cartão "em breve" no estilo Turium (troque por um vídeo depois).

   Caminhos relativos a turium-site/index.html.
   ========================================================= */
window.TURIUM_VIDEOS = [
  {
    type: 'embed',
    src: 'assets/motion/filme-narrado.html?embed=1&v=2',
    title: 'Uma venda real, do balcão ao banco',
    meta: 'Filme com narração · 1min33'
  },
  {
    type: 'embed',
    src: 'assets/motion/equipe.html?embed=1&v=2',
    title: 'Cada função tem um responsável',
    meta: 'Filme com narração · 58 s'
  },
  { type: 'placeholder', title: 'Recebimento de mercadoria', meta: 'Em breve' },
  { type: 'placeholder', title: 'Fluxo de caixa sem planilha', meta: 'Em breve' }
];
