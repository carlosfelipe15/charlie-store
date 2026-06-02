// shared.jsx — Rodi Mercado shared components
// Logo, Header, MegaMenu, Footer, ProductCard, Placeholder image, Button, Pill, etc.

// ── Logo ──────────────────────────────────────────────────────────────────
function RMLogo({ size = 22, color = RM.red, mark = '#FFF', text = RM.ink }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap: size*0.36, color: text }}>
      <div style={{
        width: size*1.4, height: size*1.4, borderRadius: 999, background: color,
        display:'grid', placeItems:'center', color: mark, fontFamily: RM.fontDisplay,
        fontWeight: 800, fontSize: size*0.85, lineHeight: 1, letterSpacing:'-0.02em',
      }}>r</div>
      <span style={{
        fontFamily: RM.fontDisplay, fontWeight: 800, fontSize: size,
        letterSpacing:'-0.03em',
      }}>Rodi<span style={{ color: RM.red }}>.</span>Mercado</span>
    </div>
  );
}

// ── Placeholder product image ─────────────────────────────────────────────
// 2-color block + emoji-glyph + monospace label slot. Drop-in for real photos.
function PImg({ vis, size = 200, radius = 12, label = true, padded = false }) {
  if (!vis) vis = { bg:'#EFE6D2', fg:'#3D3733', label:'producto', emoji:'📦' };
  return (
    <div style={{
      width:'100%', aspectRatio: '1 / 1', position:'relative', overflow:'hidden',
      borderRadius: radius, background: vis.bg, color: vis.fg,
      backgroundImage: `repeating-linear-gradient(45deg, transparent 0 14px, ${vis.fg}0F 14px 15px)`,
    }}>
      <div style={{
        position:'absolute', inset: padded ? '12%' : '8%',
        display:'grid', placeItems:'center',
      }}>
        <div style={{ fontSize: size*0.42, lineHeight:1, filter:'saturate(.85)' }}>{vis.emoji}</div>
      </div>
      {label && (
        <div style={{
          position:'absolute', left:8, bottom:8, padding:'3px 8px',
          background:'rgba(255,255,255,.78)', color: vis.fg, fontFamily: RM.fontMono,
          fontSize: 10, letterSpacing:'.06em', borderRadius: 6, fontWeight: 600,
          textTransform:'uppercase',
        }}>{vis.label}</div>
      )}
    </div>
  );
}

// ── Buttons & Pills ───────────────────────────────────────────────────────
function Btn({ children, kind='primary', size='md', style={}, full=false, ...rest }) {
  const sz = { sm:{h:32,px:14,fs:13}, md:{h:42,px:18,fs:14}, lg:{h:52,px:24,fs:15} }[size];
  const kinds = {
    primary: { background: RM.red, color:'#fff', border:'none' },
    dark:    { background: RM.ink, color:'#fff', border:'none' },
    yellow:  { background: RM.yellow, color: RM.ink, border:'none' },
    ghost:   { background:'transparent', color: RM.ink, border:`1px solid ${RM.line}` },
    outline: { background:'#fff', color: RM.ink, border:`1.5px solid ${RM.ink}` },
    soft:    { background: RM.line2, color: RM.ink, border:'none' },
  }[kind];
  return (
    <button {...rest} style={{
      height: sz.h, padding:`0 ${sz.px}px`, fontSize: sz.fs, fontWeight: 700,
      borderRadius: 10, fontFamily: RM.fontBody, cursor:'pointer',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
      width: full ? '100%' : undefined,
      ...kinds, ...style,
    }}>{children}</button>
  );
}

function Pill({ children, color = RM.ink, bg = RM.line2, style = {} }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px',
      borderRadius: 999, background: bg, color, fontSize: 11, fontWeight: 700,
      letterSpacing:'.02em', textTransform:'uppercase', ...style,
    }}>{children}</span>
  );
}

