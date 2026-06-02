// mobile.jsx — Mobile screens (rendered inside IOSDevice frames)
// Home, Category, PDP, Cart, Checkout, Account

const M = {
  pad: 16,
  brand: RM.red,
};

// ─── Mobile shared chrome ────────────────────────────────────────────────
function MHeader({ title, transparent = false, back = false, cart = true }) {
  return (
    <div style={{
      position:'relative', zIndex: 2,
      padding:'8px 14px 10px',
      background: transparent ? 'transparent' : '#fff',
      borderBottom: transparent ? 'none' : `1px solid ${RM.line}`,
      display:'flex', alignItems:'center', gap: 10,
    }}>
      {back ? (
        <button style={{ width: 38, height: 38, borderRadius: 999, background:'#fff', border:`1px solid ${RM.line}`, color: RM.ink, display:'grid', placeItems:'center', cursor:'pointer', flexShrink:0 }}>{Icon.back(18)}</button>
      ) : (
        <div style={{ width: 38, height: 38, borderRadius: 10, background: RM.red, color:'#fff', display:'grid', placeItems:'center', fontFamily: RM.fontDisplay, fontWeight: 800, fontSize: 18 }}>r</div>
      )}
      {title ? (
        <div style={{ flex:1, fontFamily: RM.fontDisplay, fontSize: 17, fontWeight: 800, letterSpacing:'-.02em' }}>{title}</div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
          <div style={{ fontSize: 10, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.08em', fontWeight: 700 }}>Entregar en</div>
          <div style={{ fontSize: 13, fontWeight: 700, display:'flex', alignItems:'center', gap: 4 }}>
            Chapinero, Bogotá {Icon.chev(12)}
          </div>
        </div>
      )}
      <button style={{ width: 38, height: 38, borderRadius: 999, background:'#fff', border:`1px solid ${RM.line}`, color: RM.ink, display:'grid', placeItems:'center', position:'relative', cursor:'pointer' }}>
        {Icon.heart(18)}
      </button>
      {cart && (
        <button style={{ width: 38, height: 38, borderRadius: 999, background: RM.ink, color:'#fff', display:'grid', placeItems:'center', position:'relative', cursor:'pointer', border:'none' }}>
          {Icon.cart(18)}
          <span style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:999, background:RM.yellow, color:RM.ink, fontSize:10, fontWeight:800, display:'grid', placeItems:'center' }}>4</span>
        </button>
      )}
    </div>
  );
}

function MTabBar({ active = 'home' }) {
  const tabs = [
    { id:'home', i:'🏠', l:'Inicio' },
    { id:'cats', i:'☰',  l:'Categorías' },
    { id:'orders', i:'📦', l:'Pedidos' },
    { id:'wish', i:'♡',  l:'Favoritos' },
    { id:'me', i:'👤',   l:'Mi cuenta' },
  ];
  return (
    <div style={{
      position:'sticky', bottom: 0,
      background:'rgba(255,255,255,.96)', backdropFilter:'blur(10px)',
      borderTop:`1px solid ${RM.line}`, padding:'8px 8px 14px',
      display:'flex', justifyContent:'space-around', alignItems:'center',
    }}>
      {tabs.map(t=>(
        <div key={t.id} style={{
          display:'flex', flexDirection:'column', alignItems:'center', gap: 2,
          color: active===t.id ? RM.red : RM.ink3,
          fontSize: 10, fontWeight: 700, padding:'4px 8px', borderRadius: 8,
        }}>
          <span style={{ fontSize: 18 }}>{t.i}</span>
          {t.l}
        </div>
      ))}
    </div>
  );
}

