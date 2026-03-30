document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // サイドバー読み込み
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;
      
      // 1. ページ全体のスタイルを強制リセット
      applyStrongStyle();
      
      // 2. ナビゲーション設定
      setupNavigation();
      loadSidebarCounter();
    });

  // 【最優先】スタイルを注入する関数
  function applyStrongStyle() {
    const styleId = 'force-sidebar-style';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    // ここで「.main a」に対して極めて強いリセットをかけます
    style.textContent = `
      /* ページ内のすべての疑似要素を一旦無効化 */
      .main a::before, .main a::after, .main li::before { 
        content: none !important; 
        display: none !important; 
      }

      /* サイドバーの基本設定 */
      .sidebar a {
        display: flex !important;
        align-items: center !important;
        text-decoration: none !important;
        margin-bottom: 12px !important;
        color: blue !important;
        font-weight: bold !important;
      }

      /* サイドバーの中の menu-link だけに丸を復活 */
      /* .sidebar を頭につけることで、メイン側への干渉を物理的に遮断します */
      .sidebar a.menu-link::before {
        content: "" !important;
        display: inline-block !important;
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        background-color: #999 !important;
        margin-right: 8px !important;
      }

      /* ロゴ・カウンター等の調整 */
      #sidebar-logo { display: block !important; margin-bottom: 20px; text-align: center; }
      #sidebar-logo img { width: 160px; height: auto; }
      #sidebar-counter-display img { height: 24px; width: auto; image-rendering: pixelated; margin: 0 -1px; }
      #sidebar-twitter-share { display: inline !important; font-weight: normal !important; color: #1da1f2 !important; }
      .center-layout { margin: 0 auto !important; display: flex !important; flex-direction: column !important; align-items: center !important; width: 100% !important; text-align: center !important; }
    `;
  }

  function setupNavigation() {
    sidebar.querySelectorAll('a').forEach(link => {
      if (link.hostname === window.location.hostname && link.id !== 'sidebar-logo') {
        link.onclick = (e) => {
          e.preventDefault();
          changePage(link.getAttribute('href'));
        };
      }
    });
  }

  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      // メインコンテンツの入れ替え
      mainArea.innerHTML = doc.querySelector('.main').innerHTML;
      window.history.pushState(null, '', url);
      mainArea.scrollTop = 0;

      // 【トドメ】入れ替え直後にスタイルを再適用
      applyStrongStyle();
      
    } catch (err) {
      window.location.href = url;
    }
  }

  window.onpopstate = () => changePage(window.location.pathname);
});

// カウンター（以前と同じ）
async function loadSidebarCounter() {
  const displayArea = document.getElementById('sidebar-counter-display');
  const twitterLink = document.getElementById('sidebar-twitter-share');
  if (!displayArea) return;
  const WORKER_URL = 'https://dry-silence-4f1f.y-bb0.workers.dev';
  try {
    const isAdmin = localStorage.getItem('is_admin_yukidama') === 'true';
    const isCounted = sessionStorage.getItem('has_counted_this_session');
    const response = await fetch((isAdmin || isCounted) ? `${WORKER_URL}?no-count=1` : WORKER_URL);
    const data = await response.json();
    const countStr = String(data.count).padStart(6, '0');
    if (twitterLink) {
      twitterLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`「ゆきだまのホームページ」でキリ番（${countStr}）を踏んだよ！\n${window.location.origin}${window.location.pathname}\n\n@yukidama_yoshi`)}`;
    }
    if (!isAdmin && !isCounted) sessionStorage.setItem('has_counted_this_session', 'true');
    displayArea.innerHTML = ''; 
    for (let char of countStr) {
      const img = document.createElement('img');
      img.src = `akusesu_kaunta_moji_sozai/${char}.png`;
      displayArea.appendChild(img);
    }
  } catch (err) { displayArea.innerHTML = 'ERR'; }
}