function Badge({ kind = 'sale', children, style = {} }) {
  const m = {
    sale:   { bg: RM.red,    color:'#fff', label:'-25%' },
    new:    { bg: RM.ink,    color:'#fff', label:'NUEVO' },
    fresco: { bg: RM.green,  color:'#fff', label:'FRESCO' },
    org:    { bg: '#fff', color: RM.green, label:'ORGÁNICO', border: `1px solid ${RM.green}` },
    bolt:   { bg: RM.yellow, color: RM.ink, label:'OFERTA' },
  }[kind];
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'3px 8px',
      borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing:'.04em',
      background: m.bg, color: m.color, border: m.border || 'none', ...style,
    }}>{children || m.label}</span>
  );
}

// ── Stars ──────────────────────────────────────────────────────────────────
function Stars({ value = 4.5, size = 13, color = RM.yellowDeep }) {
  const filled = Math.round(value);
  return (
    <span style={{ display:'inline-flex', gap:1, color }}>
      {[0,1,2,3,4].map(i => (
        <span key={i} style={{ opacity: i<filled?1:.3 }}>{Icon.star(size, true)}</span>
      ))}
    </span>
  );
}

// ── Header (mega-menu enabled) ────────────────────────────────────────────
function TopBar() {
  return (
    <div style={{
      background: RM.ink, color:'#fff', fontSize: 12, fontFamily: RM.fontBody,
      padding:'6px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
      letterSpacing:'.01em',
    }}>
      <div style={{ display:'flex', gap: 20, alignItems:'center', opacity:.9 }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6, color: RM.yellow }}>
          {Icon.truck(14)} <strong style={{ color:'#fff', fontWeight:700 }}>Envío gratis</strong>
          <span style={{ opacity:.7 }}>en pedidos sobre $80.000</span>
        </span>
        <span style={{ opacity:.7 }}>·</span>
        <span style={{ opacity:.85 }}>Entrega en 90 min en Bogotá, Medellín y Cali</span>
      </div>
      <div style={{ display:'flex', gap: 20, opacity:.85 }}>
        <span>Vender en Rodi</span>
        <span>Ayuda</span>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>🇨🇴 Colombia · COP</span>
      </div>
    </div>
  );
}

function Header({ activeCat = null, scrolled = false, megaOpen = false }) {
  return (
    <header style={{ borderBottom: `1px solid ${RM.line}`, background:'#fff', position:'relative', zIndex: 3 }}>
      <TopBar/>
      {/* Main bar: logo + search + actions */}
      <div style={{
        display:'flex', alignItems:'center', gap: 24, padding:'18px 24px',
      }}>
        <RMLogo size={22} />
        {/* Address picker */}
        <div style={{
          display:'flex', alignItems:'center', gap:8, paddingLeft: 12, marginLeft: 4,
          borderLeft: `1px solid ${RM.line}`, color: RM.ink2, fontSize: 13,
        }}>
          <span style={{ color: RM.red }}>{Icon.pin(16)}</span>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 10, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em' }}>Entregar en</div>
            <div style={{ fontWeight: 700, color: RM.ink }}>Cra 7 #45-12, Chapinero</div>
          </div>
          {Icon.chev(14)}
        </div>
        {/* Search */}
        <div style={{
          flex: 1, display:'flex', alignItems:'center', height: 48,
          border: `1.5px solid ${RM.ink}`, borderRadius: 12, paddingLeft: 16, paddingRight: 4,
          background:'#fff',
        }}>
          <span style={{ color: RM.ink3 }}>{Icon.search(18)}</span>
          <input
            defaultValue=""
            placeholder="Busca arroz, leche, papel higiénico…"
            style={{
              flex: 1, border:'none', outline:'none', padding:'0 12px',
              fontFamily: RM.fontBody, fontSize: 14, background:'transparent', color: RM.ink,
            }}
          />
          <Btn kind="dark" size="md" style={{ height: 38, borderRadius: 8 }}>Buscar</Btn>
        </div>
        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          <HeaderAction icon={Icon.user(20)} label="Cuenta" sub="Ingresar" />
          <HeaderAction icon={Icon.heart(20)} label="Favoritos" sub="12" />
          <HeaderAction icon={Icon.cart(20)} label="Carrito" sub="$48.700" badge="4" highlight />
        </div>
      </div>
      {/* Nav strip with mega-menu trigger */}
      <div style={{
        display:'flex', alignItems:'center', gap: 24, padding:'0 24px 14px',
        fontSize: 14, fontWeight: 600, color: RM.ink2,
      }}>
        <button style={{
          display:'inline-flex', alignItems:'center', gap: 8, padding:'10px 16px',
          background: RM.red, color:'#fff', border:'none', borderRadius: 10,
          fontFamily: RM.fontBody, fontWeight: 700, fontSize: 14, cursor:'pointer',
        }}>{Icon.menu(18)} Todas las categorías {Icon.chev(14)}</button>
        {['Ofertas del día','Frescos','Despensa','Aseo','Limpieza','Electrodomésticos','Mascotas','Marcas propias'].map((s,i)=>(
          <span key={i} style={{
            cursor:'pointer',
            color: i===0 ? RM.red : (s.toLowerCase()===activeCat ? RM.ink : RM.ink2),
            display:'inline-flex', alignItems:'center', gap: 4,
          }}>
            {i===0 && <span style={{ color: RM.red }}>{Icon.bolt(14)}</span>}
            {s}
          </span>
        ))}
      </div>
      {megaOpen && <MegaMenu/>}
    </header>
  );
}

