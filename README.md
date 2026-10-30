# VELOCITY X — Beyond Motion

Site de campanha de lançamento de um tênis de corrida, com **carrossel de campanha com fotografia real do produto**, narrativa guiada pelo scroll, detalhes técnicos, anatomia anotada, configurador (cores, materiais, variantes, tamanhos) e um carrinho demonstrativo.

O projeto tem duas edições, escolhidas em `src/config/site.ts` (`EXPERIENCE`):

* **`'photo'` (publicada)** — página de campanha cinematográfica com a fotografia real do tênis, sem render 3D (`src/components/campaign/`):
  hero em "cartão de estúdio" com wordmark gigante e chips de vidro com specs; **tour cinematográfico guiado pelo scroll** (palco sticky + GSAP ScrollTrigger movendo uma "câmera" pela foto: perfil → calcanhar → malha → entressola → bico); **marquee infinito em duas linhas**; **grade bento** com cards de foto e de dados; **painel de produto estilo HUD** (medidor de amortecimento, cor, material, variante, tamanho, resumo e "Add to Bag"); CTA final com formulário demonstrativo e wordmark no rodapé.
  As cores além de *Volt Yellow* (a cor fotografada) são **pré-visualizações simuladas** por filtro de matiz e aparecem rotuladas como tal. O chunk de 3D nunca é baixado nesta edição.
* **`'3d'`** — o modelo 3D procedural em tempo real (WebGL) descrito abaixo, com vista explodida e turntable.

> **Sobre a foto:** `public/product/shoe-side.webp` é uma imagem de referência de um tênis de terceiros, usada apenas como demonstração de portfólio; marcas e design pertencem aos respectivos donos. Para uso comercial, substitua por fotos próprias/licenciadas (mais ângulos podem ser adicionados em `src/config/photos.ts`).

**Site no ar:** https://devjoaosousa9.github.io/velocity-x/

> Velocity X é um produto conceitual criado para portfólio de Creative Development. Nenhum produto real é vendido; preços são demonstrativos e não há checkout.

---

## A. Arquitetura e decisões técnicas

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Framework | **Next.js 16 (App Router)** + React 19 + TypeScript strict | Página inteira renderizada no servidor (HTML indexável); só o necessário é Client Component |
| 3D | **Three.js 0.186 + React Three Fiber 9 + drei 10** | Cena declarativa, `frameloop="demand"`, utilitários (Html ancorado, Environment, ContactShadows) |
| Animação | **GSAP 3.15 + ScrollTrigger** (+ `@gsap/react`) | Uma **timeline central** pausada; seções só fazem *seek* nela |
| Estado | **Zustand 5** | Configuração, carrinho, modo do palco, preferências de movimento, tier de qualidade |
| Estilo | **Tailwind CSS 4** (tokens em `@theme`) + CSS semântico | Tokens únicos (cores, fontes, easing) e componentes legíveis |
| Pós-processamento | `@react-three/postprocessing` (só no tier alto, carregado sob demanda) | Bloom com limiar > 1 (só o emissivo HDR brilha) + vinheta suave |

### Quem controla o quê (sem conflitos câmera × scroll × controles)

```
ScrollTrigger (por seção) ──seek──▶ Timeline GSAP central ──escreve──▶ sceneTarget (pose desejada)
Configurador (UI/drag/teclado) ─────────────────────────────escreve──▶ store.turntable (yaw/pitch/zoom)
                                                                          │
CameraRig (useFrame) ◀──────────────── lê ambos ─────────────────────────┘
   └─ ÚNICO código que escreve camera.position, alvo do lookAt e transform do tênis
      (amortecimento exponencial independente de FPS; orientação via quaternion slerp)
```

* Não há OrbitControls: no configurador, o arraste gira o **objeto** (turntable) com `touch-action: pan-y`, então no celular o scroll vertical continua nativo e só o arraste horizontal gira o tênis. Zoom por botões/teclado, com limites (0,7×–1,45×).
* Enquadramentos ficam em `src/config/shots.ts` (posição/alvo da câmera, posição/rotação do produto, explosão, giro, cor de fundo). Em telas estreitas/retrato `adaptShotForAspect` recentraliza e afasta a câmera.

### O modelo 3D

