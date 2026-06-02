// home.jsx — 3 Home variations for Rodi Mercado

// ═══════════════════════════════════════════════════════════════════
// Home v1 — "Classic supermarket"
// Big promo hero, category tiles, deal-of-the-day strip, sections per category
// ═══════════════════════════════════════════════════════════════════
function HomeV1() {
  return (
    <div style={{ background: RM.cream, fontFamily: RM.fontBody, color: RM.ink }}>
      <Header/>

      {/* HERO */}
      <section style={{ padding:'24px 24px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap: 16 }}>
          <div style={{
            background: RM.red, color:'#fff', borderRadius: 18, padding: 36,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            overflow:'hidden', position:'relative', minHeight: 320,
          }}>
            <div style={{ maxWidth: 440, position:'relative', zIndex:1 }}>
              <Pill bg="rgba(255,255,255,.18)" color="#fff" style={{ marginBottom: 14 }}>
                {Icon.bolt(12)} Hasta 40% OFF
              </Pill>
              <h1 style={{
                fontFamily: RM.fontDisplay, fontSize: 56, fontWeight: 800,
                letterSpacing:'-.04em', lineHeight: .95, margin:'0 0 14px',
              }}>Llenamos<br/>tu mercado<br/>en 90 min.</h1>
              <p style={{ fontSize: 16, lineHeight: 1.45, opacity: .92, margin: 0, maxWidth: 380 }}>
                Más de 12.000 productos al precio del barrio. Envío gratis en tu primera compra.
              </p>
              <div style={{ display:'flex', gap: 10, marginTop: 22 }}>
                <Btn kind="yellow" size="lg">Empezar a comprar</Btn>
                <Btn kind="ghost" size="lg" style={{ background:'rgba(255,255,255,.12)', color:'#fff', border:'1px solid rgba(255,255,255,.3)' }}>Ver ofertas</Btn>
              </div>
            </div>
            {/* Floating produce visuals */}
            <div style={{ position:'absolute', right: -20, top: -10, width: 320, height: 340 }}>
              <div style={{ position:'absolute', right: 30, top: 40, fontSize: 140, transform:'rotate(-12deg)' }}>🛒</div>
              <div style={{ position:'absolute', right: 200, top: 220, fontSize: 64, transform:'rotate(18deg)' }}>🥑</div>
              <div style={{ position:'absolute', right: 60, top: 250, fontSize: 56, transform:'rotate(-8deg)' }}>🍅</div>
              <div style={{ position:'absolute', right: 240, top: 60, fontSize: 48, transform:'rotate(22deg)' }}>🥖</div>
            </div>
          </div>
          {/* Side hero cards */}
          <div style={{ display:'grid', gridTemplateRows:'1fr 1fr', gap: 16 }}>
            <div style={{ background: RM.s_butter, borderRadius: 18, padding: 24, position:'relative', overflow:'hidden' }}>
              <Pill bg={RM.yellow} color={RM.ink}>NUEVO</Pill>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing:'-.025em', lineHeight: 1, marginTop: 12 }}>
                Marcas propias<br/><span style={{ color: RM.red }}>Rodi</span>
              </div>
              <div style={{ fontSize: 13, color: RM.ink2, marginTop: 6 }}>Hasta 30% más económico</div>
              <div style={{ position:'absolute', right: 12, bottom: 6, fontSize: 72 }}>📦</div>
            </div>
            <div style={{ background: RM.s_mint, borderRadius: 18, padding: 24, position:'relative', overflow:'hidden' }}>
              <Pill bg={RM.green} color="#fff">{Icon.leaf(12)} Orgánicos</Pill>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing:'-.025em', lineHeight: 1, marginTop: 12 }}>
                Frutas y<br/>verduras frescas
              </div>
              <div style={{ fontSize: 13, color: RM.ink2, marginTop: 6 }}>Del campo a tu casa, en 24 h</div>
              <div style={{ position:'absolute', right: 12, bottom: 6, fontSize: 72 }}>🥬</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ padding:'24px 24px 0' }}>
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 0,
          background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`,
        }}>
          {[
            { i: Icon.truck(22),  t:'Envío gratis', s:'En pedidos sobre $80.000' },
            { i: Icon.bolt(22),   t:'Entrega 90 min', s:'En las principales ciudades' },
            { i: Icon.shield(22), t:'Pago seguro', s:'Tarjetas, PSE y contraentrega' },
            { i: Icon.leaf(22),   t:'Frescos garantizados', s:'O te devolvemos tu dinero' },
          ].map((c,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap: 12, padding:'16px 20px', borderRight: i<3 ? `1px solid ${RM.line2}` : 'none' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: RM.s_pink, color: RM.red, display:'grid', placeItems:'center' }}>{c.i}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: RM.ink }}>{c.t}</div>
                <div style={{ fontSize: 12, color: RM.ink3 }}>{c.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category tiles */}
      <section style={{ padding:'40px 24px 0' }}>
        <SectionHead title="Compra por categoría" action="Ver todas"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 12 }}>
          {CATEGORIES.slice(0,14).map(c=>(
            <CategoryTile key={c.id} c={c}/>
          ))}
        </div>
      </section>

      {/* Deal of the day */}
      <section style={{ padding:'40px 24px 0' }}>
        <div style={{
          background: RM.ink, color:'#fff', borderRadius: 18, padding:'24px 28px',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 24,
          backgroundImage:`radial-gradient(circle at 92% 50%, ${RM.red} 0, transparent 40%)`,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: RM.yellow, color: RM.ink, display:'grid', placeItems:'center' }}>{Icon.bolt(28)}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing:'.1em', color: RM.yellow }}>OFERTA RELÁMPAGO</div>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 30, fontWeight: 800, letterSpacing:'-.025em', lineHeight: 1.05 }}>Air Fryer Philips 6 L · 28% OFF</div>
              <div style={{ fontSize: 13, color:'rgba(255,255,255,.7)', marginTop: 2 }}>Solo hoy o hasta agotar existencias</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 18 }}>
            {[['04','HRS'],['12','MIN'],['38','SEG']].map(([n,l])=>(
              <div key={l} style={{ textAlign:'center', minWidth: 56 }}>
                <div style={{ fontFamily: RM.fontDisplay, fontSize: 32, fontWeight: 800, letterSpacing:'-.02em', background:'rgba(255,255,255,.08)', borderRadius: 8, padding:'4px 0' }}>{n}</div>
                <div style={{ fontSize: 10, color:'rgba(255,255,255,.6)', marginTop: 4, letterSpacing:'.1em' }}>{l}</div>
              </div>
            ))}
            <Btn kind="yellow" size="lg">Comprar ahora</Btn>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section style={{ padding:'40px 24px 0' }}>
        <SectionHead kicker="Ofertas de la semana" title="Lo más buscado al mejor precio"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap: 14 }}>
          {PRODUCTS.slice(0,12).map(p=>(
            <ProductCard key={p.id} p={p}/>
          ))}
        </div>
      </section>

      {/* Frescos */}
      <section style={{ padding:'40px 24px 0' }}>
        <SectionHead kicker="Frutas y verduras" title="Recién cosechado"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap: 14 }}>
          {PRODUCTS.filter(p=>p.category_ids[0]==='cat_frescos').concat(PRODUCTS.filter(p=>p.category_ids[0]==='cat_lacteos')).slice(0,6).map(p=>(
            <ProductCard key={p.id} p={p}/>
          ))}
        </div>
      </section>

      {/* Banner duo */}
      <section style={{ padding:'40px 24px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
          <PromoBanner
            kicker="Recetas de la semana"
            title="Domingo de pasta · 4 personas por $24.900"
            body="Te armamos la lista. Agregamos los 6 ingredientes a tu carrito en un clic."
            bg={RM.s_peach} accent={RM.red} cta="Ver receta" emoji="🍝"
          />
          <PromoBanner
            kicker="Suscripción Rodi+"
            title="Envíos gratis ilimitados por $9.900/mes"
            body="Pedidos sin mínimo, productos exclusivos y devoluciones express."
            bg={RM.ink} color="#fff" accent={RM.yellow} cta="Probar gratis" emoji="✦"
          />
        </div>
      </section>

      {/* Mascotas + hogar */}
      <section style={{ padding:'40px 24px 0' }}>
        <SectionHead kicker="Hogar y cuidado" title="Tu casa, lista"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap: 14 }}>
          {PRODUCTS.filter(p=>['cat_aseo','cat_limpieza','cat_mascotas','cat_electro'].includes(p.category_ids[0])).slice(0,12).map(p=>(
            <ProductCard key={p.id} p={p}/>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section style={{ padding:'40px 24px 0' }}>
        <SectionHead title="Marcas que amas"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap: 12 }}>
          {['Alquería','Doria','Colanta','Diana','Bimbo','Coca-Cola','Margarita','Familia','Pantene','Colgate','Huggies','Dog Chow','Philips','Oster','Águila Roja','Cristal'].map((b,i)=>(
            <div key={b} style={{
              background:'#fff', border:`1px solid ${RM.line}`, borderRadius: 12,
              height: 80, display:'grid', placeItems:'center',
              fontFamily: RM.fontDisplay, fontWeight: 800, fontSize: 15, color: RM.ink2,
              letterSpacing:'-.02em',
            }}>{b}</div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ padding:'48px 24px 48px' }}>
        <div style={{
          background: RM.s_butter, borderRadius: 18, padding:'36px 40px',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 32, fontWeight: 800, letterSpacing:'-.03em', lineHeight: 1.05, color: RM.ink }}>
              Recibe los descuentos antes que nadie
            </div>
            <div style={{ fontSize: 14, color: RM.ink2, marginTop: 6 }}>Solo lo bueno · 1 email a la semana · sin spam</div>
          </div>
          <div style={{ display:'flex', gap: 8, alignItems:'center', background:'#fff', padding: 6, borderRadius: 12, border:`1px solid ${RM.ink}`, minWidth: 460 }}>
            <input placeholder="tu@correo.com" style={{ flex:1, border:'none', outline:'none', padding:'0 14px', height: 44, fontSize: 14, background:'transparent' }}/>
            <Btn kind="primary">Suscribirme</Btn>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

function CategoryTile({ c }) {
  const surfaces = { mint: RM.s_mint, butter: RM.s_butter, sky: RM.s_sky, pink: RM.s_pink, peach: RM.s_peach, lilac: RM.s_lilac, sand: RM.s_sand };
  return (
    <div style={{
      background: surfaces[c.surface] || RM.s_butter, borderRadius: 14, padding: 14,
      display:'flex', flexDirection:'column', justifyContent:'space-between', height: 132,
      cursor:'pointer', overflow:'hidden', position:'relative',
    }}>
      <div style={{ position:'absolute', right: -6, bottom: -10, fontSize: 64, opacity: .9 }}>{c.emoji}</div>
      <div style={{ fontSize: 11, color: RM.ink3, fontWeight: 700 }}>{c.desc}</div>
      <div style={{ fontFamily: RM.fontDisplay, fontSize: 15, fontWeight: 800, letterSpacing:'-.02em', lineHeight: 1.05, color: RM.ink, maxWidth: '70%' }}>{c.name}</div>
    </div>
  );
}

function PromoBanner({ kicker, title, body, bg, color = RM.ink, accent, cta, emoji }) {
  return (
    <div style={{
      background: bg, color, borderRadius: 18, padding: 28, position:'relative', overflow:'hidden',
      display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight: 220,
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: accent, textTransform:'uppercase', letterSpacing:'.08em' }}>{kicker}</div>
        <div style={{ fontFamily: RM.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing:'-.025em', lineHeight: 1.05, marginTop: 8, maxWidth: 380 }}>{title}</div>
        <div style={{ fontSize: 14, opacity:.85, marginTop: 10, maxWidth: 380, lineHeight: 1.5 }}>{body}</div>
      </div>
      <Btn kind={color==='#fff'?'yellow':'dark'} size="md" style={{ alignSelf:'flex-start', marginTop: 16 }}>{cta} →</Btn>
      <div style={{ position:'absolute', right: -20, bottom: -30, fontSize: 180, opacity:.18 }}>{emoji}</div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// Home v2 — "Editorial / bold"
// Magazine-style typography hero, curated stories, asymmetric grid
// ═══════════════════════════════════════════════════════════════════
function HomeV2() {
  return (
    <div style={{ background: RM.paper, fontFamily: RM.fontBody, color: RM.ink }}>
      <Header/>

      {/* Editorial hero */}
      <section style={{ padding:'32px 24px 0' }}>
        <div style={{
          borderTop: `2px solid ${RM.ink}`, borderBottom: `1px solid ${RM.line}`,
          paddingTop: 16, marginBottom: 20,
          display:'flex', alignItems:'center', justifyContent:'space-between', fontSize: 12, color: RM.ink2,
        }}>
          <span style={{ display:'inline-flex', gap: 18, fontWeight: 600 }}>
            <span>Edición #34 · Mayo 2026</span>
            <span style={{ color: RM.red }}>● En vivo: ofertas relámpago</span>
          </span>
          <span style={{ display:'inline-flex', gap: 14, fontWeight: 600 }}>
            <span>El Mercadito</span><span>·</span><span>Recetas</span><span>·</span><span>Productores</span>
          </span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: RM.red, letterSpacing:'.08em', textTransform:'uppercase' }}>Portada · Frescos de mayo</div>
            <h1 style={{
              fontFamily: RM.fontDisplay, fontSize: 96, fontWeight: 800,
              letterSpacing:'-.045em', lineHeight: .9, margin:'12px 0 0',
              textWrap:'balance',
            }}>
              <span style={{ background:`linear-gradient(120deg, ${RM.red}, ${RM.redDeep})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Aguacate</span><br/>
              en su punto.
            </h1>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop: 18 }}>
              <p style={{ fontSize: 16, color: RM.ink2, maxWidth: 480, lineHeight: 1.55, margin: 0 }}>
                Esta semana llegan los Hass de Sonsón, Antioquia. Maduros al tercer día, perfectos para el guacamole del domingo. <strong style={{ color: RM.ink }}>$7.800 c/u · sin mínimo de compra.</strong>
              </p>
              <div style={{ display:'flex', gap: 10 }}>
                <Btn kind="dark" size="lg">Agregar al carrito</Btn>
                <Btn kind="ghost" size="lg">Ver receta →</Btn>
              </div>
            </div>
          </div>
          <div style={{
            aspectRatio:'3/4', background: RM.s_mint, borderRadius: 20, position:'relative', overflow:'hidden',
            backgroundImage:`repeating-linear-gradient(45deg, transparent 0 22px, rgba(15,122,62,.08) 22px 23px)`,
          }}>
            <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', fontSize: 200 }}>🥑</div>
            <div style={{ position:'absolute', top: 16, left: 16 }}>
              <Badge kind="org"/>
            </div>
            <div style={{ position:'absolute', bottom: 16, left: 16, right: 16, padding:'10px 14px', background:'rgba(255,255,255,.9)', borderRadius: 10, fontFamily: RM.fontMono, fontSize: 11, color: RM.ink2 }}>
              foto producto · 3:4
            </div>
          </div>
        </div>
      </section>

      {/* Category strip — large word marks */}
      <section style={{ padding:'48px 24px 0' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', borderBottom: `1px solid ${RM.line}`, paddingBottom: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: RM.ink, letterSpacing:'.08em', textTransform:'uppercase' }}>01 · El mercado</div>
          <div style={{ fontSize: 12, color: RM.ink3 }}>14 categorías · 12.400+ productos</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 0 }}>
          {CATEGORIES.slice(0,8).map((c,i)=>(
            <div key={c.id} style={{
              padding:'18px 0', borderBottom: `1px solid ${RM.line2}`,
              borderRight: (i+1)%4 !==0 ? `1px solid ${RM.line2}` : 'none',
              paddingRight: 20, paddingLeft: i%4===0 ? 0 : 20,
              display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer',
            }}>
              <div style={{ display:'flex', alignItems:'baseline', gap: 14 }}>
                <span style={{ fontFamily: RM.fontMono, fontSize: 11, color: RM.ink4 }}>0{i+1}</span>
                <span style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing:'-.025em', color: RM.ink }}>{c.name}</span>
              </div>
              <span style={{ fontSize: 28 }}>{c.emoji}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Curated story 1 */}
      <section style={{ padding:'56px 24px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap: 32, alignItems:'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: RM.red, letterSpacing:'.08em', textTransform:'uppercase' }}>02 · Despensa</div>
            <h2 style={{ fontFamily: RM.fontDisplay, fontSize: 56, fontWeight: 800, letterSpacing:'-.035em', lineHeight: .95, margin:'14px 0 16px' }}>
              Lo básico,<br/><em style={{ color: RM.red, fontStyle:'normal' }}>bien hecho.</em>
            </h2>
            <p style={{ fontSize: 15, color: RM.ink2, lineHeight: 1.6, margin:'0 0 20px', maxWidth: 380 }}>
              Arroz, pasta, aceite, café. Los productos que siempre tienes en casa, al mejor precio del mes. Garantizado.
            </p>
            <Btn kind="dark" size="lg">Ver toda la despensa →</Btn>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 14 }}>
            {PRODUCTS.filter(p=>p.category_ids[0]==='cat_despensa').slice(0,3).map(p=>(
              <ProductCard key={p.id} p={p}/>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial pull-quote */}
      <section style={{ padding:'72px 24px 0' }}>
        <div style={{
          background: RM.ink, color:'#fff', borderRadius: 22, padding:'60px 64px', position:'relative', overflow:'hidden',
        }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap: 40 }}>
            <div style={{ fontFamily: RM.fontDisplay, fontSize: 200, lineHeight: .8, color: RM.red, fontWeight: 800 }}>"</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: RM.fontDisplay, fontSize: 38, fontWeight: 600, letterSpacing:'-.025em', lineHeight: 1.15, margin: 0, maxWidth: 760 }}>
                El mercado de tu abuela, con la velocidad de hoy. Pediste a las 7, llegó a las 8:23.
              </p>
              <div style={{ display:'flex', alignItems:'center', gap: 12, marginTop: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 999, background: RM.s_butter, display:'grid', placeItems:'center', fontSize: 22 }}>👩🏽</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Camila R.</div>
                  <div style={{ fontSize: 13, color:'rgba(255,255,255,.6)' }}>Cliente desde 2024 · Bogotá</div>
                </div>
                <div style={{ marginLeft: 'auto', display:'flex', alignItems:'center', gap: 8 }}>
                  <Stars value={5} size={20}/>
                  <span style={{ fontSize: 13, color:'rgba(255,255,255,.6)' }}>4.9 promedio · 28.4k reseñas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated story 2 — Limpieza */}
      <section style={{ padding:'72px 24px 0' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 24, borderBottom:`1px solid ${RM.line}`, paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: RM.red, letterSpacing:'.08em', textTransform:'uppercase' }}>03 · Hogar</div>
            <h2 style={{ fontFamily: RM.fontDisplay, fontSize: 56, fontWeight: 800, letterSpacing:'-.035em', lineHeight: .95, margin:'12px 0 0' }}>
              Limpieza & aseo
            </h2>
          </div>
          <div style={{ fontSize: 13, color: RM.ink3, maxWidth: 320, textAlign:'right' }}>
            Detergentes, papelería, cuidado personal — todo lo que tu casa necesita, en un solo pedido.
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap: 14 }}>
          {PRODUCTS.filter(p=>['cat_aseo','cat_limpieza'].includes(p.category_ids[0])).slice(0,5).map(p=>(
            <ProductCard key={p.id} p={p}/>
          ))}
        </div>
      </section>

      {/* Producer card */}
      <section style={{ padding:'72px 24px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 0, borderTop:`1px solid ${RM.ink}`, borderBottom:`1px solid ${RM.ink}`, padding:'40px 0' }}>
          <div style={{ paddingRight: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: RM.red, letterSpacing:'.08em', textTransform:'uppercase' }}>Conoce a · 04</div>
            <h3 style={{ fontFamily: RM.fontDisplay, fontSize: 64, fontWeight: 800, letterSpacing:'-.035em', lineHeight: .95, margin:'14px 0 18px' }}>
              Finca La Aurora
            </h3>
            <p style={{ fontSize: 16, color: RM.ink2, lineHeight: 1.6, margin: 0, maxWidth: 540 }}>
              Tres generaciones cultivando café en las laderas de Líbano, Tolima. Su mezcla insignia se tuesta los martes y llega a tu casa el jueves. <strong style={{ color: RM.ink }}>Precio justo, comercio directo.</strong>
            </p>
            <div style={{ display:'flex', gap: 32, marginTop: 32 }}>
              {[['1.250 m','altitud'],['12 ha','cultivo'],['Tolima','origen'],['86 pts','SCA score']].map(([n,l])=>(
                <div key={l}>
                  <div style={{ fontFamily: RM.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing:'-.02em' }}>{n}</div>
                  <div style={{ fontSize: 12, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            <div style={{ background: RM.s_sand, borderRadius: 16, display:'grid', placeItems:'center', fontSize: 100, gridRow:'span 2' }}>☕</div>
            <div style={{ background: RM.s_peach, borderRadius: 16, display:'grid', placeItems:'center', fontSize: 60 }}>🌱</div>
            <div style={{ background: RM.s_butter, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 12, color: RM.ink3, fontWeight: 700, textTransform:'uppercase', letterSpacing:'.06em' }}>Mejor venta</div>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 20, fontWeight: 700, marginTop: 6, lineHeight: 1.1 }}>Café Águila Roja · 500g</div>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 24, fontWeight: 800, color: RM.red, marginTop: 8 }}>{cop(13900)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing banner */}
      <section style={{ padding:'72px 24px' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily: RM.fontMono, fontSize: 12, color: RM.ink3, letterSpacing:'.1em', textTransform:'uppercase' }}>fin de la edición</div>
          <h2 style={{ fontFamily: RM.fontDisplay, fontSize: 120, fontWeight: 800, letterSpacing:'-.05em', lineHeight: .9, margin:'12px 0 12px', textWrap:'balance' }}>
            Llena el carrito. <span style={{ color: RM.red }}>Te llega hoy.</span>
          </h2>
          <Btn kind="primary" size="lg" style={{ marginTop: 12 }}>Empezar mi pedido →</Btn>
        </div>
      </section>

      <Footer/>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// Home v3 — "Dense & practical"
// Compact layout, sidebar with category nav, dense product strips
// ═══════════════════════════════════════════════════════════════════
function HomeV3() {
  return (
    <div style={{ background:'#F4F1EA', fontFamily: RM.fontBody, color: RM.ink }}>
      <Header/>

      {/* Quick action bar */}
      <div style={{ background:'#fff', borderBottom: `1px solid ${RM.line}`, padding:'10px 24px', display:'flex', alignItems:'center', gap: 14, fontSize: 13, fontWeight: 600 }}>
        <span style={{ color: RM.red, display:'inline-flex', gap: 6 }}>{Icon.bolt(14)} En oferta</span>
        <span>·</span>
        {['Recompra rápida','Listas guardadas','Cupones (3)','Tarjetas de regalo','Estado del pedido'].map(s=>(
          <React.Fragment key={s}>
            <span style={{ color: RM.ink2 }}>{s}</span>
            <span style={{ color: RM.ink4 }}>·</span>
          </React.Fragment>
        ))}
        <span style={{ marginLeft:'auto', color: RM.ink3 }}>Última compra hace 6 días · Pollos Bucanero, leche Alquería + 18 más</span>
        <Btn kind="ghost" size="sm">Repetir →</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap: 0 }}>
        {/* Sidebar */}
        <aside style={{ background:'#fff', borderRight:`1px solid ${RM.line}`, padding: '16px 0', position:'sticky', top: 0 }}>
          <div style={{ padding:'0 16px 12px', fontSize: 11, fontWeight: 800, color: RM.ink3, letterSpacing:'.08em', textTransform:'uppercase' }}>Categorías</div>
          {CATEGORIES.map((c,i)=>(
            <div key={c.id} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 16px',
              background: i===0 ? RM.s_pink : 'transparent',
              borderLeft: i===0 ? `3px solid ${RM.red}` : '3px solid transparent',
              fontSize: 13, fontWeight: i===0 ? 700 : 600, color: i===0 ? RM.red : RM.ink2, cursor:'pointer',
            }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{c.emoji}</span>{c.name}
              </span>
            </div>
          ))}
          <div style={{
            margin: 12, padding: 14, background: RM.s_butter, borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: RM.ink, textTransform:'uppercase', letterSpacing:'.06em' }}>Tu última lista</div>
            <div style={{ fontSize: 12, color: RM.ink2, marginTop: 4 }}>Mercado quincena · 21 productos</div>
            <Btn kind="dark" size="sm" full style={{ marginTop: 10, height: 32 }}>Agregar todo</Btn>
          </div>
        </aside>

        {/* Main */}
        <main style={{ padding: 16 }}>
          {/* Promo strip */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
            <div style={{ background: RM.red, color:'#fff', borderRadius: 12, padding: 18, display:'flex', alignItems:'center', gap: 16, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right: -10, bottom: -20, fontSize: 130, opacity:.18 }}>🛒</div>
              <div style={{ width: 60, height: 60, borderRadius: 999, background: RM.yellow, color: RM.ink, display:'grid', placeItems:'center' }}>{Icon.bolt(28)}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: RM.yellow, letterSpacing:'.08em' }}>OFERTA RELÁMPAGO · TERMINA EN 04:12:38</div>
                <div style={{ fontFamily: RM.fontDisplay, fontSize: 26, fontWeight: 800, letterSpacing:'-.025em', lineHeight: 1, marginTop: 4 }}>40% OFF en aseo y limpieza</div>
              </div>
              <Btn kind="yellow" style={{ marginLeft:'auto' }}>Ver →</Btn>
            </div>
            <div style={{ background: RM.s_mint, borderRadius: 12, padding: 16, position:'relative', overflow:'hidden' }}>
              <Pill bg={RM.green} color="#fff">{Icon.truck(11)} Envío gratis</Pill>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 17, fontWeight: 800, marginTop: 8, lineHeight: 1.1, letterSpacing:'-.02em' }}>En tu primer pedido</div>
              <div style={{ position:'absolute', right: 8, bottom: 4, fontSize: 48 }}>📦</div>
            </div>
            <div style={{ background: RM.ink, color:'#fff', borderRadius: 12, padding: 16, position:'relative', overflow:'hidden' }}>
              <Pill bg={RM.yellow} color={RM.ink}>PRO</Pill>
              <div style={{ fontFamily: RM.fontDisplay, fontSize: 17, fontWeight: 800, marginTop: 8, lineHeight: 1.1, letterSpacing:'-.02em' }}>Rodi+ por $9.900/mes</div>
              <div style={{ position:'absolute', right: 8, bottom: 4, fontSize: 48 }}>✦</div>
            </div>
          </div>

          {/* Ofertas */}
          <DenseSection title="Ofertas del día" sub="68 productos" products={PRODUCTS.filter(p=>p.list_price).slice(0,8)}/>
          <DenseSection title="Frescos del día" sub="Llegados esta mañana" products={PRODUCTS.filter(p=>p.category_ids[0]==='cat_frescos' || p.category_ids[0]==='cat_carnes').slice(0,8)} kicker="🌿 fresco"/>
          <DenseSection title="Despensa & básicos" sub="Lo que siempre se acaba" products={PRODUCTS.filter(p=>['cat_despensa','cat_lacteos'].includes(p.category_ids[0])).slice(0,8)}/>
          <DenseSection title="Aseo, limpieza & hogar" sub="Cuida tu casa" products={PRODUCTS.filter(p=>['cat_aseo','cat_limpieza','cat_mascotas'].includes(p.category_ids[0])).slice(0,8)}/>
          <DenseSection title="Electrodomésticos en oferta" sub="Hasta 35% off" products={PRODUCTS.filter(p=>p.category_ids[0]==='cat_electro').concat(PRODUCTS.filter(p=>p.category_ids[0]==='cat_snacks')).slice(0,8)}/>
        </main>
      </div>

      <Footer/>
    </div>
  );
}

