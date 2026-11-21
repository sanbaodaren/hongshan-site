(function () {
  const DATA = window.HONGSHAN;
  const KEY = "hongshan-xueguan-progress-v1";
  const app = document.querySelector("#app");

  const state = {
    filter: "全部",
    query: "",
    quiz: {}
  };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        done: raw.done || {},
        saved: raw.saved || {},
        last: raw.last || ""
      };
    } catch (err) {
      return { done: {}, saved: {}, last: "" };
    }
  }

  function save(store) {
    localStorage.setItem(KEY, JSON.stringify(store));
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function lessonKey(courseId, lessonId) {
    return courseId + "/" + lessonId;
  }

  function unitsOf(course) {
    if (course.units && course.units.length) return course.units;
    return [{ id: "main", title: course.title, lessons: course.lessons || [] }];
  }

  function lessonsOf(course) {
    return unitsOf(course).flatMap((unit) => unit.lessons);
  }

  function unitOf(course, lessonId) {
    return unitsOf(course).find((unit) => unit.lessons.some((lesson) => lesson.id === lessonId));
  }

  function allLessons() {
    return DATA.courses.flatMap((course) =>
      lessonsOf(course).map((lesson, index) => ({ course, lesson, index }))
    );
  }

  function findCourse(id) {
    return DATA.courses.find((course) => course.id === id);
  }

  function findNote(id) {
    return DATA.notes.find((note) => note.id === id);
  }

  function progress() {
    const store = load();
    const lessons = allLessons();
    const doneCount = lessons.filter((item) => store.done[lessonKey(item.course.id, item.lesson.id)]).length;
    const started = DATA.courses.filter((course) =>
      lessonsOf(course).some((lesson) => store.done[lessonKey(course.id, lesson.id)])
    ).length;
    return { store, lessons, doneCount, started, total: lessons.length };
  }

  function courseDoneCount(course, store) {
    return lessonsOf(course).filter((lesson) => store.done[lessonKey(course.id, lesson.id)]).length;
  }

  function parseRoute() {
    const hash = location.hash.replace(/^#/, "") || "/";
    const parts = hash.split("/").filter(Boolean);
    return { parts, name: parts[0] || "home" };
  }

  function nav(name) {
    const items = [
      ["courses", "课程", "#/courses"],
      ["extend", "拓展", "#/extend"],
      ["library", "书库", "#/library"],
      ["method", "学规", "#/method"],
      ["back", "主站", "../index.html"]
    ];
    return items.map(([id, label, href]) => {
      const current = name === id || (name === "course" && id === "courses") || (name === "read" && id === "courses") || (name === "note" && id === "library");
      return `<a class="nav-link${current ? " active" : ""}" href="${href}" ${current ? 'aria-current="page"' : ""}>${label}</a>`;
    }).join("");
  }

  function shell(name, body) {
    const home = name === "home";
    return `
      <header class="site-header">
        <div class="container header-inner">
          <div class="brand">
            <a class="brand-mark" href="#/">宏山科学院-铁一分部</a>
            <span class="brand-sub">铁一分部</span>
          </div>
          <nav class="site-nav" id="siteNav" aria-label="主导航">${nav(name)}</nav>
          <button class="nav-toggle" id="navToggle" type="button" aria-label="打开导航" aria-expanded="false">≡</button>
        </div>
      </header>
      <main id="main" class="${home ? "" : "wrap page"}">${body}</main>
      <footer class="site-footer">
        <div class="container footer-inner">
          <p>宏山科学院·铁一分部·你的学习好帮手</p>
        </div>
      </footer>`;
  }

  function card(course, store) {
    const done = courseDoneCount(course, store);
    const pct = Math.round((done / lessonsOf(course).length) * 100);
    return `
      <a class="card" href="#/course/${course.id}">
        <div class="card-top">
          <span>${course.index}</span>
          <i class="swatch ${esc(course.swatch)}" aria-hidden="true"></i>
        </div>
        <h3>${esc(course.title)}</h3>
        <p>${esc(course.summary)}</p>
        <div class="meta-row">
          ${lessonsOf(course).length} 讲 · 已完成 ${done}
          <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
        </div>
      </a>`;
  }

  function renderHome() {
    const { doneCount, total } = progress();
    const icon = {
      course: '<rect x="4" y="3" width="16" height="18"/><path d="M8 8h8M8 12h8M8 16h5"/>',
      library: '<path d="M4 5h6v15H4zM14 5h6v15h-6z"/><path d="M4 8h6M14 8h6"/>',
      method: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
      extend: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'
    };
    const cards = [
      ["01", "课程", "语文、数学、英语、物理、化学、生物。", "#/courses", icon.course],
      ["02", "书库", "可以单独读的短记。", "#/library", icon.library],
      ["03", "学规", "怎么学，进度存在这台浏览器。", "#/method", icon.method],
      ["04", "拓展", "和课程相同的六科。", "#/extend", icon.extend]
    ];
    return `
      <section class="banner">
        <svg class="contour" viewBox="0 0 1400 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none" stroke="#c0c0b8" stroke-width="1.2">
            <path d="M1030,120 C1090,70 1200,70 1260,115 C1315,155 1315,225 1260,265 C1200,310 1090,310 1030,265 C970,225 970,155 1030,120 Z"></path>
            <path d="M995,95 C1075,25 1215,25 1290,90 C1355,145 1355,235 1290,290 C1215,350 1075,350 995,285 C935,230 935,150 995,95 Z"></path>
            <path d="M960,70 C1060,-15 1230,-15 1320,65 C1395,130 1395,250 1320,315 C1230,390 1060,390 960,315 C890,250 890,130 960,70 Z"></path>
          </g>
        </svg>
        <div class="container">
          <p class="banner-overline">学习站点</p>
          <h1 class="banner-title">宏山科学院 · 铁一分部</h1>
          <p class="banner-sub">绿水青山　科学发展</p>
        </div>
        <div class="tianshi" aria-hidden="true">
          <div class="tianshi-cap"></div>
          <div class="tianshi-pillar"></div>
          <div class="tianshi-base"></div>
        </div>
        <svg class="waterline" viewBox="0 0 1200 18" preserveAspectRatio="none" aria-hidden="true">
          <g fill="none" stroke="#8ab8b0" stroke-width="1">
            <path d="M0 11 Q150 3 300 11 T600 11 T900 11 T1200 11" opacity=".7"></path>
            <path d="M0 15 Q150 7 300 15 T600 15 T900 15 T1200 15" opacity=".4"></path>
          </g>
        </svg>
      </section>
      <section class="board-section">
        <div class="container">
          <div class="board-head">
            <h2><span class="idx">//</span>板块索引 <span class="idx en">SECTIONS</span></h2>
            <p>INDEX · 04</p>
          </div>
          <div class="layout-stats" aria-label="学习进度">
            <div class="layout-stat"><span>学科</span><b>0${DATA.courses.length}</b><i>SUBJECTS</i></div>
            <div class="layout-stat"><span>讲义</span><b>${String(total).padStart(2, "0")}</b><i>LESSONS</i></div>
            <div class="layout-stat"><span>书库</span><b>${String(DATA.notes.length).padStart(2, "0")}</b><i>NOTES</i></div>
            <div class="layout-stat"><span>已完成</span><b>${String(doneCount).padStart(2, "0")}</b><i>DONE</i></div>
          </div>
          <div class="board-grid">
            ${cards.map(([no, title, desc, href, path]) => `
              <a class="board-card" href="${href}">
                <span class="card-no">${no}</span>
                <span class="card-notch" aria-hidden="true"></span>
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${path}</svg>
                <h3>${title}</h3>
                <p>${desc}</p>
                <span class="card-arrow" aria-hidden="true">→</span>
              </a>`).join("")}
          </div>
        </div>
      </section>`;
  }

  function renderExtend() {
    return `
      <p class="kicker"><i class="sq" aria-hidden="true"></i>拓展</p>
      <h1>选择学科</h1>
      <p class="lede">物理可以点开。其余五科还没有写入。</p>
      <div class="grid-3" style="margin-top:22px">
        ${DATA.courses.map((course) => {
          const inner = `
            <div class="card-top"><span>${esc(course.index)}</span></div>
            <h3>${esc(course.category)}</h3>`;
          return course.id === "physics"
            ? `<a class="card" href="#/extend/physics">${inner}</a>`
            : `<div class="card">${inner}</div>`;
        }).join("")}
      </div>`;
  }

  function renderExtendSubject(id) {
    const article = DATA.extend && DATA.extend[id];
    if (!article) return missing();
    return `
      <p class="crumb"><a href="#/extend">拓展</a> / ${esc(article.subject)}</p>
      <article class="prose extend-read">
        <p class="kicker"><i class="sq" aria-hidden="true"></i>${esc(article.subject)}</p>
        <h1>${esc(article.title)}</h1>
        <p class="lede">${esc(article.lede)}</p>
        ${renderBlocks(article.blocks)}
      </article>`;
  }

  function renderCourses() {
    const { store } = progress();
    return `
      <p class="kicker"><i class="sq" aria-hidden="true"></i>课程</p>
      <h1>选择学科</h1>
      <p class="lede">点开一门，再读里面的讲义。</p>
      <div class="grid-3" style="margin-top:22px">${DATA.courses.map((course) => card(course, store)).join("")}</div>`;
  }

  function renderCourse(id) {
    const course = findCourse(id);
    if (!course) return missing();
    const { store } = progress();
    const lessons = lessonsOf(course);
    const done = courseDoneCount(course, store);
    return `
      <p class="crumb"><a href="#/courses">课程</a> / ${esc(course.category)}</p>
      <section class="course-hero">
        <div>
          <p class="kicker"><i class="sq" aria-hidden="true"></i>${course.index} / ${esc(course.title)}</p>
          <h1>${esc(course.title)}</h1>
          <p class="lede">${esc(course.blurb)}</p>
        </div>
        <div class="panel">
          <span class="tag quiet">${done} / ${lessons.length} 讲已完成</span>
          <p>先看大标题，再点开下面的小标题。</p>
          <a class="btn" href="#/read/${course.id}/${lessons[0].id}" style="margin-top:16px">从第一讲开始</a>
        </div>
      </section>
      ${unitsOf(course).map((unit, unitIndex) => `
        <section class="unit">
          <h2 class="unit-title"><span class="num">${String(unitIndex + 1).padStart(2, "0")}</span>${esc(unit.title)}</h2>
          <div class="row-list">
            ${unit.lessons.map((lesson, index) => {
              const on = store.done[lessonKey(course.id, lesson.id)];
              return `
                <a href="#/read/${course.id}/${lesson.id}">
                  <span class="num">${String(unitIndex + 1).padStart(2, "0")}.${index + 1}</span>
                  <span>${esc(lesson.title)}</span>
                  <span class="done-flag ${on ? "on" : ""}"><i></i>${on ? "已完成" : lesson.minutes + " 分钟"}</span>
                </a>`;
            }).join("")}
          </div>
        </section>`).join("")}`;
  }

  function drawPlot(spec) {
    const W = spec.note ? 720 : 640;
    const H = 300;
    const L = 48;
    const T = 22;
    const R = spec.note ? 500 : 600;
    const B = 258;
    const X = (x) => L + (x - spec.xmin) / (spec.xmax - spec.xmin) * (R - L);
    const Y = (y) => B - (y - spec.ymin) / (spec.ymax - spec.ymin) * (B - T);
    const inside = (x, y) => x >= spec.xmin && x <= spec.xmax && y >= spec.ymin && y <= spec.ymax;
    const num = (n) => String(Math.round(n * 100) / 100);
    const xAxis = spec.ymin <= 0 && spec.ymax >= 0 ? 0 : spec.ymin;
    const yAxis = spec.xmin <= 0 && spec.xmax >= 0 ? 0 : spec.xmin;
    const pathOf = (fn) => {
      let d = "";
      let on = false;
      for (let i = 0; i <= 80; i += 1) {
        const x = spec.xmin + (spec.xmax - spec.xmin) * i / 80;
        const y = fn(x);
        if (!isFinite(y) || y < spec.ymin || y > spec.ymax) {
          on = false;
          continue;
        }
        d += (on ? "L" : "M") + X(x).toFixed(1) + "," + Y(y).toFixed(1);
        on = true;
      }
      return d;
    };
    const stroke = (d, color, dash) => d
      ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="2"${dash ? ' stroke-dasharray="5 4"' : ""}/>`
      : "";
    const ticks = (spec.xTicks || []).map((t) => `<line x1="${X(t)}" y1="${Y(xAxis)}" x2="${X(t)}" y2="${Y(xAxis) + 4}" stroke="#8ab8b0"/><text x="${X(t)}" y="${Y(xAxis) + 16}" text-anchor="middle" fill="#8ab8b0" font-size="12">${num(t)}</text>`).join("");
    const yticks = (spec.yTicks || []).map((t) => `<line x1="${X(yAxis) - 4}" y1="${Y(t)}" x2="${X(yAxis)}" y2="${Y(t)}" stroke="#8ab8b0"/><text x="${X(yAxis) - 8}" y="${Y(t) + 4}" text-anchor="end" fill="#8ab8b0" font-size="12">${num(t)}</text>`).join("");
    const guides = (spec.guides || []).map((g) => {
      if (!inside(g.x1, g.y1) || !inside(g.x2, g.y2)) return "";
      return `<line x1="${X(g.x1)}" y1="${Y(g.y1)}" x2="${X(g.x2)}" y2="${Y(g.y2)}" stroke="${g.color || "#4a6a7a"}" stroke-width="1.25" stroke-dasharray="4 4"/>`;
    }).join("");
    const marks = (spec.points || []).map((p) => {
      if (!inside(p.x, p.y)) return "";
      const px = X(p.x);
      const py = Y(p.y);
      return `<rect x="${px - 4}" y="${py - 4}" width="8" height="8" fill="#101110"/>${p.text ? `<text x="${px + (p.dx || 8)}" y="${py + (p.dy || -8)}" fill="#101110" font-size="13">${esc(p.text)}</text>` : ""}`;
    }).join("");
    const labels = (spec.labels || []).map((p) => `<text x="${X(p.x)}" y="${Y(p.y)}" fill="${p.color || "#14d0d0"}" font-size="13">${esc(p.text)}</text>`).join("");
    const note = (spec.note || []).map((line, i) => `<text x="${R + 22}" y="${78 + i * 22}" fill="${i === spec.note.length - 1 ? "#14d0d0" : "#101110"}" font-size="14">${esc(line)}</text>`).join("");
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.aria)}">
      <line x1="${X(yAxis)}" y1="${T}" x2="${X(yAxis)}" y2="${B}" stroke="#4a6a7a" stroke-width="1.5"/>
      <line x1="${L}" y1="${Y(xAxis)}" x2="${R}" y2="${Y(xAxis)}" stroke="#4a6a7a" stroke-width="1.5"/>
      <polygon points="${X(yAxis)},${T} ${X(yAxis) - 4},${T + 10} ${X(yAxis) + 4},${T + 10}" fill="#4a6a7a"/>
      <polygon points="${R},${Y(xAxis)} ${R - 10},${Y(xAxis) - 4} ${R - 10},${Y(xAxis) + 4}" fill="#4a6a7a"/>
      <text x="${R - 14}" y="${Y(xAxis) - 8}" fill="#4a6a7a" font-size="13">x</text>
      <text x="${X(yAxis) + 6}" y="${T - 4}" fill="#4a6a7a" font-size="13">y</text>
      ${ticks}${yticks}
      ${stroke(pathOf(spec.fn), "#101110")}
      ${(spec.lines || []).map((line) => stroke(pathOf(line.fn), line.color || "#14d0d0", line.dash)).join("")}
      ${guides}${marks}${labels}${note}
    </svg>`;
  }

  function drawSheet(spec) {
    if (spec.kind === "table") {
      const cols = spec.cols;
      const w = 600 / cols.length;
      const head = cols.map((c, i) => `<text x="${20 + w * i + w / 2}" y="46" text-anchor="middle" fill="#4a6a7a" font-size="13">${esc(c)}</text>`).join("");
      const body = spec.rows.map((row, r) => row.map((c, i) => `<text x="${20 + w * i + w / 2}" y="${92 + r * 40}" text-anchor="middle" fill="${c === "+" || c === "递增" || c === "极大" ? "#14d0d0" : "#101110"}" font-size="14">${esc(c)}</text>`).join("")).join("");
      const rules = `<line x1="20" y1="58" x2="620" y2="58" stroke="#d4d4ce"/><line x1="20" y1="108" x2="620" y2="108" stroke="#d4d4ce"/>`;
      return `<svg viewBox="0 0 640 180" role="img" aria-label="${esc(spec.aria)}">${rules}${head}${body}</svg>`;
    }
    const lines = spec.steps.map((line, i) => `<text x="36" y="${48 + i * 36}" fill="${i === 1 ? "#4a6a7a" : "#101110"}" font-size="16">${esc(line)}</text>`).join("");
    return `<svg viewBox="0 0 640 160" role="img" aria-label="${esc(spec.aria)}">${lines}</svg>`;
  }

  function liveSecantFigure() {
    const L = 48;
    const T = 22;
    const R = 500;
    const B = 258;
    const X = (x) => L + x / 4 * (R - L);
    const Y = (y) => B - y / 12 * (B - T);
    let d = "";
    for (let i = 0; i <= 80; i += 1) {
      const x = 4 * i / 80;
      d += (i ? "L" : "M") + X(x).toFixed(1) + "," + Y(x * x + 1).toFixed(1);
    }
    const tick = (x, label) => `<line x1="${X(x)}" y1="${Y(0)}" x2="${X(x)}" y2="${Y(0) + 4}" stroke="#8ab8b0"/><text x="${X(x)}" y="${Y(0) + 16}" text-anchor="middle" fill="#8ab8b0" font-size="12">${label}</text>`;
    const ytick = (y) => `<line x1="${X(0) - 4}" y1="${Y(y)}" x2="${X(0)}" y2="${Y(y)}" stroke="#8ab8b0"/><text x="${X(0) - 8}" y="${Y(y) + 4}" text-anchor="end" fill="#8ab8b0" font-size="12">${y}</text>`;
    const handle = (end) => `<g class="handle" data-end="${end}" role="button" tabindex="0" aria-label="${end === "a" ? "拖动点 A" : "拖动点 B"}">
      <rect class="hit" x="-16" y="-16" width="32" height="32"/>
      <rect class="ring" x="-8" y="-8" width="16" height="16" fill="none" stroke="#14d0d0" stroke-width="1.5"/>
      <rect class="dot" x="-4" y="-4" width="8" height="8" fill="#101110"/>
      <text class="tag" font-size="13" fill="#101110"></text>
    </g>`;
    const svg = `<svg class="live-plot live-secant" data-kind="secant" data-a="1" data-b="3" viewBox="0 0 720 300" role="img" aria-label="可拖动的割线。拖动 A 或 B 改变平均变化率">
      <line x1="${X(0)}" y1="${T}" x2="${X(0)}" y2="${B}" stroke="#4a6a7a" stroke-width="1.5"/>
      <line x1="${L}" y1="${Y(0)}" x2="${R}" y2="${Y(0)}" stroke="#4a6a7a" stroke-width="1.5"/>
      <polygon points="${X(0)},${T} ${X(0) - 4},${T + 10} ${X(0) + 4},${T + 10}" fill="#4a6a7a"/>
      <polygon points="${R},${Y(0)} ${R - 10},${Y(0) - 4} ${R - 10},${Y(0) + 4}" fill="#4a6a7a"/>
      <text x="${R - 14}" y="${Y(0) - 8}" fill="#4a6a7a" font-size="13">x</text>
      <text x="${X(0) + 6}" y="${T - 4}" fill="#4a6a7a" font-size="13">y</text>
      ${tick(1, "1")}${tick(2, "2")}${tick(3, "3")}${ytick(2)}${ytick(6)}${ytick(10)}
      <path d="${d}" fill="none" stroke="#101110" stroke-width="2"/>
      <line class="secant" stroke="#14d0d0" stroke-width="2"/>
      <line class="dx" stroke="#4a6a7a" stroke-width="1.25" stroke-dasharray="4 4"/>
      <line class="dy" stroke="#4a6a7a" stroke-width="1.25" stroke-dasharray="4 4"/>
      <text class="secant-label" fill="#14d0d0" font-size="13">割线</text>
      <text class="dx-label" fill="#4a6a7a" font-size="13" text-anchor="middle"></text>
      <text class="dy-label" fill="#4a6a7a" font-size="13"></text>
      ${handle("a")}${handle("b")}
      <text class="n1" x="528" y="78" fill="#101110" font-size="14"></text>
      <text class="n2" x="528" y="100" fill="#101110" font-size="14"></text>
      <text class="n3" x="528" y="122" fill="#14d0d0" font-size="14"></text>
    </svg>`;
    return `<figure class="diagram"><div class="diagram-frame">${svg}</div><figcaption>拖动黑点 A 或 B。</figcaption></figure>`;
  }

  function paintSecant(svg) {
    const L = 48;
    const T = 22;
    const R = 500;
    const B = 258;
    const X = (x) => L + x / 4 * (R - L);
    const Y = (y) => B - y / 12 * (B - T);
    const fmt = (n) => String(Math.round(n * 100) / 100);
    const a = Number(svg.dataset.a);
    const b = Number(svg.dataset.b);
    const ya = a * a + 1;
    const yb = b * b + 1;
    const slope = (yb - ya) / (b - a);
    const at = (x) => ya + slope * (x - a);
    let x1 = 0.2;
    let x2 = 3.8;
    if (slope !== 0) {
      const fit = (x) => {
        const y = at(x);
        if (y < 0) return a + (0 - ya) / slope;
        if (y > 12) return a + (12 - ya) / slope;
        return x;
      };
      x1 = Math.max(0, Math.min(4, fit(x1)));
      x2 = Math.max(0, Math.min(4, fit(x2)));
    }
    const line = svg.querySelector(".secant");
    line.setAttribute("x1", X(x1));
    line.setAttribute("y1", Y(at(x1)));
    line.setAttribute("x2", X(x2));
    line.setAttribute("y2", Y(at(x2)));
    const dx = svg.querySelector(".dx");
    dx.setAttribute("x1", X(a));
    dx.setAttribute("y1", Y(ya));
    dx.setAttribute("x2", X(b));
    dx.setAttribute("y2", Y(ya));
    const dy = svg.querySelector(".dy");
    dy.setAttribute("x1", X(b));
    dy.setAttribute("y1", Y(ya));
    dy.setAttribute("x2", X(b));
    dy.setAttribute("y2", Y(yb));
    const dxLabel = svg.querySelector(".dx-label");
    dxLabel.setAttribute("x", (X(a) + X(b)) / 2);
    dxLabel.setAttribute("y", Math.min(Y(ya) + 18, B - 4));
    dxLabel.textContent = "Δx = " + fmt(b - a);
    const dyLabel = svg.querySelector(".dy-label");
    const dyLeft = X(b) > 430;
    dyLabel.setAttribute("x", dyLeft ? X(b) - 58 : X(b) + 8);
    dyLabel.setAttribute("y", (Y(ya) + Y(yb)) / 2);
    dyLabel.textContent = "Δy = " + fmt(yb - ya);
    const midX = (X(a) + X(b)) / 2;
    const midY = (Y(ya) + Y(yb)) / 2;
    const vx = X(b) - X(a);
    const vy = Y(yb) - Y(ya);
    const len = Math.hypot(vx, vy) || 1;
    let nx = -vy / len;
    let ny = vx / len;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const secantLabel = svg.querySelector(".secant-label");
    secantLabel.setAttribute("x", midX + nx * 18);
    secantLabel.setAttribute("y", midY + ny * 18);
    const place = (end, x, y, text) => {
      const g = svg.querySelector(`[data-end="${end}"]`);
      g.setAttribute("transform", `translate(${X(x)} ${Y(y)})`);
      const tag = g.querySelector(".tag");
      const left = end === "a" ? X(x) > 130 : X(x) > 400;
      tag.setAttribute("x", left ? -12 : 12);
      tag.setAttribute("y", -14);
      tag.setAttribute("text-anchor", left ? "end" : "start");
      tag.textContent = text;
    };
    place("a", a, ya, `A(${fmt(a)}, ${fmt(ya)})`);
    place("b", b, yb, `B(${fmt(b)}, ${fmt(yb)})`);
    svg.querySelector(".n1").textContent = "Δy / Δx";
    svg.querySelector(".n2").textContent = "= " + fmt(yb - ya) + " / " + fmt(b - a);
    svg.querySelector(".n3").textContent = "= " + fmt(slope);
    const caption = svg.closest("figure").querySelector("figcaption");
    caption.textContent = `拖动黑点 A 或 B。当前平均变化率是 ${fmt(slope)}。`;
  }

  function fmtNum(n) {
    const v = Math.round(n * 100) / 100;
    return Object.is(v, -0) ? "0" : String(v);
  }

  function liveMap(svg) {
    const L = 48;
    const T = 22;
    const R = Number(svg.dataset.r);
    const B = 258;
    const xmin = Number(svg.dataset.xmin);
    const xmax = Number(svg.dataset.xmax);
    const ymin = Number(svg.dataset.ymin);
    const ymax = Number(svg.dataset.ymax);
    return {
      L, T, R, B, xmin, xmax, ymin, ymax,
      X: (x) => L + (x - xmin) / (xmax - xmin) * (R - L),
      Y: (y) => B - (y - ymin) / (ymax - ymin) * (B - T)
    };
  }

  function liveCurve(spec) {
    const X = (x) => spec.L + (x - spec.xmin) / (spec.xmax - spec.xmin) * (spec.R - spec.L);
    const Y = (y) => spec.B - (y - spec.ymin) / (spec.ymax - spec.ymin) * (spec.B - spec.T);
    let d = "";
    let on = false;
    for (let i = 0; i <= 80; i += 1) {
      const x = spec.xmin + (spec.xmax - spec.xmin) * i / 80;
      const y = spec.fn(x);
      if (y < spec.ymin || y > spec.ymax) {
        on = false;
        continue;
      }
      d += (on ? "L" : "M") + X(x).toFixed(1) + "," + Y(y).toFixed(1);
      on = true;
    }
    return d;
  }

  function liveFrame(spec) {
    const L = 48;
    const T = 22;
    const R = spec.wide ? 500 : 590;
    const B = 258;
    const W = spec.wide ? 720 : 640;
    const xAxis = spec.ymin <= 0 && spec.ymax >= 0 ? 0 : spec.ymin;
    const yAxis = spec.xmin <= 0 && spec.xmax >= 0 ? 0 : spec.xmin;
    const X = (x) => L + (x - spec.xmin) / (spec.xmax - spec.xmin) * (R - L);
    const Y = (y) => B - (y - spec.ymin) / (spec.ymax - spec.ymin) * (B - T);
    const ticks = (spec.xTicks || []).map((t) => `<line x1="${X(t)}" y1="${Y(xAxis)}" x2="${X(t)}" y2="${Y(xAxis) + 4}" stroke="#8ab8b0"/><text x="${X(t)}" y="${Y(xAxis) + 16}" text-anchor="middle" fill="#8ab8b0" font-size="12">${t}</text>`).join("");
    const yticks = (spec.yTicks || []).map((t) => `<line x1="${X(yAxis) - 4}" y1="${Y(t)}" x2="${X(yAxis)}" y2="${Y(t)}" stroke="#8ab8b0"/><text x="${X(yAxis) - 8}" y="${Y(t) + 4}" text-anchor="end" fill="#8ab8b0" font-size="12">${t}</text>`).join("");
    const handle = (end, label) => `<g class="handle" data-end="${end}" role="button" tabindex="0" aria-label="${label}">
      <rect class="hit" x="-16" y="-16" width="32" height="32"/>
      <rect class="ring" x="-8" y="-8" width="16" height="16" fill="none" stroke="#14d0d0" stroke-width="1.5"/>
      <rect class="dot" x="-4" y="-4" width="8" height="8" fill="#101110"/>
      <text class="tag" font-size="13" fill="#101110"></text>
    </g>`;
    const pin = spec.pin ? `<g class="pin"><rect x="-4" y="-4" width="8" height="8" fill="#101110"/><text class="tag" font-size="13" fill="#101110"></text></g>` : "";
    const lines = (spec.lines || []).map((line) => `<line class="${line.cls}" stroke="${line.color}" stroke-width="${line.width || 2}"${line.dash ? ' stroke-dasharray="5 4"' : ""}/>`).join("");
    const notes = spec.wide ? `<text class="n1" x="${R + 22}" y="78" fill="#101110" font-size="14"></text><text class="n2" x="${R + 22}" y="100" fill="#14d0d0" font-size="14"></text><text class="n3" x="${R + 22}" y="122" fill="#101110" font-size="14"></text>` : "";
    const curve = liveCurve({ L, T, R, B, xmin: spec.xmin, xmax: spec.xmax, ymin: spec.ymin, ymax: spec.ymax, fn: spec.fn });
    return `<svg class="live-plot" data-kind="${spec.kind}" data-r="${R}" data-xmin="${spec.xmin}" data-xmax="${spec.xmax}" data-ymin="${spec.ymin}" data-ymax="${spec.ymax}" ${spec.data} viewBox="0 0 ${W} 300" role="img" aria-label="${esc(spec.aria)}">
      <line x1="${X(yAxis)}" y1="${T}" x2="${X(yAxis)}" y2="${B}" stroke="#4a6a7a" stroke-width="1.5"/>
      <line x1="${L}" y1="${Y(xAxis)}" x2="${R}" y2="${Y(xAxis)}" stroke="#4a6a7a" stroke-width="1.5"/>
      <polygon points="${X(yAxis)},${T} ${X(yAxis) - 4},${T + 10} ${X(yAxis) + 4},${T + 10}" fill="#4a6a7a"/>
      <polygon points="${R},${Y(xAxis)} ${R - 10},${Y(xAxis) - 4} ${R - 10},${Y(xAxis) + 4}" fill="#4a6a7a"/>
      <text x="${R - 14}" y="${Y(xAxis) - 8}" fill="#4a6a7a" font-size="13">x</text>
      <text x="${X(yAxis) + 6}" y="${T - 4}" fill="#4a6a7a" font-size="13">y</text>
      ${ticks}${yticks}
      <path d="${curve}" fill="none" stroke="#101110" stroke-width="2"/>
      ${lines}${pin}${spec.handles.map((item) => handle(item.end, item.label)).join("")}${notes}
    </svg>`;
  }

  function setLiveLine(svg, cls, x1, y1, x2, y2, map) {
    const line = svg.querySelector("." + cls);
    line.setAttribute("x1", map.X(x1));
    line.setAttribute("y1", map.Y(y1));
    line.setAttribute("x2", map.X(x2));
    line.setAttribute("y2", map.Y(y2));
  }

  function clipSlope(map, x0, y0, slope) {
    let lo = map.xmin;
    let hi = map.xmax;
    const at = (x) => y0 + slope * (x - x0);
    if (slope === 0) {
      if (y0 < map.ymin || y0 > map.ymax) return null;
    } else {
      const xa = x0 + (map.ymin - y0) / slope;
      const xb = x0 + (map.ymax - y0) / slope;
      lo = Math.max(map.xmin, Math.min(xa, xb));
      hi = Math.min(map.xmax, Math.max(xa, xb));
    }
    if (hi - lo < 0.02) return null;
    return [lo, at(lo), hi, at(hi)];
  }

  function placeLive(svg, end, x, y, text, map) {
    const g = svg.querySelector(`[data-end="${end}"]`);
    g.setAttribute("transform", `translate(${map.X(x)} ${map.Y(y)})`);
    const tag = g.querySelector(".tag");
    const left = map.X(x) > map.R * 0.55;
    tag.setAttribute("x", left ? -12 : 12);
    tag.setAttribute("y", -14);
    tag.setAttribute("text-anchor", left ? "end" : "start");
    tag.textContent = text;
  }

  function paintInstant(svg) {
    const map = liveMap(svg);
    const t = Number(svg.dataset.b);
    const y = t * t;
    const slope = 2 * t;
    const tangent = clipSlope(map, t, y, slope);
    if (tangent) setLiveLine(svg, "tangent", tangent[0], tangent[1], tangent[2], tangent[3], map);
    const step = t > 2.4 ? -0.6 : 0.6;
    const q = t + step;
    setLiveLine(svg, "secant", t, y, q, q * q, map);
    placeLive(svg, "b", t, y, `(${fmtNum(t)}, ${fmtNum(y)})`, map);
    svg.querySelector(".n1").textContent = "切线斜率";
    svg.querySelector(".n2").textContent = "= " + fmtNum(slope);
    svg.querySelector(".n3").textContent = Math.abs(t - 2) < 0.08 ? "瞬时速度 4" : "瞬时速度 2t";
    svg.closest("figure").querySelector("figcaption").textContent = Math.abs(t - 2) < 0.08
      ? "切点在 t = 2，青线斜率是 4，这就是这一时刻的瞬时速度。"
      : `拖动切点，青线跟着走。当前瞬时速度是 ${fmtNum(slope)}。`;
  }

  function paintCusp(svg) {
    const map = liveMap(svg);
    const x = Number(svg.dataset.x);
    const y = Math.abs(x);
    const slope = x < 0 ? -1 : 1;
    const edge = x < 0 ? map.xmin : map.xmax;
    setLiveLine(svg, "secant", 0, 0, edge, Math.abs(edge), map);
    const pin = svg.querySelector(".pin");
    pin.setAttribute("transform", `translate(${map.X(0)} ${map.Y(0)})`);
    pin.querySelector(".tag").setAttribute("x", "10");
    pin.querySelector(".tag").setAttribute("y", "18");
    pin.querySelector(".tag").textContent = "尖点";
    placeLive(svg, "p", x, y, `P(${fmtNum(x)}, ${fmtNum(y)})`, map);
    svg.querySelector(".n1").textContent = x < 0 ? "左侧斜率" : "右侧斜率";
    svg.querySelector(".n2").textContent = "= " + slope;
    svg.querySelector(".n3").textContent = "左右不相等";
    svg.closest("figure").querySelector("figcaption").textContent = x < 0
      ? "P 在左侧，割线斜率是 −1。拖到右侧会变成 1。"
      : "P 在右侧，割线斜率是 1。拖到左侧会变成 −1。";
  }

  function paintSlope(svg) {
    const map = liveMap(svg);
    const x = Number(svg.dataset.x);
    const y = x ** 3 - 2 * x;
    const fp = 3 * x * x - 2;
    const tangent = clipSlope(map, x, y, fp);
    if (tangent) setLiveLine(svg, "tangent", tangent[0], tangent[1], tangent[2], tangent[3], map);
    let normalText = "竖直";
    if (Math.abs(fp) < 0.08) {
      setLiveLine(svg, "normal", x, map.ymin, x, map.ymax, map);
    } else {
      const normal = clipSlope(map, x, y, -1 / fp);
      if (normal) setLiveLine(svg, "normal", normal[0], normal[1], normal[2], normal[3], map);
      normalText = fmtNum(-1 / fp);
    }
    placeLive(svg, "p", x, y, `(${fmtNum(x)}, ${fmtNum(y)})`, map);
    svg.querySelector(".n1").textContent = "切线斜率";
    svg.querySelector(".n2").textContent = "= " + fmtNum(fp);
    svg.querySelector(".n3").textContent = "法线 " + normalText;
    const caption = svg.closest("figure").querySelector("figcaption");
    caption.textContent = Math.abs(x - 1) < 0.06
      ? "切点在 x = 1，切线斜率是 1，方程是 y = x − 2。"
      : `拖动切点。当前切线斜率是 ${fmtNum(fp)}。`;
  }

  function liveInstantFigure() {
    const svg = liveFrame({
      kind: "instant",
      wide: true,
      aria: "拖动切点，青色切线的斜率就是这一时刻的瞬时速度",
      fn: (x) => x * x,
      xmin: 0, xmax: 3.2, ymin: 0, ymax: 10,
      xTicks: [1, 2, 3], yTicks: [4, 8],
      data: 'data-b="2"',
      handles: [{ end: "b", label: "拖动切点" }],
      lines: [{ cls: "tangent", color: "#14d0d0" }, { cls: "secant", color: "#4a6a7a", dash: true }]
    });
    return `<figure class="diagram"><div class="diagram-frame">${svg}</div><figcaption>拖动切点，青线跟着走。</figcaption></figure>`;
  }

  function liveCuspFigure() {
    const svg = liveFrame({
      kind: "cusp",
      wide: true,
      aria: "拖动 P 穿过原点，左右割线斜率分别是 -1 和 1",
      fn: (x) => Math.abs(x),
      xmin: -2, xmax: 2, ymin: -0.4, ymax: 2,
      xTicks: [-1, 1], yTicks: [1],
      data: 'data-x="-1"',
      pin: true,
      handles: [{ end: "p", label: "拖动点 P" }],
      lines: [{ cls: "secant", color: "#14d0d0", width: 3 }]
    });
    return `<figure class="diagram"><div class="diagram-frame">${svg}</div><figcaption>拖动 P，看左右斜率。</figcaption></figure>`;
  }

  function liveTangentFigure() {
    const svg = liveFrame({
      kind: "slope",
      wide: true,
      aria: "拖动切点，切线和法线一起变化",
      fn: (x) => x ** 3 - 2 * x,
      xmin: -2, xmax: 2, ymin: -3, ymax: 3,
      xTicks: [-1, 1], yTicks: [-2, -1, 1, 2],
      data: 'data-x="1"',
      handles: [{ end: "p", label: "拖动切点" }],
      lines: [{ cls: "tangent", color: "#14d0d0" }, { cls: "normal", color: "#4a6a7a", dash: true }]
    });
    return `<figure class="diagram"><div class="diagram-frame">${svg}</div><figcaption>拖动切点。</figcaption></figure>`;
  }

  function mountLivePlots() {
    document.querySelectorAll("svg.live-plot").forEach((svg) => {
      const kind = svg.dataset.kind;
      if (kind === "instant") paintInstant(svg);
      else if (kind === "cusp") paintCusp(svg);
      else if (kind === "slope") paintSlope(svg);
      else paintSecant(svg);
    });
  }

  function renderFigure(id) {
    if (id === "avg-secant") return liveSecantFigure();
    if (id === "inst-tangent") return liveInstantFigure();
    if (id === "abs-cusp") return liveCuspFigure();
    if (id === "tangent-line") return liveTangentFigure();
    if (id === "boost") return boostFigure();
    const figures = {
      "power-rule": {
        caption: "例图：(x³)' = 3x²。x = 1 时导数是 3，切线斜率就是 3。",
        plot: {
          aria: "y 等于 x 的立方，在 x 等于 1 处切线斜率为 3",
          fn: (x) => x ** 3,
          xmin: -1.4, xmax: 1.6, ymin: -2, ymax: 3,
          xTicks: [-1, 1], yTicks: [1],
          lines: [{ fn: (x) => 3 * x - 2 }],
          points: [{ x: 1, y: 1, text: "斜率 3", dx: 8, dy: -8 }],
          note: ["(x³)'", "= 3x²", "x = 1 时为 3"]
        }
      },
      "product-rule": {
        caption: "例图：u = x，v = x，积是 x²。在 x = 2 处，u'v + uv' = 4，等于切线斜率。",
        plot: {
          aria: "y 等于 x 的平方，在 x 等于 2 处用乘积法则得到斜率 4",
          fn: (x) => x * x,
          xmin: 0, xmax: 3, ymin: 0, ymax: 9,
          xTicks: [1, 2], yTicks: [4],
          lines: [{ fn: (x) => 4 * x - 4 }],
          points: [{ x: 2, y: 4, text: "(2, 4)", dx: 8, dy: -8 }],
          note: ["(uv)'", "= u'v + uv'", "= 4"]
        }
      },
      "chain-rule": {
        caption: "例图：y = sin(2x) 在 x = 0 的切线斜率是 2，等于外层导数 cos(0) 乘内层导数 2。",
        plot: {
          aria: "y 等于 sin 2x，在原点的切线斜率为 2",
          fn: (x) => Math.sin(2 * x),
          xmin: -1, xmax: 2, ymin: -1.4, ymax: 1.4,
          xTicks: [-1, 1], yTicks: [1, -1],
          lines: [{ fn: (x) => 2 * x }],
          points: [{ x: 0, y: 0, text: "斜率 2", dx: 10, dy: -10 }],
          note: ["外层 cos(2x)", "内层导数 2", "相乘得 2cos(2x)"]
        }
      },
      "mono-cubic": {
        caption: "例图：f(x) = x³ − 3x。中间一段导数为负，函数下降；两侧导数为正，函数上升。",
        plot: {
          aria: "立方曲线先上升，经过极大值后下降，再经过极小值后上升",
          fn: (x) => x ** 3 - 3 * x,
          xmin: -2.2, xmax: 2.2, ymin: -3, ymax: 3,
          xTicks: [-1, 1], yTicks: [-2, 2],
          points: [{ x: -1, y: 2, text: "极大", dx: -36, dy: -8 }, { x: 1, y: -2, text: "极小", dx: 8, dy: 16 }],
          labels: [{ x: -1.9, y: 0.5, text: "增" }, { x: -0.15, y: 0.45, text: "减" }, { x: 1.45, y: 0.5, text: "增" }]
        }
      },
      "flat-cubic": {
        caption: "例图：y = x³ 在 x = 0 切线水平，但左右都在上升，所以不是极值。",
        plot: {
          aria: "y 等于 x 的立方在原点有水平切线，但函数仍然递增",
          fn: (x) => x ** 3,
          xmin: -1.5, xmax: 1.5, ymin: -2, ymax: 2,
          xTicks: [-1, 1], yTicks: [1, -1],
          lines: [{ fn: () => 0 }],
          points: [{ x: 0, y: 0, text: "不是极值", dx: 8, dy: -10 }],
          note: ["f'(0) = 0", "左右都上升", "无极值"]
        }
      },
      "closed-max": {
        caption: "例图：f(x) = x² 在 [−1, 2] 上。端点与极小值比较后，最大值是 f(2) = 4，最小值是 f(0) = 0。",
        plot: {
          aria: "抛物线在闭区间负 1 到 2 上，比较两个端点和顶点",
          fn: (x) => x * x,
          xmin: -1.6, xmax: 2.5, ymin: -0.4, ymax: 5,
          xTicks: [-1, 1, 2], yTicks: [1, 4],
          guides: [{ x1: -1, y1: 0, x2: -1, y2: 1 }, { x1: 2, y1: 0, x2: 2, y2: 4 }],
          points: [{ x: -1, y: 1, text: "端点 1", dx: -58, dy: -8 }, { x: 0, y: 0, text: "极小 0", dx: 8, dy: -8 }, { x: 2, y: 4, text: "端点 4", dx: 8, dy: -8 }]
        }
      },
      "sketch-cubic": {
        caption: "例图：草图先标升降和极值。f(x) = x³ − 3x 的转折就是这两个极值点。",
        plot: {
          aria: "函数草图标出递增、递减、极大和极小",
          fn: (x) => x ** 3 - 3 * x,
          xmin: -2.2, xmax: 2.2, ymin: -3, ymax: 3,
          xTicks: [-1, 1], yTicks: [-2, 2],
          points: [{ x: -1, y: 2, text: "高点", dx: -36, dy: -8 }, { x: 1, y: -2, text: "低点", dx: 8, dy: 16 }, { x: 0, y: 0, text: "过原点", dx: 8, dy: -8 }]
        }
      },
      "two-tangents": {
        caption: "例图：过点 P(0, −1) 可以向 y = x² 作两条切线，切点是 (−1, 1) 和 (1, 1)。",
        plot: {
          aria: "抛物线外一点引出两条切线",
          fn: (x) => x * x,
          xmin: -2, xmax: 2, ymin: -1.6, ymax: 4,
          xTicks: [-1, 1], yTicks: [1],
          lines: [{ fn: (x) => 2 * x - 1 }, { fn: (x) => -2 * x - 1 }],
          points: [{ x: 0, y: -1, text: "P", dx: 8, dy: 4 }, { x: -1, y: 1, text: "切点", dx: -40, dy: -8 }, { x: 1, y: 1, text: "切点", dx: 8, dy: -8 }]
        }
      },
      "extreme-pair": {
        caption: "例图：f(x) = x³ − 3x 有一个极大值和一个极小值。参数若改变 f' = 0 的根，极值的个数会跟着变。",
        plot: {
          aria: "一条曲线有一个极大值和一个极小值",
          fn: (x) => x ** 3 - 3 * x,
          xmin: -2.2, xmax: 2.2, ymin: -3, ymax: 3,
          xTicks: [-1, 1], yTicks: [2, -2],
          points: [{ x: -1, y: 2, text: "极大值 2", dx: -78, dy: -8 }, { x: 1, y: -2, text: "极小值 −2", dx: 8, dy: 18 }]
        }
      },
      "three-roots": {
        caption: "例图：y = x³ − x 与 x 轴交于 −1、0、1。方程 x³ − x = 0 就有这三个实根。",
        plot: {
          aria: "曲线三次穿过 x 轴",
          fn: (x) => x ** 3 - x,
          xmin: -1.8, xmax: 1.8, ymin: -1.2, ymax: 1.2,
          xTicks: [-1, 1], yTicks: [0.5, -0.5],
          points: [{ x: -1, y: 0, text: "−1", dx: -16, dy: 18 }, { x: 0, y: 0, text: "0", dx: 8, dy: -8 }, { x: 1, y: 0, text: "1", dx: 8, dy: 18 }]
        }
      },
      "above-axis": {
        caption: "例图：h(x) = x² + 1 的最小值是 1，已经大于 0，所以 h(x) > 0 成立。",
        plot: {
          aria: "抛物线整个位于 x 轴上方，最低点是 1",
          fn: (x) => x * x + 1,
          xmin: -2, xmax: 2, ymin: 0, ymax: 5,
          xTicks: [-1, 1], yTicks: [1],
          points: [{ x: 0, y: 1, text: "最小 1", dx: 8, dy: -8 }],
          note: ["最小值 ≥ 0", "不等式成立"]
        }
      },
      "dip-below": {
        caption: "例图：f(x) = x² − 1 的最小值是 −1。它小于 0，所以 f(x) ≥ 0 不能恒成立；但确实存在 x 使 f(x) ≤ 0。",
        plot: {
          aria: "抛物线有一部分落到 x 轴下面，最低点是 -1",
          fn: (x) => x * x - 1,
          xmin: -2, xmax: 2, ymin: -1.6, ymax: 3,
          xTicks: [-1, 1], yTicks: [1],
          points: [{ x: 0, y: -1, text: "最小 −1", dx: 8, dy: 16 }],
          note: ["最小值 < 0", "不能恒 ≥ 0", "但存在 ≤ 0"]
        }
      },
      "area-max": {
        caption: "例图：邻边之和为 10 时，面积 A = x(10 − x)。x = 5 时面积最大，是 25。",
        plot: {
          aria: "开口向下的抛物线在 x 等于 5 处取得最大值 25",
          fn: (x) => x * (10 - x),
          xmin: 0, xmax: 10, ymin: 0, ymax: 30,
          xTicks: [5], yTicks: [25],
          points: [{ x: 5, y: 25, text: "最大 25", dx: 8, dy: 16 }],
          note: ["定义域 (0, 10)", "x = 5 取最大"]
        }
      },
      "sign-table": {
        caption: "例图：压轴题先整理出这样一张符号表，再谈单调、极值和参数范围。",
        kind: "table",
        aria: "导数符号表，负一到一之间递减，两侧递增",
        cols: ["", "(−∞, −1)", "−1", "(−1, 1)", "1", "(1, +∞)"],
        rows: [["f'", "+", "0", "−", "0", "+"], ["f", "递增", "极大", "递减", "极小", "递增"]]
      },
      "move-term": {
        caption: "例图：x + 3 = 5 两边同时减去 3，得到 x = 2。符号改变，是因为做了同一种运算。",
        kind: "steps",
        aria: "等式两边同时减去 3",
        steps: ["x + 3 = 5", "两边同时减去 3", "x = 2"]
      }
    };
    const figure = figures[id];
    if (!figure) return "";
    const svg = figure.plot ? drawPlot(figure.plot) : drawSheet(figure);
    return `<figure class="diagram"><div class="diagram-frame">${svg}</div><figcaption>${esc(figure.caption)}</figcaption></figure>`;
  }

  function boostFigure() {
    const svg = `<svg viewBox="0 0 760 300" role="img" aria-label="升压斩波电路：电源、电感、开关管、二极管、电容和负载">
      <line x1="78" y1="64" x2="78" y2="236" stroke="#101110" stroke-width="1.6"/>
      <circle cx="78" cy="150" r="24" fill="#e8e8e2" stroke="#101110" stroke-width="1.6"/>
      <circle cx="78" cy="150" r="10" fill="#101110"/>
      <text x="40" y="155" fill="#101110" font-size="16">E</text>
      <text x="92" y="92" fill="#101110" font-size="14">+</text>
      <text x="92" y="228" fill="#101110" font-size="16">−</text>
      <line x1="78" y1="64" x2="150" y2="64" stroke="#101110" stroke-width="1.6"/>
      <path d="M150,64 a14,14 0 0 0 28,0 a14,14 0 0 0 28,0 a14,14 0 0 0 28,0 a14,14 0 0 0 28,0 a14,14 0 0 0 28,0" fill="none" stroke="#101110" stroke-width="1.6"/>
      <text x="196" y="108" fill="#4a6a7a" font-size="14">L</text>
      <line x1="168" y1="36" x2="250" y2="36" stroke="#14d0d0" stroke-width="1.6"/>
      <polygon points="250,36 240,31 240,41" fill="#14d0d0"/>
      <text x="188" y="28" fill="#14d0d0" font-size="13">iₗ</text>
      <line x1="290" y1="64" x2="360" y2="64" stroke="#101110" stroke-width="1.6"/>
      <line x1="360" y1="64" x2="360" y2="118" stroke="#101110" stroke-width="1.6"/>
      <line x1="336" y1="124" x2="336" y2="192" stroke="#101110" stroke-width="1.6"/>
      <line x1="360" y1="118" x2="360" y2="198" stroke="#101110" stroke-width="1.6" stroke-dasharray="5 3"/>
      <line x1="336" y1="136" x2="356" y2="136" stroke="#101110" stroke-width="1.6"/>
      <line x1="336" y1="158" x2="356" y2="158" stroke="#101110" stroke-width="1.6"/>
      <line x1="336" y1="180" x2="356" y2="180" stroke="#101110" stroke-width="1.6"/>
      <polygon points="352,206 360,190 368,206" fill="#101110"/>
      <line x1="360" y1="206" x2="360" y2="236" stroke="#101110" stroke-width="1.6"/>
      <text x="292" y="168" fill="#101110" font-size="14">VT</text>
      <line x1="360" y1="64" x2="430" y2="64" stroke="#101110" stroke-width="1.6"/>
      <polygon points="430,52 430,76 458,64" fill="none" stroke="#101110" stroke-width="1.6"/>
      <line x1="462" y1="50" x2="462" y2="78" stroke="#101110" stroke-width="1.6"/>
      <text x="432" y="44" fill="#101110" font-size="14">VD</text>
      <line x1="462" y1="64" x2="560" y2="64" stroke="#101110" stroke-width="1.6"/>
      <line x1="560" y1="64" x2="560" y2="142" stroke="#101110" stroke-width="1.6"/>
      <line x1="544" y1="142" x2="576" y2="142" stroke="#101110" stroke-width="1.6"/>
      <line x1="544" y1="156" x2="576" y2="156" stroke="#101110" stroke-width="1.6"/>
      <line x1="560" y1="156" x2="560" y2="236" stroke="#101110" stroke-width="1.6"/>
      <text x="582" y="156" fill="#101110" font-size="14">C</text>
      <line x1="560" y1="64" x2="640" y2="64" stroke="#101110" stroke-width="1.6"/>
      <polyline points="640,64 640,108 626,122 654,138 626,154 654,170 626,186 640,200 640,236" fill="none" stroke="#101110" stroke-width="1.6"/>
      <text x="660" y="156" fill="#101110" font-size="14">R</text>
      <line x1="78" y1="236" x2="640" y2="236" stroke="#101110" stroke-width="1.6"/>
      <line x1="708" y1="214" x2="708" y2="96" stroke="#101110" stroke-width="1.6"/>
      <polygon points="708,84 702,98 714,98" fill="#101110"/>
      <text x="718" y="96" fill="#101110" font-size="14">+</text>
      <text x="718" y="222" fill="#101110" font-size="16">−</text>
      <text x="724" y="160" fill="#101110" font-size="14">Uₒ</text>
      <circle cx="360" cy="64" r="3.2" fill="#101110"/>
      <circle cx="360" cy="236" r="3.2" fill="#101110"/>
      <circle cx="560" cy="64" r="3.2" fill="#101110"/>
      <circle cx="560" cy="236" r="3.2" fill="#101110"/>
      <circle cx="640" cy="64" r="3.2" fill="#101110"/>
      <circle cx="640" cy="236" r="3.2" fill="#101110"/>
    </svg>`;
    return `<figure class="diagram"><div class="diagram-frame">${svg}</div><figcaption>升压斩波主电路。电感与输入串联，开关管并在电感之后，二极管通向负载。</figcaption></figure>`;
  }

  function renderBlocks(blocks) {
    return blocks.map((block) => {
      if (block.type === "h") return `<h2>${esc(block.text)}</h2>`;
      if (block.type === "note") return `<p class="callout">${esc(block.text)}</p>`;
      if (block.type === "formula") return `<p class="formula">${esc(block.text)}</p>`;
      if (block.type === "figure") return renderFigure(block.id);
      if (block.type === "table") {
        const head = block.headers.map((cell) => `<th>${esc(cell)}</th>`).join("");
        const body = block.rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("");
        return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
      }
      if (block.type === "list") return `<ul>${block.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
      return `<p>${esc(block.text)}</p>`;
    }).join("");
  }

  function renderReader(courseId, lessonId) {
    const course = findCourse(courseId);
    const lessons = course ? lessonsOf(course) : [];
    const index = lessons.findIndex((lesson) => lesson.id === lessonId);
    if (!course || index < 0) return missing();
    const lesson = lessons[index];
    const unit = unitOf(course, lessonId);
    const key = lessonKey(course.id, lesson.id);
    const store = load();
    store.last = key;
    save(store);
    const picked = state.quiz[key];
    const answered = picked !== undefined;
    const correct = answered && picked === lesson.quiz.answer;
    const prev = lessons[index - 1];
    const next = lessons[index + 1];
    const choices = lesson.quiz.choices.map((choice, choiceIndex) => {
      let cls = "choice";
      if (answered) {
        if (choiceIndex === lesson.quiz.answer && correct) cls += " good";
        else if (choiceIndex === picked) cls += " bad";
      }
      return `<button class="${cls}" type="button" data-quiz="${esc(key)}" data-choice="${choiceIndex}" ${answered ? "disabled" : ""}>${esc(choice)}</button>`;
    }).join("");
    let feedback = "";
    if (answered) {
      feedback = `<p class="feedback ${correct ? "good" : "bad"}">${correct ? "记入完成。" : "这一问先停住。回到正文里标出的那一句，再答一次。"} ${esc(lesson.quiz.why)}</p>${correct ? "" : `<button class="btn ghost" type="button" data-retry="${esc(key)}" style="margin-top:12px">再答一次</button>`}`;
    }
    return `
      <p class="crumb"><a href="#/course/${course.id}">${esc(course.title)}</a> / ${esc(unit.title)} / ${esc(lesson.title)}</p>
      <div class="reader">
        <aside class="outline" aria-label="本课目录">
          ${unitsOf(course).map((item) => `
            <p class="outline-unit">${esc(item.title)}</p>
            ${item.lessons.map((entry) => `
              <a href="#/read/${course.id}/${entry.id}" ${entry.id === lesson.id ? 'aria-current="true"' : ""}>${esc(entry.title)}</a>
            `).join("")}
          `).join("")}
        </aside>
        <article class="prose">
          <p class="kicker"><i class="sq" aria-hidden="true"></i>${esc(unit.title)} · ${lesson.minutes} 分钟</p>
          <h1>${esc(lesson.title)}</h1>
          <div style="height:16px"></div>
          ${renderBlocks(lesson.blocks)}
          <section class="quiz" aria-label="课后一问">
            <h2>课后一问</h2>
            <p>${esc(lesson.quiz.prompt)}</p>
            <div class="choices">${choices}</div>
            ${feedback}
          </section>
          <div class="pager">
            ${prev ? `<a class="btn ghost" href="#/read/${course.id}/${prev.id}">上一讲</a>` : "<span></span>"}
            ${next ? `<a class="btn" href="#/read/${course.id}/${next.id}">下一讲</a>` : `<a class="btn" href="#/course/${course.id}">返回课程</a>`}
          </div>
        </article>
      </div>`;
  }

  function renderLibrary() {
    const { store } = progress();
    return `
      <p class="kicker"><i class="sq" aria-hidden="true"></i>书库</p>
      <h1>短记不代替课程，只帮你记住版式和习惯。</h1>
      <p class="lede">这些篇目可以单独读。点进一篇后，可以把它留在本机。</p>
      <div class="row-list" style="margin-top:22px">
        ${DATA.notes.map((note) => `
          <a href="#/note/${note.id}">
            <span class="num">${note.index}</span>
            <span>${esc(note.title)}</span>
            <span class="done-flag ${store.saved[note.id] ? "on" : ""}"><i></i>${store.saved[note.id] ? "已留下" : note.minutes + " 分钟"}</span>
          </a>`).join("")}
      </div>`;
  }

  function renderNote(id) {
    const note = findNote(id);
    if (!note) return missing();
    const store = load();
    const on = Boolean(store.saved[id]);
    return `
      <p class="crumb"><a href="#/library">书库</a> / ${note.index}</p>
      <article class="prose" style="max-width:var(--measure)">
        <p class="kicker"><i class="sq" aria-hidden="true"></i>${note.minutes} 分钟</p>
        <h1>${esc(note.title)}</h1>
        <p style="margin-top:18px">${esc(note.text)}</p>
        <div class="hero-actions">
          <button class="btn" type="button" data-save="${esc(note.id)}">${on ? "已留在本机" : "留在本机"}</button>
          <a class="btn ghost" href="#/library">返回书库</a>
        </div>
      </article>`;
  }

  function renderMethod() {
    return `
      <p class="kicker"><i class="sq" aria-hidden="true"></i>学规</p>
      <h1>科学院只规定很少的几件事。</h1>
      <div class="split">
        <div class="prose">
          <h2>怎么学</h2>
          <p>一天一讲就够。先读正文，再答最后一问。答错就回到标出的那一句，不要立刻重选碰运气。答对之后，到生活里找一个对得上的例子。</p>
          <h2>记在哪里</h2>
          <p>完成状态和书库标记写在这台浏览器的本地存储里，不上传，也不会跟着换浏览器走。清掉站点数据，进度会一起消失。</p>
          <h2>版面</h2>
          <p>纸色 #e8e8e2，文字 #101110，分割用 #d4d4ce。青用于动作和进度，黄只做小角标，红只做提醒。所有按钮、卡片和输入框都是直角。</p>
          <p class="seal">若一页需要很多颜色才显得重要，那一页还没有写清楚。</p>
        </div>
        <aside class="aside-note">
          <p class="index-no">六科</p>
          <h2>语文、数学、英语、物理、化学、生物</h2>
          <p>先选学科，再读那一科的讲义。每讲末尾有一问，答对才记完成。</p>
          <a class="btn" href="#/courses" style="margin-top:18px">去选择学科</a>
        </aside>
      </div>`;
  }

  function missing() {
    return `
      <h1>这一页没有对应的内容。</h1>
      <p class="lede">链接可能写错了。回到课程目录即可。</p>
      <a class="btn" href="#/courses">返回课程</a>`;
  }

  function render(options) {
    const route = parseRoute();
    const name = route.name;
    let body = renderHome();
    if (name === "courses") body = renderCourses();
    else if (name === "extend") body = route.parts[1] ? renderExtendSubject(route.parts[1]) : renderExtend();
    else if (name === "course") body = renderCourse(route.parts[1]);
    else if (name === "read") body = renderReader(route.parts[1], route.parts[2]);
    else if (name === "library") body = renderLibrary();
    else if (name === "note") body = renderNote(route.parts[1]);
    else if (name === "method") body = renderMethod();
    else if (name !== "home") body = missing();
    app.innerHTML = shell(name === "read" || name === "course" ? name : name, body);
    const input = document.querySelector("#q");
    if (input && document.activeElement !== input && state.keepFocus) {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
      state.keepFocus = false;
    }
    if (!options || options.scroll !== false) window.scrollTo(0, 0);
    mountLivePlots();
  }

  let liveDrag = null;

  function secantFromPointer(svg, clientX, clientY) {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(matrix.inverse());
    const x = (local.x - 48) / (500 - 48) * 4;
    return Math.max(0.35, Math.min(3.65, x));
  }

  function pointerDataX(svg, clientX, clientY) {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(matrix.inverse());
    const xmin = Number(svg.dataset.xmin);
    const xmax = Number(svg.dataset.xmax);
    const span = xmax - xmin;
    return xmin + (local.x - 48) / (Number(svg.dataset.r) - 48) * span;
  }

  document.body.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".live-plot .handle");
    if (!handle) return;
    event.preventDefault();
    const svg = handle.closest("svg");
    try { svg.setPointerCapture(event.pointerId); } catch (error) { /* synthetic events have no capture */ }
    liveDrag = { svg, end: handle.dataset.end, pointerId: event.pointerId };
    svg.classList.add("dragging");
  });

  document.body.addEventListener("pointermove", (event) => {
    if (!liveDrag || event.pointerId !== liveDrag.pointerId) return;
    const svg = liveDrag.svg;
    const kind = svg.dataset.kind || "secant";
    if (kind === "secant") {
      let x = secantFromPointer(svg, event.clientX, event.clientY);
      if (x == null) return;
      let a = Number(svg.dataset.a);
      let b = Number(svg.dataset.b);
      const other = liveDrag.end === "a" ? b : a;
      if (Math.abs(x - other) < 0.25) x = other + (x < other ? -0.25 : 0.25);
      x = Math.max(0.35, Math.min(3.65, x));
      if (Math.abs(x - other) < 0.25) return;
      if (liveDrag.end === "a") a = x;
      else b = x;
      svg.dataset.a = String(a);
      svg.dataset.b = String(b);
      paintSecant(svg);
      return;
    }
    let x = pointerDataX(svg, event.clientX, event.clientY);
    if (x == null) return;
    if (kind === "instant") {
      x = Math.max(0.4, Math.min(3, x));
      svg.dataset.b = String(x);
      paintInstant(svg);
    } else if (kind === "cusp") {
      x = Math.max(-1.85, Math.min(1.85, x));
      if (Math.abs(x) < 0.12) x = x < 0 ? -0.12 : 0.12;
      svg.dataset.x = String(x);
      paintCusp(svg);
    } else if (kind === "slope") {
      x = Math.max(-1.7, Math.min(1.7, x));
      svg.dataset.x = String(x);
      paintSlope(svg);
    }
  });

  document.body.addEventListener("pointerup", (event) => {
    if (!liveDrag || event.pointerId !== liveDrag.pointerId) return;
    liveDrag.svg.classList.remove("dragging");
    liveDrag = null;
  });

  document.body.addEventListener("pointercancel", (event) => {
    if (!liveDrag || event.pointerId !== liveDrag.pointerId) return;
    liveDrag.svg.classList.remove("dragging");
    liveDrag = null;
  });

  document.body.addEventListener("click", (event) => {
    const toggle = event.target.closest("#navToggle");
    if (toggle) {
      const menu = document.querySelector("#siteNav");
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
      return;
    }
    const filter = event.target.closest("[data-filter]");
    if (filter) {
      state.filter = filter.getAttribute("data-filter");
      render({ scroll: false });
      return;
    }
    const quiz = event.target.closest("[data-quiz]");
    if (quiz) {
      const key = quiz.getAttribute("data-quiz");
      const choice = Number(quiz.getAttribute("data-choice"));
      const [courseId, lessonId] = key.split("/");
      const course = findCourse(courseId);
      const lesson = course && lessonsOf(course).find((item) => item.id === lessonId);
      if (!lesson || state.quiz[key] !== undefined) return;
      state.quiz[key] = choice;
      if (choice === lesson.quiz.answer) {
        const store = load();
        store.done[key] = 1;
        store.last = key;
        save(store);
      }
      render({ scroll: false });
      return;
    }
    const retry = event.target.closest("[data-retry]");
    if (retry) {
      delete state.quiz[retry.getAttribute("data-retry")];
      render({ scroll: false });
      return;
    }
    const saveBtn = event.target.closest("[data-save]");
    if (saveBtn) {
      const id = saveBtn.getAttribute("data-save");
      const store = load();
      store.saved[id] = 1;
      save(store);
      render({ scroll: false });
    }
  });

  document.body.addEventListener("submit", (event) => {
    if (event.target.classList && event.target.classList.contains("search")) {
      event.preventDefault();
    }
  });

  document.body.addEventListener("input", (event) => {
    if (event.target.id === "q") {
      state.query = event.target.value;
      state.keepFocus = true;
      render({ scroll: false });
    }
  });

  window.addEventListener("hashchange", render);
  render();
})();
