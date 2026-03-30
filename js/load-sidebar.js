document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // 1. サイドバーのHTML（中身）を読み込む
  fetch('sidebar.html')
    .then(response => {
      if (!response.ok) throw new Error('サイドバーが見つかりません');
      return response.text();
    })
    .then(data => {
      sidebar.innerHTML = data;

      // 2. スタイルを注入（サイドバーの中身の装飾に特化）
      const style = document.createElement('style');
      style.textContent = `
        /* 【最優先】ページ全体の ::before（丸印）を一旦すべて強制消去 */
        /* これにより links.html 側の古い指定を上書きします */
        ::before, .sidebar a::before, .main a::before { 
          content: none !important; 
        }

        /* サイドバー内のリンク共通設定 */
        .sidebar a {
          display: flex !important;
          align-items: center !important;
          margin-bottom: 12px !important;
          color: blue !important;
          text-decoration: none !important;
          font-weight: bold !important;
          padding: 6px 0 !important;
        }

        /* 【重要】サイドバーの中の .menu-link クラスだけに丸を復活させる */
        /* .main（リンク集など）には絶対に影響を与えない書き方です */
        .sidebar a.menu-link::before {
          content: "" !important;
          display: inline-block !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background-color: #999 !important;
          margin-right: 8px !important;
        }

        /* カウンター・ロゴ・特殊リンクの設定 */
        #sidebar-logo { display: block !important; margin-bottom: 20px; text-align: center; }
        #sidebar-logo img { width: 160px; height: auto; }
        #sidebar-counter-display img { height: 24px; width: auto; image-rendering: pixelated; margin: 0 -1px; }
        #sidebar-twitter-share { display: inline !important; font-weight: normal !important; color: #1da1f2 !important; }
        
        /* 中央揃え用クラス */
        .center-layout { margin: 0 auto !important; display: flex !important; flex-direction: column !important; align-items: center !important; width: 100% !important; text-align: center !important; }
      `;
      document.head.appendChild(style);

      // 3. リンクの非同期遷移（SPA風動作）の設定
      sidebar.querySelectorAll('a').forEach(link => {
        // 内部リンクかつロゴ・ツイッター報告以外を対象
        if (link.hostname === window.location.hostname && 
            link.id !== 'sidebar-logo' && 
            link.id !== 'sidebar-twitter-share') {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(link.getAttribute('href'));
          });
        }
      });

      // 4. カウンター起動
      loadSidebarCounter();
    })
    .catch(err => console.error(err));

  // ページ書き換え関数
  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // .main の中身だけを入れ替える
      const newContent = doc.querySelector('.main').innerHTML;
      mainArea.innerHTML = newContent;
      
      // URLを更新し、一番上までスクロール
      window.history.pushState(null, '', url);
      mainArea.scrollTop = 0;
    } catch (err) {
      // 失敗した場合は普通にページ移動
      window.location.href = url;
    }
  }

  // 戻るボタン対応
  window.addEventListener('popstate', () => {
    changePage(window.location.pathname);
  });
});

/**
 * カウンター処理（変更なし）
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
