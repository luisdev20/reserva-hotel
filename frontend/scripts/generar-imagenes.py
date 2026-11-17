#!/usr/bin/env python3
"""Genera las ilustraciones SVG locales del catálogo y la página de historia.

Se ejecuta una sola vez; las imágenes resultantes se guardan en public/assets/img.
No requiere dependencias externas.
"""

from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / "public" / "assets" / "img"
SUITES = BASE / "suites"
HISTORIA = BASE / "historia"
SUITES.mkdir(parents=True, exist_ok=True)
HISTORIA.mkdir(parents=True, exist_ok=True)

PALETAS = {
    "cordillera": {
        "wall": "#e9dfcc", "wall2": "#d8c8ae", "floor": "#9b7652", "floor2": "#7d5b3d",
        "sky": "#b8cbd5", "sky2": "#e4e9e8", "mountain": "#61756f", "mountain2": "#8fa09a",
        "accent": "#3e4f3c", "accent2": "#2d3a2c", "bed": "#f2eadb", "duvet": "#d9c7a7",
        "pillow": "#fbf7ef", "gold": "#c9a66b", "wood": "#6b4b32", "sun": "#f6e2b7",
    },
    "andina": {
        "wall": "#e8d4c4", "wall2": "#d8b9a6", "floor": "#9a6a4b", "floor2": "#7d5138",
        "sky": "#d9bda9", "sky2": "#f3e2d3", "mountain": "#7d5548", "mountain2": "#a67967",
        "accent": "#8a4b3c", "accent2": "#64352b", "bed": "#f6eade", "duvet": "#e1c4ae",
        "pillow": "#fff8f2", "gold": "#c08457", "wood": "#6a422c", "sun": "#f8d6ae",
    },
    "cumbre": {
        "wall": "#dde2e4", "wall2": "#c8d1d6", "floor": "#8a6a52", "floor2": "#6f513e",
        "sky": "#9fb7c3", "sky2": "#e0e9ec", "mountain": "#4c5c68", "mountain2": "#798a94",
        "accent": "#2f4050", "accent2": "#1f2d39", "bed": "#eef2f3", "duvet": "#c7d3d8",
        "pillow": "#ffffff", "gold": "#c9a66b", "wood": "#5e4535", "sun": "#f2e6c9",
    },
    "spa": {
        "wall": "#dfe4d8", "wall2": "#cbd4c2", "floor": "#9a8b72", "floor2": "#7d7059",
        "sky": "#c6d3c9", "sky2": "#eef2ea", "mountain": "#6f7d6a", "mountain2": "#9cac96",
        "accent": "#5f705c", "accent2": "#465544", "bed": "#f3f4ec", "duvet": "#dde3d5",
        "pillow": "#ffffff", "gold": "#b7a27b", "wood": "#6d5c45", "sun": "#f4ecd7",
    },
    "cena": {
        "wall": "#e5d4c3", "wall2": "#d2bba7", "floor": "#8d6247", "floor2": "#6e4a35",
        "sky": "#c9a58e", "sky2": "#f1dcc9", "mountain": "#6c4a44", "mountain2": "#956d64",
        "accent": "#6e2a2e", "accent2": "#4d1d20", "bed": "#f4e8da", "duvet": "#dbc2ab",
        "pillow": "#fff9f2", "gold": "#c9a66b", "wood": "#5a3b2a", "sun": "#f6d9b4",
    },
    "generica": {
        "wall": "#e9e4d9", "wall2": "#d6cec0", "floor": "#95765a", "floor2": "#745941",
        "sky": "#bdcdd4", "sky2": "#e9edec", "mountain": "#697a74", "mountain2": "#96a5a0",
        "accent": "#4b5563", "accent2": "#36404a", "bed": "#f4efe5", "duvet": "#dcd1bd",
        "pillow": "#fffdf8", "gold": "#c9a66b", "wood": "#654b36", "sun": "#f5e3bd",
    },
}

DEFS = """
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{wall}"/><stop offset="1" stop-color="{wall2}"/>
  </linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{floor}"/><stop offset="1" stop-color="{floor2}"/>
  </linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{sky}"/><stop offset="1" stop-color="{sky2}"/>
  </linearGradient>
  <linearGradient id="bed" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="{bed}"/><stop offset="1" stop-color="{duvet}"/>
  </linearGradient>
  <radialGradient id="vin" cx="50%" cy="45%" r="72%">
    <stop offset="55%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity=".28"/>
  </radialGradient>
  <filter id="grano" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".14"/></feComponentTransfer>
  </filter>
  <filter id="suave"><feGaussianBlur stdDeviation="16"/></filter>
</defs>
"""


def montanas(x, y, w, h, p, detalle=True):
    """Silueta de cordillera dentro de una ventana."""
    base = y + h
    return f"""
<g clip-path="url(#ventana)">
  <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#sky)"/>
  <circle cx="{x + w * .72:.0f}" cy="{y + h * .24:.0f}" r="{h * .075:.0f}" fill="{p['sun']}" opacity=".9"/>
  <path d="M{x},{base} L{x + w * .18:.0f},{y + h * .48:.0f} L{x + w * .34:.0f},{y + h * .70:.0f} L{x + w * .50:.0f},{y + h * .38:.0f} L{x + w * .70:.0f},{base} Z"
        fill="{p['mountain']}" opacity=".92"/>
  <path d="M{x + w * .32:.0f},{base} L{x + w * .52:.0f},{y + h * .55:.0f} L{x + w * .68:.0f},{y + h * .72:.0f} L{x + w * .82:.0f},{y + h * .50:.0f} L{x + w},{base} Z"
        fill="{p['mountain2']}" opacity=".9"/>
  <path d="M{x + w * .08:.0f},{y + h * .78:.0f} Q{x + w * .30:.0f},{y + h * .68:.0f} {x + w * .52:.0f},{y + h * .80:.0f} T{x + w * .94:.0f},{y + h * .74:.0f}"
        fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="6"/>
  {f'<path d="M{x + w * .12:.0f},{y + h * .86:.0f} q14,-36 28,0 q14,-46 28,0 q14,-32 28,0" fill="none" stroke="#2d3a2c" stroke-opacity=".35" stroke-width="4"/>' if detalle else ''}
</g>"""


