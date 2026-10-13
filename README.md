# Hennessey Digital

Webinar slides and marketing assets.

## Webinars

- `webinars/2026-11-05/` — *AI and the Agency of the Future* with Dan Hinckley (Herringbone) and Rob Coleman, Thursday, November 5, 12:00 PM EST.
  - `november_webinar_slide.pptx` — editable slide
  - `november_webinar_slide.png` — preview
  - `build_slide.py` — regenerates the slide from `source/` (`python3 build_slide.py source .`, needs `python-pptx` and `Pillow`)
  - `november_webinar_deck.pptx` / `.pdf` — full 14-slide webinar deck (title, speakers, agenda, four topic sections, Q&A, thank you)
  - `build_deck.js` — regenerates the deck (pptxgenjs); pass a folder with `dan.png`, `rob.png`, `logo.png` (the circle crops written by `build_slide.py`) and an output folder
