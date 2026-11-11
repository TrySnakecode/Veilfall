const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const files=Object.fromEntries(['src/r72-ux.css','src/r72-ux.js','src/game.js','index.html','tools/build-standalone.cjs'].map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
let n=0;function test(name,fn){fn();n++;console.log('PASS '+name)}
test('Fixed grid is used for stage navigation',()=>assert.match(files['src/r72-ux.css'],/\.r72 \.lower-strip\{display:grid/));
test('Hidden stage button keeps an occupied layout slot',()=>assert.match(files['src/r72-ux.css'],/#stage-advance\.hidden\{display:inline-flex!important;visibility:hidden/));
test('Combat messages are ellipsized instead of rearranging stage controls',()=>assert.match(files['src/r72-ux.css'],/\.r72 \.lower-msg\{[^}]*text-overflow:ellipsis/));
test('Hero cards use stable dimensions',()=>assert.match(files['src/r72-ux.css'],/\.r72-hero-card\{height:183px;min-height:183px;max-height:183px/));
test('Hero details can expand on request',()=>assert.match(files['src/r72-ux.css'],/r72-hero-card:has\(details\[open\]\)/));
test('Hero buttons have stable short labels',()=>assert.match(files['src/game.js'],/const buyLabel=canTrans\?'TRANSCENDER':`UPAR \$\{mode\}`/));
test('Cost remains visible on hero card',()=>assert.match(files['src/game.js'],/r72-hero-price/));
test('Preserve panel scroll anchor',()=>assert.match(files['src/r72-ux.js'],/matching\.getBoundingClientRect\(\)\.top-anchor\.top/));
test('Messages render in combat canvas, not over hero controls',()=>assert.match(files['src/r72-ux.js'],/\.battle-stage'\)\.append\(document\.querySelector\('#toast-root'\)\)/));
test('Modular & portable builds contain the R72 layer',()=>{assert.match(files['index.html'],/src\/r72-ux\.css/);assert.match(files['index.html'],/src\/r72-ux\.js/);assert.match(files['tools/build-standalone.cjs'],/'r67','r68','r72-ux'/)});
console.log('R72',n+'/'+n);