def ventana(x, y, w, h, p, cortinas=True):
    return f"""
<g>
  <rect x="{x - 10}" y="{y - 10}" width="{w + 20}" height="{h + 20}" rx="6" fill="#2c2a26"/>
  <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#sky)"/>
  <clipPath id="ventana"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath>
  {montanas(x, y, w, h, p)}
  <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="#2c2a26" stroke-width="12"/>
  <line x1="{x + w / 2:.0f}" y1="{y}" x2="{x + w / 2:.0f}" y2="{y + h}" stroke="#2c2a26" stroke-width="9"/>
  <line x1="{x}" y1="{y + h / 2:.0f}" x2="{x + w}" y2="{y + h / 2:.0f}" stroke="#2c2a26" stroke-width="9"/>
  {f'<path d="M{x - 18},{y - 6} q34,{h * .34} 6,{h + 12} l-34,0 l0,-{h + 18} Z" fill="{p["accent"]}" opacity=".82"/><path d="M{x + w + 18},{y - 6} q-34,{h * .34} -6,{h + 12} l34,0 l0,-{h + 18} Z" fill="{p["accent"]}" opacity=".82"/>' if cortinas else ''}
</g>"""


def cama(x, y, w, p):
    hb = w
    matt = w + 30
    mx = x - 15
    return f"""
<g>
  <ellipse cx="{x + w / 2:.0f}" cy="{y + 330:.0f}" rx="{w * .56:.0f}" ry="34" fill="#2b2118" opacity=".18"/>
  <rect x="{x}" y="{y}" width="{hb}" height="200" rx="22" fill="{p['accent']}"/>
  <rect x="{x + 14}" y="{y + 14}" width="{hb - 28}" height="172" rx="16" fill="{p['accent2']}" opacity=".55"/>
  <rect x="{mx}" y="{y + 150}" width="{matt}" height="170" rx="20" fill="url(#bed)"/>
  <rect x="{mx + 10}" y="{y + 205}" width="{matt - 20}" height="105" rx="16" fill="{p['duvet']}"/>
  <rect x="{x + 28}" y="{y + 162}" width="{w * .34:.0f}" height="62" rx="16" fill="{p['pillow']}"/>
  <rect x="{x + w * .42:.0f}" y="{y + 166}" width="{w * .30:.0f}" height="54" rx="14" fill="{p['pillow']}"/>
  <rect x="{mx + 8}" y="{y + 244}" width="{matt - 16}" height="44" rx="10" fill="{p['accent']}" opacity=".78"/>
  <rect x="{x + 18}" y="{y + 316}" width="16" height="28" rx="4" fill="{p['wood']}"/>
  <rect x="{x + w - 34}" y="{y + 316}" width="16" height="28" rx="4" fill="{p['wood']}"/>
</g>"""


def mesa_luz(x, y, p):
    return f"""
<g>
  <rect x="{x}" y="{y}" width="118" height="14" rx="7" fill="{p['wood']}"/>
  <rect x="{x + 12}" y="{y + 14}" width="10" height="82" fill="{p['wood']}"/>
  <rect x="{x + 96}" y="{y + 14}" width="10" height="82" fill="{p['wood']}"/>
  <path d="M{x + 36},{y - 52} l46,0 l12,42 l-70,0 Z" fill="{p['gold']}"/>
  <line x1="{x + 59}" y1="{y - 52}" x2="{x + 59}" y2="{y - 74}" stroke="{p['wood']}" stroke-width="5"/>
  <ellipse cx="{x + 59}" cy="{y - 10}" rx="70" ry="44" fill="{p['sun']}" opacity=".16" filter="url(#suave)"/>
  <rect x="{x + 30}" y="{y - 10}" width="24" height="10" rx="3" fill="{p['accent']}"/>
</g>"""


def planta(x, y, escala, p):
    return f"""
<g transform="translate({x} {y}) scale({escala})">
  <ellipse cx="0" cy="78" rx="62" ry="14" fill="#2b2118" opacity=".18"/>
  <path d="M-48,78 L-38,-2 L38,-2 L48,78 Z" fill="{p['gold']}" opacity=".9"/>
  <path d="M-42,2 L42,2" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>
  <g fill="none" stroke="{p['accent']}" stroke-width="7" stroke-linecap="round">
    <path d="M0,0 C-8,-48 -50,-62 -72,-84"/>
    <path d="M0,0 C6,-54 40,-72 62,-96"/>
    <path d="M0,-8 C-30,-94 -10,-120 8,-142"/>
    <path d="M0,-4 C34,-88 62,-100 86,-112"/>
    <path d="M0,-6 C-56,-72 -82,-70 -104,-58"/>
  </g>
  <g fill="{p['accent']}" opacity=".9">
    <ellipse cx="-72" cy="-86" rx="30" ry="14" transform="rotate(-28 -72 -86)"/>
    <ellipse cx="64" cy="-98" rx="30" ry="14" transform="rotate(24 64 -98)"/>
    <ellipse cx="10" cy="-144" rx="15" ry="30"/>
    <ellipse cx="88" cy="-114" rx="28" ry="13" transform="rotate(18 88 -114)"/>
    <ellipse cx="-106" cy="-58" rx="28" ry="13" transform="rotate(-8 -106 -58)"/>
  </g>
</g>"""


def sillon(x, y, p):
    return f"""
<g>
  <ellipse cx="{x + 100}" cy="{y + 170}" rx="105" ry="24" fill="#2b2118" opacity=".2"/>
  <path d="M{x},{y + 40} q0,-40 40,-40 l120,0 q40,0 40,40 l0,94 l-200,0 Z" fill="{p['accent']}"/>
  <path d="M{x + 12},{y + 60} q0,-28 28,-28 l120,0 q28,0 28,28 l0,66 l-176,0 Z" fill="{p['accent2']}" opacity=".55"/>
  <rect x="{x - 8}" y="{y + 130}" width="216" height="44" rx="18" fill="{p['accent']}"/>
  <rect x="{x + 8}" y="{y + 166}" width="14" height="28" rx="4" fill="{p['wood']}"/>
  <rect x="{x + 178}" y="{y + 166}" width="14" height="28" rx="4" fill="{p['wood']}"/>
  <rect x="{x + 22}" y="{y + 20}" width="52" height="44" rx="12" fill="{p['pillow']}" opacity=".85"/>
</g>"""