function MSearchBar({ placeholder = 'Busca arroz, leche, pañales…' }) {
  return (
    <div style={{ padding:'8px 14px 6px' }}>
      <div style={{ display:'flex', alignItems:'center', height: 44, background: RM.line2, borderRadius: 12, paddingLeft: 14 }}>
        <span style={{ color: RM.ink3 }}>{Icon.search(18)}</span>
        <span style={{ flex:1, fontSize: 14, color: RM.ink3, padding:'0 10px' }}>{placeholder}</span>
        <button style={{ width: 40, height: 40, marginRight: 2, background:'transparent', border:'none', color: RM.ink2, display:'grid', placeItems:'center', cursor:'pointer' }}>{Icon.bag(18)}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Mobile · Home
// ═══════════════════════════════════════════════════════════════════
function MHome() {
  return (
    <div style={{ fontFamily: RM.fontBody, background: RM.cream, color: RM.ink, paddingBottom: 8 }}>
      <MHeader/>
      <MSearchBar/>

      {/* Promo hero */}
      <div style={{ padding:'8px 14px 4px' }}>
        <div style={{
          background: RM.red, color:'#fff', borderRadius: 16, padding: 16, position:'relative', overflow:'hidden', minHeight: 130,
        }}>
          <Pill bg="rgba(255,255,255,.2)" color="#fff" style={{ marginBottom: 8 }}>{Icon.bolt(11)} −40% HOY</Pill>
          <div style={{ fontFamily: RM.fontDisplay, fontSize: 26, fontWeight: 800, letterSpacing:'-.03em', lineHeight: .98, maxWidth:'70%' }}>
            Tu mercado<br/>en 90 min.
          </div>
          <Btn kind="yellow" size="sm" style={{ marginTop: 10 }}>Empezar →</Btn>
          <div style={{ position:'absolute', right:-10, bottom:-20, fontSize: 130, opacity:.5 }}>🛒</div>
        </div>
        {/* Dots */}
        <div style={{ display:'flex', justifyContent:'center', gap: 6, marginTop: 8 }}>
          {[1,2,3,4].map(d=> <div key={d} style={{ width: d===1?20:6, height: 6, borderRadius: 999, background: d===1?RM.ink:RM.line }}/>)}
        </div>
      </div>

      {/* Quick categories — circle row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 6, padding:'8px 14px' }}>
        {CATEGORIES.slice(0,8).map(c=>(
          <div key={c.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 4 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: { mint:RM.s_mint, butter:RM.s_butter, sky:RM.s_sky, pink:RM.s_pink, peach:RM.s_peach, lilac:RM.s_lilac, sand:RM.s_sand }[c.surface],
              display:'grid', placeItems:'center', fontSize: 28,
            }}>{c.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 600, textAlign:'center', lineHeight: 1.1, color: RM.ink2 }}>{c.name.split(' ')[0]}</div>
          </div>
        ))}
      </div>

      {/* Flash deal */}
      <div style={{ padding:'4px 14px' }}>
        <div style={{ background: RM.ink, color:'#fff', borderRadius: 12, padding:'12px 14px', display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: RM.yellow, color: RM.ink, display:'grid', placeItems:'center' }}>{Icon.bolt(18)}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: RM.yellow, letterSpacing:'.08em' }}>OFERTA RELÁMPAGO</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Termina en 04:12:38</div>
          </div>
          <Btn kind="yellow" size="sm">Ver →</Btn>
        </div>
      </div>

      {/* Section: ofertas — horizontal scroll */}
      <MSection title="Ofertas del día" sub="68 productos">
        {PRODUCTS.filter(p=>p.list_price).slice(0,5).map(p=> <MProductCard key={p.id} p={p}/>)}
      </MSection>

      <MSection title="Frescos del día" sub="🌿 cosechado hoy">
        {PRODUCTS.filter(p=>p.category_ids[0]==='cat_frescos').slice(0,5).map(p=> <MProductCard key={p.id} p={p}/>)}
      </MSection>

      {/* Brand banner */}
      <div style={{ padding:'8px 14px' }}>
        <div style={{ background: RM.s_butter, borderRadius: 14, padding: 16, display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ fontSize: 50 }}>📦</div>
          <div style={{ flex:1 }}>
            <Pill bg={RM.yellow} color={RM.ink} style={{ fontSize: 9 }}>NUEVO</Pill>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em', marginTop: 4, lineHeight: 1.05 }}>
              Marcas propias <span style={{ color: RM.red }}>Rodi</span>
            </div>
            <div style={{ fontSize: 11, color: RM.ink2 }}>Hasta 30% más barato</div>
          </div>
          <Btn kind="dark" size="sm">Ver →</Btn>
        </div>
      </div>

      <MSection title="Despensa" sub="Lo básico, al mejor precio">
        {PRODUCTS.filter(p=>p.category_ids[0]==='cat_despensa').slice(0,5).map(p=> <MProductCard key={p.id} p={p}/>)}
      </MSection>

      <MTabBar active="home"/>
    </div>
  );
}

