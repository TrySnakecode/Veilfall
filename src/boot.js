
bindControls();renderNav();updateSpeedDisplay();requestAnimationFrame(gameFrame);try{$('#continue-game').disabled=!safeStorage.getItem(BKEY+'1')}catch(e){}