def terraza(p, variante):
    """Tercera imagen de cada suite: terraza con vista a la cordillera."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Terraza con vista a los Andes">
<defs>
  <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{p['sky']}"/><stop offset="1" stop-color="{p['sky2']}"/></linearGradient>
  <linearGradient id="piso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{p['floor']}"/><stop offset="1" stop-color="{p['floor2']}"/></linearGradient>
  <radialGradient id="vin" cx="50%" cy="45%" r="72%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".28"/></radialGradient>
  <filter id="grano"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".14"/></feComponentTransfer></filter>
  <filter id="suave"><feGaussianBlur stdDeviation="18"/></filter>
</defs>
<rect width="1200" height="800" fill="url(#cielo)"/>
<circle cx="930" cy="150" r="58" fill="{p['sun']}" opacity=".95"/>
<path d="M0,520 L160,300 L300,430 L470,220 L640,470 L790,300 L980,500 L1200,350 L1200,800 L0,800 Z" fill="{p['mountain2']}" opacity=".65"/>
<path d="M0,590 L210,420 L360,540 L560,350 L760,560 L960,420 L1200,560 L1200,800 L0,800 Z" fill="{p['mountain']}" opacity=".9"/>
<path d="M0,650 Q300,610 600,650 T1200,640 L1200,800 L0,800 Z" fill="#f4efe3" opacity=".55"/>
<rect y="610" width="1200" height="190" fill="url(#piso)"/>
<g stroke="#4f3828" stroke-width="4" opacity=".35">
  <line x1="0" y1="650" x2="1200" y2="650"/><line x1="0" y1="700" x2="1200" y2="700"/><line x1="0" y1="750" x2="1200" y2="750"/>
</g>
<g>
  <rect x="0" y="560" width="1200" height="16" fill="{p['wood']}"/>
  <rect x="0" y="530" width="1200" height="10" fill="{p['wood']}" opacity=".7"/>
  <g stroke="{p['wood']}" stroke-width="12">
    <line x1="80" y1="540" x2="80" y2="640"/><line x1="260" y1="540" x2="260" y2="640"/>
    <line x1="440" y1="540" x2="440" y2="640"/><line x1="620" y1="540" x2="620" y2="640"/>
    <line x1="800" y1="540" x2="800" y2="640"/><line x1="980" y1="540" x2="980" y2="640"/>
    <line x1="1160" y1="540" x2="1160" y2="640"/>
  </g>
</g>
<g>
  <rect x="120" y="600" width="270" height="34" rx="16" fill="{p['bed']}"/>
  <rect x="120" y="634" width="270" height="72" rx="20" fill="{p['duvet']}"/>
  <rect x="140" y="640" width="18" height="60" rx="6" fill="{p['wood']}"/>
  <rect x="352" y="640" width="18" height="60" rx="6" fill="{p['wood']}"/>
  <rect x="214" y="592" width="86" height="28" rx="12" fill="{p['pillow']}"/>
  <rect x="360" y="650" width="22" height="60" rx="4" fill="{p['wood']}"/>
</g>
<g>
  <rect x="760" y="600" width="270" height="34" rx="16" fill="{p['bed']}"/>
  <rect x="760" y="634" width="270" height="72" rx="20" fill="{p['duvet']}"/>
  <rect x="780" y="640" width="18" height="60" rx="6" fill="{p['wood']}"/>
  <rect x="992" y="640" width="18" height="60" rx="6" fill="{p['wood']}"/>
  <rect x="854" y="592" width="86" height="28" rx="12" fill="{p['pillow']}"/>
  <rect x="1000" y="650" width="22" height="60" rx="4" fill="{p['wood']}"/>
</g>
<g>
  <ellipse cx="600" cy="704" rx="62" ry="16" fill="#2b2118" opacity=".22"/>
  <rect x="566" y="640" width="68" height="10" rx="5" fill="{p['wood']}"/>
  <rect x="592" y="650" width="16" height="58" fill="{p['wood']}"/>
  <path d="M576,616 l48,0 l8,24 l-64,0 Z" fill="{p['gold']}"/>
  <line x1="600" y1="616" x2="600" y2="600" stroke="{p['wood']}" stroke-width="4"/>
  <ellipse cx="600" cy="590" rx="34" ry="22" fill="{p['sun']}" opacity=".25" filter="url(#suave)"/>
</g>
<g fill="none" stroke="{p['accent']}" stroke-width="5" opacity=".8">
  <path d="M980,560 l0,-70 q0,-34 28,-34 q28,0 28,34 l0,70"/>
  <path d="M1035,560 l0,-50 q0,-26 20,-26 q20,0 20,26 l0,50"/>
</g>
<rect width="1200" height="800" filter="url(#grano)" opacity=".55"/>
<rect width="1200" height="800" fill="url(#vin)"/>
</svg>"""


def suite_habitacion(p, variante):
    """Habitación con ventana a la izquierda o derecha según la variante."""
    if variante == 1:
        ventana_svg = ventana(92, 118, 420, 344, p)
        cama_svg = cama(628, 318, 462, p)
        mesa_svg = mesa_luz(548, 552, p)
        planta_svg = planta(102, 512, .82, p)
        sillon_svg = sillon(190, 468, p)
        detalle = f"""
<g>
  <rect x="119" y="646" width="330" height="12" rx="6" fill="{p['wood']}" opacity=".65"/>
  <path d="M146,612 q30,-18 60,0" stroke="{p['gold']}" stroke-width="3" fill="none"/>
</g>"""
    else:
        ventana_svg = ventana(688, 118, 420, 344, p)
        cama_svg = cama(112, 318, 462, p)
        mesa_svg = mesa_luz(548, 552, p)
        planta_svg = planta(1030, 512, .82, p)
        sillon_svg = sillon(790, 468, p)
        detalle = f"""
<g>
  <rect x="703" y="646" width="330" height="12" rx="6" fill="{p['wood']}" opacity=".65"/>
  <path d="M744,612 q30,-18 60,0" stroke="{p['gold']}" stroke-width="3" fill="none"/>
</g>"""

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Interior de suite con vista a los Andes">
{DEFS.format(**p)}
<rect width="1200" height="800" fill="url(#wall)"/>
<rect y="596" width="1200" height="204" fill="url(#floor)"/>
<g stroke="{p['wood']}" stroke-width="3" opacity=".26">
  <line x1="0" y1="640" x2="1200" y2="640"/><line x1="0" y1="690" x2="1200" y2="690"/><line x1="0" y1="740" x2="1200" y2="740"/>
