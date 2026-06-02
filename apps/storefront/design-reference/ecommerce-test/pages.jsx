// pages.jsx — Category, Search, Cart, Checkout, Confirmation, Auth, Account

// ═══════════════════════════════════════════════════════════════════
// CATEGORY (with filters sidebar)
// ═══════════════════════════════════════════════════════════════════
function CategoryPage() {
  const cat = CATEGORIES.find(c=>c.id==='cat_despensa');
  const products = PRODUCTS.filter(p=>p.category_ids[0]==='cat_despensa').concat(PRODUCTS).slice(0,18);
  return (
    <div style={{ background: RM.cream, fontFamily: RM.fontBody, color: RM.ink }}>
      <Header/>
      {/* Hero strip */}
      <section style={{
        background: RM.s_butter, padding:'28px 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <div style={{ fontSize: 12, color: RM.ink3, fontWeight: 600, display:'flex', gap: 6 }}>
            <span>Inicio</span><span>›</span><span style={{ color: RM.ink }}>Despensa</span>
          </div>
          <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 44, fontWeight: 800, letterSpacing:'-.035em', lineHeight: 1, margin:'8px 0 6px' }}>
            Despensa
          </h1>
          <div style={{ fontSize: 14, color: RM.ink2 }}>1.248 productos · Pasta, arroz, aceites, salsas, café y más</div>
        </div>
        <div style={{ fontSize: 80 }}>🍝</div>
      </section>

      {/* Sub-category chips */}
      <div style={{ padding:'18px 24px 0', display:'flex', gap: 8, flexWrap:'wrap', alignItems:'center' }}>
        {['Todo','Pasta y arroz','Granos y legumbres','Aceites y vinagres','Salsas','Enlatados','Harinas','Café y té','Endulzantes'].map((s,i)=>(
          <button key={s} style={{
            padding:'8px 14px', borderRadius: 999, border: 'none', cursor:'pointer',
            background: i===0 ? RM.ink : '#fff', color: i===0 ? '#fff' : RM.ink,
            fontSize: 13, fontWeight: 600, fontFamily: RM.fontBody,
            boxShadow: i===0 ? 'none' : `inset 0 0 0 1px ${RM.line}`,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap: 24, padding:'24px' }}>
        {/* Filters */}
        <aside>
          <div style={{ background:'#fff', borderRadius: 12, padding: 16, border:`1px solid ${RM.line}`, position:'sticky', top: 16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em' }}>Filtrar</div>
              <button style={{ fontSize: 12, color: RM.red, background:'none', border:'none', fontWeight: 700, cursor:'pointer' }}>Limpiar</button>
            </div>

            <FilterGroup title="Precio">
              <div style={{ padding:'4px 0' }}>
                <div style={{ height: 6, background: RM.line2, borderRadius: 999, position:'relative', margin:'14px 6px' }}>
                  <div style={{ position:'absolute', left:'15%', right:'30%', top:0, height:6, background: RM.ink, borderRadius:999 }}/>
                  <div style={{ position:'absolute', left:'15%', top:-5, width:16, height:16, borderRadius:999, background:'#fff', border:`2px solid ${RM.ink}` }}/>
                  <div style={{ position:'absolute', right:'30%', top:-5, width:16, height:16, borderRadius:999, background:'#fff', border:`2px solid ${RM.ink}` }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  <span>{cop(5000)}</span><span>{cop(80000)}</span>
                </div>
              </div>
            </FilterGroup>

            <FilterGroup title="Marca">
              {[['Diana',124,true],['Doria',86,true],['Colanta',62,false],['Gourmet',54,false],['La Constancia',38,false],['Águila Roja',31,false]].map(([n,c,sel])=>(
                <FilterRow key={n} label={n} count={c} selected={sel}/>
              ))}
              <button style={{ marginTop:6, background:'none', border:'none', color: RM.red, fontSize:12, fontWeight:700, padding:0, cursor:'pointer' }}>+ Ver 28 marcas más</button>
            </FilterGroup>

            <FilterGroup title="Promociones">
              {[['En oferta',84,true],['2x1',12,false],['Combos',22,false]].map(([n,c,sel])=>(
                <FilterRow key={n} label={n} count={c} selected={sel}/>
              ))}
            </FilterGroup>

            <FilterGroup title="Atributos">
              {[['Orgánico',32,false],['Sin gluten',18,false],['Sin azúcar',14,false],['Marca propia',46,true]].map(([n,c,sel])=>(
                <FilterRow key={n} label={n} count={c} selected={sel}/>
              ))}
            </FilterGroup>

            <FilterGroup title="Calificación" last>
              {[5,4,3].map(s=>(
                <div key={s} style={{ display:'flex', alignItems:'center', gap: 8, padding:'5px 0', fontSize: 13 }}>
                  <div style={{ width: 16, height: 16, border:`1.5px solid ${RM.line}`, borderRadius: 4 }}/>
                  <Stars value={s} size={12}/>
                  <span style={{ color: RM.ink2 }}>y más</span>
                </div>
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* Grid */}
        <div>
          {/* Toolbar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
            <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: RM.ink2 }}>1-24 de 1.248</span>
              <span style={{ color: RM.line }}>·</span>
              {/* Active filters */}
              <Pill bg={RM.line2}>Marca propia {Icon.x(11)}</Pill>
              <Pill bg={RM.line2}>En oferta {Icon.x(11)}</Pill>
              <Pill bg={RM.line2}>Diana {Icon.x(11)}</Pill>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 13 }}>
              <button style={{
                padding:'8px 12px', borderRadius: 8, border:`1px solid ${RM.line}`, background:'#fff',
                display:'inline-flex', gap: 6, alignItems:'center', cursor:'pointer', fontFamily: RM.fontBody, fontWeight: 600,
              }}>{Icon.sort(14)} Más vendidos {Icon.chev(12)}</button>
              <div style={{ display:'flex', gap:0, border:`1px solid ${RM.line}`, borderRadius: 8, overflow:'hidden' }}>
                <button style={{ padding:'8px 10px', background: RM.ink, color:'#fff', border:'none', cursor:'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>
                </button>
                <button style={{ padding:'8px 10px', background:'#fff', color: RM.ink2, border:'none', cursor:'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3"/><rect x="3" y="10" width="18" height="3"/><rect x="3" y="16" width="18" height="3"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14 }}>
            {products.map((p,i)=> <ProductCard key={`${p.id}-${i}`} p={p}/>)}
          </div>

          {/* Pagination */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 6, marginTop: 28 }}>
            <button style={pageBtnStyle()}>{Icon.chev(14,'left')}</button>
            {[1,2,3,'…',52].map((p,i)=>(
              <button key={i} style={pageBtnStyle(p===1)}>{p}</button>
            ))}
            <button style={pageBtnStyle()}>{Icon.chev(14,'right')}</button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

function pageBtnStyle(active=false) {
  return {
    width: 36, height: 36, borderRadius: 8, fontFamily: RM.fontBody, fontWeight: 700, fontSize: 13,
    border: active ? 'none' : `1px solid ${RM.line}`, cursor:'pointer',
    background: active ? RM.ink : '#fff', color: active ? '#fff' : RM.ink,
  };
}

function FilterGroup({ title, children, last }) {
  return (
    <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: last ? 'none' : `1px solid ${RM.line2}` }}>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {title} <span style={{ color: RM.ink3 }}>{Icon.chev(12, 'up')}</span>
      </div>
      {children}
    </div>
  );
}

function FilterRow({ label, count, selected }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap: 8, padding:'5px 0', cursor:'pointer', fontSize: 13 }}>
      <span style={{
        width: 16, height: 16, borderRadius: 4, flexShrink:0,
        background: selected ? RM.ink : '#fff', border:`1.5px solid ${selected?RM.ink:RM.line}`,
        display:'grid', placeItems:'center', color:'#fff',
      }}>{selected && Icon.check(11)}</span>
      <span style={{ color: RM.ink, fontWeight: 500, flex:1 }}>{label}</span>
      <span style={{ color: RM.ink4, fontSize: 12 }}>({count})</span>
    </label>
  );
}


// ═══════════════════════════════════════════════════════════════════
// SEARCH RESULTS
// ═══════════════════════════════════════════════════════════════════
function SearchPage() {
  return (
    <div style={{ background: RM.cream, fontFamily: RM.fontBody, color: RM.ink }}>
      <Header/>
      <section style={{ padding:'24px 24px 0' }}>
        <div style={{ fontSize: 12, color: RM.ink3, marginBottom: 6 }}>248 resultados</div>
        <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 32, fontWeight: 800, letterSpacing:'-.03em', margin: 0 }}>
          Resultados para <span style={{ color: RM.red }}>"leche"</span>
        </h1>
        <div style={{ display:'flex', gap: 6, marginTop: 14, flexWrap:'wrap' }}>
          {['leche entera','leche deslactosada','leche en polvo','leche de almendra','leche evaporada','leche condensada'].map((s,i)=>(
            <Pill key={s} bg={i===0?RM.ink:'#fff'} color={i===0?'#fff':RM.ink} style={{ border: i===0?'none':`1px solid ${RM.line}`, padding:'6px 12px' }}>{s}</Pill>
          ))}
        </div>
      </section>

      {/* Top suggestion */}
      <section style={{ padding:'20px 24px 0' }}>
        <div style={{ background:'#fff', borderRadius: 14, padding: 16, border:`1px solid ${RM.line}`, display:'flex', gap: 16, alignItems:'center' }}>
          <div style={{ width: 88, height: 88, flexShrink: 0 }}>
            <PImg vis={PRODUCTS.find(p=>p.handle==='leche-alqueria-1l').thumbnail} radius={10} label={false}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <Badge kind="bolt">RECOMENDADO</Badge>
              <span style={{ fontSize: 12, color: RM.ink3 }}>El más comprado en tu zona</span>
            </div>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.02em', marginTop: 6 }}>Leche entera Alquería · 1 L</div>
            <div style={{ display:'flex', alignItems:'center', gap: 10, fontSize: 12, color: RM.ink3, marginTop: 4 }}>
              <Stars value={4.7} size={12}/> 4.7 · 1.230 reseñas · 🚚 entrega hoy
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 26, fontWeight: 800 }}>{cop(4800)}</div>
            <Btn kind="primary" style={{ marginTop: 6 }}>{Icon.plus(14)} Agregar</Btn>
          </div>
        </div>
      </section>

      {/* Results grid */}
      <section style={{ padding:'20px 24px 48px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Todos los resultados</div>
          <div style={{ fontSize: 13, color: RM.ink3 }}>Más vendidos · 248 productos</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap: 14 }}>
          {[...PRODUCTS.filter(p=>p.category_ids[0]==='cat_lacteos'), ...PRODUCTS].slice(0,18).map((p,i)=>(
            <ProductCard key={`${p.id}-${i}`} p={p}/>
          ))}
        </div>
      </section>
      <Footer/>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// CART
// ═══════════════════════════════════════════════════════════════════
function CartPage() {
  const items = [
    { p: PRODUCTS[28], qty: 1 }, // air fryer
    { p: PRODUCTS[3], qty: 2 },  // arroz
    { p: PRODUCTS[6], qty: 6 },  // leche
    { p: PRODUCTS[1], qty: 4 },  // aguacate
    { p: PRODUCTS[17], qty: 1 }, // shampoo
    { p: PRODUCTS[20], qty: 1 }, // detergente
  ];
  const subtotal = items.reduce((s,it)=> s + (it.p.variants[0].prices[0].amount/100)*it.qty, 0);
  const list_sub = items.reduce((s,it)=> s + ((it.p.list_price||it.p.variants[0].prices[0].amount)/100)*it.qty, 0);
  const savings  = list_sub - subtotal;
  const shipping = 0;
  const tax      = Math.round(subtotal * 0.0); // food in CO is mostly tax-exempt; keep simple
  const total    = subtotal + shipping + tax;
  return (
    <div style={{ background: RM.cream, fontFamily: RM.fontBody, color: RM.ink, minHeight:'100vh' }}>
      <Header/>
      <div style={{ padding:'20px 24px 0' }}>
        <div style={{ fontSize: 12, color: RM.ink3, marginBottom: 6 }}>Inicio › Carrito</div>
        <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 36, fontWeight: 800, letterSpacing:'-.03em', margin: 0 }}>Tu carrito · {items.length} productos</h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap: 20, padding:'20px 24px 32px' }}>
        {/* Items */}
        <div>
          {/* Delivery promise */}
          <div style={{ background: RM.s_mint, color: RM.green, borderRadius: 12, padding:'14px 16px', display:'flex', alignItems:'center', gap: 12, marginBottom: 14 }}>
            <div style={{ color: RM.green }}>{Icon.truck(20)}</div>
            <div style={{ flex:1, fontSize: 14, fontWeight: 600 }}>
              <strong>¡Faltan $31.300 para tu envío gratis!</strong>
              <div style={{ height: 6, background:'rgba(15,122,62,.18)', borderRadius: 999, marginTop: 6, overflow:'hidden' }}>
                <div style={{ width:'62%', height:'100%', background: RM.green, borderRadius: 999 }}/>
              </div>
            </div>
          </div>

          {/* Item list */}
          <div style={{ background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:`1px solid ${RM.line2}` }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700 }}>
                <span style={{ width:18,height:18,borderRadius:5,background:RM.ink,color:'#fff',display:'grid',placeItems:'center' }}>{Icon.check(12)}</span>
                Seleccionar todo ({items.length})
              </label>
              <span style={{ fontSize: 13, color: RM.red, fontWeight: 700, cursor:'pointer' }}>Eliminar seleccionados</span>
            </div>
            {items.map((it,i)=>(
              <CartRow key={it.p.id} item={it} last={i===items.length-1}/>
            ))}
          </div>

          {/* Recommendations */}
          <div style={{ marginTop: 20 }}>
            <SectionHead kicker="Quizás también necesites" title="Completa tu compra" action={null}/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 14 }}>
              {PRODUCTS.slice(8,12).map(p=> <ProductCard key={p.id} p={p}/>)}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside>
          <div style={{ position:'sticky', top: 16 }}>
            <div style={{ background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`, padding: 20 }}>
              <h3 style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.02em', margin: '0 0 16px' }}>Resumen</h3>

              {/* Coupon */}
              <div style={{ display:'flex', gap: 6, marginBottom: 14 }}>
                <input placeholder="Cupón o código" style={{
                  flex:1, height: 42, padding:'0 12px', border:`1.5px solid ${RM.line}`, borderRadius: 8,
                  fontFamily: RM.fontBody, fontSize: 13, outline:'none',
                }}/>
                <Btn kind="dark" size="md">Aplicar</Btn>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize: 14 }}>
                <span style={{ color: RM.ink2 }}>Subtotal ({items.reduce((s,it)=>s+it.qty,0)} unidades)</span>
                <span style={{ fontWeight: 700 }}>{cop(subtotal)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize: 14, color: RM.green }}>
                <span>Descuentos</span>
                <span style={{ fontWeight: 700 }}>−{cop(savings)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize: 14 }}>
                <span style={{ color: RM.ink2 }}>Envío</span>
                <span style={{ fontWeight: 700, color: RM.green }}>Gratis</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize: 14 }}>
                <span style={{ color: RM.ink2 }}>Impuestos</span>
                <span style={{ fontWeight: 700 }}>Incluidos</span>
              </div>
              <div style={{ borderTop:`1px dashed ${RM.line}`, marginTop: 10, paddingTop: 14, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: RM.ink2 }}>TOTAL</span>
                <span style={{ fontFamily: RM.fontDisplay, fontSize: 32, fontWeight: 800, letterSpacing:'-.02em' }}>{cop(total)}</span>
              </div>
              <div style={{ fontSize: 11, color: RM.ink3, textAlign:'right' }}>o 4 cuotas de {cop(Math.round(total/4))} con Addi</div>

              <Btn kind="primary" full size="lg" style={{ marginTop: 16 }}>Ir a pagar →</Btn>
              <Btn kind="ghost" full size="md" style={{ marginTop: 8 }}>Seguir comprando</Btn>
            </div>

            <div style={{ marginTop: 14, padding: 16, background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`, fontSize: 12, color: RM.ink2, lineHeight: 1.6 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 8, fontWeight: 700, color: RM.ink, marginBottom: 6 }}>{Icon.shield(16)} Compra protegida</div>
              Devolución gratis en 30 días. Atención al cliente 24/7. Pago seguro con Wompi.
            </div>
          </div>
        </aside>
      </div>
      <Footer/>
    </div>
  );
}

