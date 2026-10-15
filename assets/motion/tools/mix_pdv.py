"""Turium — filme 4 (PDV Rápido): posiciona a locução no tempo das cenas e mistura com a trilha.

    python tools/mix_pdv.py --previa   # sem voz: trilha com as janelas de fala rebaixadas (−5 dB), para revisão
    python tools/mix_pdv.py            # com a voz: assets/audio/narracao-filme4-fenrir.wav

Entrada:  assets/audio/narracao-filme4-fenrir.wav (voz Fenrir, as 9 falas em sequência)
          assets/audio/trilha-pdv.wav             (gerada por tools/trilha_pdv.py)
Saída:    assets/audio/mix-pdv.wav  (ou mix-pdv-previa.wav), 59 s, 48 kHz, estéreo, −16 LUFS

PIECES: (início na voz, fim na voz, instante no filme). Os inícios/fins na voz são medidos depois que o
arquivo de voz chegar (como nos filmes 2 e 3); os instantes no filme são as janelas do roteiro aprovado.
A trilha abaixa sob a voz (sidechain). Requer ffmpeg.
"""
import os, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, '..', 'assets', 'audio')
VOZ = os.path.join(A, 'narracao-filme4-fenrir.wav')
TRILHA = os.path.join(A, 'trilha-pdv.wav')
DUR = 59.0

# janelas do roteiro aprovado (entra, sai) — falas 1 a 9
JANELAS = [(0.8, 4.6), (5.0, 8.4), (9.6, 16.8), (20.4, 26.4), (30.6, 34.2), (34.6, 38.8), (41.6, 45.2), (45.8, 51.2), (52.6, 58.4)]

# preencher ao receber a voz: (início na voz, fim na voz, instante no filme)
PIECES = [
    # (0.00, 0.00, 0.8),   # 1 Seu cliente não precisa carregar tudo até o balcão para fazer uma compra.
    # (0.00, 0.00, 5.0),   # 2 E sua loja não pode perder tempo procurando cada produto.
    # (0.00, 0.00, 9.6),   # 3 No PDV Rápido do Turium, você busca o produto pelo nome ou código, ...
    # (0.00, 0.00, 20.4),  # 4 E, quando o produto está no balcão, um leitor de código de barras compatível agiliza o registro.
    # (0.00, 0.00, 30.6),  # 5 O vendedor monta o pedido e envia para o caixa.
    # (0.00, 0.00, 34.6),  # 6 Tudo organizado para o responsável concluir o pagamento.
    # (0.00, 0.00, 41.6),  # 7 Finalize a venda e imprima o comprovante não fiscal.
    # (0.00, 0.00, 45.8),  # 8 A emissão de NF-e e NFC-e virá como módulo fiscal opcional, nos planos Pro e Enterprise.
    # (0.00, 0.00, 52.6),  # 9 Mais agilidade para a equipe. Mais praticidade para o cliente. Turium: seu balcão preparado para vender.
]

def previa():
    out = os.path.join(A, 'mix-pdv-previa.wav')
    vol = '+'.join(f"between(t,{a - .2:.2f},{b + .3:.2f})" for a, b in JANELAS)
    fc = (f"[0:a]aresample=48000,volume=0.62,volume='if({vol},0.56,1)':eval=frame,"
          f"loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,atrim=0:{DUR}[out]")
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', TRILHA, '-filter_complex', fc,
                    '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', out], check=True)
    print('ok', out)

def final():
    if not PIECES:
        sys.exit('PIECES vazio: meça as falas no arquivo de voz e preencha antes de mixar.')
    out = os.path.join(A, 'mix-pdv.wav')
    parts, labels = [], []
    for k, (a, b, at) in enumerate(PIECES):
        parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.04:.3f}:d=0.04,adelay={int(at * 1000)}:all=1[v{k}]")
        labels.append(f"[v{k}]")
    fc = ';'.join(parts)
    fc += f";{''.join(labels)}amix=inputs={len(PIECES)}:normalize=0,aresample=48000,apad=whole_dur={DUR},atrim=0:{DUR},pan=stereo|c0=c0|c1=c0,volume=1.6[voz]"
    fc += ";[voz]asplit[voz1][sc];[1:a]aresample=48000,volume=0.62[tr]"
    fc += ";[tr][sc]sidechaincompress=threshold=0.03:ratio=5:attack=25:release=450:makeup=1[duck]"
    fc += f";[voz1][duck]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,atrim=0:{DUR}[out]"
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', VOZ, '-i', TRILHA, '-filter_complex', fc,
                    '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', out], check=True)
    print('ok', out)

if __name__ == '__main__':
    previa() if '--previa' in sys.argv else final()