</g>
<rect x="0" y="580" width="1200" height="18" fill="{p['wood']}" opacity=".5"/>
{ventana_svg}
{detalle}
<ellipse cx="720" cy="662" rx="360" ry="52" fill="{p['accent']}" opacity=".13"/>
{sillon_svg}
{cama_svg}
{mesa_svg}
{planta_svg}
<rect width="1200" height="800" filter="url(#grano)" opacity=".55"/>
<rect width="1200" height="800" fill="url(#vin)"/>
</svg>"""


def spa_svg(p, variante):
    if variante == 1:
        escena = f"""
<rect y="520" width="1200" height="280" fill="url(#floor)"/>
<rect x="0" y="500" width="1200" height="26" fill="{p['wood']}" opacity=".55"/>
<g>
  <rect x="170" y="250" width="540" height="290" rx="26" fill="{p['accent']}" opacity=".25"/>
  <rect x="190" y="270" width="500" height="250" rx="20" fill="{p['sky']}" opacity=".75"/>
  <path d="M190,430 Q320,400 450,430 T690,430 L690,520 L190,520 Z" fill="{p['accent']}" opacity=".55"/>
  <g fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="5">
    <path d="M250,420 q30,-30 60,0 q30,30 60,0"/><path d="M430,390 q30,-30 60,0 q30,30 60,0"/>
    <path d="M330,340 q26,-26 52,0"/><path d="M510,330 q26,-26 52,0"/>
  </g>
  <g fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="4">
    <path d="M300,290 q-20,-80 20,-140"/><path d="M420,280 q20,-90 -10,-150"/><path d="M540,290 q-16,-80 26,-136"/>
  </g>
</g>
<g>
  <rect x="800" y="430" width="250" height="18" rx="9" fill="{p['wood']}"/>
  <rect x="820" y="448" width="16" height="90" fill="{p['wood']}"/>
  <rect x="1014" y="448" width="16" height="90" fill="{p['wood']}"/>
  <rect x="826" y="404" width="60" height="26" rx="8" fill="{p['pillow']}"/>
  <rect x="900" y="396" width="90" height="34" rx="10" fill="{p['duvet']}"/>
  <path d="M960,404 q0,-58 40,-58 q40,0 40,58" fill="none" stroke="{p['accent']}" stroke-width="6"/>
  <ellipse cx="925" cy="382" rx="60" ry="40" fill="{p['sun']}" opacity=".2" filter="url(#suave)"/>
</g>
<g>
  <rect x="120" y="600" width="110" height="16" rx="8" fill="{p['wood']}"/>
  <rect x="140" y="616" width="10" height="64" fill="{p['wood']}"/>
  <rect x="200" y="616" width="10" height="64" fill="{p['wood']}"/>
  <path d="M132,570 l60,0 l10,30 l-80,0 Z" fill="{p['gold']}"/>
  <line x1="162" y1="570" x2="162" y2="552" stroke="{p['wood']}" stroke-width="4"/>
  <ellipse cx="162" cy="540" rx="34" ry="26" fill="{p['sun']}" opacity=".28" filter="url(#suave)"/>
</g>
{planta(960, 530, .9, p)}
"""
    elif variante == 2:
        escena = f"""
<rect y="540" width="1200" height="260" fill="url(#floor)"/>
<rect x="0" y="520" width="1200" height="24" fill="{p['wood']}" opacity=".5"/>
<g>
  <rect x="290" y="300" width="620" height="230" rx="22" fill="{p['bed']}"/>
  <rect x="310" y="320" width="580" height="190" rx="16" fill="{p['duvet']}"/>
  <rect x="330" y="340" width="220" height="54" rx="16" fill="{p['pillow']}"/>
  <rect x="330" y="408" width="540" height="56" rx="16" fill="{p['accent']}" opacity=".22"/>
  <rect x="320" y="520" width="20" height="70" fill="{p['wood']}"/>
  <rect x="860" y="520" width="20" height="70" fill="{p['wood']}"/>
  <ellipse cx="600" cy="592" rx="330" ry="28" fill="#2b2118" opacity=".14"/>
</g>
<g>
  <rect x="140" y="420" width="110" height="14" rx="7" fill="{p['wood']}"/>
  <rect x="160" y="434" width="10" height="100" fill="{p['wood']}"/>
  <rect x="220" y="434" width="10" height="100" fill="{p['wood']}"/>
  <rect x="148" y="382" width="96" height="38" rx="8" fill="{p['pillow']}"/>
  <rect x="162" y="392" width="68" height="18" rx="6" fill="{p['accent']}" opacity=".3"/>
  <path d="M176,370 q20,-30 40,0" fill="none" stroke="{p['accent']}" stroke-width="4"/>
</g>
<g>
  <rect x="900" y="460" width="120" height="14" rx="7" fill="{p['wood']}"/>
  <rect x="922" y="474" width="10" height="70" fill="{p['wood']}"/>
  <rect x="990" y="474" width="10" height="70" fill="{p['wood']}"/>
  <path d="M912,430 l72,0 l10,30 l-92,0 Z" fill="{p['gold']}"/>
  <line x1="948" y1="430" x2="948" y2="414" stroke="{p['wood']}" stroke-width="4"/>
  <ellipse cx="948" cy="402" rx="36" ry="26" fill="{p['sun']}" opacity=".25" filter="url(#suave)"/>
</g>
{planta(1040, 470, .85, p)}
{planta(70, 480, .7, p)}
"""
    else:
        escena = f"""
