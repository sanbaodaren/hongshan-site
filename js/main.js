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

    // 各板块页：退出按钮（返回首页/桌面）
    var hero = document.querySelector('.page-hero');
    if (hero) {
      var exitBtn = document.createElement('a');
      exitBtn.className = 'btn btn-exit';
      exitBtn.href = 'index.html';
      exitBtn.textContent = '← 退出';
      exitBtn.title = '返回首页';
      exitBtn.setAttribute('aria-label', '返回首页');
      hero.appendChild(exitBtn);
    }

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
        var modalAv = modal.querySelector('.m-avatar');
        var avatarSrc = card.getAttribute('data-avatar');
        if (avatarSrc) {
          modalAv.innerHTML = '<img src="' + avatarSrc + '" alt="' + card.getAttribute('data-name') + '">';
        } else {
          modalAv.textContent = card.getAttribute('data-name').slice(0, 2);
        }
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

  /* —— 资源共享 ——
     流程：先选学科 → 再进对应资源的文件列表 */
  window.RESOURCE_FILES = {
  '数学': [
    { name: "2021-2026八省数学联考分类汇编 - 解析.pdf", file: "assets/resources/math/2021-2026八省数学联考分类汇编 - 解析.pdf", type: 'PDF', size: '9.9M' },
    { name: "专题---导数综合应用（培优重难专练）（解析版）.docx", file: "assets/resources/math/专题---导数综合应用（培优重难专练）（解析版）.docx", type: 'DOCX', size: '6.1M' },
    { name: "函数与导数1（60题）.docx", file: "assets/resources/math/函数与导数1（60题）.docx", type: 'DOCX', size: '4.1M' },
    { name: "函数与导数2（60题）.docx", file: "assets/resources/math/函数与导数2（60题）.docx", type: 'DOCX', size: '4.8M' },
    { name: "圆锥曲线基础知识篇(275页).pdf", file: "assets/resources/math/圆锥曲线基础知识篇(275页).pdf", type: 'PDF', size: '13.8M' },
    { name: "圆锥曲线技巧套路篇(223页).pdf", file: "assets/resources/math/圆锥曲线技巧套路篇(223页).pdf", type: 'PDF', size: '11.1M' },
    { name: "圆锥曲线极点极线篇(97页).pdf", file: "assets/resources/math/圆锥曲线极点极线篇(97页).pdf", type: 'PDF', size: '5.5M' },
    { name: "圆锥曲线（40道）（0.1）.docx", file: "assets/resources/math/圆锥曲线（40道）（0.1）.docx", type: 'DOCX', size: '10.1M' },
    { name: "导数强化研究1(2).docx", file: "assets/resources/math/导数强化研究1(2).docx", type: 'DOCX', size: '210K' },
    { name: "导数综合应用（培优重难专练）.pdf", file: "assets/resources/math/导数综合应用（培优重难专练）.pdf", type: 'PDF', size: '719K' },
    { name: "收心考----模拟卷_版.pdf", file: "assets/resources/math/收心考----模拟卷_版.pdf", type: 'PDF', size: '1.2M' },
    { name: "数学-140分重难点专题50讲之19 三角函数零点与恒成立问题四大题型汇总（原卷版）.pdf", file: "assets/resources/math/数学-140分重难点专题50讲之19 三角函数零点与恒成立问题四大题型汇总（原卷版）.pdf", type: 'PDF', size: '1.1M' },
    { name: "数学-全练一本通12本之第4本-三角函数.pdf", file: "assets/resources/math/数学-全练一本通12本之第4本-三角函数.pdf", type: 'PDF', size: '6.2M' },
    { name: "数学-王牌中学新高考知识总结.pdf", file: "assets/resources/math/数学-王牌中学新高考知识总结.pdf", type: 'PDF', size: '2.8M' },
    { name: "数学-衡水中学-复数与平面向量专题.pdf", file: "assets/resources/math/数学-衡水中学-复数与平面向量专题.pdf", type: 'PDF', size: '3.5M' },
    { name: "数学-衡水中学-平面向量的综合应用.pdf", file: "assets/resources/math/数学-衡水中学-平面向量的综合应用.pdf", type: 'PDF', size: '7.2M' },
    { name: "数学-高中数学培优讲义(1).pdf", file: "assets/resources/math/数学-高中数学培优讲义(1).pdf", type: 'PDF', size: '3.1M' },
    { name: "数学E1--E3--0320.pdf", file: "assets/resources/math/数学E1--E3--0320.pdf", type: 'PDF', size: '500K' },
    { name: "数学干货-2025届高考必做课本典型习题（解析版.5本合集）.pdf", file: "assets/resources/math/数学干货-2025届高考必做课本典型习题（解析版.5本合集）.pdf", type: 'PDF', size: '15.1M' },
    { name: "数学指南 _ 实用数学手册.pdf", file: "assets/resources/math/数学指南 _ 实用数学手册.pdf", type: 'PDF', size: '9M' },
    { name: "数学秘籍：高中数学知识方法典型题.pdf", file: "assets/resources/math/数学秘籍：高中数学知识方法典型题.pdf", type: 'PDF', size: '2.5M' },
    { name: "概率（40题）（0.1）.docx", file: "assets/resources/math/概率（40题）（0.1）.docx", type: 'DOCX', size: '4.2M' },
    { name: "模拟夯基练习1 .docx", file: "assets/resources/math/模拟夯基练习1 .docx", type: 'DOCX', size: '1.1M' },
    { name: "模拟夯基练习2.docx", file: "assets/resources/math/模拟夯基练习2.docx", type: 'DOCX', size: '1.2M' },
    { name: "模拟夯基练习3.docx", file: "assets/resources/math/模拟夯基练习3.docx", type: 'DOCX', size: '1.3M' },
    { name: "模拟夯基练习4.docx", file: "assets/resources/math/模拟夯基练习4.docx", type: 'DOCX', size: '1.8M' },
    { name: "模拟夯基练习6（教师版）.pdf", file: "assets/resources/math/模拟夯基练习6（教师版）.pdf", type: 'PDF', size: '800K' },
    { name: "狂练小题.pdf", file: "assets/resources/math/狂练小题.pdf", type: 'PDF', size: '2M' },
    { name: "狂练小题（一）（解析版）.docx", file: "assets/resources/math/狂练小题（一）（解析版）.docx", type: 'DOCX', size: '3.1M' },
    { name: "精品解析：浙江省杭州市临平区2026 年中考模拟检测数学试题卷（原卷版）.docx", file: "assets/resources/math/精品解析：浙江省杭州市临平区2026 年中考模拟检测数学试题卷（原卷版）.docx", type: 'DOCX', size: '1.4M' },
    { name: "阿波罗尼斯圆和蒙日圆的问题（学生版）.pdf", file: "assets/resources/math/阿波罗尼斯圆和蒙日圆的问题（学生版）.pdf", type: 'PDF', size: '1.5M' },
    { name: "（PDF）高中数学竞赛真题+强基计划真题专项训练.zip", file: "assets/resources/math/（PDF）高中数学竞赛真题+强基计划真题专项训练.zip", type: 'ZIP', size: '10.8M' }
  ],
  '化学': [
    { name: "2024高中化学基础知识必备完整-.docx", file: "assets/resources/chem/2024高中化学基础知识必备完整-.docx", type: 'DOCX', size: '90K' },
    { name: "反应原理高考真题日日练.pdf", file: "assets/resources/chem/反应原理高考真题日日练.pdf", type: 'PDF', size: '4.8M' },
    { name: "反应原理高考真题日日练答案页.pdf", file: "assets/resources/chem/反应原理高考真题日日练答案页.pdf", type: 'PDF', size: '1.6M' },
    { name: "工艺流程（6.9）.docx", file: "assets/resources/chem/工艺流程（6.9）.docx", type: 'DOCX', size: '26M' },
    { name: "水溶液30题（5.25）.docx", file: "assets/resources/chem/水溶液30题（5.25）.docx", type: 'DOCX', size: '7.4M' },
    { name: "（超详）高中化学知识点归纳汇总.pdf", file: "assets/resources/chem/（超详）高中化学知识点归纳汇总.pdf", type: 'PDF', size: '1.5M' }
  ],
  '生物': [
    { name: "2026年高考陕晋青宁卷生物高考真题（网络 收集版）（纯答案版）.docx", file: "assets/resources/bio/2026年高考陕晋青宁卷生物高考真题（网络 收集版）（纯答案版）.docx", type: 'DOCX', size: '48K' },
    { name: "人教版新教材必修1《分子与细胞》课后习题答案.docx", file: "assets/resources/bio/人教版新教材必修1《分子与细胞》课后习题答案.docx", type: 'DOCX', size: '749K' },
    { name: "基因工程40题（5.21）.docx", file: "assets/resources/bio/基因工程40题（5.21）.docx", type: 'DOCX', size: '19.5M' },
    { name: "生物-高一生物必修一复习提纲(精华版).pdf", file: "assets/resources/bio/生物-高一生物必修一复习提纲(精华版).pdf", type: 'PDF', size: '607K' },
    { name: "生物-高中生物214条课本黑体字知识.pdf", file: "assets/resources/bio/生物-高中生物214条课本黑体字知识.pdf", type: 'PDF', size: '990K' },
    { name: "生物练习1.docx", file: "assets/resources/bio/生物练习1.docx", type: 'DOCX', size: '2.2M' }
  ],
  '物理': [
    { name: "27-X-023C-物理DAz.pdf", file: "assets/resources/phys/27-X-023C-物理DAz.pdf", type: 'PDF', size: '1.4M' },
    { name: "27-X-023C-物理ZQ.pdf", file: "assets/resources/phys/27-X-023C-物理ZQ.pdf", type: 'PDF', size: '3M' },
    { name: "37 第19讲　动量守恒定律及其应用 (1).docx", file: "assets/resources/phys/37 第19讲　动量守恒定律及其应用 (1).docx", type: 'DOCX', size: '131K' },
    { name: "37 第19讲　动量守恒定律及其应用.docx", file: "assets/resources/phys/37 第19讲　动量守恒定律及其应用.docx", type: 'DOCX', size: '165K' },
    { name: "38 专题九　“子弹打木块”模型和“滑块—木板”模型 (1).docx", file: "assets/resources/phys/38 专题九　“子弹打木块”模型和“滑块—木板”模型 (1).docx", type: 'DOCX', size: '86K' },
    { name: "38 专题九　“子弹打木块”模型和“滑块—木板”模型.docx", file: "assets/resources/phys/38 专题九　“子弹打木块”模型和“滑块—木板”模型.docx", type: 'DOCX', size: '65K' },
    { name: "39 专题十    “滑块—曲面”模型和“滑块—弹簧”模型.docx", file: "assets/resources/phys/39 专题十    “滑块—曲面”模型和“滑块—弹簧”模型.docx", type: 'DOCX', size: '60K' },
    { name: "40 专题十一　动力学、能量、动量三大观点的综合应用.docx", file: "assets/resources/phys/40 专题十一　动力学、能量、动量三大观点的综合应用.docx", type: 'DOCX', size: '56K' },
    { name: "7动量专题练 学生版.docx", file: "assets/resources/phys/7动量专题练 学生版.docx", type: 'DOCX', size: '1007K' },
    { name: "7动量专题练.docx", file: "assets/resources/phys/7动量专题练.docx", type: 'DOCX', size: '2.1M' },
    { name: "8微专题：力学综合.docx", file: "assets/resources/phys/8微专题：力学综合.docx", type: 'DOCX', size: '4.1M' },
    { name: "牛顿定律强度训练(1).docx", file: "assets/resources/phys/牛顿定律强度训练(1).docx", type: 'DOCX', size: '2.3M' },
    { name: "物理-2025版高考物理大招技巧共四册之（三）（上）.pdf", file: "assets/resources/phys/物理-2025版高考物理大招技巧共四册之（三）（上）.pdf", type: 'PDF', size: '27.1M' },
    { name: "物理-2025版高考物理大招技巧共四册之（三）（下）.pdf", file: "assets/resources/phys/物理-2025版高考物理大招技巧共四册之（三）（下）.pdf", type: 'PDF', size: '28M' },
    { name: "物理-2025版高考物理大招技巧共四册之（四）（上）.pdf", file: "assets/resources/phys/物理-2025版高考物理大招技巧共四册之（四）（上）.pdf", type: 'PDF', size: '28.8M' },
    { name: "物理-2025版高考物理大招技巧共四册之（四）（下）.pdf", file: "assets/resources/phys/物理-2025版高考物理大招技巧共四册之（四）（下）.pdf", type: 'PDF', size: '25.7M' },
    { name: "物理-《2025解题觉醒》九门之物理（上下册之上册）.pdf", file: "assets/resources/phys/物理-《2025解题觉醒》九门之物理（上下册之上册）.pdf", type: 'PDF', size: '29.6M' },
    { name: "物理-高考物理三大板块专题训练.pdf", file: "assets/resources/phys/物理-高考物理三大板块专题训练.pdf", type: 'PDF', size: '2M' },
    { name: "物理学史50题（5.21）.docx", file: "assets/resources/phys/物理学史50题（5.21）.docx", type: 'DOCX', size: '779K' },
    { name: "物理模考卷.zip", file: "assets/resources/phys/物理模考卷.zip", type: 'ZIP', size: '9.8M' },
    { name: "电磁学压轴.docx", file: "assets/resources/phys/电磁学压轴.docx", type: 'DOCX', size: '15.6M' },
    { name: "电磁感应1含答案.docx", file: "assets/resources/phys/电磁感应1含答案.docx", type: 'DOCX', size: '978K' },
    { name: "电磁感应2含答案.docx", file: "assets/resources/phys/电磁感应2含答案.docx", type: 'DOCX', size: '796K' },
    { name: "第十二周高二大练考 （物理科目）.docx", file: "assets/resources/phys/第十二周高二大练考 （物理科目）.docx", type: 'DOCX', size: '481K' }
  ],
  '英语': [
    { name: "2019版人教版新课标高中英语选择性必修1词汇表（带音标单词表+带音标汉译英默写+无音标汉译英默写+英译汉默写）.pdf", file: "assets/resources/eng/2019版人教版新课标高中英语选择性必修1词汇表（带音标单词表+带音标汉译英默写+无音标汉译英默写+英译汉默写）.pdf", type: 'PDF', size: '545K' },
    { name: "Unit+1++Art+单词导纲+清单-2025-2026学年高中英语人教版（2019）选择性必修第三册.docx", file: "assets/resources/eng/Unit+1++Art+单词导纲+清单-2025-2026学年高中英语人教版（2019）选择性必修第三册.docx", type: 'DOCX', size: '73K' },
    { name: "【英语36】高中英语重点短语汇总 (1).pdf", file: "assets/resources/eng/【英语36】高中英语重点短语汇总 (1).pdf", type: 'PDF', size: '416K' },
    { name: "填空版-2019版人教版新课标高中英语选择性必修1词汇表（带音标单词表+带音标汉译英默写+无音标汉译英默写+英译汉默写） - 副本.pdf", file: "assets/resources/eng/填空版-2019版人教版新课标高中英语选择性必修1词汇表（带音标单词表+带音标汉译英默写+无音标汉译英默写+英译汉默写） - 副本.pdf", type: 'PDF', size: '515K' },
    { name: "英语4.1-4.3作业积累考点知识默写.pdf", file: "assets/resources/eng/英语4.1-4.3作业积累考点知识默写.pdf", type: 'PDF', size: '136K' },
    { name: "英语大练考 答案 515.docx", file: "assets/resources/eng/英语大练考 答案 515.docx", type: 'DOCX', size: '267K' },
    { name: "英语大练考题515.pdf", file: "assets/resources/eng/英语大练考题515.pdf", type: 'PDF', size: '257K' },
    { name: "读后续写英语作文纸.pdf", file: "assets/resources/eng/读后续写英语作文纸.pdf", type: 'PDF', size: '476K' }
  ],
  '语文': [
    { name: "2027届高二语文基础练习（四）参考答案.pdf", file: "assets/resources/chinese/2027届高二语文基础练习（四）参考答案.pdf", type: 'PDF', size: '215K' },
    { name: "基础练习（四）.pdf", file: "assets/resources/chinese/基础练习（四）.pdf", type: 'PDF', size: '493K' },
    { name: "寻找温暖 成为灯火 作文.doc", file: "assets/resources/chinese/寻找温暖 成为灯火 作文.doc", type: 'DOC', size: '22K' },
    { name: "梦的赠予.docx", file: "assets/resources/chinese/梦的赠予.docx", type: 'DOCX', size: '10K' },
    { name: "演出(阅读题).docx", file: "assets/resources/chinese/演出(阅读题).docx", type: 'DOCX', size: '21K' }
  ] };

  PageInit.resources = function () {
    var SUBJECTS = ['数学', '物理', '化学', '生物', '语文', '英语', '历史', '地理', '政治'];
    var subjectView = document.getElementById('subjectView');
    var listView = document.getElementById('listView');
    var grid = document.getElementById('subjectGrid');
    var fileList = document.getElementById('fileListBody');
    if (!subjectView || !listView || !grid) return;

    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function showList(subject) {
      var files = window.RESOURCE_FILES[subject] || [];
      document.getElementById('listTitle').textContent = subject;
      document.getElementById('listCount').textContent = files.length + ' 个资源';
      fileList.innerHTML = files.map(function (f) {
        return '<div class="file-row">' +
          '<a class="file-name" href="' + esc(f.file) + '" target="_blank" rel="noopener"><span class="file-ico">▤</span>' + esc(f.name) + '</a>' +
          '<span class="file-meta">' + esc(f.type) + ' · ' + esc(f.size) + '</span>' +
        '</div>';
      }).join('');
      subjectView.hidden = true;
      listView.hidden = false;
    }

    // 渲染学科选择卡片
    grid.innerHTML = SUBJECTS.map(function (s) {
      var count = (window.RESOURCE_FILES[s] || []).length;
      return '<button class="subject-card' + (count ? '' : ' empty') + '" data-subject="' + s + '">' +
        '<span class="sc-count">' + count + '</span>' +
        '<span class="sc-name">' + s + '</span>' +
        '<span class="sc-sub">' + (count ? count + ' 个资源' : '暂无资源') + '</span>' +
      '</button>';
    }).join('');

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.subject-card');
      if (!card || card.classList.contains('empty')) return;
      showList(card.getAttribute('data-subject'));
    });

    var back = document.getElementById('backToSubjects');
    if (back) {
      back.addEventListener('click', function () {
        listView.hidden = true;
        subjectView.hidden = false;
      });
    }
  };

  /* —— 拓展知识 —— */
  PageInit.knowledge = function () {
    var cloud = document.getElementById('tagCloud');
    if (!cloud) return;
    var cards = document.querySelectorAll('#articleList .article-card');
    var empty = document.getElementById('articleEmpty');
    cloud.querySelectorAll('.tag').forEach(function (tag) {
      tag.addEventListener('click', function () {
        cloud.querySelectorAll('.tag').forEach(function (t) { t.classList.remove('active'); });
        tag.classList.add('active');
        var cat = tag.getAttribute('data-cat');
        var shown = 0;
        cards.forEach(function (card) {
          var match = (cat === 'all' || card.getAttribute('data-cat') === cat);
          card.hidden = !match;
          if (match) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  };

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
