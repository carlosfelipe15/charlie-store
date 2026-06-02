// pdp.jsx — 3 Product Detail Page variations for Rodi Mercado
// Each shows the Air Fryer Philips XL — uses PDP_PRODUCT

// ═══════════════════════════════════════════════════════════════════
// PDP v1 — Standard: gallery left, info right, sticky-feel buy card
// ═══════════════════════════════════════════════════════════════════
function PDPv1() {
  const p = PDP_PRODUCT;
  const price = p.variants[0].prices[0].amount/100;
  const list  = p.list_price/100;
  const off   = Math.round((1 - price/list) * 100);
  return (
    <div style={{ background: RM.cream, fontFamily: RM.fontBody, color: RM.ink }}>
      <Header/>
      {/* Breadcrumbs */}
      <div style={{ padding:'14px 24px', fontSize: 13, color: RM.ink3, display:'flex', gap: 8, alignItems:'center' }}>
        <span>Inicio</span><span>{Icon.chev(12,'right')}</span>
        <span>Electrodomésticos</span><span>{Icon.chev(12,'right')}</span>
        <span>Cocina</span><span>{Icon.chev(12,'right')}</span>
        <span style={{ color: RM.ink, fontWeight: 600 }}>Air Fryer XL · 6 L</span>
      </div>

      <main style={{ padding:'0 24px 32px', display:'grid', gridTemplateColumns:'minmax(0,1fr) 420px', gap: 32 }}>
        {/* Gallery */}
        <div style={{ display:'grid', gridTemplateColumns:'72px 1fr', gap: 12 }}>
          <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
            {p.gallery.map((g,i)=>(
              <div key={i} style={{ border: `2px solid ${i===0?RM.ink:RM.line}`, borderRadius: 10, padding: 4 }}>
                <PImg vis={g} radius={6} label={false}/>
              </div>
            ))}
          </div>
          <div style={{ background:'#fff', borderRadius: 16, padding: 24, border:`1px solid ${RM.line}`, position:'relative' }}>
            <div style={{ position:'absolute', top: 40, left: 40, display:'flex', gap: 6, zIndex: 3 }}>
              <Badge kind="sale" style={{ boxShadow:'0 2px 8px rgba(0,0,0,.25)' }}>−{off}%</Badge>
              <Badge kind="bolt" style={{ boxShadow:'0 2px 8px rgba(0,0,0,.25)' }}/>
            </div>
            <PImg vis={p.gallery[0]} radius={10} label={false} padded/>
            <button style={{
              position:'absolute', top: 40, right: 40, width: 40, height: 40, borderRadius: 999, zIndex: 3,
              background:'#fff', border:`1px solid ${RM.line}`, color: RM.ink2, display:'grid', placeItems:'center', cursor:'pointer',
            }}>{Icon.heart(18)}</button>
          </div>
        </div>

        {/* Info + Buy */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 12, fontWeight: 700, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em' }}>
            <span>{p.brand}</span>
            <span style={{ color: RM.line }}>·</span>
            <span style={{ color: RM.green }}>● En stock</span>
          </div>
          <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 36, fontWeight: 800, letterSpacing:'-.03em', lineHeight: 1.05, margin:'8px 0 12px' }}>
            Air Fryer Philips XL · 6 L
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap: 12, fontSize: 13 }}>
            <Stars value={p.reviews_summary.avg} size={16}/>
            <span style={{ fontWeight: 700 }}>{p.reviews_summary.avg}</span>
            <span style={{ color: RM.ink3 }}>· {p.reviews_summary.count} reseñas</span>
            <span style={{ color: RM.line }}>|</span>
            <span style={{ color: RM.ink3 }}>SKU: PHL-AF-XL6</span>
          </div>

          {/* Price block */}
          <div style={{ marginTop: 20, padding: 20, background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}` }}>
            <div style={{ display:'flex', alignItems:'baseline', gap: 12, flexWrap:'wrap' }}>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 44, fontWeight: 800, letterSpacing:'-.025em', color: RM.ink }}>{cop(price)}</div>
              <div style={{ fontSize: 18, color: RM.ink4, textDecoration:'line-through' }}>{cop(list)}</div>
              <Badge kind="sale">Ahorras {cop(list-price)}</Badge>
            </div>
            <div style={{ fontSize: 13, color: RM.ink3, marginTop: 6 }}>
              o 4 cuotas sin interés de <strong style={{ color: RM.ink }}>{cop(Math.round(price/4))}</strong> con Addi
            </div>

            {/* Options */}
            {p.options.map(opt=>(
              <div key={opt.title} style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: RM.ink, textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 8 }}>
                  {opt.title}: <span style={{ color: RM.ink2, fontWeight: 600, textTransform:'none' }}>{opt.values[1]}</span>
                </div>
                <div style={{ display:'flex', gap: 6 }}>
                  {opt.values.map((v,i)=>(
                    <button key={v} style={{
                      padding:'8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: `1.5px solid ${i===1 ? RM.ink : RM.line}`,
                      background: i===1 ? RM.ink : '#fff', color: i===1 ? '#fff' : RM.ink,
                      cursor:'pointer', fontFamily: RM.fontBody,
                    }}>{v}</button>
                  ))}
                </div>
              </div>
            ))}

            {/* Qty + add */}
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap: 10, marginTop: 18 }}>
              <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${RM.line}`, borderRadius: 10, height: 52 }}>
                <button style={{ width: 44, height: 50, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.minus(16)}</button>
                <span style={{ minWidth: 36, textAlign:'center', fontWeight: 800, fontSize: 16 }}>1</span>
                <button style={{ width: 44, height: 50, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.plus(16)}</button>
              </div>
              <Btn kind="primary" size="lg" full>{Icon.cart(18)} Agregar al carrito</Btn>
            </div>
          </div>

          {/* Delivery */}
          <div style={{ marginTop: 16, padding: 16, background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}` }}>
            <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: RM.s_mint, color: RM.green, display:'grid', placeItems:'center' }}>{Icon.truck(20)}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Llega <span style={{ color: RM.green }}>mañana viernes</span> · gratis</div>
                <div style={{ fontSize: 12, color: RM.ink3 }}>Pídelo antes de las 4 PM</div>
              </div>
              <Btn kind="ghost" size="sm">Cambiar dirección</Btn>
            </div>
            <div style={{ borderTop:`1px solid ${RM.line2}`, marginTop: 12, paddingTop: 12, display:'flex', alignItems:'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: RM.s_butter, color: RM.yellowDeep, display:'grid', placeItems:'center' }}>{Icon.shield(18)}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>30 días para devolución gratuita</div>
                <div style={{ fontSize: 12, color: RM.ink3 }}>+ 2 años de garantía oficial Philips</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Details tabs */}
      <section style={{ padding:'8px 24px 32px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 32 }}>
          <div>
            <div style={{ display:'flex', gap: 24, borderBottom:`1px solid ${RM.line}`, marginBottom: 24 }}>
              {['Descripción','Especificaciones','Reseñas (312)','Preguntas (18)'].map((t,i)=>(
                <div key={t} style={{
                  padding:'12px 0', fontSize: 14, fontWeight: 700,
                  color: i===0 ? RM.ink : RM.ink3,
                  borderBottom: i===0 ? `2px solid ${RM.red}` : '2px solid transparent', marginBottom: -1,
                }}>{t}</div>
              ))}
            </div>
            <p style={{ fontSize: 15, color: RM.ink2, lineHeight: 1.6, margin: '0 0 20px' }}>{p.description}</p>
            <div style={{ fontSize: 14, fontWeight: 800, color: RM.ink, marginBottom: 10 }}>Lo que incluye</div>
            <ul style={{ paddingLeft: 0, listStyle:'none', margin: 0 }}>
              {p.highlights.map(h=>(
                <li key={h} style={{ display:'flex', alignItems:'flex-start', gap: 10, padding:'6px 0', fontSize: 14, color: RM.ink2 }}>
                  <span style={{ color: RM.green, marginTop: 2 }}>{Icon.check(16)}</span> {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews summary */}
          <div style={{ background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`, padding: 24 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap: 16 }}>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 56, fontWeight: 800, letterSpacing:'-.02em', lineHeight: 1 }}>{p.reviews_summary.avg}</div>
              <div>
                <Stars value={p.reviews_summary.avg} size={16}/>
                <div style={{ fontSize: 12, color: RM.ink3, marginTop: 2 }}>{p.reviews_summary.count} reseñas</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              {[5,4,3,2,1].map((stars,i)=>(
                <div key={stars} style={{ display:'flex', alignItems:'center', gap: 10, fontSize: 12, marginBottom: 6 }}>
                  <span style={{ width: 12, color: RM.ink2, fontWeight: 700 }}>{stars}</span>
                  <span style={{ color: RM.yellowDeep }}>{Icon.star(11)}</span>
                  <div style={{ flex:1, height: 6, background: RM.line2, borderRadius: 999, overflow:'hidden' }}>
                    <div style={{ width:`${p.reviews_summary.dist[i]}%`, height:'100%', background: RM.yellowDeep }}/>
                  </div>
                  <span style={{ width: 32, textAlign:'right', color: RM.ink3 }}>{p.reviews_summary.dist[i]}%</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop:`1px solid ${RM.line2}` }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 6 }}>
                <Stars value={5} size={13}/>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Vale cada peso</span>
                <span style={{ marginLeft:'auto', fontSize: 11, color: RM.ink3 }}>hace 3 días</span>
              </div>
              <p style={{ fontSize: 13, color: RM.ink2, lineHeight: 1.5, margin: 0 }}>Le doy uso casi a diario. Comparada con la que tenía antes, es mucho más silenciosa y la canasta es enorme. — <strong>María L.</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section style={{ padding:'24px 24px 48px' }}>
        <SectionHead kicker="También te puede interesar" title="Completa tu cocina"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap: 14 }}>
          {PRODUCTS.filter(p=>['cat_electro','cat_despensa'].includes(p.category_ids[0])).slice(0,6).map(pr=>(
            <ProductCard key={pr.id} p={pr}/>
          ))}
        </div>
      </section>

      <Footer/>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// PDP v2 — Full-bleed editorial: huge product, sticky buy, content below
