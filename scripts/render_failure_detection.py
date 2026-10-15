"""Render the website figures from plotted values extracted from the manuscript PDF.

Dependencies: matplotlib, numpy. Run from any directory.
The JSON records source provenance. The original mean and one-SD envelopes are
preserved; individual rollout traces are intentionally omitted for readability.
"""
from pathlib import Path
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
font_path = Path("/System/Library/Fonts/Palatino.ttc")
if font_path.exists():
    font_manager.fontManager.addfont(str(font_path))
    family = font_manager.FontProperties(fname=str(font_path)).get_name()
else:
    family = "DejaVu Serif"
plt.rcParams.update({"font.family": family, "font.size": 13, "svg.fonttype": "path", "svg.hashsalt": "eqc-failure-detection", "axes.unicode_minus": False})
paper, ink, muted = "#f8f7f3", "#202b2d", "#68716f"
def render(stem, signal, xmax, ymax, xticks):
    data = json.loads((ROOT / f"scripts/data/{stem}.json").read_text())
    fig, ax = plt.subplots(figsize=(8, 4.7), facecolor=paper)
    fig.subplots_adjust(left=.095, right=.965, bottom=.16, top=.86)
    ax.set_facecolor(paper)
    for name, color in [("successful", "#2d865b"), ("failed", "#d74e3b")]:
        values = data["series"][name]
        x = np.array(values.get("inference_steps", data.get("inference_steps")))
        assert len(x) == len(values["mean"]) == len(values["lower_sd"]) == len(values["upper_sd"])
        ax.fill_between(x, values["lower_sd"], values["upper_sd"], color=color, alpha=.105, linewidth=0, zorder=2)
        ax.plot(x, values["mean"], color=color, linewidth=2.7, solid_capstyle="round", solid_joinstyle="round", zorder=3)
        ax.scatter([x[-1]], [values["mean"][-1]], s=38, color=color, edgecolors=paper, linewidths=1.2, zorder=4)
    ax.set_xlim(-xmax*.0125, xmax*1.0125)
    ax.set_ylim(0,ymax)
    ax.set_xticks(xticks)
    yticks = np.linspace(0, ymax, 6 if ymax == .5 else 5)
    ax.set_yticks(yticks)
    ax.set_yticklabels([f"{v:.1f}" if ymax == .5 else f"{v:.2f}" for v in yticks])
    ax.tick_params(axis="both", which="both", length=0, labelcolor=muted, pad=9, labelsize=13)
    ax.set_axisbelow(True)
    ax.grid(axis="y", color="#dfe4db", linewidth=.7)
    for side in ["top","right","left"]:
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color("#bfc9bf")
    ax.spines["bottom"].set_linewidth(.8)
    ax.set_xlabel("Inference step", color=muted, fontsize=14, labelpad=13)
    fig.text(.095,.94,signal, color=ink, fontsize=15, va="center")
    fig.savefig(ROOT / f"assets/figures/{stem}.svg", metadata={"Date":None,"Description":"Block stacking: mean signals and one-standard-deviation bands from 25 successful and 25 failed rollouts. Values preserved from the original manuscript figure."})

    svg_path = ROOT / f"assets/figures/{stem}.svg"
    svg_path.write_text("\n".join(line.rstrip() for line in svg_path.read_text().splitlines()) + "\n")
    plt.close(fig)

render("failure-detection", "Energy-consistency signal", 32, .5, [0,8,16,24,32])
render("failure-detection-diffdagger", "Loss expectation", 45, .2, [0,10,20,30,40,45])
