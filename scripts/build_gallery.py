from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "media-gallery"
OUT.mkdir(exist_ok=True)

W, H = 1500, 1000
BG = (6, 10, 18)
PANEL = (14, 22, 36)
PANEL_2 = (20, 32, 50)
CYAN = (51, 214, 255)
GREEN = (91, 255, 171)
AMBER = (255, 196, 87)
RED = (255, 91, 110)
TEXT = (232, 242, 255)
MUTED = (152, 169, 193)


def font(size: int, bold: bool = False):
    names = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            pass
    return ImageFont.load_default()


F_TITLE = font(70, True)
F_H1 = font(48, True)
F_H2 = font(34, True)
F_BODY = font(27)
F_SMALL = font(22)
F_TINY = font(18)


def canvas():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    for y in range(H):
        shade = int(18 + 28 * y / H)
        d.line((0, y, W, y), fill=(6, 10, shade))
    for x in range(0, W, 60):
        d.line((x, 0, x, H), fill=(10, 22, 38), width=1)
    for y in range(0, H, 60):
        d.line((0, y, W, y), fill=(10, 22, 38), width=1)
    return im


def draw_text_box(draw, xy, text, fnt, fill=TEXT, line_gap=8, max_width=1100):
    x, y = xy
    words = text.split()
    line = ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textbbox((x, y), trial, font=fnt)[2] - x <= max_width:
            line = trial
        else:
            draw.text((x, y), line, font=fnt, fill=fill)
            y += fnt.size + line_gap
            line = word
    if line:
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap
    return y


def rounded_panel(draw, box, fill=PANEL, outline=(42, 75, 107), width=2, radius=28):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def save(im, name):
    path = OUT / name
    im.save(path, optimize=True)
    return path