function HeaderAction({ icon, label, sub, badge, highlight }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 10, padding:'8px 12px',
      borderRadius: 10, cursor:'pointer',
      background: highlight ? RM.line2 : 'transparent',
      position:'relative',
    }}>
      <div style={{ color: highlight ? RM.red : RM.ink, position:'relative' }}>
        {icon}
        {badge && (
          <div style={{
            position:'absolute', top:-6, right:-8, minWidth:18, height:18, padding:'0 5px',
            borderRadius:999, background: RM.red, color:'#fff', fontSize: 10, fontWeight:800,
            display:'grid', placeItems:'center', lineHeight:1,
          }}>{badge}</div>
        )}
      </div>
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontSize: 10, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: RM.ink }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Mega menu (opens under the "Todas las categorías" button) ─────────────
function MegaMenu() {
  return (
    <div style={{
      position:'absolute', top:'100%', left: 24, right: 24, marginTop: -4,
      background:'#fff', border:`1px solid ${RM.line}`, borderRadius: 14,
      boxShadow:'0 24px 60px rgba(26,23,20,.16)',
      display:'grid', gridTemplateColumns:'240px 1fr 280px', zIndex: 30,
    }}>
      {/* Left: categories rail */}
      <div style={{ padding: 12, borderRight:`1px solid ${RM.line2}` }}>
        {CATEGORIES.slice(0,10).map((c,i)=>(
          <div key={c.id} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            color: i===2 ? RM.red : RM.ink, background: i===2 ? RM.line2 : 'transparent',
          }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>{c.name}
            </span>
            {Icon.chev(12,'right')}
          </div>
        ))}
      </div>
      {/* Middle: subcategories grid */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{
          fontFamily: RM.fontDisplay, fontSize: 18, fontWeight: 700, letterSpacing:'-.02em',
          marginBottom: 14, color: RM.ink,
        }}>Lácteos y huevos</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px 24px' }}>
          {['Leche entera','Leche deslactosada','Leche en polvo','Yogur griego','Yogur líquido','Kumis','Queso doble crema','Queso campesino','Queso parmesano','Mantequilla','Margarina','Huevos AA','Huevos rojos','Bebida de almendra','Bebida de avena','Crema de leche','Arequipe','Postres'].map((s,i)=>(
            <div key={i} style={{ fontSize: 13, color: RM.ink2, padding:'4px 0', cursor:'pointer' }}>{s}</div>
          ))}
        </div>
        <div style={{ marginTop: 18, display:'flex', alignItems:'center', gap: 10, fontSize:13, color: RM.red, fontWeight:700 }}>
          Ver toda la categoría {Icon.chev(12,'right')}
        </div>
      </div>
      {/* Right: featured promo */}
      <div style={{ padding: 16 }}>
        <div style={{
          background: RM.s_butter, borderRadius: 12, padding: 18,
          display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100%',
        }}>
          <div>
            <Badge kind="bolt">2x1</Badge>
            <div style={{
              fontFamily: RM.fontDisplay, fontSize: 22, fontWeight: 800, letterSpacing:'-.025em',
              lineHeight: 1.05, marginTop: 10, color: RM.ink,
            }}>Lácteos<br/>Alquería</div>
            <div style={{ fontSize: 12, color: RM.ink2, marginTop: 6 }}>Aplica en leche entera y deslactosada</div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop: 14 }}>
            <Btn size="sm" kind="dark">Ver oferta</Btn>
            <div style={{ fontSize: 48 }}>🥛</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Card (foto grande + nombre + precio, minimal) ─────────────────
