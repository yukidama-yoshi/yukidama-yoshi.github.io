document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // 1. サイドバーのHTMLを読み込む
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;
      
      // スタイルを適用（この関数の中でロゴの上の丸を狙い撃ちで消します）
      applyStrongStyle();
      
      // ナビゲーション（クリックイベント）の設定
      setupNavigation();
      
      // カウンターの起動
      loadSidebarCounter();
    });

  // スタイル定義：ここで「ロゴ」と「メインエリア」を丸印の禁止区域にします
  function applyStrongStyle() {
    const styleId = 'force-sidebar-style';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      /* [除菌] 全てのaタグの::beforeを一旦リセット */
      .main a::before, .sidebar a::before { 
        content: none !important; 
      }

      /* サイドバーのリンク共通設定 */
      .sidebar a {
        display: flex !important;
        align-items: center !important;
        text-decoration: none !important;
        margin-bottom: 12px !important;
        color: blue !important;
        font-weight: bold !important;
      }

      /* [復活] サイドバー内のmenu-linkだけに丸を出す */
      /* ただし、ロゴ(#sidebar-logo)には絶対に付けない */
      .sidebar a.menu-link:not(#sidebar-logo)::before {
        content: "" !important;
        display: inline-block !important;
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        background-color: #999 !important;
        margin-right: 8px !important;
      }

      /* ロゴ自体の表示設定 */
      #sidebar-logo { 
        display: block !important; 
        margin-bottom: 20px !important; 
        text-align: center !important; 
      }
      #sidebar-logo img { width: 160px; height: auto; }

      /* カウンター・報告リンク・中央揃え */
      #sidebar-counter-display img { height: 24px; width: auto; image-rendering: pixelated; margin: 0 -1px; }
      #sidebar-twitter-share { display: inline !important; font-weight: normal !important; color: #1da1f2 !important; }
      #sidebar-twitter-share::before { content: none !important; }
      .center-layout { margin: 0 auto !important; display: flex !important; flex-direction: column !important; align-items: center !important; width: 100% !important; text-align: center !important; }
    `;
  }

  // 内部リンクのクリックを横取りして中身だけ変える
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

  // ページ書き換え処理
  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      // メインコンテンツの中身を入れ替え
      const newContent = doc.querySelector('.main').innerHTML;
      mainArea.innerHTML = newContent;

      // URLを書き換えて、一番上までスクロール
      window.history.pushState(null, '', url);
      mainArea.scrollTop = 0;

      // 遷移後、改めてスタイルを適用して丸印の誤爆を防ぐ
      applyStrongStyle();
      
    } catch (err) {
      // エラー時は普通の遷移に切り替え
      window.location.href = url;
    }
  }

  window.onpopstate = () => changePage(window.location.pathname);
});

// カウンター処理（変更なし）
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