<rect y="480" width="1200" height="320" fill="url(#floor)"/>
<g>
  <rect x="80" y="220" width="1040" height="300" rx="18" fill="{p['wood']}" opacity=".35"/>
  <rect x="130" y="300" width="940" height="40" rx="10" fill="{p['wood']}"/>
  <rect x="130" y="420" width="940" height="40" rx="10" fill="{p['wood']}"/>
  <rect x="130" y="300" width="40" height="210" fill="{p['wood']}"/>
  <rect x="1030" y="300" width="40" height="210" fill="{p['wood']}"/>
  <g stroke="{p['wood']}" stroke-width="6" opacity=".65">
    <line x1="230" y1="300" x2="230" y2="480"/><line x1="330" y1="300" x2="330" y2="480"/>
    <line x1="430" y1="300" x2="430" y2="480"/><line x1="530" y1="300" x2="530" y2="480"/>
    <line x1="630" y1="300" x2="630" y2="480"/><line x1="730" y1="300" x2="730" y2="480"/>
    <line x1="830" y1="300" x2="830" y2="480"/><line x1="930" y1="300" x2="930" y2="480"/>
  </g>
  <rect x="140" y="360" width="60" height="36" rx="8" fill="{p['pillow']}"/>
  <rect x="250" y="360" width="90" height="36" rx="8" fill="{p['duvet']}"/>
  <rect x="510" y="360" width="80" height="36" rx="8" fill="{p['pillow']}"/>
  <g>
    <path d="M870,430 l54,0 l6,42 l-66,0 Z" fill="{p['wood']}"/>
    <path d="M884,430 q0,-30 18,-30 q18,0 18,30" fill="none" stroke="{p['wood']}" stroke-width="6"/>
    <ellipse cx="897" cy="404" rx="32" ry="20" fill="{p['sun']}" opacity=".22" filter="url(#suave)"/>
  </g>
  <g fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4">
    <path d="M590,270 q-30,-60 0,-120"/><path d="M640,270 q30,-60 0,-120"/><path d="M690,270 q-30,-60 0,-120"/>
  </g>
</g>
<g>
  <rect x="120" y="600" width="960" height="26" rx="13" fill="{p['wood']}" opacity=".65"/>
  <rect x="160" y="626" width="20" height="70" fill="{p['wood']}"/>
  <rect x="1020" y="626" width="20" height="70" fill="{p['wood']}"/>
</g>
{planta(1060, 520, .9, p)}
"""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Ambiente de spa y bienestar">
{DEFS.format(**p)}
<rect width="1200" height="800" fill="url(#wall)"/>
<g opacity=".22" stroke="{p['accent']}" stroke-width="5" fill="none">
  <path d="M0,120 q120,-50 240,0 t240,0 t240,0 t240,0 t240,0"/>
  <path d="M0,180 q120,-50 240,0 t240,0 t240,0 t240,0 t240,0"/>
</g>
{escena}
<rect width="1200" height="800" filter="url(#grano)" opacity=".55"/>
<rect width="1200" height="800" fill="url(#vin)"/>
</svg>"""


