"""Turium — filme 3: grava o filme quadro a quadro (Playwright + Chromium) em JPG.
Uso: python tools/render_frames.py <pasta_saida> [fps=30] [pagina=perdas.html]
O relógio do filme é posicionado em cada quadro (Film.T = i/fps) — o resultado é determinístico."""
import asyncio, os, sys, time
from playwright.async_api import async_playwright
OUT = sys.argv[1]; FPS = int(sys.argv[2]) if len(sys.argv) > 2 else 30
PAGE = sys.argv[3] if len(sys.argv) > 3 else 'perdas.html'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.makedirs(OUT, exist_ok=True)
async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1920, 'height': 1080})
        await pg.goto('file://' + ROOT + '/' + PAGE + '#paused')
        await pg.wait_for_function('document.getElementById("gate").classList.contains("gone")', timeout=30000)
        await pg.evaluate("document.fonts.ready")
        await pg.evaluate("document.getElementById('player').style.display='none'; document.getElementById('gate').style.display='none'")
        dur = await pg.evaluate('Film.duration'); n = int(round(dur * FPS))
        t0 = time.time()
        for i in range(n):
            await pg.evaluate(f"async () => {{ Film.T = {i / FPS}; Film.render(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }}")
            await pg.screenshot(path=os.path.join(OUT, f'f{i:05d}.jpg'), type='jpeg', quality=94)
            if i % 300 == 0: print(i, '/', n, round(time.time() - t0), 's', flush=True)
        print('frames', n, 'secs', round(time.time() - t0), flush=True)
        await b.close()
asyncio.run(run())