function MSection({ title, sub, children }) {
  return (
    <div style={{ padding:'12px 0 4px' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'0 14px 8px' }}>
        <div>
          <div style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em' }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: RM.ink3 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: RM.red, display:'flex', alignItems:'center', gap: 2 }}>Ver todo {Icon.chev(11,'right')}</div>
      </div>
      <div style={{ display:'flex', gap: 8, padding:'0 14px 4px', overflowX:'auto' }}>
        {children}
      </div>
    </div>
  );
}

function MProductCard({ p }) {
  const price = p.variants[0].prices[0].amount/100;
  const list  = p.list_price ? p.list_price/100 : null;
  const off   = list ? Math.round((1 - price/list) * 100) : 0;
  return (
    <div style={{
      width: 138, flexShrink: 0, background:'#fff', borderRadius: 12, border:`1px solid ${RM.line}`,
      padding: 8, display:'flex', flexDirection:'column', gap: 6, position:'relative',
    }}>
      {off>0 && <div style={{ position:'absolute', top: 12, left: 12, zIndex:1 }}><Badge kind="sale" style={{ fontSize:9, padding:'2px 6px' }}>−{off}%</Badge></div>}
      <PImg vis={p.thumbnail} radius={8} label={false}/>
      <div style={{ fontSize: 10, fontWeight: 700, color: RM.ink3, textTransform:'uppercase' }}>{p.brand}</div>
      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25, minHeight: '2.4em', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.title}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
        <div style={{ fontFamily: RM.fontDisplay, fontSize: 16, fontWeight: 800, letterSpacing:'-.02em' }}>{cop(price)}</div>
        {list && <div style={{ fontSize: 10, color: RM.ink4, textDecoration:'line-through' }}>{cop(list)}</div>}
      </div>
      <button style={{
        position:'absolute', right: 8, bottom: 8, width: 32, height: 32, borderRadius: 999,
        background: RM.red, color:'#fff', border:'none', display:'grid', placeItems:'center', cursor:'pointer',
        boxShadow:'0 2px 8px rgba(230,57,70,.4)',
      }}>{Icon.plus(14)}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Mobile · PDP
// ═══════════════════════════════════════════════════════════════════
function MPDP() {
  const p = PDP_PRODUCT;
  const price = p.variants[0].prices[0].amount/100;
  const list  = p.list_price/100;
  const off   = Math.round((1 - price/list) * 100);
  return (
    <div style={{ fontFamily: RM.fontBody, background:'#fff', color: RM.ink, paddingBottom: 80 }}>
      {/* Floating top */}
      <div style={{ padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button style={mFAB()}>{Icon.back(18)}</button>
        <div style={{ display:'flex', gap: 8 }}>
          <button style={mFAB()}>{Icon.heart(18)}</button>
          <button style={mFAB()}>↗</button>
          <button style={mFAB(RM.ink, '#fff')}>{Icon.cart(18)}</button>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ padding:'4px 14px 0' }}>
        <div style={{ position:'relative', background: RM.ink, borderRadius: 16, padding: 12, height: 320, overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 70% 30%, ${RM.yellow} 0, transparent 60%)`, opacity:.4 }}/>
          <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', fontSize: 200 }}>🍟</div>
          <div style={{ position:'absolute', top: 14, left: 14 }}><Badge kind="sale">−{off}% HOY</Badge></div>
          <div style={{ position:'absolute', bottom: 12, left:0, right:0, display:'flex', justifyContent:'center', gap: 4 }}>
            {[1,2,3,4].map(d=> <div key={d} style={{ width: d===1?14:5, height: 5, borderRadius: 999, background: d===1?'#fff':'rgba(255,255,255,.4)' }}/>)}
          </div>
        </div>
        {/* Thumbnail strip */}
        <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
          {p.gallery.map((g,i)=>(
            <div key={i} style={{ flex:1, padding: 2, border:`1.5px solid ${i===0?RM.ink:RM.line}`, borderRadius: 8 }}>
              <PImg vis={g} radius={5} label={false}/>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:'14px 14px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em' }}>{p.brand}</div>
        <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.025em', margin:'4px 0 8px', lineHeight: 1.1 }}>Air Fryer Philips XL · 6 L</h1>
        <div style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 12 }}>
          <Stars value={p.reviews_summary.avg} size={12}/>
          <span style={{ fontWeight: 700 }}>{p.reviews_summary.avg}</span>
          <span style={{ color: RM.ink3 }}>({p.reviews_summary.count} reseñas)</span>
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap: 8, marginTop: 12 }}>
          <div style={{ fontFamily: RM.fontDisplay, fontSize: 34, fontWeight: 800, letterSpacing:'-.025em' }}>{cop(price)}</div>
          <div style={{ fontSize: 14, color: RM.ink4, textDecoration:'line-through' }}>{cop(list)}</div>
        </div>
        <div style={{ fontSize: 11, color: RM.green, fontWeight: 700, marginTop: 2 }}>● En stock · Ahorras {cop(list-price)}</div>

        {/* Variants */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 8 }}>COLOR · <span style={{ color: RM.ink, fontWeight: 700 }}>Plateado</span></div>
          <div style={{ display:'flex', gap: 6 }}>
            {['#1A1714','#D7D5D0','#EFE6D2'].map((c,i)=>(
              <div key={i} style={{ padding: 4, border:`2px solid ${i===1?RM.ink:RM.line}`, borderRadius: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: c }}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 8 }}>CAPACIDAD · <span style={{ color: RM.ink, fontWeight: 700 }}>6 L</span></div>
          <div style={{ display:'flex', gap: 6 }}>
            {['4 L','6 L','8 L'].map((s,i)=>(
              <div key={s} style={{
                flex:1, padding:'10px 0', textAlign:'center', borderRadius: 10, fontSize: 13, fontWeight: 700,
                border:`1.5px solid ${i===1?RM.ink:RM.line}`, background: i===1?RM.cream:'#fff',
              }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div style={{ marginTop: 16, padding: 12, background: RM.cream, borderRadius: 12, display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: RM.s_mint, color: RM.green, display:'grid', placeItems:'center' }}>{Icon.truck(18)}</div>
          <div style={{ flex:1, fontSize: 12 }}>
            <div style={{ fontWeight: 700 }}>Llega <span style={{ color: RM.green }}>mañana</span> · gratis</div>
            <div style={{ color: RM.ink3 }}>Pídelo antes de las 4 PM</div>
          </div>
          <span style={{ color: RM.ink3 }}>{Icon.chev(14,'right')}</span>
        </div>

        {/* Description */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: RM.fontDisplay, fontSize: 16, fontWeight: 800, letterSpacing:'-.02em', marginBottom: 6 }}>Sobre este producto</div>
          <p style={{ fontSize: 13, color: RM.ink2, lineHeight: 1.55, margin: 0 }}>{p.description}</p>
        </div>

        {/* Highlights */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: RM.fontDisplay, fontSize: 16, fontWeight: 800, letterSpacing:'-.02em', marginBottom: 10 }}>Lo que incluye</div>
          {p.highlights.slice(0,4).map(h=>(
            <div key={h} style={{ display:'flex', gap: 8, padding:'5px 0', fontSize: 13, color: RM.ink2 }}>
              <span style={{ color: RM.green }}>{Icon.check(14)}</span>{h}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky buy bar */}
      <div style={{
        position:'sticky', bottom: 0,
        padding:'10px 14px 22px',
        background:'rgba(255,255,255,.96)', backdropFilter:'blur(10px)',
        borderTop:`1px solid ${RM.line}`,
        display:'flex', gap: 8, alignItems:'center',
      }}>
        <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${RM.line}`, borderRadius: 10, height: 48 }}>
          <button style={{ width: 36, height: 46, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.minus(14)}</button>
          <span style={{ minWidth: 22, textAlign:'center', fontWeight: 800 }}>1</span>
          <button style={{ width: 36, height: 46, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.plus(14)}</button>
        </div>
        <Btn kind="primary" size="lg" full>{Icon.cart(16)} Agregar · {cop(price)}</Btn>
      </div>
    </div>
  );
}

function mFAB(bg = '#fff', color = RM.ink) {
  return {
    width: 38, height: 38, borderRadius: 999, background: bg, color,
    border: bg==='#fff' ? `1px solid ${RM.line}` : 'none',
    display:'grid', placeItems:'center', cursor:'pointer',
    boxShadow: bg==='#fff' ? '0 2px 6px rgba(0,0,0,.06)' : 'none',
  };
}

// ═══════════════════════════════════════════════════════════════════
// Mobile · Cart
// ═══════════════════════════════════════════════════════════════════
function MCart() {
  const items = [
    { p: PRODUCTS[28], qty: 1 },
    { p: PRODUCTS[3], qty: 2 },
    { p: PRODUCTS[6], qty: 6 },
    { p: PRODUCTS[1], qty: 4 },
  ];
  return (
    <div style={{ fontFamily: RM.fontBody, background: RM.cream, color: RM.ink, paddingBottom: 100 }}>
      <MHeader title="Carrito · 4 productos" back/>

      {/* Free shipping progress */}
      <div style={{ padding:'10px 14px 6px' }}>
        <div style={{ background: RM.s_mint, color: RM.green, borderRadius: 12, padding:'10px 12px', fontSize: 12, fontWeight: 700 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 6 }}>{Icon.truck(14)} Faltan {cop(31300)} para envío gratis</div>
          <div style={{ height: 5, background:'rgba(15,122,62,.18)', borderRadius: 999, marginTop: 6, overflow:'hidden' }}>
            <div style={{ width:'62%', height:'100%', background: RM.green }}/>
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ padding:'4px 14px' }}>
        {items.map((it,i)=>{
          const price = it.p.variants[0].prices[0].amount/100;
          return (
            <div key={it.p.id} style={{ background:'#fff', borderRadius: 12, border:`1px solid ${RM.line}`, padding: 10, marginBottom: 8, display:'flex', gap: 10 }}>
              <div style={{ width: 68, height: 68, flexShrink: 0 }}><PImg vis={it.p.thumbnail} radius={8} label={false}/></div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: RM.ink3, textTransform:'uppercase' }}>{it.p.brand}</div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25, marginTop: 2, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{it.p.title}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 6 }}>
                  <div style={{ fontFamily: RM.fontDisplay, fontSize: 15, fontWeight: 800 }}>{cop(price*it.qty)}</div>
                  <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${RM.line}`, borderRadius: 8, height: 30 }}>
                    <button style={{ width: 28, height: 28, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.minus(13)}</button>
                    <span style={{ minWidth: 22, textAlign:'center', fontWeight: 800, fontSize: 13 }}>{it.qty}</span>
                    <button style={{ width: 28, height: 28, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.plus(13)}</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation banner */}
      <div style={{ padding:'8px 14px' }}>
        <div style={{ background: RM.s_butter, borderRadius: 12, padding: 12, display:'flex', alignItems:'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎁</span>
          <div style={{ flex:1, fontSize: 12 }}>
            <div style={{ fontWeight: 800 }}>Agrega un postre y ahorra 15%</div>
            <div style={{ color: RM.ink3 }}>Combo helado + galletas</div>
          </div>
          <Btn kind="dark" size="sm">Ver</Btn>
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding:'8px 14px' }}>
        <div style={{ background:'#fff', borderRadius: 12, border:`1px solid ${RM.line}`, padding: 14, fontSize: 13 }}>
          <SumRow label="Subtotal (13 unidades)" value={cop(681500)}/>
          <SumRow label="Descuentos" value={`−${cop(58400)}`} color={RM.green}/>
          <SumRow label="Envío" value="Gratis" color={RM.green}/>
          <div style={{ borderTop:`1px dashed ${RM.line}`, marginTop: 8, paddingTop: 10, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: RM.ink2 }}>TOTAL</span>
            <span style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800 }}>{cop(623100)}</span>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position:'sticky', bottom: 0,
        padding:'10px 14px 22px',
        background:'rgba(255,255,255,.96)', backdropFilter:'blur(10px)',
        borderTop:`1px solid ${RM.line}`,
      }}>
        <Btn kind="primary" size="lg" full>
          Ir a pagar · {cop(623100)} →
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Mobile · Checkout
// ═══════════════════════════════════════════════════════════════════
function MCheckout() {
  return (
    <div style={{ fontFamily: RM.fontBody, background: RM.cream, color: RM.ink, paddingBottom: 100 }}>
      <MHeader title="Pagar" back cart={false}/>

      {/* Stepper */}
      <div style={{ padding:'10px 14px 8px' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 4 }}>
          {['Dir','Envío','Pago','OK'].map((l,i)=>(
            <React.Fragment key={l}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 4 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 999,
                  background: i<2 ? RM.green : i===2 ? RM.red : '#fff',
                  border: i>2 ? `1.5px solid ${RM.line}` : 'none',
                  color: i<3 ? '#fff' : RM.ink3,
                  display:'grid', placeItems:'center', fontSize: 10, fontWeight: 800,
                }}>{i<2 ? Icon.check(11) : i+1}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: i===2?RM.ink:RM.ink3 }}>{l}</div>
              </div>
              {i<3 && <div style={{ flex:1, height: 2, background: i<2?RM.green:RM.line, marginTop: -10 }}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding:'4px 14px', display:'flex', flexDirection:'column', gap: 8 }}>
        <MCheckoutCard done title="Entrega" sub="Cra 7 #45-12 · Chapinero" detail="Andrea Pérez · +57 311 234 5678"/>
        <MCheckoutCard done title="Envío" sub="Express · llega hoy" detail="4:00 PM – 4:45 PM · +$8.900"/>

        {/* Payment */}
        <div style={{ background:'#fff', borderRadius: 12, border:`1.5px solid ${RM.ink}`, padding: 14 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: RM.red, color:'#fff', display:'grid', placeItems:'center', fontSize: 10, fontWeight: 800 }}>3</div>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 16, fontWeight: 800, letterSpacing:'-.02em' }}>Método de pago</div>
          </div>
          <div style={{ display:'grid', gap: 6, marginTop: 12 }}>
            {[
              { i:'💳', t:'Tarjeta · Visa **** 4242', a:true },
              { i:'🏦', t:'PSE — Bancolombia', a:false },
              { i:'📱', t:'Nequi', a:false },
              { i:'💵', t:'Contraentrega (efectivo)', a:false },
              { i:'🤝', t:'Addi · 4 cuotas', a:false },
            ].map(m=>(
              <div key={m.t} style={{
                display:'flex', alignItems:'center', gap: 10, padding: 12, borderRadius: 10,
                border:`1.5px solid ${m.a?RM.ink:RM.line}`, background: m.a?RM.cream:'#fff',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 999,
                  border:`1.5px solid ${m.a?RM.ink:RM.line}`, background: m.a?RM.ink:'#fff',
                  boxShadow: m.a ? `inset 0 0 0 3px #fff` : 'none',
                }}/>
                <span style={{ fontSize: 18 }}>{m.i}</span>
                <span style={{ fontSize: 13, fontWeight: 700, flex:1 }}>{m.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon */}
        <div style={{ background: RM.s_butter, borderRadius: 12, padding: 12, display:'flex', alignItems:'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🎁</span>
          <span style={{ flex:1, fontSize: 12, fontWeight: 600 }}>Aplica un cupón y ahorra más</span>
          <Btn kind="dark" size="sm">Aplicar</Btn>
        </div>

        {/* Summary mini */}
        <div style={{ background:'#fff', borderRadius: 12, border:`1px solid ${RM.line}`, padding: 12, fontSize: 12 }}>
          <SumRow label="Subtotal · 6 productos" value={cop(681500)}/>
          <SumRow label="Descuentos" value={`−${cop(58400)}`} color={RM.green}/>
          <SumRow label="Envío express" value={cop(8900)}/>
          <div style={{ borderTop:`1px dashed ${RM.line}`, marginTop: 6, paddingTop: 8, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: RM.ink2 }}>TOTAL</span>
            <span style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800 }}>{cop(632000)}</span>
          </div>
        </div>
      </div>

      <div style={{
        position:'sticky', bottom: 0,
        padding:'10px 14px 22px',
        background:'rgba(255,255,255,.96)', backdropFilter:'blur(10px)',
        borderTop:`1px solid ${RM.line}`,
      }}>
        <Btn kind="primary" size="lg" full>{Icon.shield(16)} Pagar {cop(632000)}</Btn>
      </div>
    </div>
  );
}

