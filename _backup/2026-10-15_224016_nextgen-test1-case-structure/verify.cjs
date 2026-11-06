const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = 'D:/L-archive/portfolio';
const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline.json'), 'utf8'));
const shots = path.join(os.tmpdir(), 'nextgen-test1-case-structure-20261015');
fs.mkdirSync(shots, { recursive: true });
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const url = 'http://127.0.0.1:8000/projects/nextgen-messaging/index-test1.html';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  const checks = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    const open = async (width) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.evaluate(() => document.fonts.ready);
    };
    await open(1440);
    const sourceFacts = await page.evaluate(() => {
      const articles = [...document.querySelectorAll('.ng-case')];
      return {
        order: articles.map((article) => [...article.querySelector('.m-sol__body').children].filter((el) => el.matches('.ng-case-stage')).map((stage) => stage.querySelector('h4').textContent.trim())),
        images: [...document.querySelectorAll('main img[src*="/project/"]')].map((img) => img.getAttribute('src')),
        servers: [...document.querySelectorAll('.ng-dev-title')].map((el) => el.childNodes[0].textContent.trim()),
        resultOpen: [...document.querySelectorAll('[data-independent]')].every((el) => el.open),
        processClosed: [...document.querySelectorAll('.ng-case-disclosures > details')].every((el) => !el.open),
        text: document.querySelector('main').textContent,
        ids: [...document.querySelectorAll('[id]')].map((el) => el.id),
      };
    });
    assert.deepEqual(sourceFacts.order, Array(3).fill(['문제', '해결', '결과']));
    assert.deepEqual(sourceFacts.images, report.projectImages);
    assert.equal(sourceFacts.servers.length, 8);
    assert(sourceFacts.servers.includes('OAuth 2.0 Server'));
    assert(sourceFacts.servers.includes('Admin Server'));
    assert(sourceFacts.resultOpen && sourceFacts.processClosed);
    assert.equal(new Set(sourceFacts.ids).size, sourceFacts.ids.length);
    for (const fact of ['82대', '30%', '21%', '2024년 2월부터 2025년 5월', '3,406.1', '4,201.2', '8,380.0', '69.63', '36.4%', '27.6%', '471 MB', 'self-hosted runner 1대', 'rollback workflow', 'readiness', 'liveness', '30건']) {
      assert(sourceFacts.text.includes(fact), `Missing fact: ${fact}`);
    }
    assert(!/[·—]/.test(sourceFacts.text), 'Disallowed visible punctuation');

    for (const width of [320, 375, 414, 768, 1000, 1001, 1280, 1440, 1920]) {
      await open(width);
      const geometry = async () => page.evaluate(() => {
        const overflow = [...document.querySelectorAll('main *')].filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
        }).map((el) => ({ tag: el.tagName, class: el.className, text: el.textContent.trim().slice(0, 60) }));
        const clipped = [...document.querySelectorAll('details[open] .ng-disclosure__content')].filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.bottom > el.parentElement.getBoundingClientRect().bottom + 1;
        }).length;
        return { document: document.documentElement.scrollWidth, viewport: innerWidth, overflow, clipped };
      });
      let current = await geometry();
      assert(current.document <= width + 1, `Page overflow ${width}: ${JSON.stringify(current)}`);
      assert.deepEqual(current.overflow, [], `Element overflow ${width}`);
      assert.equal(current.clipped, 0, `Result clipping ${width}`);
      if ([375, 1440].includes(width)) {
        await page.screenshot({ path: path.join(shots, `default-${width}.png`), fullPage: true });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(shots, `viewport-${width}.png`) });
        for (let index = 0; index < 3; index++) {
          await page.locator('.ng-case').nth(index).screenshot({ path: path.join(shots, `case-${index + 1}-default-${width}.png`), style: '.nav { visibility: hidden !important; }' });
        }
      }
      await page.evaluate(() => document.querySelectorAll('details').forEach((el) => { el.open = true; }));
      for (const img of await page.locator('main img[src*="/project/"]').all()) await img.scrollIntoViewIfNeeded();
      await page.evaluate(async () => { await Promise.all([...document.querySelectorAll('main img')].map((img) => img.decode().catch(() => {}))); });
      current = await geometry();
      assert(current.document <= width + 1, `Expanded page overflow ${width}`);
      assert.deepEqual(current.overflow, [], `Expanded element overflow ${width}: ${JSON.stringify(current.overflow)}`);
      assert.equal(current.clipped, 0, `Expanded clipping ${width}`);
      const missing = await page.locator('main img').evaluateAll((images) => images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src));
      assert.deepEqual(missing, [], `Missing images ${width}`);
      const brokenBranches = await page.locator('.ng-cicd-branches code').evaluateAll((codes) => codes.filter((code) => {
        const spans = [...code.querySelectorAll('span')];
        return spans.length > 1 && Math.abs(spans[0].getBoundingClientRect().top - spans[1].getBoundingClientRect().top) > 1;
      }).map((code) => code.textContent));
      assert.deepEqual(brokenBranches, [], `Branch name wrap ${width}`);
      const overlap = await page.evaluate(() => {
        const figure = document.querySelector('.ng-cicd-figure').getBoundingClientRect();
        const flow = document.querySelector('.ng-cicd-flow');
        const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT);
        const collisions = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent.trim() || node.parentElement.closest('figure')) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) if (rect.left < figure.right - 1 && rect.right > figure.left + 1 && rect.top < figure.bottom - 1 && rect.bottom > figure.top + 1) collisions.push(node.textContent.trim());
        }
        return collisions;
      });
      assert.deepEqual(overlap, [], `Text/diagram overlap ${width}`);
      if ([375, 1440].includes(width)) {
        for (const selector of ['#service-unification', '#reactive-api-test', '#cicd-automation']) {
          await page.locator(selector).screenshot({ path: path.join(shots, `${selector.slice(1)}-${width}.png`), style: '.nav { visibility: hidden !important; }' });
        }
        await page.locator('.m-list--dev').screenshot({ path: path.join(shots, `backend-${width}.png`), style: '.nav { visibility: hidden !important; }' });
      }
      checks.push({ width, default: 'pass', expanded: 'pass', images: 'pass', textOverlap: 'none' });
    }

    await open(1440);
    await page.locator('#service-unification > summary').click();
    await page.waitForTimeout(550);
    assert(await page.locator('#service-unification').evaluate((el) => el.open));
    const second = page.locator('.ng-case').first().locator('.ng-case-disclosures > details').nth(1);
    await second.locator('summary').click();
    await page.waitForTimeout(550);
    assert(!(await page.locator('#service-unification').evaluate((el) => el.open)));
    assert(await second.evaluate((el) => el.open));
    assert(await page.locator('[data-independent]').evaluateAll((els) => els.every((el) => el.open)));
    await page.locator('#integration-result > summary').click();
    await page.waitForTimeout(550);
    assert(!(await page.locator('#integration-result').evaluate((el) => el.open)));
    await page.locator('#integration-result > summary').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(550);
    assert(await page.locator('#integration-result').evaluate((el) => el.open));
    await page.locator('.m-list--dev').screenshot({ path: path.join(shots, 'backend-interactive-1440.png') });

    await page.locator('img[src$="arch-nextgen.png"]').locator('..').click();
    await page.waitForTimeout(250);
    assert(await page.locator('#lightbox').evaluate((el) => el.classList.contains('is-open')));
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#lightbox').evaluate((el) => el.classList.contains('is-open'))));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#reactive-benchmark > summary').click();
    assert(await page.locator('#reactive-benchmark').evaluate((el) => el.open));
    assert.equal(await page.locator('[data-animating]').count(), 0);
    assert.deepEqual(errors, []);
    for (const [file, expected] of Object.entries(report.protected)) assert.equal(hash(file), expected, `Protected file changed: ${file}`);
    const output = { url, checks, interactions: 'pass', originalFiles: 'unchanged', images: report.projectImages.length, screenshots: shots };
    fs.writeFileSync(path.join(__dirname, 'verification.json'), JSON.stringify(output, null, 2));
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
