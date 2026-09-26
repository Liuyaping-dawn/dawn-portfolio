/* ================= 作品页 · 弹窗播放器（B 站官方外链，关弹幕 / 不自播） =================
   用法 1（视频卡）：给卡片加 data-bv="BV号或完整链接" 即可点击弹窗播放，例：
   <li class="card" data-bv="https://www.bilibili.com/video/BV1xx411c7mD"> ... </li>
   竖版（9:16）源视频的卡片再加 data-orient="v"，弹窗会自动收窄成竖窗，画面不被压小。

   用法 2（外链卡 / 文档卡）：给卡片加 data-href="目标地址" 即可点击跳转；
   目标在站外时再加 data-target="_blank"，会在新标签页打开。
   <li class="card" data-href="https://example.com" data-target="_blank"> ... </li>
   <li class="card" data-href="doc-xxx.html"> ... </li> */
(function () {
  'use strict';

  /* 从任意形式的输入里取 BV 号 */
  function bvOf(v) {
    if (!v) return '';
    var m = String(v).match(/BV[a-zA-Z0-9]{10}/);
    return m ? m[0] : '';
  }

  var modal = null, frame = null, lastFocus = null;

  function build() {
    modal = document.createElement('div');
    modal.className = 'vmodal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="vmodal__backdrop" data-close></div>' +
      '<figure class="vmodal__box">' +
      '  <button class="vmodal__close" data-close type="button" aria-label="关闭播放器">&#215;</button>' +
      '  <div class="vmodal__player">' +
      '    <iframe class="vmodal__frame" src="about:blank" title="视频播放器" scrolling="no" frameborder="0" ' +
      'allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>' +
      '  </div>' +
      '  <figcaption class="vmodal__cap">' +
      '    <span class="vmodal__capT"></span>' +
      '    <a class="vmodal__open" target="_blank" rel="noopener">在哔哩哔哩打开 &#8599;</a>' +
      '  </figcaption>' +
      '</figure>';
    document.body.appendChild(modal);
    frame = modal.querySelector('.vmodal__frame');
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  function open(card) {
    if (!modal) build();
    var bv = bvOf(card.getAttribute('data-bv'));
    if (!bv) return;
    var t = card.querySelector('.t');
    frame.src = 'https://player.bilibili.com/player.html?bvid=' + bv +
      '&page=1&autoplay=0&danmaku=0&high_quality=1';
    /* 竖版源视频 → 弹窗切竖窗（只影响带 data-orient="v" 的卡片） */
    var vert = card.getAttribute('data-orient') === 'v';
    modal.querySelector('.vmodal__box').classList.toggle('is-vert', vert);
    modal.querySelector('.vmodal__capT').textContent = t ? t.textContent : '';
    modal.querySelector('.vmodal__open').href = 'https://www.bilibili.com/video/' + bv;
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    document.documentElement.classList.add('vmodal-lock');
    modal.querySelector('.vmodal__close').focus();
  }

  function close() {
    if (!modal || !modal.classList.contains('is-open')) return;
    frame.src = 'about:blank';                    /* 摘掉源，立即停止播放 */
    modal.classList.remove('is-open');
    document.documentElement.classList.remove('vmodal-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* 事件委托：现在和将来加 data-bv / data-href 的卡片都自动生效 */
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.card[data-bv]');
    if (card) { e.preventDefault(); open(card); return; }
    var link = e.target.closest('.card[data-href]');
    if (!link) return;
    var href = link.getAttribute('data-href');
    if (!href) return;
    if (link.getAttribute('data-target') === '_blank') {
      var w = window.open(href, '_blank');   /* 站外链接 → 新标签页，并断开 opener */
      if (w) w.opener = null;
    } else {
      window.location.href = href;           /* 站内页面（如文档阅读页）→ 同标签跳转 */
    }
  });
})();
