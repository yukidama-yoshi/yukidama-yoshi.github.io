document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // 1. サイドバーの読み込みとスタイル定義
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;
      applyGlobalStyles(); // スタイル適用関数を呼び出し
      
      // リンクの非同期遷移設定
      setupNavigation();
      loadSidebarCounter();
    });

  // スタイルを一括定義・強制適用する関数
  function applyGlobalStyles() {
    // 既存のJS注入スタイルがあれば削除して重複を防ぐ
    const oldStyle = document.getElementById('dynamic-sidebar-style');
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = 'dynamic-sidebar-style';
    style.textContent = `
      /* 全ての ::before を一旦リセット（!importantで残留スタイルをねじ伏せる） */
      ::before, .sidebar a::before, .main a::before { 
        content: none !important; 
      }

      /* サイドバーのリンク設定 */
      .sidebar a {
        display: flex !important;
        align-items: center !important;
        margin-bottom: 12px !important;
        color: blue !important;
        text-decoration: none !important;
        font-weight: bold !important;
      }

      /* サイドバー内の特定のクラスだけに丸を復活 */
      .sidebar a.menu-link::before {
        content: "" !important;
        display: inline-block !important;
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        background-color: #999 !important;
        margin-right: 8px !important;
      }

      /* メインコンテンツ内のリンクは絶対に丸を出さない設定を上書き */
      .main a::before, .main a.link::before {
        content: none !important;
      }

      /* その他レイアウト */
      .center-layout { margin: 0 auto !important; display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center; }
      #sidebar-logo { display: block !important; margin-bottom: 20px; text-align: center; }
      #sidebar-logo img { width: 160px; height: auto; }
      #sidebar-counter-display img { height: 24px; width: auto; image-rendering: pixelated; margin: 0 -1px; }
      #sidebar-twitter-share { display: inline !important; font-weight: normal !important; color: #1da1f2 !important; }
    `;
    document.head.appendChild(style);
  }

  // ナビゲーション設定
  function setupNavigation() {
    sidebar.querySelectorAll('a').forEach(link => {
      if (link.hostname === window.location.hostname && link.id !== 'sidebar-logo') {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          changePage(link.getAttribute('href'));
        });
      }
    });
  }

  // ページ書き換え関数（クリーンアップ機能付き）
  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const newMainContent = doc.querySelector('.main').innerHTML;
      mainArea.innerHTML = newMainContent;

      // URL更新
      window.history.pushState(null, '', url);
      mainArea.scrollTop = 0;

      // 【最重要】遷移後に再度スタイルを適用し直して、
      // 前のページから引き継がれた「オゾマシイ丸」を強制除菌する
      applyGlobalStyles();

    } catch (err) {
      window.location.href = url;
    }
  }

  window.addEventListener('popstate', () => {
    changePage(window.location.pathname);
  });
});

/**
 * カウンター処理
 */
async function loadSidebarCounter() {
  const displayArea = document.getElementById('sidebar-counter-display');
  const twitterLink = document.getElementById('sidebar-twitter-share');
  if (!displayArea) return;

  const WORKER_URL = 'https://dry-silence-4f1f.y-bb0.workers.dev';
  const IMAGE_PATH = 'akusesu_kaunta_moji_sozai/';
  const isAdmin = localStorage.getItem('is_admin_yukidama') === 'true';
  const isCounted = sessionStorage.getItem('has_counted_this_session');

  try {
    const shouldSkip = isAdmin || isCounted;
    const fetchUrl = shouldSkip ? `${WORKER_URL}?no-count=1` : WORKER_URL;
    const response = await fetch(fetchUrl);
    const data = await response.json();
    const countStr = String(data.count).padStart(6, '0');

    if (twitterLink) {
      const tweetText = `「ゆきだまのホームページ」でキリ番（${countStr}）を踏んだよ！\n${window.location.origin}${window.location.pathname}\n\n@yukidama_yoshi`;
      twitterLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    }

    if (!shouldSkip) sessionStorage.setItem('has_counted_this_session', 'true');

    displayArea.innerHTML = ''; 
    for (let char of countStr) {
      const img = document.createElement('img');
      img.src = `${IMAGE_PATH}${char}.png`;
      img.alt = char;
      displayArea.appendChild(img);
    }
  } catch (err) {
    displayArea.innerHTML = '<span style="color:#f00; font-size:10px;">ERR</span>';
  }
}