function ProductCard({ p, size = 'md', showQty = false, layout='default' }) {
  const price = p.variants[0].prices[0].amount / 100;
  const list  = p.list_price ? p.list_price / 100 : null;
  const off   = list ? Math.round((1 - price/list) * 100) : 0;
  return (
    <div style={{
      background:'#fff', borderRadius: 14, border:`1px solid ${RM.line}`,
      padding: size==='lg' ? 16 : 12, display:'flex', flexDirection:'column', gap: 10,
      cursor:'pointer', position:'relative', transition:'box-shadow .15s',
    }}>
      {off > 0 && (
        <div style={{ position:'absolute', top: 14, left: 14, zIndex: 1 }}>
          <Badge kind="sale">−{off}%</Badge>
        </div>
      )}
      <button style={{
        position:'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 999,
        border:'none', background:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,.06)',
        color: RM.ink3, display:'grid', placeItems:'center', cursor:'pointer', zIndex:1,
      }}>{Icon.heart(16)}</button>
      <PImg vis={p.thumbnail} />
      <div style={{ display:'flex', flexDirection:'column', gap: 4 }}>
        <div style={{ fontSize: 11, color: RM.ink3, textTransform:'uppercase', letterSpacing:'.06em', fontWeight:700 }}>
          {p.brand}
        </div>
        <div style={{
          fontSize: size==='lg'?16:14, fontWeight: 600, lineHeight: 1.25, color: RM.ink,
          textWrap:'balance', minHeight: '2.5em',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>{p.title}</div>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
        <div style={{
          fontFamily: RM.fontDisplay, fontSize: size==='lg'?22:19, fontWeight: 800,
          letterSpacing:'-.02em', color: RM.ink,
        }}>{cop(price)}</div>
        {list && <div style={{ fontSize: 12, color: RM.ink4, textDecoration:'line-through' }}>{cop(list)}</div>}
      </div>
      {showQty ? (
        <QtyAdder/>
      ) : (
        <Btn kind="dark" size="sm" full style={{ height: 38 }}>
          {Icon.plus(14)} Agregar
        </Btn>
      )}
    </div>
  );
}

function QtyAdder({ qty = 2 }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      height: 38, background: RM.red, color:'#fff', borderRadius: 10, padding:'0 6px',
    }}>
      <button style={{ width:32, height:32, borderRadius:8, border:'none', background:'rgba(255,255,255,.2)', color:'#fff', display:'grid', placeItems:'center', cursor:'pointer' }}>{Icon.minus(14)}</button>
      <span style={{ fontWeight:800, fontSize:14 }}>{qty}</span>
      <button style={{ width:32, height:32, borderRadius:8, border:'none', background:'rgba(255,255,255,.2)', color:'#fff', display:'grid', placeItems:'center', cursor:'pointer' }}>{Icon.plus(14)}</button>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────