def fit_image(path, box):
    img = Image.open(ROOT / path).convert("RGB")
    x1, y1, x2, y2 = box
    bw, bh = x2 - x1, y2 - y1
    scale = min(bw / img.width, bh / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    layer = Image.new("RGB", (bw, bh), (8, 14, 24))
    layer.paste(img, ((bw - nw) // 2, (bh - nh) // 2))
    return layer


def screenshot_card(name, title, subtitle, screenshot, accent):
    im = canvas()
    d = ImageDraw.Draw(im)
    title_bottom = draw_text_box(d, (70, 55), title, F_H1, TEXT, line_gap=6, max_width=1300)
    subtitle_bottom = draw_text_box(d, (72, max(118, title_bottom + 4)), subtitle, F_BODY, MUTED, max_width=1180)
    panel_top = max(240, subtitle_bottom + 18)
    rounded_panel(d, (70, panel_top, 1430, 910), fill=PANEL)
    d.line((70, panel_top - 5, 1430, panel_top - 5), fill=accent, width=5)
    shot = fit_image(screenshot, (105, panel_top + 35, 1395, 875))
    im.paste(shot, (105, panel_top + 35))
    d.text((72, 938), "BLACK SWAN FORGE · adversarial city resilience simulator", font=F_SMALL, fill=MUTED)
    return save(im, name)


def title_card():
    im = canvas()
    d = ImageDraw.Draw(im)
    d.text((80, 90), "BLACK SWAN", font=F_TITLE, fill=TEXT)
    d.text((80, 168), "FORGE", font=F_TITLE, fill=CYAN)
    draw_text_box(
        d,
        (82, 285),
        "An adversarial resilience simulator that finds hidden chains where small infrastructure failures become citywide collapse — then proves the cheapest interventions before disaster strikes.",
        F_H2,
        TEXT,
        max_width=980,
    )
    rounded_panel(d, (80, 620, 460, 820), fill=PANEL_2, outline=(48, 92, 125))
    rounded_panel(d, (520, 620, 900, 820), fill=PANEL_2, outline=(48, 92, 125))
    rounded_panel(d, (960, 620, 1340, 820), fill=PANEL_2, outline=(48, 92, 125))
    d.text((115, 650), "28", font=F_TITLE, fill=CYAN)
    d.text((115, 742), "city services", font=F_BODY, fill=MUTED)
    d.text((555, 650), "46", font=F_TITLE, fill=GREEN)
    d.text((555, 742), "dependencies", font=F_BODY, fill=MUTED)
    d.text((995, 650), "1.90×", font=F_TITLE, fill=AMBER)
    d.text((995, 742), "better collapse discovery", font=F_BODY, fill=MUTED)
    d.text((82, 930), "Moonshot submission: prototype + paper + vision presentation", font=F_SMALL, fill=MUTED)
    return save(im, "01-black-swan-forge-title.png")


def architecture_card():
    im = canvas()
    d = ImageDraw.Draw(im)
    d.text((70, 55), "Architecture: from city model to intervention proof", font=F_H1, fill=TEXT)
    nodes = [
        ("City dependency model", "28 services + 46 edges", CYAN),
        ("Cascade engine", "thresholds, delays, backups", GREEN),
        ("Adversarial search", "find worst hidden chains", AMBER),
        ("Causal minimizer", "smallest collapse explanation", RED),
        ("Intervention optimizer", "replay fixes under budget", GREEN),
        ("Research evidence", "baselines + robustness + IEEE-14", CYAN),
    ]
    x_positions = [80, 525, 970, 80, 525, 970]
    y_positions = [220, 220, 220, 585, 585, 585]
    for i, (title, sub, color) in enumerate(nodes):
        x, y = x_positions[i], y_positions[i]
        rounded_panel(d, (x, y, x + 360, y + 170), fill=PANEL_2, outline=color, width=3)
        d.text((x + 25, y + 35), title, font=F_H2, fill=TEXT)
        draw_text_box(d, (x + 25, y + 92), sub, F_BODY, MUTED, max_width=300)
    arrows = [((440, 305), (525, 305)), ((885, 305), (970, 305)), ((1150, 390), (1150, 585)), ((970, 670), (885, 670)), ((525, 670), (440, 670))]
    for start, end in arrows:
        d.line((*start, *end), fill=(90, 130, 170), width=5)
        ex, ey = end
        d.polygon([(ex, ey), (ex - 18, ey - 10), (ex - 18, ey + 10)], fill=(90, 130, 170))
    d.text((80, 930), "The key claim is executable: every score, chain, and fix comes from running the simulator.", font=F_SMALL, fill=MUTED)
    return save(im, "02-system-architecture-flow.png")


def evidence_card():
    im = canvas()
    d = ImageDraw.Draw(im)
    d.text((70, 55), "Research evidence judges can verify", font=F_H1, fill=TEXT)
    metrics = [
        ("19 / 20", "evolutionary search wins", GREEN),
        ("1.90×", "mean collapse discovery vs random", AMBER),
        ("64", "uncertainty perturbation trials", CYAN),
        ("259 MW", "IEEE-14 unserved-load cascade", RED),
        ("83%", "sensitivity from dependency strength", GREEN),
        ("0", "collapse at best repair frontier", CYAN),
    ]
    for i, (big, label, color) in enumerate(metrics):
        col, row = i % 3, i // 3
        x, y = 80 + col * 455, 210 + row * 280
        rounded_panel(d, (x, y, x + 395, y + 205), fill=PANEL_2, outline=color, width=3)
        d.text((x + 28, y + 35), big, font=F_TITLE, fill=color)
        draw_text_box(d, (x + 30, y + 125), label, F_BODY, TEXT, max_width=325)
    d.text((80, 850), "This is not a static mockup: the repo includes unit tests, Playwright tests, and a repeatable study command.", font=F_BODY, fill=TEXT)
    d.text((80, 930), "Command: npm run study · npm test · npx playwright test", font=F_SMALL, fill=MUTED)
    return save(im, "05-research-results-card.png")


def video_cover_card():
    im = canvas()
    d = ImageDraw.Draw(im)
    d.text((90, 100), "90-SECOND DEMO", font=F_TITLE, fill=CYAN)
    draw_text_box(d, (92, 210), "A quiet infrastructure failure becomes a citywide cascade. SwanForge discovers the hidden chain, explains the cause, and proves the cheapest preventive fix.", F_H2, TEXT, max_width=1070)
    rounded_panel(d, (105, 500, 1395, 790), fill=(12, 18, 30), outline=CYAN, width=4)
    d.polygon([(650, 570), (650, 720), (790, 645)], fill=CYAN)
    d.text((105, 865), "Use this as the video thumbnail or first gallery image if Devpost asks for visual proof.", font=F_BODY, fill=MUTED)
    return save(im, "08-video-thumbnail.png")


def main():
    paths = [
        title_card(),
        architecture_card(),
        screenshot_card(
            "03-live-demo-screen.png",
            "Prototype: live city-collapse simulation",
            "The demo shows how failure propagates across infrastructure layers and how an intervention changes the outcome.",
            "test-results/demo-complete.png",
            CYAN,
        ),
        screenshot_card(
            "04-adversarial-search-screen.png",
            "Adversarial search: find the failures humans miss",
            "Instead of assuming normal scenarios, SwanForge searches for compact shocks that create disproportionate damage.",
            "test-results/adversarial-search.png",
            AMBER,
        ),
        evidence_card(),
        screenshot_card(
            "06-research-evidence-screen.png",
            "Evidence screen: baselines, uncertainty, and physical grid bridge",
            "The prototype compares search methods, runs robustness checks, and links abstract failures to IEEE-14 power-flow behavior.",
            "test-results/research-evidence.png",
            GREEN,
        ),
        video_cover_card(),
    ]
    for path in paths:
        print(path)


if __name__ == "__main__":
    main()
