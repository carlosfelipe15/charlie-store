// data.jsx — Medusa-shaped mock data (Region, ProductCategory, Product, Variant, Cart, Order)
// Field names mirror Medusa's so swapping in the real SDK is straightforward.

const REGION = {
  id: 'reg_co',
  name: 'Colombia',
  currency_code: 'cop',
  countries: [{ iso_2: 'co', display_name: 'Colombia' }],
  tax_rate: 19,
};

// ProductCategory[]  — top-level + handles match Medusa's /[handle] routing
const CATEGORIES = [
  { id:'cat_frescos',    handle:'frescos',          name:'Frutas y verduras', surface:'mint',  emoji:'🥬', desc:'Cosechado esta semana' },
  { id:'cat_despensa',   handle:'despensa',         name:'Despensa',          surface:'butter',emoji:'🍝', desc:'Pasta, granos, aceites' },
  { id:'cat_lacteos',    handle:'lacteos-huevos',   name:'Lácteos y huevos',  surface:'sky',   emoji:'🥛', desc:'Leche, quesos, yogurt' },
  { id:'cat_carnes',     handle:'carnes',           name:'Carnes y pescados', surface:'pink',  emoji:'🥩', desc:'Frescos del día' },
  { id:'cat_panaderia',  handle:'panaderia',        name:'Panadería',         surface:'peach', emoji:'🥖', desc:'Hornado en casa' },
  { id:'cat_bebidas',    handle:'bebidas',          name:'Bebidas',           surface:'sky',   emoji:'🥤', desc:'Refrescos, jugos, agua' },
  { id:'cat_snacks',     handle:'snacks-dulces',    name:'Snacks y dulces',   surface:'butter',emoji:'🍫', desc:'Antojos para todos' },
  { id:'cat_congelados', handle:'congelados',       name:'Congelados',        surface:'sky',   emoji:'🧊', desc:'Listos en minutos' },
  { id:'cat_aseo',       handle:'aseo-personal',    name:'Aseo personal',     surface:'lilac', emoji:'🧴', desc:'Cuidado e higiene' },
  { id:'cat_limpieza',   handle:'limpieza',         name:'Limpieza del hogar',surface:'mint',  emoji:'🧽', desc:'Hogar impecable' },
  { id:'cat_mascotas',   handle:'mascotas',         name:'Mascotas',          surface:'peach', emoji:'🐶', desc:'Para tu compañero' },
  { id:'cat_bebe',       handle:'bebe',             name:'Bebé',              surface:'pink',  emoji:'🍼', desc:'Pañales, fórmula, papillas' },
  { id:'cat_electro',    handle:'electrodomesticos',name:'Electrodomésticos', surface:'sand',  emoji:'🔌', desc:'Para tu cocina y hogar' },
  { id:'cat_farmacia',   handle:'farmacia',         name:'Farmacia',          surface:'mint',  emoji:'💊', desc:'Cuidado y bienestar' },
];

// Mega-menu structure: parent → children (subcategories)
const MEGAMENU = {
  cat_frescos:    ['Frutas tropicales','Verduras y hortalizas','Orgánicos','Hierbas y especias','Listos para comer'],
  cat_despensa:   ['Pasta y arroz','Granos y legumbres','Aceites y vinagres','Salsas y condimentos','Enlatados','Harinas','Café y té'],
  cat_lacteos:    ['Leche','Yogur','Quesos','Mantequilla','Huevos','Bebidas vegetales'],
  cat_carnes:     ['Res','Cerdo','Pollo','Pescados','Mariscos','Embutidos'],
  cat_bebidas:    ['Aguas','Gaseosas','Jugos','Cervezas','Vinos','Energizantes'],
  cat_aseo:       ['Cuidado del cabello','Cuidado bucal','Cuidado corporal','Afeitado','Higiene femenina','Desodorantes'],
  cat_limpieza:   ['Lavandería','Cocina','Baño','Pisos','Lavavajillas','Papelería'],
  cat_electro:    ['Cocina','Línea blanca','Cuidado personal','Cocción','Pequeños'],
};

// Color-swatch utility for placeholder product images
function swatch(name, bg, fg) {
  return { name, bg, fg };
}