def cena_svg(p, variante):
    if variante == 1:
        escena = f"""
<rect y="580" width="1200" height="220" fill="url(#floor)"/>
<g>
  <ellipse cx="600" cy="650" rx="360" ry="54" fill="#2b2118" opacity=".18"/>
  <rect x="300" y="520" width="600" height="26" rx="13" fill="{p['wood']}"/>
  <rect x="350" y="546" width="24" height="110" fill="{p['wood']}"/>
  <rect x="826" y="546" width="24" height="110" fill="{p['wood']}"/>
  <rect x="400" y="492" width="400" height="30" rx="15" fill="{p['pillow']}" opacity=".85"/>
  <path d="M520,492 q0,-50 40,-50 q40,0 40,50" fill="none" stroke="{p['gold']}" stroke-width="5"/>
  <path d="M480,470 q-30,-60 0,-120 M600,470 q0,-80 0,-140 M720,470 q30,-60 0,-120" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="4"/>
  <g>
    <path d="M470,430 l34,0 l-6,58 q-2,18 -11,18 q-9,0 -11,-18 Z" fill="{p['gold']}" opacity=".9"/>
    <path d="M470,430 q17,-18 34,0" fill="none" stroke="{p['gold']}" stroke-width="4"/>
    <line x1="487" y1="506" x2="487" y2="540" stroke="{p['gold']}" stroke-width="4"/>
  </g>
  <g>
    <path d="M690,430 l34,0 l-6,58 q-2,18 -11,18 q-9,0 -11,-18 Z" fill="{p['gold']}" opacity=".9"/>
    <path d="M690,430 q17,-18 34,0" fill="none" stroke="{p['gold']}" stroke-width="4"/>
    <line x1="707" y1="506" x2="707" y2="540" stroke="{p['gold']}" stroke-width="4"/>
  </g>
  <g>
    <rect x="575" y="456" width="50" height="12" rx="6" fill="{p['pillow']}"/>
    <path d="M590,456 l20,0 l-4,26 l-12,0 Z" fill="{p['accent']}" opacity=".8"/>
  </g>
</g>
<g>
  <rect x="100" y="600" width="220" height="30" rx="15" fill="{p['bed']}"/>
  <rect x="120" y="630" width="18" height="60" fill="{p['wood']}"/>
  <rect x="282" y="630" width="18" height="60" fill="{p['wood']}"/>
  <rect x="168" y="590" width="84" height="26" rx="12" fill="{p['pillow']}"/>
</g>
<g>
  <rect x="880" y="600" width="220" height="30" rx="15" fill="{p['bed']}"/>
  <rect x="900" y="630" width="18" height="60" fill="{p['wood']}"/>
  <rect x="1062" y="630" width="18" height="60" fill="{p['wood']}"/>
  <rect x="948" y="590" width="84" height="26" rx="12" fill="{p['pillow']}"/>
</g>
"""
    elif variante == 2:
        escena = f"""
<rect y="560" width="1200" height="240" fill="url(#floor)"/>
<g>
  <ellipse cx="600" cy="650" rx="300" ry="50" fill="#2b2118" opacity=".2"/>
  <ellipse cx="600" cy="570" rx="300" ry="96" fill="{p['pillow']}"/>
  <ellipse cx="600" cy="560" rx="230" ry="70" fill="{p['duvet']}"/>
  <ellipse cx="600" cy="550" rx="150" ry="46" fill="{p['accent']}" opacity=".2"/>
  <ellipse cx="600" cy="548" rx="92" ry="28" fill="{p['gold']}" opacity=".7"/>
  <g fill="{p['accent']}">
    <circle cx="560" cy="542" r="10"/><circle cx="590" cy="536" r="8"/><circle cx="620" cy="542" r="11"/>
    <circle cx="642" cy="536" r="7"/><circle cx="578" cy="554" r="7"/><circle cx="612" cy="556" r="9"/>
  </g>
  <path d="M520,530 q40,-22 80,0 q40,22 80,0" fill="none" stroke="{p['accent2']}" stroke-width="3" opacity=".7"/>
  <g>
    <path d="M760,470 l40,0 l-8,70 q-2,16 -12,16 q-10,0 -12,-16 Z" fill="{p['gold']}" opacity=".9"/>
    <path d="M760,470 q20,-20 40,0" fill="none" stroke="{p['gold']}" stroke-width="4"/>
    <line x1="780" y1="556" x2="780" y2="600" stroke="{p['gold']}" stroke-width="4"/>
  </g>
  <g>
    <path d="M400,500 l30,0 l-6,54 q-2,14 -9,14 q-7,0 -9,-14 Z" fill="{p['gold']}" opacity=".8"/>
    <line x1="415" y1="568" x2="415" y2="600" stroke="{p['gold']}" stroke-width="3"/>
  </g>
  <path d="M450,620 q150,40 300,0" fill="none" stroke="{p['wood']}" stroke-width="6"/>
</g>
<g opacity=".5">
  <circle cx="930" cy="420" r="46" fill="{p['sun']}" filter="url(#suave)"/>
  <path d="M902,420 q28,-28 56,0 q-28,28 -56,0" fill="{p['gold']}" opacity=".6"/>
</g>
"""
    else:
        escena = f"""
<rect y="520" width="1200" height="280" fill="url(#floor)"/>
<g>
  <rect x="120" y="580" width="300" height="24" rx="12" fill="{p['wood']}"/>
  <rect x="160" y="604" width="18" height="90" fill="{p['wood']}"/>
  <rect x="362" y="604" width="18" height="90" fill="{p['wood']}"/>
  <rect x="760" y="580" width="300" height="24" rx="12" fill="{p['wood']}"/>
  <rect x="800" y="604" width="18" height="90" fill="{p['wood']}"/>
  <rect x="1002" y="604" width="18" height="90" fill="{p['wood']}"/>
  <g>
    <rect x="210" y="540" width="120" height="40" rx="8" fill="{p['pillow']}"/>
    <rect x="240" y="530" width="60" height="12" rx="6" fill="{p['gold']}"/>
    <rect x="850" y="540" width="120" height="40" rx="8" fill="{p['pillow']}"/>
    <rect x="880" y="530" width="60" height="12" rx="6" fill="{p['gold']}"/>
  </g>
  <g>
    <line x1="270" y1="0" x2="270" y2="300" stroke="{p['wood']}" stroke-width="4"/>
    <path d="M220,300 l100,0 l-20,50 l-60,0 Z" fill="{p['gold']}"/>
    <ellipse cx="270" cy="360" rx="70" ry="40" fill="{p['sun']}" opacity=".2" filter="url(#suave)"/>
    <line x1="910" y1="0" x2="910" y2="300" stroke="{p['wood']}" stroke-width="4"/>
    <path d="M860,300 l100,0 l-20,50 l-60,0 Z" fill="{p['gold']}"/>
    <ellipse cx="910" cy="360" rx="70" ry="40" fill="{p['sun']}" opacity=".2" filter="url(#suave)"/>
  </g>
</g>
{planta(60, 520, .75, p)}
{planta(1090, 520, .75, p)}
"""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="Experiencia gastronómica andina">
{DEFS.format(**p)}
<rect width="1200" height="800" fill="url(#wall)"/>
{ventana(420, 80, 360, 300, p, False)}
{escena}
<rect width="1200" height="800" filter="url(#grano)" opacity=".55"/>
<rect width="1200" height="800" fill="url(#vin)"/>
</svg>"""


def generar_suites():
    grupos = {
        "cordillera": "cordillera",
        "andina": "andina",
        "cumbre": "cumbre",
        "spa": "spa",
        "cena": "cena",
        "generica": "generica",
    }
    for nombre, paleta in grupos.items():
        p = PALETAS[paleta]
        if nombre in ("cordillera", "andina", "cumbre", "generica"):
            svgs = [suite_habitacion(p, 1), suite_habitacion(p, 2), terraza(p, 3)]
        elif nombre == "spa":
            svgs = [spa_svg(p, 1), spa_svg(p, 2), spa_svg(p, 3)]
        else:
            svgs = [cena_svg(p, 1), cena_svg(p, 2), cena_svg(p, 3)]
        for i, svg in enumerate(svgs, start=1):
            (SUITES / f"{nombre}-{i}.svg").write_text(svg, encoding="utf-8")


HIST_DEFS = """
<defs>
  <linearGradient id="papel" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#d8c6a6"/><stop offset=".55" stop-color="#c9b391"/><stop offset="1" stop-color="#b99f7c"/>
  </linearGradient>
  <radialGradient id="vin" cx="50%" cy="45%" r="72%">
    <stop offset="55%" stop-color="#3b2b1b" stop-opacity="0"/><stop offset="100%" stop-color="#3b2b1b" stop-opacity=".45"/>
  </radialGradient>
  <filter id="grano">
    <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope=".22"/></feComponentTransfer>
  </filter>
  <filter id="suave"><feGaussianBlur stdDeviation="10"/></filter>
