"""Turium — filme 3: posiciona a locução no tempo das cenas e mistura com a trilha.

Entrada:  assets/audio/narracao-filme3-fenrir.wav  (voz gerada por IA, 46,2 s, falas em sequência)
          assets/audio/trilha-perdas.wav           (gerada por tools/trilha.py)
Saída:    assets/audio/mix-perdas.wav              (59,5 s, 48 kHz, estéreo, −16 LUFS)

Cada trecho da voz (início/fim em segundos NO ARQUIVO DE VOZ) é colocado num instante do filme.
Pausas internas longas das falas 9 e 10 são encurtadas para o filme caber em 59,5 s.
A trilha abaixa sob a voz (sidechain). Requer ffmpeg.

    python tools/mix.py
"""
import os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, '..', 'assets', 'audio')
VOZ = os.path.join(A, 'narracao-filme3-fenrir.wav')
TRILHA = os.path.join(A, 'trilha-perdas.wav')
OUT = os.path.join(A, 'mix-perdas.wav')
DUR = 59.5

# (início na voz, fim na voz, instante no filme) — fala nº e texto para referência
PIECES = [
    (0.25, 2.42, 0.80),    # 1  Sua loja vende todos os dias.
    (3.00, 6.84, 3.40),    # 2  Mas você sabe onde seu dinheiro está sendo desperdiçado?
    (7.46, 13.03, 9.60),   # 3  Com o Turium, você transforma dados da operação em uma visão mais clara do seu negócio.
    (13.63, 15.74, 19.80), # 4  Analise um produto ao longo do ano.
    (16.39, 22.36, 23.20), # 5  Descubra os dias de maior saída, reconheça padrões e prepare suas próximas compras.
    (22.99, 25.83, 33.60), # 6  E o desperdício não está só no estoque.
    (26.46, 30.59, 37.00), # 7  Na logística, escolher o veículo adequado também pode fazer diferença.
    (31.32, 37.35, 45.50), # 8  Com registros organizados, fica mais fácil acompanhar responsabilidades e investigar ocorrências.
    (38.24, 39.36, 51.90), # 9a Enxergue mais.
    (39.85, 41.18, 53.30), # 9b Desperdice menos.
    (41.73, 43.58, 54.95), # 10a Turium Pro e Enterprise:
    (43.95, 46.24, 57.00), # 10b inteligência para decisões melhores.
]

def main():
    parts, labels = [], []
    for k, (a, b, at) in enumerate(PIECES):
        d = int(at * 1000)
        parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.04:.3f}:d=0.04,adelay={d}:all=1[v{k}]")
        labels.append(f"[v{k}]")
    fc = ';'.join(parts)
    fc += f";{''.join(labels)}amix=inputs={len(PIECES)}:normalize=0,aresample=48000,apad=whole_dur={DUR},atrim=0:{DUR},pan=stereo|c0=c0|c1=c0,volume=1.6[voz]"
    fc += ";[voz]asplit[voz1][sc]"
    fc += ";[1:a]aresample=48000,volume=0.62[tr]"
    fc += ";[tr][sc]sidechaincompress=threshold=0.03:ratio=5:attack=25:release=450:makeup=1[duck]"
    fc += f";[voz1][duck]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,atrim=0:{DUR}[out]"
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', VOZ, '-i', TRILHA,
                    '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', OUT], check=True)
    print('ok', OUT)

if __name__ == '__main__':
    main()
