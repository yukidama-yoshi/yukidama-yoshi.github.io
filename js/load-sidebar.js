document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // 1. サイドバーの中身を読み込む
  fetch('sidebar.html')
    .then(response => {
      if (!response.ok) throw new Error('Sidebar not found');
      return response.text();
    })
    .then(data => {
      sidebar.innerHTML = data;
      
      // 2. ナビゲーション（内部リンクの制御）を設定
      setupNavigation();
      
      // 3. カウンターを起動
      loadSidebarCounter();
    })
    .catch(err => console.error(err));

  // 内部リンクをクリックしたときに中身だけ入れ替える関数
  function setupNavigation() {
    sidebar.querySelectorAll('a').forEach(link => {
      // 自ドメインのリンクかつ、ロゴと報告リンク以外を非同期遷移にする
      if (link.hostname === window.location.hostname && 
          link.id !== 'sidebar-logo' && 
          link.id !== 'sidebar-twitter-share') {
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetUrl = link.getAttribute('href');
          changePage(targetUrl);
        });
      }
    });
  }

  // ページ書き換え処理（SPA）
  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 遷移先の .main の中身だけを抽出して入れ替え
      const newContent = doc.querySelector('.main').innerHTML;
      mainArea.innerHTML = newContent;

      // URLの更新とスクロール位置のリセット
      window.history.pushState(null, '', url);
      mainArea.scrollTop = 0;

    } catch (err) {
      // 失敗した場合は通常のページ遷移を行う
      window.location.href = url;
    }
  }

  // ブラウザの「戻る・進む」に対応
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