// ═══════════════════════════════════════════════════════════════════
function PDPv2() {
  const p = PDP_PRODUCT;
  const price = p.variants[0].prices[0].amount/100;
  const list  = p.list_price/100;
  const off   = Math.round((1 - price/list) * 100);
  return (
    <div style={{ background: RM.paper, fontFamily: RM.fontBody, color: RM.ink }}>
      <Header/>

      {/* Hero — product + headline + sticky buy panel */}
      <section style={{
        background: RM.ink, color:'#fff', padding:'48px 48px 56px', position:'relative', overflow:'hidden',
      }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 48, alignItems:'center' }}>
          <div>
            <div style={{ fontFamily: RM.fontMono, fontSize: 11, letterSpacing:'.12em', color: RM.yellow, marginBottom: 14, textTransform:'uppercase' }}>
              {p.brand} · Cocina sin aceite · 2026
            </div>
            <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 88, fontWeight: 800, letterSpacing:'-.04em', lineHeight: .9, margin:'0 0 18px', textWrap:'balance' }}>
              Air Fryer XL.<br/><span style={{ color: RM.red }}>6 litros.</span>
            </h1>
            <p style={{ fontSize: 17, color:'rgba(255,255,255,.7)', lineHeight: 1.5, maxWidth: 520, margin: 0 }}>
              90% menos grasa. Cocina familiar para 5 personas. Panel digital con 7 programas listos para empezar.
            </p>
            <div style={{ display:'flex', gap: 32, marginTop: 28 }}>
              {[['6 L','capacidad'],['1.700 W','potencia'],['7','programas'],['2 años','garantía']].map(([n,l])=>(
                <div key={l}>
                  <div style={{ fontFamily: RM.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing:'-.02em' }}>{n}</div>
                  <div style={{ fontSize: 11, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.06em', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position:'relative', height: 480 }}>
            <div style={{
              position:'absolute', inset: 0, background: RM.red, borderRadius: 24,
              backgroundImage:`radial-gradient(circle at 70% 30%, ${RM.yellow} 0, transparent 50%)`,
            }}/>
            <div style={{ position:'absolute', inset: 0, display:'grid', placeItems:'center', fontSize: 320 }}>🍟</div>
            <div style={{ position:'absolute', top: 18, right: 18 }}>
              <Badge kind="sale">−{off}% HOY</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky-feeling buy bar */}
      <section style={{
        position:'sticky', top: 0, zIndex: 5,
        borderBottom:`1px solid ${RM.line}`, background:'rgba(255,255,255,.95)', backdropFilter:'blur(8px)',
        padding:'14px 48px',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: RM.ink, color: RM.yellow, display:'grid', placeItems:'center', fontSize: 28 }}>🍟</div>
            <div>
              <div style={{ fontSize: 12, color: RM.ink3, fontWeight: 700 }}>PHILIPS</div>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em' }}>Air Fryer XL · 6 L</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 8, marginLeft: 12, fontSize: 12 }}>
              <Stars value={p.reviews_summary.avg} size={13}/>
              <span style={{ fontWeight: 700 }}>{p.reviews_summary.avg}</span>
              <span style={{ color: RM.ink3 }}>({p.reviews_summary.count})</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 16 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize: 11, color: RM.ink4, textDecoration:'line-through' }}>{cop(list)}</div>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 24, fontWeight: 800, letterSpacing:'-.025em', color: RM.red, lineHeight: 1 }}>{cop(price)}</div>
            </div>
            <Btn kind="primary" size="lg">{Icon.cart(18)} Agregar al carrito</Btn>
          </div>
        </div>
      </section>

      {/* Options + delivery panel */}
      <section style={{ padding:'48px 48px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 48 }}>
          {/* Variants */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: RM.red, letterSpacing:'.08em', textTransform:'uppercase' }}>Elige tu modelo</div>
            <h2 style={{ fontFamily: RM.fontDisplay, fontSize: 36, fontWeight: 800, letterSpacing:'-.03em', margin:'8px 0 24px' }}>3 colores · 3 tamaños</h2>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10, letterSpacing:'.04em' }}>COLOR · <span style={{ color: RM.ink2 }}>Plateado</span></div>
              <div style={{ display:'flex', gap: 12 }}>
                {[
                  ['Negro','#1A1714'],
                  ['Plateado','#D7D5D0'],
                  ['Crema','#EFE6D2'],
                ].map(([n,c],i)=>(
                  <div key={n} style={{
                    padding: 6, border: `2px solid ${i===1?RM.ink:RM.line}`, borderRadius: 12, cursor:'pointer',
                    display:'flex', flexDirection:'column', alignItems:'center', gap: 4, minWidth: 100,
                  }}>
                    <div style={{ width: 78, height: 78, borderRadius: 8, background: c }}/>
                    <div style={{ fontSize: 12, fontWeight: 600, color: RM.ink }}>{n}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10, letterSpacing:'.04em' }}>CAPACIDAD · <span style={{ color: RM.ink2 }}>6 L</span></div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10 }}>
                {[
                  ['4 L','2-3 personas', cop(459900), false],
                  ['6 L','4-5 personas', cop(price), true],
                  ['8 L','6+ personas', cop(659900), false],
                ].map(([sz,d,pr,active])=>(
                  <div key={sz} style={{
                    padding: 16, borderRadius: 12, cursor:'pointer',
                    border: `2px solid ${active?RM.ink:RM.line}`,
                    background: active ? RM.cream : '#fff',
                  }}>
                    <div style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.02em' }}>{sz}</div>
                    <div style={{ fontSize: 12, color: RM.ink3, marginTop: 2 }}>{d}</div>
                    <div style={{ fontFamily: RM.fontDisplay, fontSize: 16, fontWeight: 800, marginTop: 8, color: active ? RM.red : RM.ink }}>{pr}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery / shipping pane */}
          <div style={{ background: RM.cream, borderRadius: 16, padding: 28, border:`1px solid ${RM.line}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: RM.ink3, letterSpacing:'.06em', textTransform:'uppercase' }}>Entrega y devoluciones</div>
            <div style={{ marginTop: 16 }}>
              {[
                { i: Icon.truck(22), t:'Envío gratis · Bogotá', s:'Llega mañana viernes 24 may' },
                { i: Icon.bolt(22),  t:'Express · 90 minutos',   s:'+$8.900 — pídelo antes de las 7 PM' },
                { i: Icon.pin(22),   t:'Recoger en tienda',      s:'Disponible en 12 puntos' },
                { i: Icon.shield(22),t:'Devolución 30 días',     s:'Sin costo, sin preguntas' },
                { i: Icon.check(22), t:'Garantía 2 años',        s:'Oficial Philips · cobertura total' },
              ].map((r,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap: 12, padding:'10px 0', borderBottom: i<4?`1px solid ${RM.line2}`:'none' }}>
                  <div style={{ color: RM.red }}>{r.i}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.t}</div>
                    <div style={{ fontSize: 12, color: RM.ink3 }}>{r.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights — full bleed editorial */}
      <section style={{ padding:'72px 48px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: RM.red, letterSpacing:'.08em', textTransform:'uppercase' }}>Por qué la amarás</div>
        <h2 style={{ fontFamily: RM.fontDisplay, fontSize: 56, fontWeight: 800, letterSpacing:'-.035em', margin:'10px 0 40px', maxWidth: 800, lineHeight: 1 }}>
          Frito sin culpa.<br/>Crocante de verdad.
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16 }}>
          {[
            { e:'🌬', t:'Tecnología Rapid Air', d:'El aire caliente circula a 200°C para dorar sin usar aceite. Hasta 90% menos grasa que freír.' },
            { e:'🧠', t:'7 programas inteligentes', d:'Papas, pollo, pescado, hornear, recalentar, asar, deshidratar. Un botón, listo.' },
            { e:'🧼', t:'Lavable en lavavajillas', d:'Canasta antiadherente. Sin recovecos, sin grasa pegada. Limpieza en 2 minutos.' },
          ].map(c=>(
            <div key={c.t} style={{ background: RM.cream, borderRadius: 16, padding: 28, minHeight: 220 }}>
              <div style={{ fontSize: 56 }}>{c.e}</div>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.02em', marginTop: 14 }}>{c.t}</div>
              <p style={{ fontSize: 14, color: RM.ink2, lineHeight: 1.55, margin:'8px 0 0' }}>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specs table */}
      <section style={{ padding:'72px 48px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap: 48 }}>
          <h2 style={{ fontFamily: RM.fontDisplay, fontSize: 40, fontWeight: 800, letterSpacing:'-.03em', margin: 0, lineHeight: 1 }}>Especificaciones técnicas</h2>
          <div>
            {[
              ['Capacidad', '6 L · canasta de 1.2 kg'],
              ['Potencia', '1.700 W'],
              ['Voltaje', '110 V · 60 Hz'],
              ['Temperatura', '60 – 200°C'],
              ['Temporizador', 'Hasta 60 minutos'],
              ['Programas preestablecidos', '7 (Papas, Pollo, Pescado, Hornear, Recalentar, Asar, Deshidratar)'],
              ['Material canasta', 'Antiadherente cerámica, libre de PFOA'],
              ['Dimensiones', '32 × 27 × 38 cm'],
              ['Peso', '5.4 kg'],
              ['Garantía', '24 meses oficial Philips'],
            ].map(([k,v],i)=>(
              <div key={k} style={{ display:'grid', gridTemplateColumns:'200px 1fr', padding:'12px 0', borderBottom: `1px solid ${RM.line2}`, fontSize: 14 }}>
                <div style={{ color: RM.ink3, fontWeight: 600 }}>{k}</div>
                <div style={{ color: RM.ink, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section style={{ padding:'72px 48px 56px' }}>
        <SectionHead kicker="Para tu cocina" title="Otros que te encantarán"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap: 14 }}>
          {PRODUCTS.filter(p=>p.category_ids[0]==='cat_electro').concat(PRODUCTS.filter(p=>p.category_ids[0]==='cat_despensa')).slice(0,5).map(p=>(
            <ProductCard key={p.id} p={p}/>
          ))}
        </div>
      </section>

      <Footer/>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// PDP v3 — Grocery-density: compact, quick-add focused
// For everyday grocery items where users want speed
// ═══════════════════════════════════════════════════════════════════
function PDPv3() {
  // Use a grocery item: aguacate
  const p = {
    ...PRODUCTS.find(x=>x.handle==='aguacate-hass'),
    description: 'Aguacate Hass premium de Sonsón, Antioquia. Cosechado a punto de maduración, listo en 2-3 días.',
    gallery: [
      v('#E2EBC4','#3A4D14','vista 1','🥑'),
      v('#D8F1DD','#0F4A26','vista 2','🌿'),
      v('#FFF4D0','#6F5400','vista 3','🪴'),
    ],
    nutrition: [
      ['Calorías','160 kcal'],
      ['Grasa','15 g · 87% mono-insaturada'],
      ['Proteína','2 g'],
      ['Fibra','7 g'],
      ['Potasio','485 mg'],
    ],
  };
  const price = p.variants[0].prices[0].amount/100;
  return (
    <div style={{ background:'#F4F1EA', fontFamily: RM.fontBody, color: RM.ink, minHeight: 1200 }}>
      <Header/>
      <div style={{ padding:'12px 24px', fontSize: 12, color: RM.ink3 }}>
        Inicio · Frutas y verduras · Frutas tropicales · <span style={{ color: RM.ink, fontWeight: 600 }}>Aguacate Hass premium</span>
      </div>

      <main style={{ padding:'0 24px 32px', display:'grid', gridTemplateColumns:'minmax(0,2fr) 360px', gap: 24 }}>
        {/* Left side */}
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.2fr) 1fr', gap: 16 }}>
            {/* Gallery */}
            <div>
              <div style={{ background:'#fff', borderRadius: 14, padding: 16, border:`1px solid ${RM.line}`, position:'relative' }}>
                <Badge kind="org" style={{ position:'absolute', top: 14, left: 14, zIndex: 1 }}/>
                <PImg vis={p.gallery[0]} radius={10} label={false} padded/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 6, marginTop: 8 }}>
                {[...p.gallery, p.gallery[0]].slice(0,4).map((g,i)=>(
                  <div key={i} style={{ border:`1.5px solid ${i===0?RM.ink:RM.line}`, borderRadius: 8, padding: 2, background:'#fff' }}>
                    <PImg vis={g} radius={6} label={false}/>
                  </div>
                ))}
              </div>
            </div>
            {/* Info */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: RM.green, textTransform:'uppercase', letterSpacing:'.08em', display:'flex', alignItems:'center', gap: 6 }}>
                {Icon.leaf(14)} Orgánico · Verde Vivo
              </div>
              <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 30, fontWeight: 800, letterSpacing:'-.025em', margin:'6px 0 4px', lineHeight: 1.05 }}>
                Aguacate Hass premium
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap: 10, fontSize: 12, marginBottom: 14 }}>
                <Stars value={4.8} size={13}/>
                <span style={{ fontWeight: 700 }}>4.8</span>
                <span style={{ color: RM.ink3 }}>· 124 reseñas</span>
              </div>

              <div style={{ background:'#fff', border:`1px solid ${RM.line}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: RM.ink3, fontWeight: 700, textTransform:'uppercase', letterSpacing:'.06em' }}>Vendido por unidad · ~180g</div>
                <div style={{ display:'flex', alignItems:'baseline', gap: 10, marginTop: 4 }}>
                  <div style={{ fontFamily: RM.fontDisplay, fontSize: 36, fontWeight: 800, letterSpacing:'-.02em' }}>{cop(price)}</div>
                  <div style={{ fontSize: 12, color: RM.ink3 }}>/ unidad · {cop(43000)} / kg</div>
                </div>
                <div style={{ fontSize: 12, color: RM.green, fontWeight: 700, marginTop: 2 }}>● En stock — 240+ disponibles</div>

                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap: 8, marginTop: 14 }}>
                  <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${RM.line}`, borderRadius: 10, height: 44, background:'#fff' }}>
                    <button style={{ width: 36, height: 42, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.minus(14)}</button>
                    <span style={{ minWidth: 28, textAlign:'center', fontWeight: 800 }}>3</span>
                    <button style={{ width: 36, height: 42, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.plus(14)}</button>
                  </div>
                  <Btn kind="primary" full size="md">Agregar · {cop(price*3)}</Btn>
                </div>
                <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
                  <Btn kind="ghost" size="sm" full>♡ Favoritos</Btn>
                  <Btn kind="ghost" size="sm" full>Añadir a lista</Btn>
                </div>
              </div>

              {/* Bundle deal */}
              <div style={{ background: RM.s_butter, border:`1px solid ${RM.yellow}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display:'flex', alignItems:'center', gap: 6, fontSize: 11, fontWeight: 800, color: RM.ink, textTransform:'uppercase', letterSpacing:'.06em' }}>
                  {Icon.bolt(14)} Combo guacamole · 4 productos
                </div>
                <div style={{ fontSize: 13, color: RM.ink2, marginTop: 4, lineHeight: 1.4 }}>
                  Aguacate ×3 + Limones ×6 + Tomate + Cilantro → <strong style={{ color: RM.ink }}>{cop(18900)}</strong>
                  <span style={{ color: RM.ink3, textDecoration:'line-through', marginLeft: 6 }}>{cop(24600)}</span>
                </div>
                <Btn kind="dark" size="sm" style={{ marginTop: 8 }}>Ver combo →</Btn>
              </div>
            </div>
          </div>

          {/* Details (no tabs, all flat) */}
          <div style={{ marginTop: 20, display:'grid', gridTemplateColumns:'2fr 1fr', gap: 16 }}>
            <div style={{ background:'#fff', borderRadius: 12, padding: 18, border:`1px solid ${RM.line}` }}>
              <h3 style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em', margin:'0 0 8px' }}>Descripción</h3>
              <p style={{ fontSize: 14, color: RM.ink2, lineHeight: 1.55, margin: 0 }}>{p.description}</p>
              <h4 style={{ fontFamily: RM.fontDisplay, fontSize: 14, fontWeight: 800, marginTop: 16, marginBottom: 6 }}>Origen y producción</h4>
              <p style={{ fontSize: 13, color: RM.ink2, lineHeight: 1.55, margin: 0 }}>
                Cultivado en las laderas de Sonsón, Antioquia, a 2.100 m sobre el nivel del mar. Sin pesticidas químicos, certificación orgánica USDA + ICA Colombia.
              </p>
              <div style={{ display:'flex', gap: 14, marginTop: 14, alignItems:'center', flexWrap:'wrap' }}>
                <Badge kind="org"/>
                <Badge kind="fresco"/>
                <span style={{ fontSize: 12, color: RM.ink3 }}>Comercio justo · Hueila — Tolima — Antioquia</span>
              </div>
            </div>
            <div style={{ background:'#fff', borderRadius: 12, padding: 18, border:`1px solid ${RM.line}` }}>
              <h3 style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em', margin:'0 0 12px' }}>Información nutricional</h3>
              <div style={{ fontSize: 11, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 6 }}>Por porción · 100 g</div>
              {p.nutrition.map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${RM.line2}`, fontSize: 13 }}>
                  <span style={{ color: RM.ink2 }}>{k}</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background:'#fff', borderRadius: 12, padding: 18, border:`1px solid ${RM.line}`, marginTop: 16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
              <h3 style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em', margin: 0 }}>Reseñas (124)</h3>
              <Btn kind="ghost" size="sm">Escribir reseña</Btn>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12 }}>
              {[
                { n:'Andrea P.', s:5, r:'Llegaron en el punto justo, ni muy verdes ni muy maduros. Volveré a pedir.', t:'hace 2 días' },
                { n:'Carlos M.', s:4, r:'Buen tamaño y excelente sabor. El empaque podría mejorar.', t:'hace 5 días' },
                { n:'Lucía R.',  s:5, r:'Mis hijos se los comen como mantequilla. Frescos siempre.', t:'hace 1 semana' },
              ].map((rv,i)=>(
                <div key={i} style={{ background: RM.cream, borderRadius: 10, padding: 14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 999, background: RM.s_mint, display:'grid', placeItems:'center', fontSize: 13, fontWeight: 700, color: RM.green }}>{rv.n[0]}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{rv.n}</div>
                    <span style={{ marginLeft:'auto', fontSize: 11, color: RM.ink3 }}>{rv.t}</span>
                  </div>
                  <div style={{ marginTop: 6 }}><Stars value={rv.s} size={12}/></div>
                  <p style={{ fontSize: 13, color: RM.ink2, lineHeight: 1.5, margin:'6px 0 0' }}>{rv.r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sticky sidebar */}
        <aside>
          <div style={{ background:'#fff', borderRadius: 12, padding: 16, border:`1px solid ${RM.line}`, marginBottom: 12, position:'sticky', top: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 10 }}>Entrega</div>
            <div style={{ display:'flex', alignItems:'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: RM.s_mint, color: RM.green, display:'grid', placeItems:'center' }}>{Icon.truck(18)}</div>
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 700 }}>Llega <span style={{ color: RM.green }}>hoy</span> entre 4 PM y 7 PM</div>
                <div style={{ fontSize: 12, color: RM.ink3 }}>Pídelo antes de las 3 PM · gratis sobre $80.000</div>
              </div>
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius: 12, padding: 16, border:`1px solid ${RM.line}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Quien lo compró también compró</div>
            {PRODUCTS.filter(x=>x.category_ids[0]==='cat_frescos' && x.id!==p.id).slice(0,3).map(rp=>{
              const rprice = rp.variants[0].prices[0].amount/100;
              return (
                <div key={rp.id} style={{ display:'flex', gap: 10, padding:'8px 0', borderTop:`1px solid ${RM.line2}` }}>
                  <div style={{ width: 56, height: 56, flexShrink:0 }}><PImg vis={rp.thumbnail} radius={8} label={false}/></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: RM.ink, lineHeight: 1.3 }}>{rp.title}</div>
                    <div style={{ fontFamily: RM.fontDisplay, fontSize: 14, fontWeight: 800, color: RM.ink, marginTop: 2 }}>{cop(rprice)}</div>
                  </div>
                  <button style={{ alignSelf:'center', width: 28, height: 28, borderRadius: 8, background: RM.red, color:'#fff', border:'none', display:'grid', placeItems:'center', cursor:'pointer' }}>{Icon.plus(14)}</button>
                </div>
              );
            })}
          </div>
        </aside>
      </main>

      <Footer/>
    </div>
  );
}

Object.assign(window, { PDPv1, PDPv2, PDPv3 });
