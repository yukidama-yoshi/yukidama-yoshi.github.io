document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main'); // index.htmlのメイン要素

  // 1. サイドバーのHTMLを読み込む
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;

      // 2. スタイルを一括適用（丸印消去、カウンター画像設定など）
      const style = document.createElement('style');
      style.textContent = `
        #sidebar-logo::before, #sidebar-twitter-share::before { content: none !important; }
        #sidebar-counter-display img { height: 24px; width: auto; image-rendering: pixelated; margin: 0 -1px; }
        #sidebar-twitter-share { display: inline !important; padding: 0 !important; color: #1da1f2 !important; }
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

      // --- ★新機能：リンクのクリックを横取りして中身だけ入れ替える ---
      sidebar.querySelectorAll('a').forEach(link => {
        // 外部リンクやロゴ画像以外を対象にする
        if (link.hostname === window.location.hostname && link.id !== 'sidebar-logo') {
          link.addEventListener('click', (e) => {
            e.preventDefault(); // 通常のページ移動をキャンセル
            const targetUrl = link.getAttribute('href');
            changePage(targetUrl);
          });
        }
      });

      // 4. カウンターを動かす
      loadSidebarCounter();
    })
    .catch(err => console.error("サイドバー読み込みエラー:", err));

  // --- ★新機能：コンテンツだけを入れ替える関数 ---
  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();

      // 読み込んだHTMLから <div class="main"> の中身だけを抜き出す
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMainContent = doc.querySelector('.main').innerHTML;

      // メインエリアの中身を差し替える
      mainArea.innerHTML = newMainContent;

      // URLバーを書き換える（戻るボタンも効くようになります）
      window.history.pushState(null, '', url);

      // ページの一番上へスクロール
      mainArea.scrollTop = 0;

    } catch (err) {
      console.error("ページ遷移エラー:", err);
      window.location.href = url; // 失敗した時は普通の移動に切り替える
    }
  }

  // ブラウザの「戻る・進む」ボタンへの対応
  window.addEventListener('popstate', () => {
    changePage(window.location.pathname);
  });
});

/**
 * カウンター処理（ページを移動しても再実行されないので、数字が維持されます）
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

    if (!shouldSkip) {
      sessionStorage.setItem('has_counted_this_session', 'true');
    }

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
