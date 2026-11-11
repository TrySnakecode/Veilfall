from pathlib import Path
import re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
errors=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(root/'index.html').read_text(encoding='utf-8')
    styles=re.findall(r'<link rel="stylesheet" href="([^"]+)"',html)
    scripts=re.findall(r'<script src="([^"]+)"',html)
    html=re.sub(r'<script src="[^"]+"></script>','',html)
    html=re.sub(r'<link rel="stylesheet" href="[^"]+">','',html)
    page.set_content(html.replace('</head>','<base href="http://localhost/"></head>'),timeout=30000)
    page.evaluate('window.requestAnimationFrame=()=>0')
    for style in styles:page.add_style_tag(content=(root/style).read_text(encoding='utf-8'))
    for script in scripts:page.add_script_tag(content=(root/script).read_text(encoding='utf-8'))
    page.wait_for_timeout(500)
    info=page.evaluate('''() => ({title:document.title,menuPresent:!!document.querySelector('.r73-menu'),start:!!document.querySelector('#new-game'),stageLabel:!!document.querySelector('#hdr-world'),raid:!!window.VeilRaid})''')
    print('INITIAL',info)
    assert 'R77' in info['title']
    assert info['start'] and info['stageLabel']
    page.locator('#new-game').click(timeout=10000)
    page.wait_for_timeout(800)
    state=page.evaluate('''() => ({playing:typeof playing!=='undefined'&&playing,stage:g.stage,prestige:typeof earlyPrestigeRelicMultiplier==='function'?earlyPrestigeRelicMultiplier(55,0):null})''')
    print('CAMPAIGN',state)
    assert state['playing'] is True and state['stage'] == 1
    assert state['prestige'] == 1.75
    print('PAGE_ERRORS',errors)
    browser.close()
    if errors:raise SystemExit(1)