function SectionHead({ kicker, title, action='Ver todo' }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 18 }}>
      <div>
        {kicker && <div style={{ fontSize: 12, fontWeight: 800, color: RM.red, textTransform:'uppercase', letterSpacing:'.08em', marginBottom: 4 }}>{kicker}</div>}
        <h2 style={{
          fontFamily: RM.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing:'-.03em',
          color: RM.ink, margin: 0, lineHeight: 1.05,
        }}>{title}</h2>
      </div>
      {action && (
        <div style={{ display:'inline-flex', alignItems:'center', gap: 6, fontSize: 13, fontWeight: 700, color: RM.ink, cursor:'pointer' }}>
          {action} {Icon.chev(12,'right')}
        </div>
      )}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: RM.ink, color:'#FFF', padding:'48px 24px 24px', fontFamily: RM.fontBody }}>
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1.2fr', gap: 32, paddingBottom: 32, borderBottom:'1px solid rgba(255,255,255,.12)' }}>
        <div>
          <RMLogo size={20} mark={RM.ink} text="#fff"/>
          <p style={{ fontSize: 13, color:'rgba(255,255,255,.65)', lineHeight:1.5, marginTop: 14, maxWidth: 280 }}>
            Mercado online de Latinoamérica. Frescos, despensa, hogar y más. Entregamos en menos de 90 minutos.
          </p>
          <div style={{ display:'flex', gap: 8, marginTop: 16, flexWrap:'wrap' }}>
            {/* Visa */}
            <div style={{ width: 44, height: 28, background:'#fff', borderRadius: 5, display:'grid', placeItems:'center', boxShadow:'0 1px 2px rgba(0,0,0,.25)' }}>
              <span style={{ fontFamily:'Georgia, serif', fontStyle:'italic', fontWeight:800, fontSize: 13, color:'#1A1F71', letterSpacing:'-.02em' }}>VISA</span>
            </div>
            {/* Mastercard */}
            <div style={{ width: 44, height: 28, background:'#fff', borderRadius: 5, display:'grid', placeItems:'center', boxShadow:'0 1px 2px rgba(0,0,0,.25)' }}>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{ width: 15, height: 15, borderRadius:'50%', background:'#EB001B' }}/>
                <div style={{ width: 15, height: 15, borderRadius:'50%', background:'#F79E1B', marginLeft: -6, mixBlendMode:'multiply' }}/>
              </div>
            </div>
            {/* Discover */}
            <div style={{ width: 44, height: 28, background:'#fff', borderRadius: 5, display:'flex', alignItems:'center', justifyContent:'center', gap: 3, boxShadow:'0 1px 2px rgba(0,0,0,.25)' }}>
              <span style={{ fontFamily: RM.fontDisplay, fontWeight:800, fontSize: 8.5, color:'#1A1A1A', letterSpacing:'-.01em' }}>DISC</span>
              <div style={{ width: 7, height: 7, borderRadius:'50%', background:'#F76B1C' }}/>
              <span style={{ fontFamily: RM.fontDisplay, fontWeight:800, fontSize: 8.5, color:'#1A1A1A', letterSpacing:'-.01em' }}>VER</span>
            </div>
          </div>
        </div>
        {[
          { t:'Comprar', items:['Todas las categorías','Ofertas del día','Marcas propias','Recetas','Nuevos productos'] },
          { t:'Mi cuenta', items:['Ingresar','Crear cuenta','Mis pedidos','Direcciones','Favoritos'] },
          { t:'Ayuda', items:['Centro de ayuda','Devoluciones','Estado del pedido','Métodos de pago','Contáctanos'] },
          { t:'Rodi Mercado', items:['Sobre nosotros','Trabaja con nosotros','Vender en Rodi','Sostenibilidad','Prensa'] },
        ].map((col,i)=>(
          <div key={i}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14, color:'#fff' }}>{col.t}</div>
            {col.items.map(it=>(
              <div key={it} style={{ fontSize: 13, color:'rgba(255,255,255,.65)', padding:'5px 0', cursor:'pointer' }}>{it}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop: 20, fontSize: 12, color:'rgba(255,255,255,.45)' }}>
        <div>© 2026 Rodi Mercado · NIT 900.123.456-7</div>
        <div style={{ display:'flex', gap: 18 }}>
          <span>Términos</span><span>Privacidad</span><span>Cookies</span>
          <span style={{ color: RM.yellow, fontWeight: 700 }}>🇨🇴 Colombia · COP</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  RMLogo, PImg, Btn, Pill, Badge, Stars,
  Header, MegaMenu, ProductCard, QtyAdder, SectionHead, Footer,
});