O tênis é **geometria procedural real** (não imagem), gerada a partir de curvas analíticas em `src/three/geometry/shoeProfile.ts`, inspirada em tênis de corrida de elite ("super shoe"): entressola alta com *rocker* e flare no calcanhar, placa embutida visível na lateral, pads de borracha só no calcanhar e antepé (meio do pé com espuma exposta), cabedal de malha de baixo volume com **abertura de tornozelo recortada de verdade**, colarinho acolchoado, puxador, gaiola de tiras soldadas em "X", língua, cadarços chatos em zigue-zague e ilhoses instanciados.

São **7 componentes separados** (sola, entressola, palmilha, cabedal, contraforte, língua, cadarços), por isso a vista explodida move geometria real.

## B. Estrutura de diretórios

```
velocity-x/
├─ docs/github-actions-deploy.yml   CI (typecheck, lint, testes) + deploy no GitHub Pages (opcional)
├─ public/                          favicon, og.png, .nojekyll
├─ src/
│  ├─ app/                          layout (fontes, metadados SEO/Open Graph), page, globals.css
│  ├─ animation/                    ScrollDirector, timeline central, sceneTarget
│  ├─ components/
│  │  ├─ layout/                    Header (menu mobile, progresso, pausa), Footer, Logo
│  │  ├─ sections/                  Hero, Technology, Engineering, Anatomy, Customize, Story, Buy
│  │  ├─ ui/                        Options (cores, materiais, variantes, tamanhos), CartDrawer
│  │  ├─ fallback/                  ShoeFallback (SVG 2D gerado das mesmas curvas), FallbackSlot
│  │  ├─ Stage.tsx                  detecção de WebGL, tier inicial, ErrorBoundary, loader
│  │  └─ ClientShell.tsx
│  ├─ config/                       product, shots, parts, content, site
│  ├─ hooks/                        useMotionPreference
│  ├─ lib/                          quality (política adaptativa), webgl (probe)
│  ├─ store/                        useExperience (Zustand)
│  ├─ three/
│  │  ├─ geometry/                  shoeProfile (curvas), buildShoe (malhas)
│  │  ├─ materials/                 useShoeMaterials, texturas procedurais (knit/weave)
│  │  ├─ models/ProceduralShoe.tsx
│  │  ├─ CameraRig, Lighting, Annotations, Effects, Scene, liveState
│  └─ types/
└─ tests/
   ├─ unit/                         Vitest + Testing Library
   └─ e2e/                          Playwright + servidor estático do build
```

## C. Instalação e execução

