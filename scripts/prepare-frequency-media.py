"""Build compact seamless 10-second audio loops from the supplied hour-long recordings.
Usage: python3 scripts/prepare-frequency-media.py [source-directory]
Original recordings stay outside the website; only compact loops are published.
"""
from pathlib import Path
import subprocess
import sys
import wave
import numpy as np

source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Downloads'
target = Path(__file__).resolve().parents[1] / 'public/media/frequencies'
target.mkdir(parents=True, exist_ok=True)
for name in ('01_regeneration_theta_6.3hz.mp4', '02_iq_elevation_beta_18.0hz.mp4', '03_superlearning_alpha_10.0hz.mp4'):
    original = source / name
    stem = name[:2]
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-ss', '30', '-i', str(original),
                                   '-t', '10.02', '-vn', '-f', 'f32le', '-acodec', 'pcm_f32le', '-'])
    samples = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
    count, overlap = 441000, 882
    # Ten seconds is an integer number of cycles for every carrier. Blend the
    # next 20 ms into the start to join the pink noise without shifting phase.
    blend = np.linspace(0, 1, overlap)[:, None]
    samples[:overlap] = samples[count:count + overlap] * (1 - blend) + samples[:overlap] * blend
    with wave.open(str(target / f'{stem}.wav'), 'wb') as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(44100)
        output.writeframes((np.clip(samples[:count], -1, 1) * 32767).astype('<i2').tobytes())
