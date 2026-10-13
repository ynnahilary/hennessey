# Hennessey Digital

Webinar slides and marketing assets.

## Webinars

- `webinars/2026-11-05/` — *AI and the Agency of the Future* with Dan Hinckley (Herringbone) and Rob Coleman, Thursday, November 5, 12:00 PM EST.
  - `november_webinar_slide.pptx` — editable slide
  - `november_webinar_slide.png` — preview
  - `build_slide.py` — regenerates the slide from `source/` (`python3 build_slide.py source .`, needs `python-pptx` and `Pillow`)
  - `november_webinar_deck.pptx` / `.pdf` — full 14-slide webinar deck in the style of the earlier Hennessey speaker deck (cinematic title, navy backgrounds, half-bleed art panels, light cards)
  - `build_assets.py` — generates the backgrounds, art panels, glowing speaker portraits and transparent logo (`python3 build_assets.py source <assets dir>`)
  - `build_deck.js` — builds the deck from those assets with pptxgenjs (`node build_deck.js <assets dir> <output dir>`)
