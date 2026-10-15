"""Turium — filme 4 (PDV Rápido): trilha e efeitos sintetizados por código (sem amostras de terceiros).

Gera assets/audio/trilha-pdv.wav (48 kHz, estéreo, 59 s), determinístico (semente fixa). Requer numpy e scipy.

    python tools/trilha_pdv.py

96 BPM, Ré maior: pulso leve e otimista no balcão, sobe na passagem ao caixa, resolve no logotipo.
Efeitos nos instantes das cenas (s): itens 1,0–1,75 · sopro 4,6 · whoosh 8,25 · F3 10,0 · digitação 10,4–11,6 ·
itens no carrinho 12,9/16,4/17,95 · bipes 20,9/24,35/26,95 · F8 31,0 · cartão 35,4–36,9 · notas 37,0 e 39,6 ·
motor do papel 41,8–43,2 · selo 44,0 · lado futuro sem efeito (46–52) · carrilhão 54,9.
"""
import os
import numpy as np
from scipy.signal import butter, lfilter

SR = 48000
DUR = 59.0
N = int(SR * DUR)
rng = np.random.default_rng(20261014)
t_all = np.arange(N) / SR
L = np.zeros(N)
R = np.zeros(N)

def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def lp(x, fc, order=2):
    b, a = butter(order, min(fc, SR / 2 * 0.95) / (SR / 2), 'low')
    return lfilter(b, a, x)

def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), 'high')
    return lfilter(b, a, x)

def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    gl = np.cos((pan + 1) * np.pi / 4) * gain
    gr = np.sin((pan + 1) * np.pi / 4) * gain
    L[i:i + len(sig)] += sig * gl
    R[i:i + len(sig)] += sig * gr

