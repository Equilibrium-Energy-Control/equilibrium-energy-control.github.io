# EqC research website

Project website for **EqC: Equilibrium Energy Control for Introspective Lifelong Robot Learning**.

This repository is kept **private during author review**. GitHub Pages is not enabled. Cloning, editing, or pushing changes does not publish a website. The intended public address, after an explicit release, is https://equilibrium-energy-control.github.io/ .

## Preview on your computer

Install Node.js if it is not already available, clone this repository using your authorized GitHub account, and open a terminal in the repository folder:

```sh
npm run dev
```

No dependency installation or build step is required. Open **http://127.0.0.1:8767/** in your browser. Saving `index.html`, `styles.css`, or `app.js` automatically refreshes this local preview. After replacing an image or video, refresh the browser manually. Stop the server with **Ctrl+C**. The preview is bound to your own computer; the address does not give other people access to it.

## Where to edit

| File | Contents |
| --- | --- |
| `index.html` | Text, authors, affiliations, sections, resource links, and citation |
| `styles.css` | Typography, colors, layouts, and responsive styles |
| `app.js` | Task tabs, result data, learning curves, synchronized event jumps, and video dialog |
| `assets/eqc-paper.pdf` | Paper compiled from the supplied source |
| `assets/video/` | Selected footage and the two complete films as HLS playlists and segments |
| `assets/posters/` | Video poster frames |
| `assets/figures/` | Figures from the paper |

Keep the complete folders for `assets/video/explainer/` and `assets/video/demo/`; their `.m3u8` playlists refer to the accompanying `.ts` segments. Use the preview server rather than opening `index.html` as a `file://` URL so streaming playback works correctly.

## Collaborating

Organization members need repository access; contributors should have the **Write** role. Each author previews a local checkout. Changes are shared by pushing and pulling commits, not by editing the same live browser session. Short branches and pull requests are recommended for concurrent edits.

Before proposing changes, run:

```sh
npm run check
```

The checks verify JavaScript syntax, local references, anchors, key videos, and complete HLS playlists. Also inspect your changed section in the browser, including a narrow viewport if the layout changed.

## Public release, when all authors are ready

1. Review the website and confirm the content is ready for public release.
2. In repository **Settings → General → Danger Zone**, change repository visibility to **Public**.
3. In **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)**, and save.
4. Verify the resulting website and its videos. The `.nojekyll` file makes this a plain static deployment.

No deployment workflow is included or enabled during private review. The `private` field in `package.json` only prevents accidental npm package publication; GitHub repository settings control repository visibility.

## Content provenance and scientific scope

The paper, authors, affiliations, and experimental results are taken from the supplied `ICLR_2027__Equilibrium_Energy_Control (1).zip`. The manuscript was compiled without editing its source. All paper links point to the author-provided arXiv version at https://arxiv.org/abs/2610.18790v1 . Its title and author list were verified against the arXiv page. The bundled PDF remains available in the repository. No conference acceptance is assumed.

- Benchmark success: G0.5 versus G0.5 + EqC, 20 trials per task. Sweeping: 65 → 100%; flower insertion: 45 → 80%; towel folding: 80 → 95%. The displayed rollouts are illustrative EqC examples, not baseline comparisons.
- Lifelong learning: three independent runs, 20 trials per checkpoint per run. Final EqC means: 96.7% for blocks and 98.3% for garment folding. Curves show means; the paper contains variability details.
- Astra: a separate proof of concept, using the same 18 seed demonstrations plus six agent recoveries, with 20/20 subsequent autonomous evaluations. Full automation is qualified by initialization and expert preparation.
- Cross-task adaptation: the sequential study initialized from Block Stacking Run 1, Round 5. Both tasks reach 100% in the reported Round 2 evaluation; this is not a three-run aggregate.

The source paper's code link was not publicly accessible when the website was prepared, so no working Code button is claimed. Add one once the repository is available.

## Media

All robot footage comes from the supplied project media. Robot execution and energy charts are encoded into one synchronized frame for each recovery video. Block recovery is 3× speed. Garment recovery is 6× speed, with the last chart frame held briefly to match the robot footage. The full explainer and demo are segmented into HLS without a new lossy encode; English captions accompany the explainer.

The website uses native HLS where supported, with bundled hls.js 1.6.13 elsewhere. Its Apache-2.0 license is included at `assets/vendor/hls.LICENSE`. Other manuscript and media rights remain with their respective authors; no blanket license is assigned to them here.
