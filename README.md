# Velocity X — o tênis de knit, em 3D

Site de lançamento de um tênis com um **modelo 3D real (escaneado) renderizado em tempo real** no navegador: o wordmark fica atrás do tênis, um tour guiado pelo scroll mostra as medidas reais do modelo com linhas de cota, e o configurador troca as **três colorways reais** do arquivo 3D.

**Site no ar:** https://devjoaosousa9.github.io/velocity-x/

> Velocity X é um produto conceitual para portfólio de Creative Development. Nada é vendido; preço e carrinho são demonstrativos.

## O modelo 3D

| | |
| --- | --- |
| Arquivo | `public/models/shoe.glb` |
| Origem | [Materials Variants Shoe](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe), Khronos glTF Sample Assets |
| Autor / licença | Shopify, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (crédito no rodapé e na seção Details) |
| Geometria | malha escaneada única, 22,7 mil triângulos |
| Materiais | 3 conjuntos PBR completos (cor, normal, oclusão, rugosidade), um por colorway, via `KHR_materials_variants` |
| Compressão | 7,8 MB → 1,8 MB com `gltf-transform optimize --compress meshopt --texture-compress webp --texture-size 2048` |
| Medidas (bounding box) | 298 × 152 × 116 mm (comprimento × altura × largura) |

As colorways (Midnight, Beach, Street) são os materiais do próprio arquivo: a troca substitui texturas reais, nunca é um filtro de cor. Por ser uma malha única, o modelo não permite vista explodida — essa seção foi substituída pelo tour com medidas, que é verdadeiro para este asset.

## Arquitetura

| Camada | Escolha |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript strict; todo o texto é HTML do servidor |
| 3D | three.js + React Three Fiber + drei (`useGLTF` com meshopt, `Html`, `Line`, `Environment`/`Lightformer`, `ContactShadows`) |
| Scroll | GSAP ScrollTrigger seeking **uma timeline central** (`src/animation`) |
| Estado | Zustand (`src/store/useExperience.ts`): colorway, largura, tamanho, carrinho, modo do palco, passo do tour |
| Estilo | Tailwind 4 + CSS (`src/app/globals.css`), fontes Big Shoulders + Instrument Sans |

**Camadas da página:** fundo (papel) → wordmark do hero (z 0) → canvas WebGL transparente fixo (z 1) → conteúdo (z 2). Por isso o tênis gira *na frente* do wordmark.

**Quem controla o quê:** o ScrollTrigger só escreve a pose desejada (`sceneTarget`); o configurador só escreve `turntable` no store; o `CameraRig` é o único que move câmera e produto, com amortecimento independente de FPS e quaternions. Cada passo do tour tem um *mark* (posição 0–1 da seção) onde o enquadramento correspondente é atingido exatamente (`src/config/shots.ts`).

**Qualidade adaptativa:** tier inicial por sinais reais do aparelho (renderizador WebGL, WebGL2, núcleos, memória, `saveData`), refinado em execução pelo tempo de quadro medido; DPR, resolução do ambiente e sombra mudam por tier. Render sob demanda (`frameloop="demand"`).

**Fallback:** sem WebGL, ou se o 3D falhar, a página mostra renders estáticos (`public/renders/*.webp`) gerados a partir do próprio modelo, e tudo continua funcionando (configurador, carrinho).

## Estrutura

```
src/
├─ app/            layout (fontes, SEO/Open Graph), page, globals.css
├─ animation/      ScrollDirector, timeline central, sceneTarget
├─ components/
│  ├─ sections/    Hero, Tour, Colourways (configurador), Details, Reserve (+ rodapé)
│  ├─ ui/          Options (colorway, largura, tamanho), CartDrawer, CurrentColourway
│  ├─ layout/      Header, Logo
│  └─ Stage.tsx    canvas fixo, detecção de WebGL, progresso de carregamento, fallback
├─ config/         product (modelo, colorways, tamanhos), shots, tour, site
├─ three/          Scene, RealShoe (variantes), CameraRig, Lighting, Callouts (pinos e cotas)
├─ store/ hooks/ lib/ types/
tests/unit         Vitest + Testing Library
tests/e2e          Playwright (desktop + mobile) contra o build estático
```

## Rodar

```bash
npm install
npm run dev            # http://localhost:3000
npm run build:pages    # export estático em out/ (base /velocity-x)
npm test               # unitários
npx playwright install chromium && npm run test:e2e
```

> Windows: não instale `node_modules` dentro de pasta do OneDrive (a sincronização trava o `npm install`).

URL params: `?webgl=0` força o fallback; `?quality=low|medium|high` força o tier.

## Trocar o modelo

1. Exporte um GLB com as colorways como `KHR_materials_variants` (nomes iguais a `variant` em `src/config/product.ts`).
2. Comprima: `npx gltf-transform optimize in.glb public/models/shoe.glb --compress meshopt --texture-compress webp --texture-size 2048 --join false`.
3. Atualize `MODEL` (escala, offset e medidas da bounding box), as âncoras dos pinos em `src/config/tour.ts` e os enquadramentos em `src/config/shots.ts`.
4. Regere os renders de fallback (`public/renders/*.webp`).

## Deploy

GitHub Pages pelo branch `gh-pages` (conteúdo de `out/`). Para CI + deploy automático, copie `docs/github-actions-deploy.yml` para `.github/workflows/` (exige token com escopo `workflow`). Na Vercel, o build padrão funciona sem mudanças.

## Testes

* Unitários (31): store (colorway, largura indisponível, tamanhos esgotados, carrinho), timeline central e marcas do tour, enquadramento responsivo, o próprio GLB (variantes, compressão, medidas), qualidade adaptativa, componentes (teclado, fallback, progresso, movimento reduzido).
* E2E (17, desktop + mobile): render 3D sem erros de console, tour, navegação, configurador → carrinho, troca de colorway no hero, teclado, fallback sem WebGL, `prefers-reduced-motion`, sem overflow horizontal.

Licença do código: MIT. Modelo 3D: CC BY 4.0, Shopify.
