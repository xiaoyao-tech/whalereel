# 潭柘寺 45 秒 · 配乐与拟音（numpy，无采样库）
import numpy as np, soundfile as sf
from pathlib import Path

SR = 48000
DUR = 45.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

mix = np.zeros((N, 2), dtype=np.float32)
t = np.arange(N) / SR

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    n = min(len(sig), N - i)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    mix[i:i+n, 0] += sig[:n] * gain * l * 1.414
    mix[i:i+n, 1] += sig[:n] * gain * r * 1.414

# --- drone: D2 / A2 / D3, very slow swell
env = np.minimum(t / 4.0, 1.0) * np.minimum((DUR - t) / 3.5, 1.0)
env = np.clip(env, 0, 1) ** 1.5
lfo = 0.82 + 0.18 * np.sin(2 * np.pi * 0.045 * t)
drone = (0.50 * np.sin(2 * np.pi * 73.42 * t)
         + 0.28 * np.sin(2 * np.pi * 110.00 * t + 0.7)
         + 0.16 * np.sin(2 * np.pi * 146.83 * t + 1.9)
         + 0.05 * np.sin(2 * np.pi * 36.71 * t))
add(drone * env * lfo, 0, 0.20)

# --- air: low-passed noise
air = rng.normal(0, 1, N)
b = np.zeros_like(air); a = 0.9995
for i in range(1, N): b[i] = a * b[i-1] + (1 - a) * air[i]
add(b * env, 0, 0.055)

# --- match strike at 0.65
def burst(dur, decay=40.0, band=0.35):
    n = int(SR * dur)
    x = rng.normal(0, 1, n) * np.exp(-np.linspace(0, decay, n))
    y = np.copy(x)
    for i in range(1, n): y[i] = y[i-1] + band * (x[i] - y[i-1])
    return y

add(burst(0.09, 55), 0.62, 0.55, -0.35)
for k, dt in enumerate([0.03, 0.06, 0.11, 0.17]):
    add(burst(0.02, 90), 0.62 + dt, 0.18, -0.3)

# --- gate pass whoosh at 13.6
n = int(SR * 1.4)
x = rng.normal(0, 1, n)
y = np.copy(x)
for i in range(1, n): y[i] = 0.998 * y[i-1] + 0.002 * x[i]
w = np.hanning(n) * (np.linspace(0, 1, n) ** 0.5)
add(y * w, 13.6, 0.16, 0.1)

# --- paper / wood taps
for at in [6.05, 13.15, 23.35, 33.15]:
    add(burst(0.03, 80, 0.6), at, 0.20, 0.0)

# --- bell at 40.65 (196 Hz + partials)
def bell(f0, dur=3.2):
    n = int(SR * dur); tt = np.arange(n) / SR
    s = (1.00 * np.sin(2*np.pi*f0*tt) * np.exp(-tt*1.9)
         + 0.55 * np.sin(2*np.pi*f0*2.01*tt) * np.exp(-tt*2.6)
         + 0.30 * np.sin(2*np.pi*f0*2.76*tt) * np.exp(-tt*3.4)
         + 0.18 * np.sin(2*np.pi*f0*5.42*tt) * np.exp(-tt*4.6))
    return s * np.minimum(tt / 0.004, 1.0)

add(bell(196.0), 40.65, 0.30, 0.05)
add(bell(392.0, 2.2), 40.65, 0.06, -0.2)

# --- narration
places = {"l1": 7.0, "l2": 14.6, "l3": 24.6, "l4": 34.4}
for k, at in places.items():
    v, sr = sf.read(f"output/tanzhe-45s/voice/{k}.wav", dtype="float32")
    if v.ndim > 1: v = v.mean(axis=1)
    v = v / (np.max(np.abs(v)) + 1e-9) * 0.72
    # gentle fades
    f = int(0.02 * SR)
    v[:f] *= np.linspace(0, 1, f); v[-f:] *= np.linspace(1, 0, f)
    add(v, at, 1.0, 0.0)

# --- soft clip + normalize
mix = np.tanh(mix * 1.1)
peak = np.max(np.abs(mix))
mix = mix / peak * 0.89
sf.write("output/tanzhe-45s/mix-raw.wav", mix, SR)
print("peak", round(float(peak), 3), "len", round(N / SR, 2))
