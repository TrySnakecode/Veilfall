from playwright.sync_api import sync_playwright
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parent.parent
errors=[]
html=(root/'index.html').read_text(encoding='utf-8')
source_names=re.findall(r'<script src="([^"]+)"',html)
html=re.sub(r'<script src="[^"]+"></script>','',html)
html=re.sub(r'<link rel="stylesheet" href="[^"]+">','',html)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html.replace('</head>','<base href="http://localhost/"></head>'))
 page.evaluate('window.requestAnimationFrame=()=>0')
 for name in ['base','visual','polish','r52','r66','r67','r68']:
  page.add_style_tag(content=(root/'src'/f'{name}.css').read_text(encoding='utf-8'))
 for name in source_names:
  try:page.add_script_tag(content=(root/name).read_text(encoding='utf-8'))
  except Exception as e: print('Script error load',name,str(e)[:1000]);raise
 print('initial state',page.evaluate("({title:document.title,hasStart:!!document.querySelector('#new-game'),nodes:P67.nodes.length})"))
 page.click('#new-game')
 page.wait_for_timeout(180)
 page.evaluate("()=>{g.talentPoints=4800;tab='skills';skillView='tree';panelMode='info';UI67.selected='origin';renderPanel();}")
 page.wait_for_timeout(300)
 print('tree',page.evaluate("({nodes:document.querySelectorAll('.p67-node').length,detail:document.querySelector('#p67-detail')?.innerText.slice(0,200),balance:document.querySelector('#p67-balance')?.innerText,errors:[]})"))
 page.screenshot(path=str(root/'docs/R68_ARVORE_DESKTOP.png'),full_page=False)
 page.evaluate("()=>{r67TreeAction('result','core_center');}")
 print('core selected',page.locator('#p67-detail').inner_text()[:370])
 page.locator('[data-p67="route"]').click()
 print('rank1',page.evaluate("({draft:JSON.stringify(r67Draft()),dirty:r67Dirty(),spent:p67Cost(r67Draft()),next:document.querySelector('#p67-detail')?.innerText.slice(0,250)})"))
 page.locator('[data-p67="rank5"]').click()
 print('rank5',page.evaluate("({draft:r67Draft().core_center,spent:p67Cost(r67Draft()),display:document.querySelector('#p67-detail')?.innerText.slice(0,300)})"))
 page.screenshot(path=str(root/'docs/R68_TALENTO_RANK.png'),full_page=False)
 page.locator('[data-p67="apply"]').click()
 print('applied',page.evaluate("({spent:g.talentSpent,rank:g.passiveNodes.core_center,version:g.passiveVersion})"))
 page.locator('[data-p67="rankMinus"]').click()
 print('minus',page.evaluate("({draft:r67Draft().core_center,spent:p67Cost(r67Draft())})"))
 page.evaluate("()=>r67TreeAction('sector','magic')")
 page.screenshot(path=str(root/'docs/R68_MAGIA.png'),full_page=False)
 qa=(root/'qa-r68.html').read_text(encoding='utf-8').split('<script>')[-1].split('</script>')[0]
 page.add_script_tag(content=qa)
 page.evaluate("() => {const p=document.createElement('pre');p.id='r68-report';document.body.appendChild(p)}")
 page.evaluate("()=>{document.querySelector('#r68-qa')?.remove();}") if False else None
 print('r68 qa', page.evaluate('runR68QA()'))
 print('errors',errors[:20]); browser.close()
if errors:raise SystemExit(1)