</defs>
"""


def historia_svg(escena, etiqueta):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="{etiqueta}">
{HIST_DEFS}
<rect width="1200" height="800" fill="url(#papel)"/>
<g opacity=".28" stroke="#5b4630" stroke-width="3" fill="none">
  <path d="M0,110 q150,-40 300,0 t300,0 t300,0 t300,0"/>
  <path d="M0,150 q150,-40 300,0 t300,0 t300,0 t300,0"/>
</g>
{escena}
<g opacity=".22" stroke="#4a3826" stroke-width="2">
  <line x1="90" y1="90" x2="250" y2="140"/><line x1="920" y1="700" x2="1100" y2="650"/>
  <line x1="180" y1="730" x2="330" y2="700"/><line x1="880" y1="120" x2="1000" y2="170"/>
</g>
<rect width="1200" height="800" filter="url(#grano)" opacity=".65"/>
<rect width="1200" height="800" fill="url(#vin)"/>
<rect x="34" y="34" width="1132" height="732" fill="none" stroke="#efe2ca" stroke-width="10" opacity=".8"/>
<rect x="52" y="52" width="1096" height="696" fill="none" stroke="#5b4630" stroke-width="2" opacity=".45"/>
</svg>"""


def historia_1():
    return f"""
<g>
  <path d="M0,560 L180,330 L330,470 L500,250 L680,470 L850,320 L1050,500 L1200,390 L1200,800 L0,800 Z" fill="#8f795d" opacity=".55"/>
  <path d="M0,620 L220,470 L390,580 L610,410 L820,600 L1030,470 L1200,580 L1200,800 L0,800 Z" fill="#6d5941" opacity=".55"/>
  <rect y="650" width="1200" height="150" fill="#9b8565" opacity=".55"/>
  <g>
    <path d="M330,650 L330,430 L600,430 L600,650 Z" fill="#c9b18d"/>
    <path d="M300,440 L465,300 L630,440 Z" fill="#7c6142"/>
    <path d="M316,438 L465,318 L614,438" fill="none" stroke="#4a3826" stroke-width="6" opacity=".55"/>
    <rect x="400" y="520" width="90" height="130" fill="#594329"/>
    <circle cx="472" cy="586" r="5" fill="#d8c6a6"/>
    <rect x="350" y="475" width="60" height="50" fill="#8e7657"/>
    <line x1="380" y1="475" x2="380" y2="525" stroke="#3d2e1e" stroke-width="3"/>
    <line x1="350" y1="500" x2="410" y2="500" stroke="#3d2e1e" stroke-width="3"/>
    <rect x="520" y="480" width="56" height="56" fill="#8e7657"/>
    <path d="M540,480 l0,56 M520,508 l56,0" stroke="#3d2e1e" stroke-width="3"/>
    <path d="M300,650 L660,650 L680,670 L280,670 Z" fill="#6b5237"/>
  </g>
  <g stroke="#4a3826" stroke-width="4" opacity=".65">
    <line x1="700" y1="650" x2="700" y2="580"/><line x1="760" y1="650" x2="760" y2="580"/><line x1="820" y1="650" x2="820" y2="580"/>
    <line x1="680" y1="600" x2="840" y2="600"/><line x1="680" y1="630" x2="840" y2="630"/>
  </g>
  <g>
    <rect x="880" y="540" width="14" height="110" fill="#4a3826"/>
    <circle cx="887" cy="500" r="52" fill="#6d5941" opacity=".85"/>
    <circle cx="860" cy="480" r="34" fill="#6d5941" opacity=".8"/>
    <circle cx="915" cy="485" r="30" fill="#6d5941" opacity=".8"/>
  </g>
  <g fill="#d8c6a6" opacity=".5">
    <ellipse cx="240" cy="700" rx="100" ry="18"/><ellipse cx="960" cy="690" rx="130" ry="16"/>
  </g>
</g>"""


def historia_2():
    return f"""
<g>
  <rect y="590" width="1200" height="210" fill="#9b8565" opacity=".5"/>
  <rect x="120" y="90" width="380" height="330" fill="#8e7657" opacity=".8"/>
  <path d="M120,90 L310,220 L500,90" fill="none" stroke="#4a3826" stroke-width="8" opacity=".5"/>
  <line x1="310" y1="90" x2="310" y2="420" stroke="#4a3826" stroke-width="6" opacity=".45"/>
  <line x1="120" y1="255" x2="500" y2="255" stroke="#4a3826" stroke-width="6" opacity=".45"/>
  <g>
    <ellipse cx="640" cy="610" rx="330" ry="58" fill="#4a3826" opacity=".22"/>
    <rect x="360" y="470" width="560" height="30" rx="15" fill="#6b5237"/>
    <rect x="410" y="500" width="24" height="130" fill="#4a3826"/>
    <rect x="846" y="500" width="24" height="130" fill="#4a3826"/>
    <g>
      <circle cx="470" cy="400" r="42" fill="#4a3826" opacity=".8"/>
      <path d="M430,450 q40,-30 80,0 l18,80 l-116,0 Z" fill="#594329"/>
      <circle cx="600" cy="380" r="46" fill="#4a3826" opacity=".85"/>
      <path d="M552,438 q48,-34 96,0 l20,92 l-136,0 Z" fill="#594329"/>
      <circle cx="740" cy="405" r="40" fill="#4a3826" opacity=".8"/>
      <path d="M702,454 q38,-28 76,0 l16,76 l-108,0 Z" fill="#594329"/>
    </g>
    <g>
      <rect x="500" y="458" width="60" height="14" rx="7" fill="#d8c6a6"/>
      <rect x="640" y="452" width="70" height="18" rx="9" fill="#d8c6a6"/>
      <path d="M520,440 q20,-30 40,0" fill="none" stroke="#d8c6a6" stroke-width="4"/>
      <path d="M665,430 l24,0 l-4,22 l-16,0 Z" fill="#d8c6a6"/>
    </g>
  </g>
  <g>
    <line x1="600" y1="0" x2="600" y2="230" stroke="#4a3826" stroke-width="5"/>
    <path d="M530,230 l140,0 l-26,60 l-88,0 Z" fill="#6b5237"/>
    <ellipse cx="600" cy="320" rx="90" ry="60" fill="#d8c6a6" opacity=".22" filter="url(#suave)"/>
  </g>
  <g opacity=".35" stroke="#4a3826" stroke-width="2">
    <path d="M720,90 q40,40 0,80 q-40,40 0,80"/><path d="M760,90 q40,40 0,80 q-40,40 0,80"/>
  </g>
</g>"""


