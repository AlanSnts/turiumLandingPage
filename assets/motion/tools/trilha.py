"""Turium — filme 3: trilha original sintetizada por código (sem amostras de terceiros).

Gera assets/audio/trilha-perdas.wav (48 kHz, estéreo, 59,5 s). Tudo é determinístico (semente fixa):
rodar de novo produz o mesmo arquivo. Requer numpy e scipy.

    python tools/trilha.py

Marcações seguem o roteiro do filme (segundos):
  0–9   drone grave, tique de operação, sopros vermelhos (3–4,8), impacto na pergunta (5,2)
  9–19  pad Lá menor → Fá → Dó → Sol, pulso suave; brilho das partículas (9,2–11)
  19–33 arpejo + batida leve; subida ao virar 3D (23,9); brilho nos picos (27–29)
  33–45 pulso mais leve (logística)
  45–52 tensão contida; aviso discreto na notificação (46,9)
  52–59,5 resolução, carrilhão no logotipo (54,9), fade até o silêncio
"""
import os
import numpy as np
from scipy.signal import butter, lfilter

SR = 48000
DUR = 59.5
N = int(SR * DUR)
rng = np.random.default_rng(20261008)
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

# ---------- 1 · drone, tique, sopros, impacto (0–9)
n = int(9.6 * SR)
dr = lp(saw(mtof(33), n, .003) + .6 * saw(mtof(40), n, .003), 260) * env(n, 1.5, 1e9, 1.0, r=1.2)
add(dr, 0, -.1, .22); add(dr, 0, .1, .22)
for i in range(int(5.0 / (BEAT / 2))):
    tick(0.4 + i * BEAT / 2, .035 if i % 2 else .05, pan=(-.3 if i % 4 < 2 else .3))
for k, at in enumerate([3.0, 3.45, 3.9, 4.3]):
    noise_sweep(at + .2, 1.4, 2600, 500, .035, pan=[-.5, .5, -.2, .3][k], rise=False)
boom(5.2, .55)
noise_sweep(7.9, 1.2, 300, 4200, .06)            # sobe para a cena 2

# ---------- 2 · pad e pulso (9–19)
PROG = [[57, 60, 64, 71], [53, 57, 60, 67], [48, 55, 60, 64], [55, 59, 62, 69]]   # Lá m(9) · Fá(9) · Dó · Sol(9)
for k, ch in enumerate(PROG + PROG[:1]):
    pad(ch, 9.0 + k * 2.5, 2.7, .30, fc=1200 + k * 120)
    add(lp(saw(mtof(ch[0] - 12), int(2.6 * SR), .002), 180) * env(int(2.6 * SR), .3, 1e9, 1.0, r=.6), 9.0 + k * 2.5, 0, .18)
for i in range(16):
    kick(9.0 + i * BEAT, .30)
scale = [69, 72, 74, 76, 79, 81, 84]
for i in range(26):
    at = 9.15 + rng.random() * 1.9
    pluck(scale[int(rng.random() * len(scale))] + 12, at, .045, .25, pan=rng.random() * 1.6 - .8, fc=5000)

# ---------- 3 · arpejo e subida (19–33)
PROG3 = [[57, 60, 64, 71], [53, 57, 60, 67], [48, 55, 60, 64], [55, 59, 62, 69], [57, 60, 64, 71], [53, 57, 60, 69]]
for k, ch in enumerate(PROG3):
    st = 19.0 + k * 2.4
    pad(ch, st, 2.6, .26, fc=1600)
    add(lp(saw(mtof(ch[0] - 12), int(2.5 * SR), .002), 200) * env(int(2.5 * SR), .2, 1e9, 1.0, r=.5), st, 0, .2)
    arp = ch + [ch[1] + 12]
    for j in range(16):
        pluck(arp[j % len(arp)] + 12, st + j * 0.15, .07, .22, pan=(-.4 if j % 2 else .4), fc=4200)
for i in range(int(14.0 / BEAT)):
    at = 19.0 + i * BEAT
    kick(at, .34)
    hat(at + BEAT / 2, .05)
noise_sweep(22.6, 1.5, 400, 5000, .07)            # 2D → 3D
for j in range(14):                                # colunas sobem: glissando ascendente
    pluck(57 + [0, 3, 7, 10, 12, 15, 19, 22, 24, 27, 31, 34, 36, 39][j], 23.9 + j * .11, .06, .3, pan=-.6 + j * .09, fc=6000)
for j in range(10):                                # brilho nos picos
    pluck([84, 88, 91, 93, 96][j % 5], 27.0 + j * .2, .04, .5, pan=(j % 3 - 1) * .5, fc=8000)

# ---------- 4 · logística (33–45)
PROG4 = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67], [52, 55, 59, 64], [57, 60, 64, 69]]
for k, ch in enumerate(PROG4):
    pad(ch, 33.0 + k * 2.4, 2.6, .22, fc=1300)
for i in range(int(12.0 / BEAT)):
    at = 33.0 + i * BEAT
    kick(at, .26 if i % 2 == 0 else .16)
    tick(at + BEAT / 2, .03, pan=.3)

# ---------- 5 · tensão contida (45–52)
pad([45, 52, 57, 60], 45.0, 7.2, .26, fc=900)
add(lp(saw(mtof(33), int(7.2 * SR), .003), 200) * env(int(7.2 * SR), .5, 1e9, 1.0, r=1.0), 45.0, 0, .2)
for i in range(int(7.0 / BEAT)):
    kick(45.0 + i * BEAT, .18)
for k, m in enumerate([76, 72]):                   # aviso discreto (multa)
    n2 = int(.5 * SR)
    add(sine(mtof(m), n2) * env(n2, .005, .12), 46.9 + k * .16, .2, .07)
noise_sweep(51.0, 1.1, 300, 4500, .05)

# ---------- 6 · resolução (52–59,5)
pad([48, 55, 60, 64, 71], 52.0, 3.0, .30, fc=1800)
pad([53, 57, 60, 64, 69], 55.0, 4.4, .32, fc=1700)
add(lp(saw(mtof(36), int(3.0 * SR), .002), 180) * env(int(3.0 * SR), .2, 1e9, 1.0, r=.6), 52.0, 0, .2)
add(lp(saw(mtof(41), int(4.4 * SR), .002), 180) * env(int(4.4 * SR), .2, 1e9, 1.0, r=1.8), 55.0, 0, .2)
kick(52.0, .4)
chime(54.9, .2)
boom(54.9, .25)

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

out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio', 'trilha-perdas.wav')
os.makedirs(os.path.dirname(out), exist_ok=True)
from scipy.io import wavfile
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
print('ok', out, round(N / SR, 2), 's')
