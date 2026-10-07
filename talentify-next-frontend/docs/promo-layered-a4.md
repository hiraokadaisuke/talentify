# Layered A4 visit poster

A4 output is 1240 × 1754. Feed and story drawing remain unchanged.

## Layers (back to front)

1. `public/promo-templates/layered-v1/background.png`: generated stage and crowd, no baked-in names, dates, logos or placeholder text.
2. Actual performer photo: MODNet alpha matte, cropped to visible alpha bounds, bust-oriented placement, lower fade and alpha-following warm shadow. An already transparent image skips matting. No generative alteration of the performer.
3. `foreground.png`: transparent light trails and sparks.
4. Locally hosted fonts: date (Oswald 700), performer name (Yuji Syuku), store/brand/organizer (Noto Sans JP 900). SIL OFL notices are included beside fonts. Noto and Oswald are static instances of their variable fonts; all are WOFF2 conversions.
5. `visit.png`: isolated transparent gold 来店 lettering. This is the only baked-in headline.

Organizer is always drawn as `主催：来店ナビ（RAITEN NAVI）`. No イベント wording is added to this poster.

## Background removal

`@huggingface/transformers` 3.8.1 runs in a dedicated browser worker with single-thread WASM, so no COOP/COEP or WebGPU is needed. The Apache-2.0 `Xenova/modnet` model is pinned to revision `fa2fa546052fba4c08921230a26cc69a333fca12`.

Model: https://huggingface.co/Xenova/modnet/tree/fa2fa546052fba4c08921230a26cc69a333fca12
Library: https://github.com/huggingface/transformers.js/tree/3.8.1

Only model and WASM runtime downloads use external hosts (Hugging Face and jsDelivr). Portrait pixels are processed locally, never uploaded to those hosts. Browser cache reuses downloaded model files. At most three finished cutouts are kept in tab memory. Source image longest edge is capped at 1600 pixels; source photos still determine actual print quality.

Changing photos or leaving the page aborts active work and terminates its worker. Errors display a retry action; they do not silently substitute the uncut photo. A4 failures do not block feed/story. Photo size and vertical-position controls affect A4 only and do not modify the stored performer photo.

## Visual QA

Verify with an actual full-length performer photo as well as a transparent source: head crop, alpha edges, date/name/store text, long names, organizer visibility, PNG size and download. Test remote-model failures, retry, photo changes and unmount to prevent stale previews or leaked workers/blob URLs.
