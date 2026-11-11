from pathlib import Path
import re,json
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
 page.set_content(html.replace('</head>','<base href="http://localhost/"></head>'),timeout=60000)
 page.evaluate('window.requestAnimationFrame=()=>0')
 for style in styles:page.add_style_tag(content=(root/style).read_text(encoding='utf-8'))
 for script in scripts:page.add_script_tag(content=(root/script).read_text(encoding='utf-8'))
 page.wait_for_timeout(400)
 info=page.evaluate('''() => ({title:document.title, realButton:!!document.querySelector('#start-real-campaign-test'), vButton:!!document.querySelector('#start-difficulty-five-test'), menu:!document.querySelector('#start-overlay').classList.contains('hidden')})''')
 assert 'R79' in info['title'] and info['realButton'] and info['vButton'] and info['menu'],info
 print('MENU',info)
 page.locator('#new-game').click(timeout=20000)
 page.wait_for_timeout(400)
 original=page.evaluate('''() => ({saved:safeStorage.getItem(BKEY+'1'),stage:g.stage,heroes:JSON.stringify(g.heroLevels),artifacts:JSON.stringify(g.artifactLevels),hp:player.hp})''')
 page.evaluate("startEndgameTrial('real')")
 page.wait_for_timeout(300)
 active=page.evaluate('''() => ({scenario:trialScenario, stage:g.stage, isTrial:endgameTrial, isTestMode:testMode, ctrl:document.querySelector('#panel-body').textContent.includes('SAVE REAL'), bonuses:trialPower.physical.num(1)})''')
 assert active['scenario']=='real' and active['isTrial'] and active['isTestMode'] and active['ctrl'] and active['bonuses']==1, active
 print('ACTIVE_REAL',active)
 page.evaluate('''() => {g.stage=73;g.knightLevel=999;g.heroLevels.h01=8000;gold=B(1e30);save(1,true)}''')
 page.locator('#exit-trial').click(timeout=20000)
 page.wait_for_timeout(300)
 after=page.evaluate('''() => ({saved:safeStorage.getItem(BKEY+'1'),stage:g.stage,heroes:JSON.stringify(g.heroLevels),artifacts:JSON.stringify(g.artifactLevels),isTrial:endgameTrial})''')
 assert after['saved']==original['saved'] and after['stage']==original['stage'] and after['heroes']==original['heroes'] and after['artifacts']==original['artifacts'] and not after['isTrial'],after
 print('RESTORED',{'stage':after['stage'],'savedUnchanged':True})
 page.evaluate("startEndgameTrial('v24000')")
 page.wait_for_timeout(300)
 v=page.evaluate('''() => ({scenario:trialScenario,stage:g.stage,isTrial:endgameTrial,calibrated:trialPower.physical.cmp(1)!==0,btn:document.querySelector('#trial-farm-toggle').classList.contains('hidden')})''')
 assert v['scenario']=='v24000' and v['stage']==24000 and not v['btn'],v
 print('MAX_MODE',v)
 page.locator('#exit-trial').click(timeout=20000)
 page.wait_for_timeout(100)
 print('PAGE_ERRORS',errors)
 if errors:raise SystemExit(1)
 browser.close()
