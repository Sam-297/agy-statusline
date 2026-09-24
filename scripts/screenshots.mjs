// Regenerates docs/theme_<name>.png from SAMPLE_PAYLOAD. Usage: npm run screenshots
// Renders in-process, so it never reads or writes the real user config.
import puppeteer from 'puppeteer';
import AnsiToHtml from 'ansi-to-html';
import { listThemes, resolveConfig } from '../src/core/config.js';
import { renderStatusLine } from '../src/core/renderer.js';
import { SAMPLE_PAYLOAD } from '../src/core/sample-payload.js';

const convert = new AnsiToHtml({ fg: '#ccc', bg: '#1e1e1e', newline: true, escapeXML: true });
const page = (body) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin: 0; padding: 20px; display: inline-block; background: transparent;
         font: 14px/1.5 'JetBrains Mono', 'Fira Code', 'DejaVu Sans Mono', 'Noto Color Emoji', monospace; }
  .t { background: #1e1e1e; color: #ccc; border: 1px solid #333; border-radius: 8px;
       padding: 16px 20px; white-space: pre; box-shadow: 0 10px 30px rgba(0,0,0,.5); }
</style></head><body><div class="t">${body}</div></body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const theme of listThemes()) {
    const out = await renderStatusLine(
      { ...SAMPLE_PAYLOAD, terminal_width: 160 },
      await resolveConfig({ theme }),
      { env: {} }
    );
    const tab = await browser.newPage();
    // ansi-to-html has no "dim"; map it to gray.
    await tab.setContent(page(convert.toHtml(out.replace(/\x1b\[2m/g, '\x1b[90m'))));
    const box = await (await tab.$('.t')).boundingBox();
    await tab.setViewport({
      width: Math.ceil(box.width) + 40,
      height: Math.ceil(box.height) + 40,
    });
    await tab.screenshot({ path: `docs/theme_${theme}.png`, omitBackground: true });
    await tab.close();
    console.log(`docs/theme_${theme}.png`);
  }
} finally {
  await browser.close();
}
