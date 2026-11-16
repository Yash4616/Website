"""Limit the Archivo variable font to the axis ranges the site uses.

usage: python scripts/subset-font.py <source.woff2> app/fonts/archivo-latin.woff2

The source is the Latin subset of Archivo (wght 100-900, wdth 62-125) as
Google Fonts serves it with both axes. The site sets weights 400 to 700 and
widths 100% to 122%, so the rest of the design space is dropped: 90 KB to
57 KB. Needs fonttools and brotli (pip install fonttools brotli).
Archivo is licensed under the SIL Open Font License 1.1.
"""
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

src, out = sys.argv[1], sys.argv[2]
font = TTFont(src)
before = os.path.getsize(src)
font = instancer.instantiateVariableFont(font, {"wght": (400, 700), "wdth": (100, 125)})
font.flavor = "woff2"
font.save(out)
check = TTFont(out)
print("axes:", [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in check["fvar"].axes])
print("glyphs:", check["maxp"].numGlyphs)
cmap = check.getBestCmap()
print("codepoints:", len(cmap), "max:", hex(max(cmap)))
print(f"size: {before} -> {os.path.getsize(out)} bytes")
