"""Site self-check: run `python check.py` before deploying."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).parent
SITE = "https://filrouge.example/"


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.ids, self.schema, self.in_schema = [], set(), [], False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        self.refs += [attrs[k] for k in ("href", "src") if k in attrs and tag != "link"]
        self.in_schema = tag == "script" and attrs.get("type") == "application/ld+json"

    def handle_data(self, data):
        if self.in_schema:
            self.schema.append(data)
            self.in_schema = False


pages = {}
for path in ROOT.glob("*.html"):
    page = Page()
    page.feed(path.read_text(encoding="utf-8"))
    pages[path.name] = page

errors = []
for name, page in pages.items():
    text = (ROOT / name).read_text(encoding="utf-8")
    for tag in ("<title>", 'name="description"', 'rel="canonical"', 'name="robots"', "<h1"):
        if tag not in text:
            errors.append(f"{name}: missing {tag}")
    if re.search(r"€|Lyon|\+33|service\.html", text):
        errors.append(f"{name}: old identity left")
    if len(page.schema) != 1:
        errors.append(f"{name}: expected one schema block")
    else:
        json.loads(page.schema[0])
    for ref in page.refs:
        if re.match(r"(https?:|tel:|mailto:)", ref):
            continue
        file, _, anchor = ref.partition("#")
        target = file or name
        if not (ROOT / target).exists():
            errors.append(f"{name}: broken link {ref}")
        elif anchor and target in pages and anchor not in pages[target].ids:
            errors.append(f"{name}: missing anchor {ref}")

for url in re.findall(r"<loc>(.*?)</loc>", (ROOT / "sitemap.xml").read_text(encoding="utf-8")):
    file = url.removeprefix(SITE) or "index.html"
    if file not in pages:
        errors.append(f"sitemap: missing page {url}")

print("\n".join(errors) or f"OK: {len(pages)} pages")
raise SystemExit(bool(errors))