function DenseSection({ title, sub, products, kicker }) {
  return (
    <section style={{ background:'#fff', borderRadius: 12, padding: 16, marginBottom: 14, border:`1px solid ${RM.line}` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            {kicker && <Pill bg={RM.s_mint} color={RM.green}>{kicker}</Pill>}
            <h3 style={{ fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.025em', margin: 0, lineHeight: 1 }}>{title}</h3>
          </div>
          <div style={{ fontSize: 12, color: RM.ink3, marginTop: 4 }}>{sub}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 6, color: RM.ink2 }}>
          <button style={{ width: 32, height: 32, borderRadius: 8, border:`1px solid ${RM.line}`, background:'#fff', cursor:'pointer', display:'grid', placeItems:'center' }}>{Icon.chev(14,'left')}</button>
          <button style={{ width: 32, height: 32, borderRadius: 8, border:`1px solid ${RM.line}`, background:'#fff', cursor:'pointer', display:'grid', placeItems:'center' }}>{Icon.chev(14,'right')}</button>
          <Btn kind="ghost" size="sm">Ver todo →</Btn>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap: 10 }}>
        {products.map(p=> <ProductCard key={p.id} p={p}/>)}
      </div>
    </section>
  );
}

Object.assign(window, { HomeV1, HomeV2, HomeV3, CategoryTile, PromoBanner, DenseSection });