// Product[]  — minimal Medusa shape: handle, title, thumbnail, variants[0].prices[]
const P = (id, handle, title, brand, price, list, cat, vis, badges = []) => ({
  id, handle, title, brand, category_ids:[cat],
  thumbnail: vis,
  badges,
  variants: [{ id:`var_${id}`, title:'Default', prices:[{ amount: price*100, currency_code:'cop' }] }],
  list_price: list ? list*100 : null,
  rating: 4 + (id.length % 5)*0.1, reviews: 12 + (id.length*7)%400,
});

// Visual placeholders use 2-color blocks — drop-in for real product photos later.
const v = (bg, fg, label, emoji) => ({ bg, fg, label, emoji });

const PRODUCTS = [
  P('p01','platanos-maduros',     'Plátanos maduros',                  'Frutimer',   4900,  5900, 'cat_frescos',  v('#FFE7A8','#7A5B00','x kg','🍌'), ['fresco']),
  P('p02','aguacate-hass',        'Aguacate Hass premium',             'Verde Vivo', 7800,  null, 'cat_frescos',  v('#E2EBC4','#3A4D14','un.','🥑'), ['fresco','orgánico']),
  P('p03','tomate-chonto',        'Tomate chonto',                     'Cosecha',    3200,  3900, 'cat_frescos',  v('#FCBFB6','#6E1A0F','x kg','🍅'), ['fresco']),
  P('p04','arroz-diana-5kg',      'Arroz blanco premium · 5 kg',       'Diana',     22900, 27900, 'cat_despensa', v('#F4ECCD','#6A5210','5 kg','🍚'), ['oferta']),
  P('p05','pasta-doria-500',      'Pasta espagueti · 500 g',           'Doria',      4200,  null, 'cat_despensa', v('#FFD8A8','#7A3A00','500 g','🍝'), []),
  P('p06','aceite-girasol-1l',    'Aceite de girasol · 1 L',           'Gourmet',   12900, 14900, 'cat_despensa', v('#FFE066','#5F4A00','1 L','🫙'),  ['oferta']),
  P('p07','leche-alqueria-1l',    'Leche entera · 1 L',                'Alquería',   4800,  null, 'cat_lacteos',  v('#EAF1FF','#234683','1 L','🥛'), []),
  P('p08','queso-campesino',      'Queso campesino · 500 g',           'Colanta',   14500, 16900, 'cat_lacteos',  v('#FFF4D0','#6F5400','500 g','🧀'), ['oferta']),
  P('p09','huevos-aa-30',         'Huevos AA · panal x 30',            'Kikes',     17900,  null, 'cat_lacteos',  v('#F2DCBB','#5E3A0E','30 un','🥚'), []),
  P('p10','pechuga-pollo',        'Pechuga de pollo · x kg',           'Pollos Bucanero', 16900, 19900, 'cat_carnes', v('#F8D6BE','#6A2E0E','x kg','🍗'), ['fresco']),
  P('p11','carne-molida',         'Carne molida de res · 500 g',       'Friogan',   18900,  null, 'cat_carnes',   v('#E8B5A8','#5A1605','500 g','🥩'), ['fresco']),
  P('p12','pan-tajado',           'Pan tajado integral',               'Bimbo',      6900,  7900, 'cat_panaderia',v('#F0DDB2','#5A3D0A','450 g','🍞'), []),
  P('p13','coca-cola-2l',         'Coca-Cola · 2 L',                   'Coca-Cola',  6200,  null, 'cat_bebidas',  v('#E63946','#FFF','2 L','🥤'),    []),
  P('p14','agua-cristal-6',       'Agua Cristal · 6 x 600 ml',         'Cristal',    9900, 11900, 'cat_bebidas',  v('#CFE7FF','#103F73','6 un','💧'), ['oferta']),
  P('p15','papas-margarita',      'Papas Margarita pollo · 105 g',     'Margarita',  4500,  null, 'cat_snacks',   v('#FFC233','#5A3F00','105 g','🥔'), []),
  P('p16','chocolatina-jet',      'Chocolatina Jet · pack x 6',        'Jet',        6800,  null, 'cat_snacks',   v('#5B3A1F','#FFE8B6','6 un','🍫'), []),
  P('p17','helado-crem',          'Helado de vainilla · 1 L',          'Crem Helado',13900,15900, 'cat_congelados',v('#FFF0DA','#5A3A00','1 L','🍨'), ['oferta']),
  P('p18','shampoo-pantene',      'Shampoo reparación · 750 ml',       'Pantene',   24900, 28900, 'cat_aseo',     v('#E6DAFF','#2D1B66','750 ml','🧴'), ['oferta']),
  P('p19','crema-dental',         'Crema dental Total · 75 ml',        'Colgate',    7900,  null, 'cat_aseo',     v('#EAF1FF','#234683','75 ml','🪥'), []),
  P('p20','jabon-dove',           'Jabón humectante · 4 un',           'Dove',      14900, 16900, 'cat_aseo',     v('#FFE3E1','#7A1B22','4 un','🧼'), []),
  P('p21','detergente-fab',       'Detergente líquido · 3 L',          'Fab',       28900, 33900, 'cat_limpieza', v('#D8F1DD','#0F4A26','3 L','🧴'),   ['oferta']),
  P('p22','suavizante',           'Suavizante floral · 1.8 L',         'Suavitel',  18900,  null, 'cat_limpieza', v('#E6DAFF','#2D1B66','1.8 L','🌸'), []),
  P('p23','servilletas',          'Servilletas · 400 un',              'Familia',    9900,  null, 'cat_limpieza', v('#F2EDE6','#3D3733','400 un','🧻'), []),
  P('p24','panales-huggies-g',    'Pañales Huggies G · 80 un',         'Huggies',   58900, 64900, 'cat_bebe',     v('#FFD8B8','#5A2E00','80 un','🍼'), ['oferta']),
  P('p25','formula-bebe',         'Fórmula etapa 1 · 800 g',           'Nan',       82900,  null, 'cat_bebe',     v('#FFE3E1','#7A1B22','800 g','🍼'), []),
  P('p26','concentrado-perro',    'Concentrado perro adulto · 4 kg',   'Dog Chow',  54900, 62900, 'cat_mascotas', v('#FFD8B8','#5A2E00','4 kg','🐶'),  ['oferta']),
  P('p27','arena-gato',           'Arena sanitaria · 5 kg',            'Tidy Cats', 32900,  null, 'cat_mascotas', v('#F2EDE6','#3D3733','5 kg','🐱'),  []),
  P('p28','licuadora-oster',      'Licuadora Oster Pro · 600 W',       'Oster',    189900,229900,'cat_electro',  v('#EAF1FF','#234683','600 W','⚙️'), ['oferta']),
  P('p29','airfryer-philips',     'Air Fryer XL · 6 L',                'Philips',  549900,629900,'cat_electro',  v('#1A1714','#FFC233','6 L','🍟'),   ['oferta']),
  P('p30','olla-arrocera',        'Olla arrocera · 1.8 L',             'Imusa',     89900,  null, 'cat_electro',  v('#EFE6D2','#3D3733','1.8 L','🍚'), []),
  P('p31','acetaminofen',         'Acetaminofén · 500 mg x 20',        'MK',         8900,  null, 'cat_farmacia', v('#D8F1DD','#0F4A26','20 un','💊'),  []),
  P('p32','cafe-aguila-roja',     'Café Águila Roja · 500 g',          'Águila Roja',13900,15900,'cat_despensa', v('#5A3A0E','#FFE066','500 g','☕'), ['oferta']),
];

