# Turium — Filme 4: PDV Rápido (prévia de produção)

Motion graphics de **59 s** (16:9, 1920×1080, 30 fps) para o 4º cartão do carrossel da landing. A versão atual é uma **prévia**: as animações, os textos, as transições e a trilha estão prontos. As 13 telas reais aparecem como **espaços reservados identificados** (C01–C13), e a locução ainda é só o guia em texto.

## Versão do ERP

As capturas serão feitas no commit `71e4252` (origin/master de 13/10/2026), que é anterior à B.2 e não tem o visor do cliente. Nenhuma cena do roteiro atual precisa do visor. Se alguma passar a precisar, isso precisa ser decidido antes de trocar de commit.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `pdv.html` | Filme no navegador, sem som (espaço pausa, F tela cheia, `#t=25` pula para 25 s). Com `?guia=1`, mostra o guia de locução no topo. |
| `js/scenes-pdv.js` | Peças compartilhadas (capturas, ícones, falas) e cenas 1–3. |
| `js/scenes-pdv-b.js` | Cenas 4–6, guia de locução e marca de prévia. |
| `css/pdv.css` | Estilos do filme 4. |
| `tools/trilha_pdv.py` | Trilha e efeitos por código (96 BPM, Ré maior). Gera `assets/audio/trilha-pdv.wav`. |
| `tools/mix_pdv.py` | `--previa`: trilha sem voz. Sem argumento: posiciona a voz (PIECES) e mistura. |
| `tools/render_frames.py`, `tools/encode.sh` | Gravação quadro a quadro e MP4/WebM (os mesmos dos filmes anteriores). |
| `assets/legendas/filme4-pdv.pt-BR.rascunho.vtt` | Legendas com as janelas do roteiro. Os tempos finais saem da voz. |

## Cenas

| Cena | Tempo | Material |
| --- | --- | --- |
| 1 · O problema | 0–9 s | Planta isométrica (ilustração), itens acendem, caminho longo se desfaz, câmera entra no monitor. |
| 2 · Encontre e adicione | 9–20 s | C02 → C04 → C03 → C05, mais as anotações (F3, busca, item indo para "Sua venda"). |
| 3 · Leitor | 20–30 s | Leitor ilustrado ("compatível"), alternado com C06 e C07. Três bipes. |
| 4 · Do vendedor ao caixa | 30–41 s | C07 → F8 → C08 → C09. Cartão do pedido na linha dourada → C10 → C11 → C12. |
| 5 · Comprovante e futuro fiscal | 41–52 s | Impressora ilustrada, papel com C13, selo NÃO FISCAL. Lado futuro cinza e tracejado: NF-e / NFC-e · módulo fiscal · recurso futuro · Pro e Enterprise · módulo opcional. |
| 6 · Encerramento | 52–59 s | A tela gira e recua, cinco ícones, logotipo desenhado. "Menos tempo no balcão. Mais tempo para vender." |

## Como entram as capturas

1. Salve cada captura aprovada (2560×1032) como `assets/film/pdv-c01.webp` … `pdv-c13.webp`.
2. Em `js/scenes-pdv.js`, preencha `CAPS.Cxx.src` com o caminho.
3. Troque os rótulos provisórios pelos dados reais: o cartão do pedido (itens e total) e a posição do item que "voa" até "Sua venda". Nenhum valor é inventado antes disso.

## Como entra a voz

1. Gere a voz Fenrir com o texto do roteiro aprovado e salve como `assets/audio/narracao-filme4-fenrir.wav`.
2. Meça o início e o fim de cada fala no arquivo e preencha `PIECES` em `tools/mix_pdv.py`.
3. Rode `python tools/mix_pdv.py`. Depois regrave os quadros sem `?guia=1` e rode `sh tools/encode.sh <quadros> assets/audio/mix-pdv.wav` (ajustando os nomes de saída para `filme4-pdv`).

## Regras mantidas

- Nenhuma tela do ERP é desenhada como se fosse captura.
- O leitor e a impressora aparecem sempre como "compatível".
- O comprovante é sempre "não fiscal". NF-e / NFC-e só como recurso futuro, sem dourado de "concluído".
- Trilha e efeitos são sintetizados por código, sem amostras de terceiros.
