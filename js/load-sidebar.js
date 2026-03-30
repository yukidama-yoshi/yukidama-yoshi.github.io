document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // 1. サイドバーのHTMLを読み込む
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;

      // 2. スタイルを一括適用（ここで暴走を食い止める）
      const style = document.createElement('style');
      style.textContent = `
        /* すべてのリンクの丸印を一旦リセット */
        .sidebar a::before, .main a::before { content: none !important; }

        /* 「menu-link」クラスがついたメニュー項目だけ丸印を出す */
        .menu-link {
          display: flex !important;
          align-items: center;
          margin-bottom: 12px;
          color: blue;
          text-decoration: none;
          font-weight: bold;
          padding: 6px 0;
        }
        .menu-link::before {
          content: "" !important;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #999;
          margin-right: 8px;
        }

        /* 中央揃え用のクラス（indexやprofileで使用） */
        .center-layout {
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          width: 100% !important;
          text-align: center;
        }

        /* カウンター画像のドットをパキッとさせる */
        #sidebar-counter-display img { 
          height: 24px; 
          width: auto; 
          image-rendering: pixelated; 
          margin: 0 -1px; 
        }

        /* キリ番報告リンクの微調整 */
        #sidebar-twitter-share { 
          display: inline !important; 
          padding: 0 !important; 
          color: #1da1f2 !important; 
          font-weight: normal !important;
        }
      `;
      document.head.appendChild(style);

      // 3. ロゴの表示調整
      const logoLink = document.getElementById('sidebar-logo');
      if (logoLink) {
        Object.assign(logoLink.style, { display: 'block', padding: '0', marginBottom: '20px', textAlign: 'center' });
        const logoImg = logoLink.querySelector('img');
        if (logoImg) { logoImg.style.width = '160px'; logoImg.style.height = 'auto'; }
        logoLink.style.display = 'block';
      }

      // 4. 非同期遷移（中身だけ入れ替え）の設定
      sidebar.querySelectorAll('a').forEach(link => {
        // 内部リンクかつロゴ以外を対象
        if (link.hostname === window.location.hostname && link.id !== 'sidebar-logo') {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(link.getAttribute('href'));
          });
        }
      });

      // 5. カウンター起動
      loadSidebarCounter();
    })
    .catch(err => console.error("サイドバー読み込み失敗:", err));

  // ページ書き換え関数
  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMainContent = doc.querySelector('.main').innerHTML;

      // 中身を入れ替え
      mainArea.innerHTML = newMainContent;
      // URLを更新
      window.history.pushState(null, '', url);
      // 上にスクロール
      mainArea.scrollTop = 0;
    } catch (err) {
      window.location.href = url; // 失敗時は普通に飛ぶ
    }
  }

  // ブラウザの戻るボタン対応
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