// Variants for the deep-dive PDP product (p29 — Air Fryer)
const PDP_PRODUCT = {
  ...PRODUCTS.find(p=>p.id==='p29'),
  description: 'Cocina con hasta un 90% menos de grasa gracias a la tecnología Rapid Air. La canasta XL de 6 L alcanza para 5 porciones. Sistema antiadherente, panel digital con 7 programas preestablecidos y temporizador hasta 60 min.',
  gallery: [
    v('#1A1714','#FFC233','vista 1','🍟'),
    v('#FFC233','#5A3F00','vista 2','📐'),
    v('#FFE066','#5F4A00','vista 3','⚙️'),
    v('#FFD8B8','#5A2E00','vista 4','📦'),
  ],
  options: [
    { title:'Color',     values:['Negro','Plateado','Crema'] },
    { title:'Capacidad', values:['4 L','6 L','8 L'] },
  ],
  highlights: [
    '7 programas: papas fritas, pollo, pescado, hornear, recalentar, asar, deshidratar',
    'Canasta XL de 6 L — hasta 5 porciones',
    'Tecnología Rapid Air — 90% menos grasa',
    'Panel digital con temporizador hasta 60 min',
    'Garantía oficial Philips · 2 años',
  ],
  reviews_summary: { avg: 4.7, count: 312, dist: [82, 14, 3, 1, 0] },
};

Object.assign(window, { REGION, CATEGORIES, MEGAMENU, PRODUCTS, PDP_PRODUCT, v });