function MCheckoutCard({ done, title, sub, detail }) {
  return (
    <div style={{ background:'#fff', borderRadius: 12, border:`1px solid ${RM.line}`, padding: 12 }}>
      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
        {done && <div style={{ width: 22, height: 22, borderRadius: 999, background: RM.green, color:'#fff', display:'grid', placeItems:'center' }}>{Icon.check(11)}</div>}
        <div style={{ fontFamily: RM.fontDisplay, fontSize: 15, fontWeight: 800, letterSpacing:'-.02em', flex:1 }}>{title}</div>
        <span style={{ fontSize: 12, color: RM.red, fontWeight: 700 }}>Editar</span>
      </div>
      <div style={{ paddingLeft: 30, marginTop: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{sub}</div>
        {detail && <div style={{ fontSize: 12, color: RM.ink3, marginTop: 2 }}>{detail}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Mobile · Confirmation
// ═══════════════════════════════════════════════════════════════════
function MConfirmation() {
  return (
    <div style={{ fontFamily: RM.fontBody, background: RM.cream, color: RM.ink, padding:'12px 14px 80px', minHeight:'100%' }}>
      {/* Big confirmation */}
      <div style={{ background:'#fff', borderRadius: 16, padding:'28px 16px 22px', textAlign:'center', border:`1px solid ${RM.line}` }}>
        <div style={{ width: 60, height: 60, borderRadius: 999, background: RM.green, color:'#fff', display:'grid', placeItems:'center', margin:'0 auto', boxShadow:'0 6px 16px rgba(15,122,62,.3)' }}>
          {Icon.check(30)}
        </div>
        <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 30, fontWeight: 800, letterSpacing:'-.03em', margin:'12px 0 2px', lineHeight: 1 }}>¡Listo, Andrea!</h1>
        <div style={{ fontSize: 13, color: RM.ink2 }}>Pedido <strong style={{ color: RM.ink }}>#038124</strong> confirmado</div>
        <div style={{ marginTop: 14, padding:'10px 14px', background: RM.s_butter, borderRadius: 10, display:'inline-flex', alignItems:'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛵</span>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: RM.ink, textTransform:'uppercase', letterSpacing:'.06em' }}>LLEGA HOY</div>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 17, fontWeight: 800 }}>4:00 PM – 4:45 PM</div>
          </div>
        </div>
      </div>

      {/* Tracker */}
      <div style={{ background:'#fff', borderRadius: 16, padding: 16, border:`1px solid ${RM.line}`, marginTop: 12 }}>
        <div style={{ fontFamily: RM.fontDisplay, fontSize: 16, fontWeight: 800, letterSpacing:'-.02em', marginBottom: 14 }}>Seguimiento</div>
        {[
          { t:'Confirmado',   tm:'2:42 PM', d:true },
          { t:'Preparando',   tm:'3:08 PM', d:true },
          { t:'En camino',    tm:'3:42 PM · ahora', d:'now' },
          { t:'Entregado',    tm:'~ 4:25 PM', d:false },
        ].map((s,i,arr)=>(
          <div key={i} style={{ display:'flex', gap: 12 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                background: s.d===true ? RM.green : s.d==='now' ? RM.red : '#fff',
                border: s.d===false ? `1.5px solid ${RM.line}` : 'none',
                color: s.d ? '#fff' : RM.ink3,
                display:'grid', placeItems:'center',
              }}>{s.d===true && Icon.check(11)} {s.d==='now' && '●'}</div>
              {i<arr.length-1 && <div style={{ width: 2, flex: 1, background: s.d?RM.green:RM.line, margin:'4px 0' }}/>}
            </div>
            <div style={{ paddingBottom: i<arr.length-1?14:0, flex:1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.d?RM.ink:RM.ink3 }}>{s.t}</div>
              <div style={{ fontSize: 11, color: s.d==='now'?RM.red:RM.ink3, fontWeight: s.d==='now'?700:500 }}>{s.tm}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div style={{ background: RM.ink, color:'#fff', borderRadius: 16, padding: 18, marginTop: 12 }}>
        <Pill bg={RM.yellow} color={RM.ink}>¡GRACIAS!</Pill>
        <div style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.025em', marginTop: 6, lineHeight: 1.1 }}>
          Tu próxima compra<br/>tiene <span style={{ color: RM.yellow }}>20% off</span>
        </div>
        <div style={{ fontSize: 12, opacity:.7, marginTop: 6 }}>Código <strong style={{ color: RM.yellow, fontFamily: RM.fontMono }}>GRACIAS20</strong> · válido hasta el 30 de mayo</div>
      </div>

      <Btn kind="primary" full size="lg" style={{ marginTop: 12 }}>Seguir comprando →</Btn>
      <Btn kind="ghost" full size="md" style={{ marginTop: 8 }}>Ver mis pedidos</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Mobile · Category
// ═══════════════════════════════════════════════════════════════════
function MCategory() {
  return (
    <div style={{ fontFamily: RM.fontBody, background: RM.cream, color: RM.ink, paddingBottom: 80 }}>
      <MHeader title="Despensa" back/>
      {/* Hero band */}
      <div style={{ padding:'10px 14px 6px' }}>
        <div style={{ background: RM.s_butter, borderRadius: 14, padding: 14, display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ fontSize: 48 }}>🍝</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize: 11, color: RM.ink3, fontWeight: 700 }}>1.248 productos</div>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em' }}>Pasta, arroz, aceites…</div>
          </div>
        </div>
      </div>
      {/* Chips */}
      <div style={{ padding:'8px 14px 6px', display:'flex', gap: 6, overflowX:'auto' }}>
        {['Todo','Pasta','Granos','Aceites','Salsas','Enlatados','Harinas','Café'].map((s,i)=>(
          <button key={s} style={{
            padding:'8px 12px', borderRadius: 999, border:'none', flexShrink:0,
            background: i===0?RM.ink:'#fff', color: i===0?'#fff':RM.ink,
            fontSize: 12, fontWeight: 700, boxShadow: i===0?'none':`inset 0 0 0 1px ${RM.line}`,
          }}>{s}</button>
        ))}
      </div>
      {/* Filter/sort bar */}
      <div style={{ padding:'4px 14px 8px', display:'flex', gap: 8 }}>
        <button style={{ flex:1, height: 38, borderRadius: 8, background:'#fff', border:`1px solid ${RM.line}`, display:'flex', alignItems:'center', justifyContent:'center', gap: 6, fontSize: 13, fontWeight: 700 }}>{Icon.filter(14)} Filtrar (3)</button>
        <button style={{ flex:1, height: 38, borderRadius: 8, background:'#fff', border:`1px solid ${RM.line}`, display:'flex', alignItems:'center', justifyContent:'center', gap: 6, fontSize: 13, fontWeight: 700 }}>{Icon.sort(14)} Más vendidos</button>
      </div>
      {/* Grid */}
      <div style={{ padding:'4px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8 }}>
        {PRODUCTS.slice(0,8).map(p=>{
          const price = p.variants[0].prices[0].amount/100;
          const list = p.list_price?p.list_price/100:null;
          const off = list?Math.round((1-price/list)*100):0;
          return (
            <div key={p.id} style={{ background:'#fff', borderRadius: 12, border:`1px solid ${RM.line}`, padding: 8, position:'relative' }}>
              {off>0 && <div style={{ position:'absolute', top: 12, left: 12, zIndex:1 }}><Badge kind="sale" style={{ fontSize:9, padding:'2px 6px' }}>−{off}%</Badge></div>}
              <PImg vis={p.thumbnail} radius={8} label={false}/>
              <div style={{ fontSize: 10, fontWeight:700, color: RM.ink3, textTransform:'uppercase', marginTop: 6 }}>{p.brand}</div>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25, minHeight:'2.4em', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.title}</div>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop: 4 }}>
                <div style={{ fontFamily: RM.fontDisplay, fontSize: 16, fontWeight: 800 }}>{cop(price)}</div>
                <button style={{ width: 28, height: 28, borderRadius: 999, background: RM.red, color:'#fff', border:'none', display:'grid', placeItems:'center' }}>{Icon.plus(14)}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { MHome, MPDP, MCart, MCheckout, MConfirmation, MCategory });