function CartRow({ item, last }) {
  const price = item.p.variants[0].prices[0].amount/100;
  const list  = item.p.list_price ? item.p.list_price/100 : null;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'24px 88px 1fr auto auto', gap: 14, padding: 16, alignItems:'center', borderBottom: last?'none':`1px solid ${RM.line2}` }}>
      <span style={{ width:18,height:18,borderRadius:5,background:RM.ink,color:'#fff',display:'grid',placeItems:'center' }}>{Icon.check(12)}</span>
      <div style={{ width: 88 }}><PImg vis={item.p.thumbnail} radius={10} label={false}/></div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em' }}>{item.p.brand}</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{item.p.title}</div>
        <div style={{ fontSize: 12, color: RM.green, fontWeight: 700, marginTop: 4 }}>● En stock</div>
        <div style={{ display:'flex', gap: 14, marginTop: 6, fontSize: 12, color: RM.ink2 }}>
          <span style={{ cursor:'pointer' }}>♡ Mover a favoritos</span>
          <span style={{ cursor:'pointer', color: RM.red }}>Eliminar</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${RM.line}`, borderRadius: 8, height: 36 }}>
        <button style={{ width: 32, height: 34, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.minus(14)}</button>
        <span style={{ minWidth: 24, textAlign:'center', fontWeight: 800 }}>{item.qty}</span>
        <button style={{ width: 32, height: 34, border:'none', background:'transparent', cursor:'pointer' }}>{Icon.plus(14)}</button>
      </div>
      <div style={{ textAlign:'right', minWidth: 110 }}>
        <div style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em' }}>{cop(price*item.qty)}</div>
        {list && <div style={{ fontSize: 12, color: RM.ink4, textDecoration:'line-through' }}>{cop(list*item.qty)}</div>}
        <div style={{ fontSize: 11, color: RM.ink3, marginTop: 2 }}>{cop(price)} c/u</div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// CHECKOUT (steps: Address → Shipping → Payment)
// ═══════════════════════════════════════════════════════════════════
function CheckoutPage() {
  return (
    <div style={{ background: RM.cream, fontFamily: RM.fontBody, color: RM.ink, minHeight: '100vh' }}>
      {/* Minimal checkout header */}
      <header style={{ background:'#fff', borderBottom:`1px solid ${RM.line}`, padding:'14px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <RMLogo size={20}/>
        <div style={{ display:'flex', alignItems:'center', gap: 20, fontSize: 13 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap: 6, color: RM.green, fontWeight: 700 }}>{Icon.shield(16)} Compra 100% segura</span>
          <span style={{ color: RM.ink3 }}>¿Necesitas ayuda? <strong style={{ color: RM.ink }}>+57 300 123 4567</strong></span>
        </div>
      </header>

      {/* Stepper */}
      <div style={{ background:'#fff', borderBottom:`1px solid ${RM.line}`, padding:'14px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 32 }}>
          {[
            ['Dirección', true],
            ['Envío', true],
            ['Pago', false],
            ['Confirmación', false],
          ].map(([label,done],i,arr)=>(
            <React.Fragment key={label}>
              <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: i===2 ? RM.red : done ? RM.green : '#fff',
                  color: (i===2||done) ? '#fff' : RM.ink3,
                  border: !done && i!==2 ? `1.5px solid ${RM.line}` : 'none',
                  display:'grid', placeItems:'center', fontSize: 12, fontWeight: 800,
                }}>{done ? Icon.check(14) : i+1}</div>
                <div style={{
                  fontSize: 13, fontWeight: i===2?800:600,
                  color: i===2 ? RM.ink : done ? RM.ink2 : RM.ink3,
                }}>{label}</div>
              </div>
              {i<arr.length-1 && <div style={{ width: 60, height: 2, background: done?RM.green:RM.line }}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap: 20, padding:'24px 32px', maxWidth: 1280, margin:'0 auto' }}>
        {/* Steps */}
        <div>
          {/* Step 1 — Address (collapsed/done) */}
          <CheckoutSection done title="Dirección de entrega" subtitle="Cra 7 #45-12, Apto 502 · Chapinero, Bogotá">
            <div style={{ fontSize: 13, color: RM.ink2 }}>Andrea Pérez · +57 311 234 5678</div>
          </CheckoutSection>

          {/* Step 2 — Shipping (done, summary) */}
          <CheckoutSection done title="Método de envío" subtitle="Express — llega hoy entre 4 PM y 7 PM"/>

          {/* Step 3 — Payment (active) */}
          <CheckoutSection active title="Método de pago">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { i:'💳', t:'Tarjeta crédito/débito', s:'Visa, Mastercard, Amex', a:true },
                { i:'🏦', t:'PSE',            s:'Débito desde tu banco', a:false },
                { i:'📱', t:'Nequi · Daviplata', s:'Pago desde tu celular', a:false },
                { i:'💵', t:'Contraentrega',   s:'Efectivo al recibir',    a:false },
                { i:'🤝', t:'Addi · Sistecrédito', s:'4 cuotas sin interés', a:false },
                { i:'🧧', t:'Tarjeta de regalo Rodi', s:'Saldo: $0',         a:false },
              ].map(m=>(
                <label key={m.t} style={{
                  display:'flex', gap: 12, padding: 14, borderRadius: 12, cursor:'pointer',
                  border: `1.5px solid ${m.a ? RM.ink : RM.line}`,
                  background: m.a ? RM.cream : '#fff',
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 999, flexShrink: 0,
                    border:`1.5px solid ${m.a?RM.ink:RM.line}`, marginTop: 2,
                    background: m.a ? RM.ink : '#fff',
                    boxShadow: m.a ? `inset 0 0 0 3px #fff` : 'none',
                  }}/>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, display:'flex', alignItems:'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{m.i}</span> {m.t}
                    </div>
                    <div style={{ fontSize: 12, color: RM.ink3, marginTop: 2 }}>{m.s}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Card form */}
            <div style={{ background: RM.line2, borderRadius: 12, padding: 18 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
                <FormField label="Número de tarjeta" placeholder="4242 4242 4242 4242" trailing="💳 visa"/>
                <FormField label="Nombre en la tarjeta" placeholder="ANDREA PEREZ"/>
                <FormField label="Vence" placeholder="MM / AA"/>
                <FormField label="CVV" placeholder="123" trailing="?"/>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap: 8, marginTop: 12, fontSize: 13, color: RM.ink2 }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: RM.ink, color:'#fff', display:'grid', placeItems:'center' }}>{Icon.check(11)}</span>
                Guardar esta tarjeta para próximas compras
              </label>
            </div>

            <div style={{ marginTop: 16, padding:'12px 14px', background: RM.s_butter, borderRadius: 10, fontSize: 13, display:'flex', alignItems:'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <span style={{ flex:1 }}>¿Tienes un cupón? Aplícalo y ahorra hasta 30% más.</span>
              <Btn kind="ghost" size="sm">Agregar cupón</Btn>
            </div>
          </CheckoutSection>

          {/* Step 4 — Review (pending) */}
          <CheckoutSection title="Revisar y confirmar pedido"/>
        </div>

        {/* Summary */}
        <aside>
          <div style={{ position:'sticky', top: 16, background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`, padding: 20 }}>
            <h3 style={{ fontFamily: RM.fontDisplay, fontSize: 20, fontWeight: 800, letterSpacing:'-.02em', margin: '0 0 14px' }}>Tu pedido · 6 productos</h3>
            <div style={{ maxHeight: 240, overflow:'hidden', borderBottom:`1px solid ${RM.line2}`, paddingBottom: 12, marginBottom: 12 }}>
              {[PRODUCTS[28], PRODUCTS[3], PRODUCTS[6], PRODUCTS[1]].map((p,i)=>(
                <div key={i} style={{ display:'flex', gap: 10, padding:'8px 0' }}>
                  <div style={{ width: 44, height: 44, flexShrink:0, position:'relative' }}>
                    <PImg vis={p.thumbnail} radius={6} label={false}/>
                    <span style={{ position:'absolute', top:-6,right:-6, width:18,height:18, borderRadius:999, background:RM.ink, color:'#fff', fontSize:10, fontWeight:800, display:'grid', placeItems:'center' }}>{[1,2,6,4][i]}</span>
                  </div>
                  <div style={{ flex:1, fontSize: 12, lineHeight: 1.3 }}>
                    <div style={{ fontWeight: 600, color: RM.ink }}>{p.title}</div>
                    <div style={{ color: RM.ink3 }}>{p.brand}</div>
                  </div>
                  <div style={{ fontFamily: RM.fontDisplay, fontSize: 14, fontWeight: 800 }}>{cop(p.variants[0].prices[0].amount/100 * [1,2,6,4][i])}</div>
                </div>
              ))}
              <div style={{ fontSize: 12, color: RM.red, fontWeight: 700, paddingTop: 6, cursor:'pointer' }}>Ver los 6 productos →</div>
            </div>

            <div style={{ fontSize: 13 }}>
              <SumRow label="Subtotal" value={cop(681500)}/>
              <SumRow label="Descuentos" value={`−${cop(58400)}`} color={RM.green}/>
              <SumRow label="Envío express" value={cop(8900)}/>
              <SumRow label="Impuestos" value="Incluidos"/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderTop:`1px dashed ${RM.line}`, marginTop: 10, paddingTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: RM.ink2 }}>TOTAL</span>
              <span style={{ fontFamily: RM.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing:'-.02em' }}>{cop(632000)}</span>
            </div>

            <Btn kind="primary" full size="lg" style={{ marginTop: 14 }}>{Icon.shield(16)} Pagar {cop(632000)}</Btn>
            <div style={{ fontSize: 11, color: RM.ink3, textAlign:'center', marginTop: 8, lineHeight: 1.5 }}>
              Al pagar aceptas los <u>términos</u> y la <u>política de privacidad</u>. Pago seguro con encriptación SSL.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckoutSection({ title, subtitle, done, active, children }) {
  return (
    <div style={{
      background:'#fff', borderRadius: 14, padding: '18px 20px', marginBottom: 12,
      border: `1.5px solid ${active ? RM.ink : RM.line}`,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          {done && <div style={{ width: 22, height: 22, borderRadius: 999, background: RM.green, color:'#fff', display:'grid', placeItems:'center' }}>{Icon.check(12)}</div>}
          <div>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, letterSpacing:'-.02em' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: RM.ink2, marginTop: 2 }}>{subtitle}</div>}
          </div>
        </div>
        {done && <button style={{ fontSize: 13, fontWeight: 700, color: RM.red, background:'none', border:'none', cursor:'pointer' }}>Editar</button>}
      </div>
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}

function FormField({ label, placeholder, trailing }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'center', height: 42, background:'#fff', border:`1.5px solid ${RM.line}`, borderRadius: 8, padding:'0 12px' }}>
        <input placeholder={placeholder} style={{ flex:1, border:'none', outline:'none', fontSize: 14, fontFamily: RM.fontBody, background:'transparent' }}/>
        {trailing && <span style={{ fontSize: 11, color: RM.ink3, fontWeight: 700, textTransform:'uppercase' }}>{trailing}</span>}
      </div>
    </div>
  );
}

function SumRow({ label, value, color }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
      <span style={{ color: RM.ink2 }}>{label}</span>
      <span style={{ fontWeight: 700, color: color || RM.ink }}>{value}</span>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// ORDER CONFIRMATION
// ═══════════════════════════════════════════════════════════════════
function ConfirmationPage() {
  return (
    <div style={{ background: RM.cream, fontFamily: RM.fontBody, color: RM.ink, minHeight: '100vh' }}>
      <header style={{ background:'#fff', borderBottom:`1px solid ${RM.line}`, padding:'14px 32px' }}>
        <RMLogo size={20}/>
      </header>

      <main style={{ maxWidth: 920, margin:'0 auto', padding:'40px 24px 56px' }}>
        {/* Hero confirmation */}
        <div style={{
          background:'#fff', borderRadius: 18, border:`1px solid ${RM.line}`, padding: 40,
          textAlign:'center', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', inset: 0, opacity:.06, fontSize: 32, display:'grid', gridTemplateColumns:'repeat(20, 1fr)', gap: 10, padding: 8 }}>
            {Array.from({length: 40}).map((_,i)=> <span key={i}>{['🥑','🍝','🥛','🛒','🥦','🍞','🧴'][i%7]}</span>)}
          </div>
          <div style={{ position:'relative' }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: RM.green, color:'#fff', display:'grid', placeItems:'center', margin:'0 auto', boxShadow:`0 8px 24px rgba(15,122,62,.3)` }}>
              {Icon.check(36)}
            </div>
            <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 56, fontWeight: 800, letterSpacing:'-.04em', margin:'18px 0 4px', lineHeight: 1 }}>
              ¡Listo, Andrea!
            </h1>
            <div style={{ fontSize: 17, color: RM.ink2 }}>Tu pedido <strong style={{ color: RM.ink }}>#RDM-2026-038124</strong> está en camino</div>
            <div style={{ marginTop: 24, display:'inline-flex', alignItems:'center', gap: 12, padding:'14px 22px', background: RM.s_butter, borderRadius: 14 }}>
              <span style={{ fontSize: 32 }}>🛵</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: RM.ink, textTransform:'uppercase', letterSpacing:'.06em' }}>Llega entre</div>
                <div style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>HOY · 4:00 PM – 4:45 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracker */}
        <div style={{ background:'#fff', borderRadius: 18, border:`1px solid ${RM.line}`, padding: 28, marginTop: 20 }}>
          <div style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.025em', marginBottom: 22 }}>Seguimiento en vivo</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 0, position:'relative' }}>
            <div style={{ position:'absolute', left: '12.5%', right:'12.5%', top: 16, height: 3, background: RM.line2, borderRadius: 999, zIndex:0 }}/>
            <div style={{ position:'absolute', left: '12.5%', width:'37.5%', top: 16, height: 3, background: RM.green, borderRadius: 999, zIndex:0 }}/>
            {[
              { i:Icon.check(16), t:'Pedido confirmado', tm:'2:42 PM', d:true },
              { i:Icon.bag(16),   t:'Preparando',         tm:'3:08 PM', d:true },
              { i:Icon.truck(16), t:'En camino',          tm:'3:42 PM · ahora', d:'now' },
              { i:Icon.pin(16),   t:'Entregado',          tm:'~ 4:25 PM', d:false },
            ].map((s,i)=>(
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: s.d===true ? RM.green : s.d==='now' ? RM.red : '#fff',
                  border: s.d===false ? `2px solid ${RM.line}` : 'none',
                  color: s.d ? '#fff' : RM.ink3,
                  display:'grid', placeItems:'center',
                }}>{s.i}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, color: s.d?RM.ink:RM.ink3 }}>{s.t}</div>
                <div style={{ fontSize: 11, color: s.d==='now'?RM.red:RM.ink3, fontWeight: s.d==='now'?700:500 }}>{s.tm}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 14, padding: 14, background: RM.cream, borderRadius: 12, marginTop: 22 }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: RM.s_sky, color: RM.blue, display:'grid', placeItems:'center', fontSize: 22 }}>👨🏽</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Juan Pablo · tu repartidor</div>
              <div style={{ fontSize: 12, color: RM.ink3 }}><Stars value={5} size={11}/> 4.9 · 2.341 entregas</div>
            </div>
            <Btn kind="ghost" size="sm">Llamar</Btn>
            <Btn kind="dark" size="sm">Mensaje</Btn>
          </div>
        </div>

        {/* Summary + invoice */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16, marginTop: 20 }}>
          <div style={{ background:'#fff', borderRadius: 18, border:`1px solid ${RM.line}`, padding: 24 }}>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 20, fontWeight: 800, letterSpacing:'-.02em', marginBottom: 14 }}>Resumen</div>
            <SumRow label="6 productos · 14 unidades" value={cop(681500)}/>
            <SumRow label="Descuentos" value={`−${cop(58400)}`} color={RM.green}/>
            <SumRow label="Envío express" value={cop(8900)}/>
            <div style={{ borderTop:`1px dashed ${RM.line}`, marginTop: 10, paddingTop: 12, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: RM.ink2 }}>Total pagado</span>
              <span style={{ fontFamily: RM.fontDisplay, fontSize: 26, fontWeight: 800 }}>{cop(632000)}</span>
            </div>
            <div style={{ fontSize: 12, color: RM.ink3, marginTop: 6 }}>Visa **** 4242 · Recibo enviado a andrea@correo.com</div>
            <Btn kind="ghost" full size="sm" style={{ marginTop: 14 }}>Descargar factura PDF</Btn>
          </div>
          <div style={{ background: RM.ink, color:'#fff', borderRadius: 18, padding: 24 }}>
            <Pill bg={RM.yellow} color={RM.ink}>¡Gracias!</Pill>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 26, fontWeight: 800, letterSpacing:'-.025em', lineHeight: 1.1, marginTop: 10 }}>
              Tu próxima compra<br/>tiene <span style={{ color: RM.yellow }}>20% off</span>
            </div>
            <div style={{ fontSize: 13, opacity:.7, marginTop: 8 }}>Usa el código <strong style={{ color: RM.yellow, fontFamily: RM.fontMono }}>GRACIAS20</strong> antes del 30 de mayo. Aplica en aseo y limpieza.</div>
            <Btn kind="yellow" style={{ marginTop: 14 }}>Seguir comprando →</Btn>
          </div>
        </div>
      </main>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// AUTH (login + register, split layout)
// ═══════════════════════════════════════════════════════════════════
function AuthPage() {
  return (
    <div style={{ background: RM.paper, fontFamily: RM.fontBody, color: RM.ink, minHeight:'100vh', display:'grid', gridTemplateColumns:'1.1fr 1fr' }}>
      {/* Left visual */}
      <aside style={{ background: RM.red, color:'#fff', padding: 56, display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
        <RMLogo size={22} color="#fff" mark={RM.red} text="#fff"/>
        <div style={{ position:'relative', zIndex:1 }}>
          <Pill bg="rgba(255,255,255,.18)" color="#fff" style={{ marginBottom: 18 }}>{Icon.bolt(12)} Para tu próxima compra</Pill>
          <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 64, fontWeight: 800, letterSpacing:'-.04em', lineHeight: .95, margin: 0, textWrap:'balance' }}>
            Tu mercado<br/>en 90 minutos.
          </h1>
          <p style={{ fontSize: 17, opacity:.85, lineHeight: 1.5, marginTop: 14, maxWidth: 460 }}>
            Frescos del día, marcas que amas y entrega rápida. Crea tu cuenta y desbloquea descuentos exclusivos.
          </p>
          <div style={{ display:'flex', gap: 24, marginTop: 32 }}>
            {[['12.4k','reseñas 5★'],['90 min','entrega'],['$80k','envío gratis']].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontFamily: RM.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing:'-.02em' }}>{n}</div>
                <div style={{ fontSize: 11, opacity: .75, textTransform:'uppercase', letterSpacing:'.06em', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:'absolute', right: -40, top: 120, fontSize: 280, opacity:.18 }}>🛒</div>
        <div style={{ position:'absolute', left: 40, bottom: 40, fontSize: 60, transform:'rotate(-10deg)' }}>🥑</div>
        <div style={{ position:'absolute', right: 80, bottom: 80, fontSize: 50, transform:'rotate(20deg)' }}>🍅</div>
      </aside>

      {/* Form */}
      <div style={{ display:'flex', flexDirection:'column', padding:'48px 56px', justifyContent:'center' }}>
        <div style={{ maxWidth: 420 }}>
          <div style={{ display:'flex', gap: 0, background: RM.line2, padding: 4, borderRadius: 12, marginBottom: 28 }}>
            <div style={{ flex:1, padding:'10px 12px', textAlign:'center', borderRadius: 8, background:'#fff', fontWeight: 700, fontSize: 14, boxShadow:'0 1px 3px rgba(0,0,0,.05)' }}>Ingresar</div>
            <div style={{ flex:1, padding:'10px 12px', textAlign:'center', borderRadius: 8, color: RM.ink3, fontWeight: 600, fontSize: 14 }}>Crear cuenta</div>
          </div>

          <h2 style={{ fontFamily: RM.fontDisplay, fontSize: 38, fontWeight: 800, letterSpacing:'-.03em', margin:'0 0 6px', lineHeight: 1 }}>Hola de nuevo</h2>
          <p style={{ fontSize: 14, color: RM.ink3, margin:'0 0 24px' }}>Ingresa con tu correo o un proveedor</p>

          {/* Social */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            <SocialBtn label="Google" letter="G" color="#4285F4"/>
            <SocialBtn label="Apple" letter=""/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 12, margin:'22px 0' }}>
            <div style={{ flex:1, height: 1, background: RM.line }}/>
            <span style={{ fontSize: 12, color: RM.ink3 }}>o con tu correo</span>
            <div style={{ flex:1, height: 1, background: RM.line }}/>
          </div>

          <div style={{ display:'grid', gap: 12 }}>
            <FormField label="Correo electrónico" placeholder="andrea@correo.com"/>
            <FormField label="Contraseña" placeholder="••••••••" trailing="👁"/>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 14, fontSize: 13 }}>
            <label style={{ display:'flex', alignItems:'center', gap: 6 }}>
              <span style={{ width:16,height:16, borderRadius:4, background: RM.ink, color:'#fff', display:'grid', placeItems:'center' }}>{Icon.check(11)}</span>
              <span>Recuérdame</span>
            </label>
            <span style={{ color: RM.red, fontWeight: 700, cursor:'pointer' }}>¿Olvidaste tu contraseña?</span>
          </div>

          <Btn kind="primary" full size="lg" style={{ marginTop: 18 }}>Ingresar</Btn>

          <div style={{ fontSize: 13, color: RM.ink3, marginTop: 24, textAlign:'center' }}>
            ¿Nuevo en Rodi? <span style={{ color: RM.red, fontWeight: 700, cursor:'pointer' }}>Crea tu cuenta gratis →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({ label, letter, color }) {
  return (
    <button style={{
      height: 48, borderRadius: 10, background:'#fff', border:`1.5px solid ${RM.line}`,
      display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
      fontFamily: RM.fontBody, fontSize: 14, fontWeight: 700, color: RM.ink, cursor:'pointer',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 4, background: color||'#000', color:'#fff',
        display:'grid', placeItems:'center', fontWeight: 800, fontSize: 13,
      }}>{letter || '\u{F8FF}'}</span>
      Continuar con {label}
    </button>
  );
}


// ═══════════════════════════════════════════════════════════════════
// ACCOUNT (dashboard with orders, addresses, etc.)
// ═══════════════════════════════════════════════════════════════════
function AccountPage() {
  return (
    <div style={{ background: RM.cream, fontFamily: RM.fontBody, color: RM.ink, minHeight:'100vh' }}>
      <Header/>

      <div style={{ padding:'24px 32px' }}>
        <div style={{ fontSize: 12, color: RM.ink3, marginBottom: 6 }}>Inicio › Mi cuenta</div>
        <h1 style={{ fontFamily: RM.fontDisplay, fontSize: 40, fontWeight: 800, letterSpacing:'-.03em', margin:'0 0 4px' }}>Hola, Andrea 👋</h1>
        <div style={{ fontSize: 14, color: RM.ink2 }}>Cliente desde julio 2024 · Nivel <strong style={{ color: RM.red }}>Rodi+ Oro</strong> · 1.240 puntos</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap: 20, padding:'0 32px 40px' }}>
        {/* Sidebar */}
        <aside style={{ background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`, padding: 12, height:'fit-content' }}>
          {[
            ['Resumen','📊',true],
            ['Mis pedidos','📦',false,'12'],
            ['Direcciones','📍',false,'3'],
            ['Métodos de pago','💳',false],
            ['Favoritos','♡',false,'24'],
            ['Listas de compra','📝',false,'6'],
            ['Cupones','🎟',false,'3'],
            ['Suscripciones','🔄',false],
            ['Rodi+ Oro','⭐',false],
            ['Notificaciones','🔔',false],
            ['Ayuda','❔',false],
            ['Salir','↩',false],
          ].map(([label,emoji,active,badge])=>(
            <div key={label} style={{
              display:'flex', alignItems:'center', gap: 10, padding:'10px 12px', borderRadius: 8,
              background: active ? RM.s_pink : 'transparent', cursor:'pointer',
              color: active ? RM.red : RM.ink2, fontWeight: active ? 700 : 600, fontSize: 13,
            }}>
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <span style={{ flex:1 }}>{label}</span>
              {badge && <Pill bg={RM.line2} style={{ padding:'2px 7px', fontSize: 10 }}>{badge}</Pill>}
            </div>
          ))}
        </aside>

        {/* Main */}
        <main>
          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { l:'Pedidos este año', v:'12', s:'+3 vs 2025', bg: RM.s_pink, c: RM.red },
              { l:'Ahorrado en ofertas', v:cop(184500), s:'34 productos', bg: RM.s_mint, c: RM.green },
              { l:'Puntos Rodi+', v:'1.240', s:'Faltan 260 para Platino', bg: RM.s_butter, c: RM.yellowDeep },
              { l:'Próximo pedido', v:'Hoy', s:'4:00 PM – 4:45 PM', bg: RM.s_sky, c: RM.blue },
            ].map(s=>(
              <div key={s.l} style={{ background: s.bg, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 12, color: s.c, fontWeight: 800, textTransform:'uppercase', letterSpacing:'.06em' }}>{s.l}</div>
                <div style={{ fontFamily: RM.fontDisplay, fontSize: 32, fontWeight: 800, letterSpacing:'-.025em', marginTop: 6, lineHeight: 1, color: RM.ink }}>{s.v}</div>
                <div style={{ fontSize: 12, color: RM.ink2, marginTop: 4 }}>{s.s}</div>
              </div>
            ))}
          </div>

          {/* Active order */}
          <div style={{ background: RM.ink, color:'#fff', borderRadius: 14, padding: 22, marginBottom: 16, display:'flex', alignItems:'center', gap: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: RM.red, display:'grid', placeItems:'center', fontSize: 28 }}>🛵</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: RM.yellow, letterSpacing:'.06em', textTransform:'uppercase' }}>● En camino · 18 min restantes</div>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.02em', marginTop: 4 }}>Pedido #RDM-2026-038124</div>
              <div style={{ fontSize: 13, color:'rgba(255,255,255,.7)' }}>6 productos · {cop(632000)} · Juan Pablo (4.9★)</div>
            </div>
            <Btn kind="yellow">Seguir pedido →</Btn>
          </div>

          {/* Orders + Addresses + Recommendations */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap: 16 }}>
            <div style={{ background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`, padding: 20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
                <h3 style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.02em', margin: 0 }}>Pedidos recientes</h3>
                <Btn kind="ghost" size="sm">Ver todos →</Btn>
              </div>
              {[
                { id:'#RDM-2026-038124', d:'Hoy', s:'En camino', items: 6, t: 632000, sc: RM.red },
                { id:'#RDM-2026-037890', d:'17 may', s:'Entregado', items: 14, t: 248900, sc: RM.green },
                { id:'#RDM-2026-037412', d:'09 may', s:'Entregado', items: 8, t: 124300, sc: RM.green },
                { id:'#RDM-2026-036998', d:'02 may', s:'Entregado · valorado ★', items: 22, t: 412700, sc: RM.green },
              ].map((o,i)=>(
                <div key={o.id} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap: 14, padding:'12px 0', borderTop: i===0?'none':`1px solid ${RM.line2}`, alignItems:'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: RM.line2, display:'grid', placeItems:'center', fontSize: 20 }}>📦</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{o.id}</div>
                    <div style={{ fontSize: 12, color: RM.ink3 }}>{o.d} · {o.items} productos</div>
                  </div>
                  <Pill bg={o.sc===RM.red?RM.s_pink:RM.s_mint} color={o.sc} style={{ fontSize: 10 }}>{o.s}</Pill>
                  <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                    <div style={{ fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 800, minWidth: 90, textAlign:'right' }}>{cop(o.t)}</div>
                    <button style={{ width: 30, height: 30, borderRadius: 8, border:`1px solid ${RM.line}`, background:'#fff', cursor:'pointer' }}>{Icon.chev(12,'right')}</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
              {/* Default address */}
              <div style={{ background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`, padding: 18 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <h4 style={{ fontFamily: RM.fontDisplay, fontSize: 16, fontWeight: 800, margin: 0 }}>Direcciones</h4>
                  <Btn kind="ghost" size="sm">Editar</Btn>
                </div>
                <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: RM.cream }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                    <Pill bg={RM.red} color="#fff" style={{ fontSize:10 }}>Principal</Pill>
                    <span style={{ fontSize: 12, color: RM.ink3, fontWeight: 600 }}>Casa</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>Cra 7 #45-12, Apto 502</div>
                  <div style={{ fontSize: 12, color: RM.ink2 }}>Chapinero · Bogotá · +57 311 234 5678</div>
                </div>
                <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: RM.cream }}>
                  <div style={{ fontSize: 12, color: RM.ink3, fontWeight: 600 }}>Oficina</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>Cll 26 #92-32, Piso 14</div>
                  <div style={{ fontSize: 12, color: RM.ink2 }}>Modelia · Bogotá</div>
                </div>
                <Btn kind="ghost" full size="sm" style={{ marginTop: 10 }}>+ Agregar dirección</Btn>
              </div>

              {/* Rodi+ Status */}
              <div style={{ background:`linear-gradient(135deg, ${RM.yellow} 0%, #FFB84C 100%)`, color: RM.ink, borderRadius: 14, padding: 18 }}>
                <div style={{ fontFamily: RM.fontMono, fontSize: 11, letterSpacing:'.1em', fontWeight: 800 }}>RODI+ ORO</div>
                <div style={{ fontFamily: RM.fontDisplay, fontSize: 26, fontWeight: 800, letterSpacing:'-.025em', lineHeight: 1, marginTop: 6 }}>1.240 pts</div>
                <div style={{ height: 6, background:'rgba(0,0,0,.12)', borderRadius: 999, marginTop: 10, overflow:'hidden' }}>
                  <div style={{ width:'82%', height:'100%', background: RM.ink, borderRadius: 999 }}/>
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>260 pts más para <strong>Platino</strong></div>
              </div>
            </div>
          </div>

          {/* Recommended */}
          <div style={{ marginTop: 20 }}>
            <SectionHead kicker="Comprado frecuentemente" title="Repite tu mercado" action="Ver listas"/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap: 12 }}>
              {PRODUCTS.slice(0,6).map(p=> <ProductCard key={p.id} p={p}/>)}
            </div>
          </div>
        </main>
      </div>
      <Footer/>
    </div>
  );
}

Object.assign(window, {
  CategoryPage, SearchPage, CartPage, CheckoutPage, ConfirmationPage, AuthPage, AccountPage,
  FilterGroup, FilterRow, CheckoutSection, FormField, SumRow, SocialBtn, CartRow, pageBtnStyle,
});
