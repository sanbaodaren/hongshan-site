/* ============================================================
   宏山科学院-铁一分部 · 共享脚本
   —— 导航注入 / 动效 / 各板块页面交互
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 导航数据 ---------- */
  var NAV_ITEMS = [
    { href: 'daily.html',    label: '每日一题' },
    { href: 'share.html',    label: '好题分享' },
    { href: 'members.html',  label: '成员资料' },
    { href: 'resources.html',label: '资源共享' },
    { href: 'knowledge.html',label: '拓展知识' },
    { href: 'methods.html',  label: '学习方法' }
  ];

  /* ---------- 等高线 / 水纹 装饰 SVG ---------- */
  var CONTOUR_SVG =
    '<svg class="contour" viewBox="0 0 1400 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<g fill="none" stroke="#c0c0b8" stroke-width="1.2">' +
    '<path d="M1030,120 C1090,70 1200,70 1260,115 C1315,155 1315,225 1260,265 C1200,310 1090,310 1030,265 C970,225 970,155 1030,120 Z"/>' +
    '<path d="M995,95 C1075,25 1215,25 1290,90 C1355,145 1355,235 1290,290 C1215,350 1075,350 995,285 C935,230 935,150 995,95 Z"/>' +
    '<path d="M960,70 C1060,-15 1230,-15 1320,65 C1395,130 1395,250 1320,315 C1230,390 1060,390 960,315 C890,250 890,130 960,70 Z"/>' +
    '<path d="M520,300 C560,265 620,262 655,295 C690,330 690,385 650,415 C600,455 520,445 500,400 C485,360 495,320 520,300 Z"/>' +
    '<path d="M470,275 C530,215 630,210 680,275 C725,330 730,400 700,440 C655,500 545,505 490,445 C445,395 440,320 470,275 Z"/>' +
    '</g></svg>';

  var WATER_SVG =
    '<svg class="waterline" viewBox="0 0 1200 18" preserveAspectRatio="none" aria-hidden="true">' +
    '<g fill="none" stroke="#8ab8b0" stroke-width="1">' +
    '<path d="M0 11 Q150 3 300 11 T600 11 T900 11 T1200 11" opacity=".7"/>' +
    '<path d="M0 15 Q150 7 300 15 T600 15 T900 15 T1200 15" opacity=".4"/>' +
    '</g></svg>';

  /* ---------- 头部 / 底部模板 ---------- */
  function buildHeader(current) {
    var links = NAV_ITEMS.map(function (n) {
      var active = (n.href === current) ? ' active' : '';
      return '<a class="nav-link' + active + '" href="' + n.href + '">' + n.label + '</a>';
    }).join('');
    return '' +
      '<header class="site-header">' +
        '<div class="container header-inner">' +
          '<div class="brand">' +
            '<a class="brand-mark" href="index.html">宏山科学院-铁一分部</a>' +
            '<span class="brand-sub">大炎天师府附属 · 铁一分部</span>' +
          '</div>' +
          '<nav class="site-nav" id="siteNav">' + links + '</nav>' +
          '<button class="nav-toggle" id="navToggle" aria-label="打开导航" aria-expanded="false">≡</button>' +
        '</div>' +
      '</header>';
  }

  function buildFooter() {
    return '' +
      '<footer class="site-footer">' +
        '<div class="container footer-inner">' +
          '<p>© 2026 宏山科学院-铁一分部 · 大炎天师府附属<span class="footer-ver"> · v1.0</span></p>' +
          '<span class="footer-dot" aria-hidden="true"></span>' +
          '<p class="footer-slogan">绿水青山 · 科学发展</p>' +
        '</div>' +
      '</footer>';
  }

  /* ---------- 初始化 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var path = location.pathname.split('/').pop() || 'index.html';
    var current = path;

    var headSlot = document.getElementById('headerSlot');
    if (headSlot) headSlot.innerHTML = buildHeader(current);

    var footSlot = document.getElementById('footerSlot');
    if (footSlot) footSlot.innerHTML = buildFooter();

    // 装饰：等高线 + 水纹
    document.querySelectorAll('[data-contour]').forEach(function (el) { el.innerHTML = CONTOUR_SVG; });
    document.querySelectorAll('[data-water]').forEach(function (el) { el.innerHTML = WATER_SVG; });

    // 汉堡菜单
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('siteNav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // 页面淡入
    var main = document.getElementById('pageMain');
    if (main) main.classList.add('page-fade');

    // 各板块页交互
    var page = document.body.getAttribute('data-page');
    if (page && window.PageInit && typeof window.PageInit[page] === 'function') {
      window.PageInit[page]();
    }
  });

  /* ============================================================
     各板块页交互定义
     ============================================================ */
  window.PageInit = window.PageInit || {};

  /* —— 每日一题 ——
     每条结构：{ no: 序号, date: '2026年8月29日', ds: '08.29', title: '标题',
                 q: '题目图片路径', a: ['解析1路径','解析2路径'], aType: 'img'|'pdf' } */
  window.DAILY_QUESTIONS = [
    { no: 14, date: '2026年8月29日', ds: '08.29', title: '双曲函数',
      q: 'assets/daily/26-08-29-q.png', a: ['assets/daily/26-08-29-a.pdf'], aType: 'pdf' },
    { no: 13, date: '2026年8月28日', ds: '08.28', title: '',
      q: 'assets/daily/26-08-28-q.png', a: ['assets/daily/26-08-28-a.pdf'], aType: 'pdf' },
    { no: 12, date: '2026年8月26日', ds: '08.26', title: '',
      q: 'assets/daily/26-08-26-q.jpg', a: ['assets/daily/26-08-26-a.jpg'], aType: 'img' },
    { no: 11, date: '2026年8月25日', ds: '08.25', title: '',
      q: 'assets/daily/26-08-25-q.jpg', a: ['assets/daily/26-08-25-a.jpg'], aType: 'img' },
    { no: 10, date: '2026年8月24日', ds: '08.24', title: '立体几何',
      q: 'assets/daily/26-08-24-q.jpg', a: ['assets/daily/26-08-24-a.jpg'], aType: 'img' },
    { no: 9, date: '2026年8月23日', ds: '08.23', title: '',
      q: 'assets/daily/26-08-23-q.jpg', a: ['assets/daily/26-08-23-a1.jpg', 'assets/daily/26-08-23-a2.jpg'], aType: 'img' },
    { no: 8, date: '2026年8月22日', ds: '08.22', title: '',
      q: 'assets/daily/26-08-22-q.png', a: ['assets/daily/26-08-22-a1.png', 'assets/daily/26-08-22-a2.png'], aType: 'img' },
    { no: 7, date: '2026年8月21日', ds: '08.21', title: '向量',
      q: 'assets/daily/26-08-21-q.jpg', a: ['assets/daily/26-08-21-a.jpg'], aType: 'img' },
    { no: 6, date: '2026年8月20日', ds: '08.20', title: '',
      q: 'assets/daily/26-08-20-q.jpg', a: ['assets/daily/26-08-20-a1.jpg', 'assets/daily/26-08-20-a2.jpg'], aType: 'img' },
    { no: 5, date: '2026年8月19日', ds: '08.19', title: '',
      q: 'assets/daily/26-08-19-q.png', a: ['assets/daily/26-08-19-a.png'], aType: 'img' },
    { no: 4, date: '2026年8月18日', ds: '08.18', title: '清华强基 · 单位根（一）',
      q: 'assets/daily/26-08-18-q.jpg', a: ['assets/daily/26-08-18-a.jpg'], aType: 'img' },
    { no: 3, date: '2026年8月17日', ds: '08.17', title: '清华强基',
      q: 'assets/daily/26-08-17-q.jpg', a: ['assets/daily/26-08-17-a.jpg'], aType: 'img' },
    { no: 2, date: '2026年8月16日', ds: '08.16', title: '双变量（二）',
      q: 'assets/daily/26-08-16-q.png', a: ['assets/daily/26-08-16-a.jpg'], aType: 'img' },
    { no: 1, date: '2026年8月15日', ds: '08.15', title: '双变量（一）',
      q: 'assets/daily/26-08-15-q.png', a: ['assets/daily/26-08-15-a.jpg'], aType: 'img' }
  ];

  PageInit.daily = function () {
    var data = window.DAILY_QUESTIONS || [];
    var qc = document.getElementById('qCount');
    if (qc) qc.textContent = data.length;
    var btn = document.getElementById('showAnswer');
    var ans = document.getElementById('qAnswer');
    var ansText = document.getElementById('qAnswerText');
    var qIndex = 0;

    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function render(i) {
      if (!data.length) return;
      var q = data[i];
      document.getElementById('qTitle').textContent = q.title || '每日一题';
      document.getElementById('qDate').textContent = q.date + ' · 第 ' + q.no + ' 题';

      var body = document.getElementById('qBody');
      if (q.q) {
        body.innerHTML = '<img class="q-img" src="' + q.q + '" alt="' + q.date + ' 题目">';
      } else {
        body.innerHTML = '<p class="q-missing">（该题暂无题目图片）</p>';
      }

      var answers = q.a || [];
      if (answers.length) {
        if (q.aType === 'pdf') {
          ansText.innerHTML = answers.map(function (p) {
            return '<a class="q-pdf" href="' + p + '" target="_blank" rel="noopener">▼ 查看解析 PDF（新窗口打开）</a>';
          }).join('');
        } else {
          ansText.innerHTML = answers.map(function (p) {
            return '<img class="q-img" src="' + p + '" alt="' + q.date + ' 解析">';
          }).join('');
        }
      } else {
        ansText.innerHTML = '<p class="q-missing">（该题暂无解析）</p>';
      }

      ans.hidden = true;
      if (btn) btn.textContent = '显示答案';
    }

    // 历史题目列表（与数据同步生成）
    var list = document.getElementById('historyList');
    if (list) {
      list.innerHTML = data.map(function (q, i) {
        return '<li><a href="#" data-index="' + i + '">' +
          '<span class="s-list-date">' + esc(q.ds) + '</span>' + esc(q.title || '每日一题') +
          '</a></li>';
      }).join('');
      list.addEventListener('click', function (e) {
        var t = e.target.closest('a[data-index]');
        if (t) {
          e.preventDefault();
          qIndex = +t.getAttribute('data-index');
          render(qIndex);
        }
      });
    }

    if (btn && ans) {
      btn.addEventListener('click', function () {
        ans.hidden = !ans.hidden;
        btn.textContent = ans.hidden ? '显示答案' : '隐藏答案';
      });
    }
    var next = document.getElementById('nextQuestion');
    if (next) {
      next.addEventListener('click', function () {
        qIndex = (qIndex + 1) % data.length;
        render(qIndex);
      });
    }

    render(0);
  };

  /* —— 好题分享 —— */
  PageInit.share = function () {
    document.querySelectorAll('.filter-bar .tag').forEach(function (tag) {
      tag.addEventListener('click', function () {
        document.querySelectorAll('.filter-bar .tag').forEach(function (t) { t.classList.remove('active'); });
        tag.classList.add('active');
        var cat = tag.getAttribute('data-cat');
        document.querySelectorAll('.share-card').forEach(function (card) {
          card.hidden = (cat !== 'all' && card.getAttribute('data-cat') !== cat);
        });
      });
    });
  };

  /* —— 成员资料 —— */
  PageInit.members = function () {
    var modal = document.getElementById('memberModal');
    if (!modal) return;
    var close = modal.querySelector('.modal-close');

    document.querySelectorAll('.member-card').forEach(function (card) {
      card.addEventListener('click', function () {
        modal.querySelector('.m-name').textContent = card.getAttribute('data-name');
        modal.querySelector('.m-avatar').textContent = card.getAttribute('data-name').slice(-2);
        modal.querySelector('.m-role').textContent = card.getAttribute('data-role');
        modal.querySelector('.m-bio').textContent = card.getAttribute('data-bio');
        var tags = (card.getAttribute('data-tags') || '').split(',');
        var box = modal.querySelector('.m-tags');
        box.innerHTML = tags.map(function (t) {
          return '<span class="tag">' + t + '</span>';
        }).join('');
        modal.classList.add('open');
      });
    });

    function closeModal() { modal.classList.remove('open'); }
    close.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  };

  /* —— 资源共享 —— */
  PageInit.resources = function () {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var cat = tab.getAttribute('data-cat');
        document.querySelectorAll('.file-row').forEach(function (row) {
          row.hidden = (cat !== 'all' && row.getAttribute('data-cat') !== cat);
        });
      });
    });
  };

  /* —— 拓展知识 —— */
  PageInit.knowledge = function () { /* 静态内容，无需脚本 */ };

  /* —— 学习方法 —— */
  PageInit.methods = function () {
    var input = document.getElementById('methodSearch');
    var cards = document.querySelectorAll('.method-card');
    var catFilter = 'all';

    function apply() {
      var kw = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var matchCat = (catFilter === 'all' || card.getAttribute('data-cat') === catFilter);
        var matchKw = kw === '' || (card.getAttribute('data-key') || '').toLowerCase().indexOf(kw) !== -1;
        card.hidden = !(matchCat && matchKw);
      });
    }

    if (input) input.addEventListener('input', apply);

    document.querySelectorAll('.method-toolbar .tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.method-toolbar .tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        catFilter = tab.getAttribute('data-cat');
        apply();
      });
    });
  };
})();
