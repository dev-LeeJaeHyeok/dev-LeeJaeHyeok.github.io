const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = 'D:/L-archive/portfolio';
const target = path.join(root, 'projects/nextgen-messaging/index-test1.html');
const protectedFiles = ['projects/nextgen-messaging/index.html', 'projects/nextgen-messaging/index-test.html', 'style.css', 'script.js'];
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const source = fs.readFileSync(target, 'utf8');
    const output = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, 'text/html');
      const main = doc.querySelector('main');
      const projectImages = () => [...main.querySelectorAll('img[src*="/project/"]')].map((img) => img.getAttribute('src'));
      const beforeImages = projectImages();
      const comments = doc.createTreeWalker(main, NodeFilter.SHOW_COMMENT);
      const remove = [];
      while (comments.nextNode()) remove.push(comments.currentNode);
      remove.forEach((node) => node.remove());
      [...main.querySelectorAll('.m-sec')].find((section) => section.querySelector('.m-sec__label')?.textContent.trim() === '마주했던 문제').remove();
      const solutions = main.querySelector('.ng-solutions');
      const label = solutions.parentElement.querySelector('.m-sec__label');
      label.remove();
      solutions.parentElement.setAttribute('aria-label', '프로젝트 개발 사례');

      const retag = (node, tag) => {
        const replacement = doc.createElement(tag);
        for (const attr of node.attributes) replacement.setAttribute(attr.name, attr.value);
        while (node.firstChild) replacement.append(node.firstChild);
        node.replaceWith(replacement);
        return replacement;
      };
      const titles = ['integration', 'reactive', 'cicd'];
      [...solutions.querySelectorAll('article')].forEach((article, index) => {
        article.classList.add('ng-case');
        article.querySelector('div').className = 'ng-solution-heading';
        const body = article.querySelector('.m-sol__body');
        const sections = body.querySelector('.ng-solution-sections');
        const result = sections.querySelector('[data-independent]');
        const problem = doc.createElement('section');
        problem.className = 'ng-case-stage ng-case-stage--problem';
        problem.setAttribute('aria-labelledby', `${titles[index]}-problem-title`);
        problem.innerHTML = `\n<h4 class="ng-stage-title" id="${titles[index]}-problem-title">문제</h4>\n<div class="ng-problem-copy" id="${titles[index]}-problem-copy"></div>\n`;
        if (index > 0) {
          const first = sections.querySelector('details');
          const content = first.querySelector('.ng-disclosure__content');
          const copy = problem.querySelector('.ng-problem-copy');
          while (content.firstChild) copy.append(content.firstChild);
          first.remove();
        }
        const solution = doc.createElement('section');
        solution.className = 'ng-case-stage ng-case-stage--solution';
        solution.setAttribute('aria-labelledby', `${titles[index]}-solution-title`);
        solution.innerHTML = `\n<h4 class="ng-stage-title" id="${titles[index]}-solution-title">해결</h4>\n`;
        sections.className = 'ng-case-disclosures';
        for (const title of sections.querySelectorAll('summary > h4')) retag(title, 'h5');
        for (const title of sections.querySelectorAll('.ng-sub')) retag(title, 'h6');
        for (const title of sections.querySelectorAll('.m-list--dev h4')) retag(title, 'h6').classList.add('ng-dev-title');
        result.querySelector('summary > h5') && retag(result.querySelector('summary > h5'), 'h4');
        for (const title of result.querySelectorAll('.ng-sub')) retag(title, 'h5');
        result.classList.add('ng-case-stage', 'ng-case-stage--result');
        result.setAttribute('open', '');
        solution.append(sections);
        body.replaceChildren(problem, doc.createTextNode('\n'), solution, doc.createTextNode('\n'), result, doc.createTextNode('\n'));
        for (const section of [problem, solution]) section.append(doc.createTextNode('\n'));
      });
      const afterImages = projectImages();
      if (JSON.stringify(beforeImages) !== JSON.stringify(afterImages)) throw new Error('Project images changed during structural move');
      return { html: '<!DOCTYPE html>\n' + doc.documentElement.outerHTML + '\n', beforeImages };
    }, source);
    const report = { protected: Object.fromEntries(protectedFiles.map((file) => [file, hash(file)])), projectImages: output.beforeImages };
    fs.writeFileSync(path.join(__dirname, 'baseline.json'), JSON.stringify(report, null, 2));
    fs.writeFileSync(target, output.html);
    process.stdout.write(JSON.stringify({ target, projectImages: output.beforeImages.length, cases: 3 }) + '\n');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
