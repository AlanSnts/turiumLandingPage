"""Quadros soltos para revisão: python tools/shots.py <saida> <pagina> t1 t2 ..."""
import asyncio, os, sys
from playwright.async_api import async_playwright
OUT, PAGE = sys.argv[1], sys.argv[2]; TS = [float(x) for x in sys.argv[3:]]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1920, 'height': 1080})
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + ROOT + '/' + PAGE + '#paused')
        await pg.wait_for_function('document.getElementById("gate").classList.contains("gone")', timeout=30000)
        await pg.evaluate("document.fonts.ready")
        await pg.evaluate("document.getElementById('player').style.display='none'")
        for t in TS:
            await pg.evaluate(f"async () => {{ Film.T = {t}; Film.render(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }}")
            await pg.screenshot(path=os.path.join(OUT, f't{t:05.1f}.png'))
        print('dur', await pg.evaluate('Film.duration'), 'erros', errs)
        await b.close()
asyncio.run(run())