def env(n, a, d, s=0.0, r=None):
    """ataque/decay exponencial simples (em segundos)."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / max(d, 1e-4)) * (1 - s) + s)
    if r:
        rel = np.clip((t[-1] - t) / r, 0, 1)
        e = e * rel
    return e

def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    out = 0
    for dt in (-detune, 0, detune):
        ph = (f * (1 + dt) * t + rng.random()) % 1.0
        out = out + (2 * ph - 1)
    return out / 3

def sine(f, n, ph=0.0):
    return np.sin(2 * np.pi * f * np.arange(n) / SR + ph)

def pad(notes, start, dur, gain, fc=1400, pan_spread=0.5):
    n = int(dur * SR)
    e = env(n, min(1.2, dur * .3), 1e9, 1.0, r=min(1.5, dur * .4))
    for k, m in enumerate(notes):
        s = lp(saw(mtof(m), n, 0.004), fc) * e
        add(s, start, pan=((k / max(1, len(notes) - 1)) - .5) * 2 * pan_spread, gain=gain / len(notes))

def pluck(m, start, gain=0.2, dec=0.35, pan=0.0, fc=3200):
    n = int((dec * 5) * SR)
    s = (sine(mtof(m), n) * .6 + saw(mtof(m), n) * .4)
    s = lp(s, fc) * env(n, .004, dec)
    add(s, start, pan, gain)

def kick(start, gain=0.5):
    n = int(.5 * SR)
    t = np.arange(n) / SR
    f = 46 + 90 * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    add(s, start, 0, gain)

def hat(start, gain=0.05, pan=0.2):
    n = int(.08 * SR)
    s = hp(rng.standard_normal(n), 7000) * env(n, .001, .018)
    add(s, start, pan, gain)

def tick(start, gain=0.05, pan=0.0):
    n = int(.05 * SR)
    s = hp(sine(2400, n) + .4 * rng.standard_normal(n), 1800) * env(n, .0005, .008)
    add(s, start, pan, gain)

def noise_sweep(start, dur, f0, f1, gain, pan=0.0, rise=True):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 2048
    for i in range(0, n, seg):
        k = i / n
        fc = f0 * (f1 / f0) ** k
        out[i:i + seg] = lp(x[i:i + seg], fc, 1)
    e = np.linspace(0, 1, n) ** 2 if rise else np.linspace(1, 0, n) ** 1.5
    e *= np.minimum(1, np.linspace(0, 1, n) * 20)
    add(out * e, start, pan, gain)

def boom(start, gain=0.6):
    n = int(2.8 * SR)
    t = np.arange(n) / SR
    f = 38 + 60 * np.exp(-t * 9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    s += lp(rng.standard_normal(n), 900) * np.exp(-t * 6) * .35
    add(s, start, 0, gain)

def chime(start, gain=0.18):
    for k, (m, p) in enumerate([(84, -.3), (88, .2), (91, -.1), (96, .35)]):
        n = int(3.5 * SR)
        s = (sine(mtof(m), n) + .3 * sine(mtof(m) * 2.76, n)) * env(n, .005, 1.1)
        add(s, start + k * .06, p, gain / (1 + k * .4))

BEAT = 60 / 96
BAR = BEAT * 4

def thump(start, gain=0.25, f0=70):
    n = int(.35 * SR); t = np.arange(n) / SR
    f = f0 + 40 * np.exp(-t * 30)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14), start, 0, gain)

def click(start, gain=0.06, pan=0.0, f=3200):
    n = int(.03 * SR)
    s = hp(rng.standard_normal(n) * .6 + sine(f, n) * .4, 1500) * env(n, .0005, .006)
    add(s, start, pan, gain)

def pop(start, gain=0.09, m=79, pan=0.15):
    n = int(.25 * SR); t = np.arange(n) / SR
    f = mtof(m) * (1 + .5 * np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .06)
    add(s, start, pan, gain)

def beep(start, gain=0.09):
    # bipe eletrônico curto, audível sem estridor (onda quase senoidal, 1,9 kHz, 110 ms)
    n = int(.11 * SR)
    s = (sine(1900, n) + .15 * sine(3800, n)) * env(n, .004, 1e9, 1.0, r=.02)
    add(lp(s, 5000), start, .1, gain)

def note(start, m, gain=0.1, pan=0.0, dec=.6):
    n = int(dec * 4 * SR)
    s = (sine(mtof(m), n) + .25 * sine(mtof(m) * 2, n) + .08 * sine(mtof(m) * 3, n)) * env(n, .004, dec)
    add(s, start, pan, gain)

def motor(start, dur, gain=0.05):
    # motor de papel térmico (sintético): zumbido modulado + ruído filtrado
    n = int(dur * SR); t = np.arange(n) / SR
    s = lp(saw(140, n, .01), 900) * (1 + .4 * np.sin(2 * np.pi * 22 * t)) * .5
    s += lp(hp(rng.standard_normal(n), 1200), 3500) * .35 * (1 + .5 * np.sin(2 * np.pi * 44 * t))
    e = np.minimum(1, t / .06) * np.minimum(1, (dur - t) / .08)
    add(s * e, start, -.15, gain)

def bass(m, start, dur, gain=0.16):
    n = int(dur * SR)
    s = lp(saw(mtof(m), n, .002), 220) * env(n, .01, .4, .55, r=.12)
    add(s, start, 0, gain)

D = [62, 66, 69, 73]; A_ = [57, 61, 64, 69]; Bm = [59, 62, 66, 69]; G = [55, 59, 62, 66]; Em = [52, 55, 59, 62]

# ---------- 1 · balcão: pad claro e pulsos dos itens (0–9)
pad([50, 57, 62, 66, 69], 0.0, 9.4, .22, fc=900)
add(lp(saw(mtof(38), int(9.4 * SR), .003), 200) * env(int(9.4 * SR), 1.5, 1e9, 1.0, r=1.0), 0, 0, .16)
for i in range(int(8.4 / BEAT)):
    tick(0.6 + i * BEAT, .03 if i % 2 else .045, pan=(-.25 if i % 2 else .25))
for k, at in enumerate([1.0, 1.25, 1.5, 1.75]):           # itens acendem
    thump(at, .22, 62 + k * 4)
    pluck([74, 78, 81, 86][k], at, .05, .4, pan=-.4 + k * .27, fc=5000)
noise_sweep(4.6, 1.0, 2400, 400, .04, pan=.2, rise=False)  # caminho se desfaz (sopro)
noise_sweep(8.25, .45, 500, 6000, .07)                      # entrada no monitor (whoosh curto)

# ---------- 2 e 3 · pulso leve e otimista (9–30)
PROG = [D, A_, Bm, G, D, A_, Bm, G, D]
for k, ch in enumerate(PROG):
    st = 9.0 + k * BAR
    if st >= 30: break
    pad(ch, st, BAR + .2, .20, fc=1500)
    for b in range(4):
        bass(ch[0] - 12 if b % 2 == 0 else ch[2] - 12, st + b * BEAT, BEAT * .9, .14)
for i in range(int(21.0 / BEAT)):
    at = 9.0 + i * BEAT
    kick(at, .26 if i % 2 == 0 else .18)
    hat(at + BEAT / 2, .045)
for k in range(8):                                          # arpejo a partir da cena 3
    st = 19.0 + k * BAR / 2
    if st >= 29.8: break
    ch = PROG[int((st - 9.0) // BAR)]
    for j in range(8):
        pluck(ch[j % 4] + 12, st + j * BEAT / 4 * 2, .035, .2, pan=(-.35 if j % 2 else .35), fc=4500)
# efeitos da cena 2
click(10.0, .09, .2); click(10.08, .05, .2)                 # F3
for j in range(13): click(10.4 + j * .092, .035 + .01 * (j % 3), pan=.1 + (j % 2) * .1, f=2800 + (j % 4) * 200)
pop(12.9, .1, 81)
click(15.8, .07, .15); pop(16.4, .1, 83)
click(17.6, .05, .1); click(17.75, .05, .1); pop(17.95, .07, 86)
# efeitos da cena 3 (bipes e itens no carrinho)
for b in [20.9, 24.35, 26.95]: beep(b, .085)
pop(25.3, .09, 81); pop(27.9, .09, 83)
noise_sweep(29.3, .6, 400, 5500, .06)

# ---------- 4 · subida na passagem ao caixa (30–41)
PROG4 = [G, A_, Bm, A_, G, A_]
for k, ch in enumerate(PROG4):
    st = 30.0 + k * BAR * .75
    pad(ch, st, BAR * .75 + .2, .22, fc=1500 + k * 250)
    for b in range(3):
        bass(ch[0] - 12, st + b * BEAT, BEAT * .9, .15)
for i in range(int(11.0 / BEAT)):
    at = 30.0 + i * BEAT
    kick(at, .28)
    hat(at + BEAT / 2, .05); hat(at + BEAT / 4, .025, -.2); hat(at + 3 * BEAT / 4, .025, -.2)
click(31.0, .1, .2); click(31.07, .06, .2)                  # F8
click(32.0, .05, .1); click(34.0, .07, .1)
noise_sweep(35.4, 1.5, 300, 4200, .07, pan=.3)               # cartão corre até o caixa (deslizar ascendente)
for j in range(6): pluck([69, 73, 76, 78, 81, 85][j], 35.5 + j * .24, .04, .25, pan=-.5 + j * .2, fc=6000)
note(37.0, 81, .12, .1); note(37.0, 74, .06, -.1)          # entra em "Aguardando caixa"
click(38.0, .06, .1)
note(39.6, 86, .12, .1); note(39.6, 78, .07, -.1)          # venda concluída

# ---------- 5 · comprovante (41–46) e lado futuro sem sinal de sucesso (46–52)
pad([50, 57, 62, 66], 41.0, 5.2, .2, fc=1200)
for i in range(int(5.0 / BEAT)):
    kick(41.0 + i * BEAT, .16)
noise_sweep(40.8, .6, 3000, 8000, .03)                      # linha desce
motor(41.8, 1.4, .06)                                       # papel sai em 1,4 s
thump(44.0, .32, 55); add(lp(rng.standard_normal(int(.12 * SR)), 600) * env(int(.12 * SR), .001, .03), 44.0, 0, .12)  # selo (batida abafada)
pad([47, 54, 59, 62], 46.0, 6.2, .18, fc=900)               # Si menor neutro: nada de "concluído"
add(lp(saw(mtof(35), int(6.2 * SR), .003), 200) * env(int(6.2 * SR), .6, 1e9, 1.0, r=1.0), 46.0, 0, .12)
noise_sweep(51.3, .7, 400, 5000, .05)

# ---------- 6 · resolução e logotipo (52–59)
pad([50, 57, 62, 66, 69], 52.0, 3.0, .26, fc=1700)
pad([43, 55, 62, 66, 71], 55.0, 4.0, .28, fc=1700)
bass(38, 52.0, 3.0, .16); bass(43, 55.0, 3.6, .16)
kick(52.0, .36)
noise_sweep(51.9, .5, 4000, 300, .04, rise=False)           # tela recua
chime(54.9, .2)
boom(54.9, .18)
# ---------- master: reverb simples (ecos difusos), limite e fade
mix = np.stack([L, R])
for d, g in [(.031, .25), (.047, .2), (.071, .16), (.113, .12), (.173, .09), (.257, .06)]:
    k = int(d * SR)
    mix[0, k:] += lp(mix[1, :-k], 3500, 1) * g
    mix[1, k:] += lp(mix[0, :-k], 3500, 1) * g
fade = np.ones(N)
fi = int(.15 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo = int(1.2 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
mix *= fade
mix = hp(mix, 28)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) / .89

out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio', 'trilha-pdv.wav')
os.makedirs(os.path.dirname(out), exist_ok=True)
from scipy.io import wavfile
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
print('ok', out, round(N / SR, 2), 's')