Requisitos: Node 20+ (testado com Node 24) e npm.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # build de produção (Vercel/Node)
npm run build:pages    # export estático para GitHub Pages em out/ (base /velocity-x)
npm run serve:out      # ou: node tests/e2e/serve-out.mjs 4173 /velocity-x
```

> Dica Windows: não instale `node_modules` dentro de uma pasta sincronizada pelo OneDrive — a sincronização trava o `npm install`.

Parâmetros de URL úteis: `?webgl=0` força a edição 2D; `?quality=low|medium|high` força o tier gráfico.

## D–G. Implementação, cena, animações e configurador

* **Hero**: entrada coreografada (câmera aproxima, luzes acendem em sequência rim → key → fill/ambiente), tipografia oversized, CTAs e indicador de scroll. Não bloqueia a interação.
* **Scroll story (02)**: 6 etapas — gira, muda orientação, aproxima, lateral, sola, composição final.
* **Engenharia (03)**: Adaptive Cushioning / AeroMesh / Precision Grip, cada uma com enquadramento próprio e hotspot **ancorado em coordenadas do modelo** (`shoeAnchors`).
* **Vista explodida (04)**: progressão escalonada por peça, legendas com linhas de indicação, botão Remontar/Explodir.
* **Configurador (05)**: 5 cores, 3 materiais (malha, carbono, suede — mudam roughness, clearcoat, sheen e relevo), 3 variantes (Road, Trail, Elite — mudam geometria: altura da entressola e dos cravos, cor da sola, brilho da linha de energia), 12 tamanhos (alguns esgotados), restaurar configuração. Combinações indisponíveis mostram aviso e são tratadas no estado.
* **Story (06)** editorial, **Compra (07)** com resumo, "Add to Bag" e "View Details", **Footer (08)**.

## H. Responsividade e qualidade adaptativa

`detectInitialTier` usa sinais reais de capacidade (renderizador WebGL, WebGL2, núcleos, memória, `saveData`, ponteiro) — **nunca só a largura da tela**. Em execução, `AdaptiveQuality` mede o tempo de quadro **apenas em quadros contíguos** (o loop é sob demanda) e desce/sobe de tier com histerese, sem passar do teto do dispositivo.

| Tier | DPR | Malha (u×v) | Sombras | Pós | Env |
| --- | --- | --- | --- | --- | --- |
| high | 1–2 | 180×56 | ContactShadows 1024 | Bloom + vinheta | 256 |
| medium | 1–1,5 | 120×40 | ContactShadows 512 | — | 128 |
| low | 0,75–1 | 72×26 | quad “blob” | — | 64 |

## I. Desempenho — orçamento e técnicas

**Orçamento** (justificativa: o conteúdo/LCP é texto do servidor; o 3D é progressivo):

| Item | Orçamento | Motivo |
| --- | --- | --- |
| JS inicial (sem 3D) | ≤ 180 KB gz | LCP/INP dependem só do HTML + UI |
| Chunk 3D (three + R3F + drei) | ≤ 350 KB gz, carregado depois | Não bloqueia o primeiro paint |
| Modelo / texturas | 0 KB baixados | Geometria e texturas geradas em runtime |
| Draw calls | ≤ 30 | ~20 malhas, sola e ilhoses instanciados |
| Triângulos | ≤ 120k (high) / ≤ 40k (low) | GPUs integradas e celulares |

Técnicas: `next/dynamic` sem SSR para a cena, `React.lazy` para pós-processamento, `frameloop="demand"` (renderiza só enquanto algo se move), instancing (cravos e ilhoses), materiais criados uma vez e mutados (sem recompilar shaders), descarte de geometrias/materiais/texturas no unmount, estado de alta frequência fora do React (`sceneTarget`, `liveState`), DPR limitado por tier.

> As metas (60 FPS, Lighthouse ≥ 90) são **objetivos**; não foram medidas com Lighthouse neste ambiente.

## J. Testes

```bash
npm run typecheck
npm run lint
npm test               # Vitest + Testing Library (30 testes)
npm run build:pages && npx playwright install chromium && npm run test:e2e
```

Cobertura: renderização das seções, navegação, seleção de cor, tamanho e material, carrinho, fallback sem WebGL, `prefers-reduced-motion` e pausa manual, teclado (skip link, radiogroups com setas, turntable), layout sem overflow horizontal (desktop e mobile), timeline central contígua, enquadramento responsivo, escalonamento da vista explodida, perfil geométrico e política de qualidade.

## K. Deploy

* **GitHub Pages** (atual): o site é publicado a partir do branch `gh-pages`, que contém o conteúdo de `out/` gerado por `npm run build:pages`.
  Para automatizar (CI + deploy a cada push), copie `docs/github-actions-deploy.yml` para `.github/workflows/deploy.yml` e mude a fonte do Pages para "GitHub Actions". O push desse arquivo exige um token com escopo `workflow` (`gh auth refresh -s workflow`).
* **Vercel**: importe o repositório; o build padrão (`npm run build`) já funciona. `vercel.json` define cache imutável para `/_next/static`.

## L. Limitações e substituição do asset 3D

* O tênis é procedural. Ele é fiel à proposta (peças separadas, materiais PBR reais), mas não tem o nível de detalhe de um modelo esculpido/escaneado.
* **Para trocar por um GLB profissional**: modele/exporte no Blender um GLB com nós nomeados `outsole`, `midsole`, `insole`, `upper`, `heelCounter`, `tongue`, `laces`; comprima com `gltf-transform optimize model.glb out.glb --compress draco --texture-compress ktx2`; coloque em `public/models/`; crie um componente com `useGLTF` que aplique os materiais de `useShoeMaterials` e renderize cada nó dentro de um `<group name="…">` com o mesmo nome — `ProceduralShoe` localiza os grupos por nome, então vista explodida e configurador continuam funcionando. Atualize `shoeAnchors` com as coordenadas do novo modelo. *(Este adaptador GLB ainda não foi implementado nem testado.)*
* Sem backend: carrinho em memória; checkout desabilitado por design. A arquitetura (store isolada, `priceFor`, `cartKey`) permite plugar uma API Next/FastAPI + PostgreSQL futuramente.
* Lenis não foi usado: o scroll nativo preserva acessibilidade e desempenho. Cursor customizado não foi usado (não melhora usabilidade aqui).

## Origem e licença dos assets

* Modelo 3D, texturas e ilustração 2D: **gerados por código neste repositório** (MIT).
* Fontes: Archivo e JetBrains Mono via Google Fonts (SIL Open Font License).
* Iluminação: Lightformers do drei (procedural, sem HDRI externo).
* Nenhuma marca, logo ou material de terceiros foi utilizado.

Licença do código: MIT.
