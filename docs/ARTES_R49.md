# Origem dos quadros do cavaleiro — R49

Três folhas 4 × 4 editadas a partir do cavaleiro dourado original, usando imagegen. O PNG original da R48 era uma folha 8 × 8 com desenhos atravessando células. As folhas abaixo fornecem 48 poses isoladas e preservam a armadura, o elmo fechado, a auréola e a capa clara.

O empacotamento mecânico corta, redimensiona e posiciona as células, sem desenhar ou recolorir pixels. A limpeza de componentes isolados no carregamento continua ativa. As demais sete imagens de execução permanecem idênticas às da R48.

## locomotion

Arquivo: `assets/source/characters/knight-locomotion.png`

Prompt usado:

```
Asset type: a production pixel-art animation sheet for VEILFALL. Input image is ONLY the character design reference, NOT a layout reference. Reorganize into EXACTLY FOUR COLUMNS AND FOUR ROWS, sixteen separate complete frames on transparent background. DO NOT reuse the crowded 8x8 layout. The character is the exact same gold celestial knight: CLOSED face helmet, slim golden armor, circular thin gold halo behind head, short ivory tattered cape, gold sword. Preserve its identity, proportions, gothic chunky pixel style and 3/4 top-down viewpoint. Critical packing: each frame occupies only the central HALF of its equal cell. All limbs, cape, sword and halo fit with a LARGE CLEAR TRANSPARENT GUTTER on EVERY side. A knight's height is approximately ONE EIGHTH of the entire sheet height. Do not crop any body part or weapon, no shared effect across cells. No labels, grid, colored fringe or background. Consistent body size and feet baseline within every row. Row 1: four subtle FRONT idle poses, breathing. Row 2: four BACK idle poses showing ivory cape. Row 3: four clearly different FRONT walking cycle poses with alternating feet. Row 4: four clearly different BACK walking cycle poses. 
```

## combat

Arquivo: `assets/source/characters/knight-combat.png`

Prompt usado:

```
Asset type: a production pixel-art animation sheet for VEILFALL. Input image is ONLY the character design reference, NOT a layout reference. Reorganize into EXACTLY FOUR COLUMNS AND FOUR ROWS, sixteen separate complete frames on transparent background. DO NOT reuse the crowded 8x8 layout. The character is the exact same gold celestial knight: CLOSED face helmet, slim golden armor, circular thin gold halo behind head, short ivory tattered cape, gold sword. Preserve its identity, proportions, gothic chunky pixel style and 3/4 top-down viewpoint. Critical packing: each frame occupies only the central HALF of its equal cell. All limbs, cape, sword and halo fit with a LARGE CLEAR TRANSPARENT GUTTER on EVERY side. A knight's height is approximately ONE EIGHTH of the entire sheet height. Do not crop any body part or weapon, no shared effect across cells. No labels, grid, colored fringe or background. Consistent body size and feet baseline within every row. Row 1: four SIDE walking cycle poses facing screen right. Row 2: four sword attack cycle poses: ready, anticipation raised blade, impact swinging blade, recovery. Row 3: four FAITH spell cast poses: gather, raise hand, release, recovery, only tiny compact golden hand light. Row 4: four ARCANE spell cast poses: gather, channel, release, recovery, only tiny compact blue hand light. NO long sword trails, beams, rings or large effects because effects are separate game layers. 
```

## reactions

Arquivo: `assets/source/characters/knight-reactions.png`

Prompt usado:

```
Asset type: a production pixel-art animation sheet for VEILFALL. Input image is ONLY the character design reference, NOT a layout reference. Reorganize into EXACTLY FOUR COLUMNS AND FOUR ROWS, sixteen separate complete frames on transparent background. DO NOT reuse the crowded 8x8 layout. The character is the exact same gold celestial knight: CLOSED face helmet, slim golden armor, circular thin gold halo behind head, short ivory tattered cape, gold sword. Preserve its identity, proportions, gothic chunky pixel style and 3/4 top-down viewpoint. Critical packing: each frame occupies only the central HALF of its equal cell. All limbs, cape, sword and halo fit with a LARGE CLEAR TRANSPARENT GUTTER on EVERY side. A knight's height is approximately ONE EIGHTH of the entire sheet height. Do not crop any body part or weapon, no shared effect across cells. No labels, grid, colored fringe or background. Consistent body size and feet baseline within every row. Row 1: four hit reaction poses: light recoil, shield arm protecting chest, heavy recoil, recovery. Row 2: four death sequence poses: kneeling, falling sideways, almost prone, lying completely prone, complete cape and weapon within cell. Row 3: four revival sequence poses: kneeling with head bowed, rising on one knee, half standing, upright restored stance. Row 4: four second sword attack cycle poses: ready side stance, backswing, horizontal slash, recovery. NO large spell effects or long sword trails. 
```

## Atlas final

`assets/characters/knight.png`: 1024 × 768, grade 8 × 6, células de 128 px e apoio vertical em 105 px. O mapa por quadro está em `assets/knight-manifest.json`.

A revisão usa ciclos curtos de quatro poses, não animação tradicional com dezenas de desenhos intermediários por ação. A fluidez vem da cadência, da antecipação e recuperação do ataque e dos efeitos sincronizados aos eventos reais.

