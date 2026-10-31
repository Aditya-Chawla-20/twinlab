"""Optional macOS presentation renderer. Requires say, ffmpeg/ffprobe and Pillow.
Uses committed actual-UI frames and licensed footage; it never calls a model.
Run from the repository root: python3 scripts/render-demo.py
"""
import hashlib
import json
import math
import subprocess
import textwrap
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'artifacts/demo/render'
OUT = ROOT / 'public/demo'
SPEC = json.loads((ROOT / 'specs/demo/storyboard.json').read_text())
FONT = '/System/Library/Fonts/Supplemental/Arial.ttf'


def run(*args):
    subprocess.run([str(a) for a in args], check=True, stdout=subprocess.DEVNULL,
                   stderr=subprocess.PIPE)


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)]))


def stamp(seconds, separator=','):
    ms = round(seconds * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02}{separator}{ms % 1000:03}'


def main():
    assert SPEC['width'] == 1920 and SPEC['height'] == 1080
    assert 1 <= len(SPEC['scenes']) <= 12
    assert 130 <= SPEC['wordsPerMinute'] <= 190
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(exist_ok=True)
    chunks, cues, chapters = [], [], []
    elapsed = 0.0
    # Narration first: exact synthesized sentence lengths determine every caption/cut.
    for scene in SPEC['scenes']:
        base = ROOT / 'specs/assets/demo' / (scene['id'] + '.png')
        assert Image.open(base).size == (1920, 1080)
        chapters.append({'id': scene['id'], 'title': scene['title'], 'start': elapsed})
        for number, sentence in enumerate(scene['sentences']):
            key = scene['id'] + f'-{number:02}'
            txt, aiff, wav = (WORK / (key + ext) for ext in ('.txt', '.aiff', '.wav'))
            txt.write_text(sentence)
            fingerprint = hashlib.sha256(f'{SPEC["voice"]}:{SPEC["wordsPerMinute"]}:{sentence}'.encode()).hexdigest()
            cache = WORK / (key + '.sha256')
            if not wav.exists() or not cache.exists() or cache.read_text() != fingerprint:
                run('say', '-v', SPEC['voice'], '-r', SPEC['wordsPerMinute'], '-f', txt, '-o', aiff)
                run('ffmpeg', '-v', 'error', '-y', '-i', aiff, '-ar', '48000', '-ac', '1', wav)
                cache.write_text(fingerprint)
            with wave.open(str(wav)) as audio:
                duration = audio.getnframes() / audio.getframerate()
            # Align cuts to 30 fps; pad audio, never accelerate narration.
            duration = math.ceil(duration * 30) / 30
            frame = Image.open(base).convert('RGB')
            draw = ImageDraw.Draw(frame)
            font = ImageFont.truetype(FONT, 32)
            lines = textwrap.wrap(sentence, width=105)
            assert len(lines) <= 3, sentence
            for row, line in enumerate(lines):
                draw.text((48, 922 + row * 36), line, font=font, fill='white')
            png, mp4 = WORK / (key + '.png'), WORK / (key + '.mp4')
            frame.save(png)
            chunks.append({'frame': png, 'audio': wav, 'output': mp4, 'duration': duration,
                           'footage': scene['visual'] == 'footage', 'offset': elapsed})
            cues.append((elapsed, elapsed + duration, sentence))
            elapsed += duration
    assert elapsed <= 180, f'Narration is {elapsed:.2f}s; shorten storyboard before rendering'
    print(f'Narration measured {elapsed:.2f}s; rendering {len(chunks)} captioned cuts', flush=True)
    for index, chunk in enumerate(chunks):
        args = ['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-i', chunk['frame'],
                '-i', chunk['audio']]
        filters = []
        if chunk['footage']:
            args += ['-ss', str(chunk['offset']), '-i', ROOT / 'public/examples/beam-A-20s.mp4']
            filters = ['-filter_complex', '[2:v]scale=960:768[clip];[0:v][clip]overlay=48:120:eof_action=pass[v]', '-map', '[v]']
        else:
            filters = ['-map', '0:v']
        run(*args, *filters, '-map', '1:a', '-af', 'volume=0.8,apad', '-t', str(chunk['duration']),
            '-r', '30', '-c:v', 'libx264', '-threads', '4', '-preset', 'veryfast', '-crf', '23',
            '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', chunk['output'])
        print(f'{index + 1}/{len(chunks)}', flush=True)
    concat = WORK / 'concat.txt'
    concat.write_text(''.join(f"file '{c['output']}'\n" for c in chunks))
    dest = OUT / 'twinlab-demo.mp4'
    run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', concat,
        '-c', 'copy', '-movflags', '+faststart', dest)
    actual = probe(dest)
    assert float(actual['format']['duration']) <= 180.1
    assert any(s['codec_type'] == 'audio' for s in actual['streams'])
    (OUT / 'twinlab-demo.srt').write_text('\n\n'.join(
        f'{i + 1}\n{stamp(a)} --> {stamp(b)}\n{text}' for i, (a, b, text) in enumerate(cues)) + '\n')
    (OUT / 'twinlab-demo.vtt').write_text('WEBVTT\n\n' + '\n\n'.join(
        f'{stamp(a, ".")} --> {stamp(b, ".")}\n{text}' for a, b, text in cues) + '\n')
    (OUT / 'transcript.md').write_text('# TwinLab demo transcript\n\nSynthetic system narration; actual app screen captures and licensed filmed footage. Recorded Meta outputs; no fresh inference.\n\n' + '\n\n'.join(
        f'## {stamp(chapter["start"], ".")} — {scene["title"]}\n\n' + ' '.join(scene['sentences'])
        for chapter, scene in zip(chapters, SPEC['scenes'])) + '\n')
    manifest = {'durationSeconds': float(actual['format']['duration']), 'chapters': chapters,
                'sha256': hashlib.sha256(dest.read_bytes()).hexdigest(), 'bytes': dest.stat().st_size,
                'storyboardSha256': hashlib.sha256((ROOT / 'specs/demo/storyboard.json').read_bytes()).hexdigest(),
                'voice': SPEC['voice'], 'wordsPerMinute': SPEC['wordsPerMinute'],
                'frameSha256': {s['id']: hashlib.sha256((ROOT / 'specs/assets/demo' / (s['id'] + '.png')).read_bytes()).hexdigest() for s in SPEC['scenes']},
                'footageSha256': hashlib.sha256((ROOT / 'public/examples/beam-A-20s.mp4').read_bytes()).hexdigest()}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest), flush=True)


if __name__ == '__main__':
    main()