def historia_3():
    return f"""
<g>
  <path d="M0,600 L200,420 L380,540 L560,370 L760,560 L980,420 L1200,560 L1200,800 L0,800 Z" fill="#6d5941" opacity=".5"/>
  <rect y="650" width="1200" height="150" fill="#9b8565" opacity=".52"/>
  <g>
    <path d="M160,650 L160,410 L520,410 L520,650 Z" fill="#c9b18d"/>
    <path d="M140,420 L340,300 L540,420 Z" fill="#7c6142"/>
    <rect x="250" y="500" width="70" height="150" fill="#594329"/>
    <rect x="400" y="470" width="70" height="60" fill="#8e7657"/>
  </g>
  <g>
    <path d="M540,650 L540,380 L960,380 L960,650 Z" fill="#d4bd99" opacity=".85"/>
    <path d="M520,392 L750,270 L980,392 Z" fill="#8b704d"/>
    <g stroke="#4a3826" stroke-width="5" opacity=".55">
      <line x1="580" y1="380" x2="580" y2="650"/><line x1="660" y1="380" x2="660" y2="650"/>
      <line x1="740" y1="380" x2="740" y2="650"/><line x1="820" y1="380" x2="820" y2="650"/>
      <line x1="900" y1="380" x2="900" y2="650"/><line x1="540" y1="470" x2="960" y2="470"/>
      <line x1="540" y1="560" x2="960" y2="560"/>
    </g>
    <g fill="#6b5237" opacity=".7">
      <rect x="590" y="490" width="42" height="50"/><rect x="670" y="490" width="42" height="50"/>
      <rect x="750" y="490" width="42" height="50"/><rect x="830" y="490" width="42" height="50"/>
      <rect x="590" y="580" width="42" height="50"/><rect x="670" y="580" width="42" height="50"/>
      <rect x="750" y="580" width="42" height="50"/><rect x="830" y="580" width="42" height="50"/>
    </g>
  </g>
  <g stroke="#4a3826" stroke-width="5" opacity=".7">
    <line x1="1040" y1="650" x2="1100" y2="470"/><line x1="1060" y1="650" x2="1120" y2="470"/>
    <line x1="1030" y1="560" x2="1085" y2="560"/><line x1="1038" y1="610" x2="1095" y2="610"/>
    <line x1="1045" y1="520" x2="1100" y2="520"/>
  </g>
  <g>
    <circle cx="1080" cy="440" r="26" fill="#4a3826" opacity=".8"/>
    <path d="M1055,470 q25,-18 50,0 l10,40 l-70,0 Z" fill="#594329"/>
  </g>
  <g fill="#d8c6a6" opacity=".4">
    <ellipse cx="260" cy="700" rx="120" ry="18"/><ellipse cx="800" cy="710" rx="180" ry="20"/>
  </g>
</g>"""


def historia_4():
    return f"""
<g>
  <path d="M0,610 L200,410 L380,550 L560,360 L780,570 L980,410 L1200,550 L1200,800 L0,800 Z" fill="#6d5941" opacity=".5"/>
  <rect y="650" width="1200" height="150" fill="#9b8565" opacity=".52"/>
  <g>
    <path d="M220,650 L220,300 L980,300 L980,650 Z" fill="#c9b18d"/>
    <path d="M200,310 L600,220 L1000,310 Z" fill="#7c6142"/>
    <g fill="#594329" opacity=".8">
      <rect x="270" y="350" width="80" height="70"/><rect x="390" y="350" width="80" height="70"/>
      <rect x="510" y="350" width="80" height="70"/><rect x="630" y="350" width="80" height="70"/>
      <rect x="750" y="350" width="80" height="70"/><rect x="870" y="350" width="80" height="70"/>
      <rect x="270" y="460" width="80" height="70"/><rect x="390" y="460" width="80" height="70"/>
      <rect x="510" y="460" width="80" height="70"/><rect x="630" y="460" width="80" height="70"/>
      <rect x="750" y="460" width="80" height="70"/><rect x="870" y="460" width="80" height="70"/>
    </g>
    <g fill="#e8d7b7" opacity=".8">
      <rect x="282" y="362" width="56" height="46"/><rect x="402" y="362" width="56" height="46"/>
      <rect x="522" y="362" width="56" height="46"/><rect x="642" y="362" width="56" height="46"/>
      <rect x="762" y="362" width="56" height="46"/><rect x="882" y="362" width="56" height="46"/>
      <rect x="282" y="472" width="56" height="46"/><rect x="402" y="472" width="56" height="46"/>
      <rect x="522" y="472" width="56" height="46"/><rect x="642" y="472" width="56" height="46"/>
      <rect x="762" y="472" width="56" height="46"/><rect x="882" y="472" width="56" height="46"/>
    </g>
    <path d="M500,650 L500,540 L700,540 L700,650 Z" fill="#594329"/>
    <path d="M480,545 L600,500 L720,545 Z" fill="#8b704d"/>
    <rect x="570" y="300" width="60" height="40" fill="#594329"/>
    <path d="M560,300 l40,0 l0,-26 l-40,0 Z" fill="#6b5237"/>
  </g>
  <g stroke="#4a3826" stroke-width="6" opacity=".55">
    <line x1="160" y1="650" x2="160" y2="560"/><line x1="1040" y1="650" x2="1040" y2="560"/>
    <line x1="130" y1="590" x2="190" y2="590"/><line x1="1010" y1="590" x2="1070" y2="590"/>
  </g>
  <g fill="#d8c6a6" opacity=".4">
    <ellipse cx="260" cy="704" rx="120" ry="18"/><ellipse cx="820" cy="710" rx="190" ry="20"/>
  </g>
</g>"""


def generar_historia():
    escenas = [
        ("historia-1.svg", historia_1(), "Casa fundadora en la cordillera"),
        ("historia-2.svg", historia_2(), "Primeros huéspedes en la mesa familiar"),
        ("historia-3.svg", historia_3(), "Ampliación de la posada"),
        ("historia-4.svg", historia_4(), "Hotel Andes Suites en la actualidad"),
    ]
    for archivo, escena, etiqueta in escenas:
        (HISTORIA / archivo).write_text(historia_svg(escena, etiqueta), encoding="utf-8")


if __name__ == "__main__":
    generar_suites()
    generar_historia()
    print("Imágenes generadas en", BASE)
