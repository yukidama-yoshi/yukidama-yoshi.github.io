document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // 1. サイドバーの読み込み
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;

      // 2. スタイルの一括定義（これが最強の優先順位になります）
      const style = document.createElement('style');
      style.textContent = `
        /* すべての ::before を一旦リセット */
        .sidebar a::before, .main a::before { content: none !important; }

        /* サイドバーのリンク基本設定 */
        .sidebar a {
          display: flex !important;
          align-items: center;
          margin-bottom: 12px;
          color: blue;
          text-decoration: none;
          font-weight: bold;
          padding: 6px 0;
        }

        /* menu-linkクラスがあるものだけに丸印を出す */
        .menu-link::before {
          content: "" !important;
          display: inline-block !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background-color: #999 !important;
          margin-right: 8px !important;
        }

        /* 中央揃え用のレイアウト（.center-layoutクラス用） */
        .center-layout {
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          width: 100% !important;
          text-align: center;
        }

        /* ロゴと報告リンクの除外設定 */
        #sidebar-logo::before, #sidebar-twitter-share::before { content: none !important; }
        #sidebar-twitter-share { display: inline !important; font-weight: normal !important; color: #1da1f2 !important; }
        
        /* カウンター画像 */
        #sidebar-counter-display img { height: 24px; width: auto; image-rendering: pixelated; margin: 0 -1px; }
      `;
      document.head.appendChild(style);

      // 3. ロゴ表示の強制上書き
      const logoLink = document.getElementById('sidebar-logo');
      if (logoLink) {
        Object.assign(logoLink.style, { display: 'block', padding: '0', marginBottom: '20px', textAlign: 'center' });
        const logoImg = logoLink.querySelector('img');
        if (logoImg) { logoImg.style.width = '160px'; logoImg.style.height = 'auto'; }
      }

      // 4. 非同期遷移（ページ内リンクの横取り）
      sidebar.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && link.id !== 'sidebar-logo') {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = link.getAttribute('href');
            changePage(targetUrl);
          });
        }
      });

      // 5. カウンター実行
      loadSidebarCounter();
    })
    .catch(err => console.error("Sidebar loading error:", err));

  // コンテンツ入れ替え関数
  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMainContent = doc.querySelector('.main').innerHTML;

      mainArea.innerHTML = newMainContent;
      window.history.pushState(null, '', url);
      mainArea.scrollTop = 0;
    } catch (err) {
      window.location.href = url;
    }
  }

  window.addEventListener('popstate', () => {
    changePage(window.location.pathname);
  });
});

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
      const tweetText = `「ゆきだまのホームページ」でキリ番（${countStr}）を踏んだよ！\\n${window.location.origin}${window.location.pathname}\\n\\n@yukidama_yoshi`;
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
