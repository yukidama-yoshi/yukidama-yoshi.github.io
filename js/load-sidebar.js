document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // サイドバーの読み込み
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;
      setupNavigation();
      loadSidebarCounter(); // カウンター開始
    });

  function setupNavigation() {
    sidebar.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');

      // Twitterリンク、または外部サイト（httpから始まる）はJSで処理せず、そのまま飛ばす
      if (link.id === 'sidebar-twitter-share' || (href && href.startsWith('http'))) {
        link.setAttribute('target', '_blank'); // 別タブで開く設定
        link.setAttribute('rel', 'noopener noreferrer');
        return; // ここで処理を終了（下のpreventDefaultをさせない）
      }

      // 内部リンク（自分のサイト内）だけ、ページの中身を入れ替える
      if (link.hostname === window.location.hostname && link.id !== 'sidebar-logo') {
        link.onclick = (e) => {
          e.preventDefault();
          changePage(href);
        };
      }
    });
  }

  async function changePage(url) {
    if (!url || url === '#') return;
    try {
      const response = await fetch(url);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newContent = doc.querySelector('.main').innerHTML;
      mainArea.innerHTML = newContent;
      window.history.pushState(null, '', url);
      mainArea.scrollTop = 0;
    } catch (e) {
      window.location.href = url; // 失敗したら普通に飛ばす
    }
  }

  window.onpopstate = () => changePage(window.location.pathname);
});

// カウンターとTwitterリンク作成処理
async function loadSidebarCounter() {
  const displayArea = document.getElementById('sidebar-counter-display');
  const twitterLink = document.getElementById('sidebar-twitter-share');
  if (!displayArea) return;

  const WORKER_URL = 'https://dry-silence-4f1f.y-bb0.workers.dev';
  const IMAGE_PATH = 'akusesu_kaunta_moji_sozai/';

  try {
    const isAdmin = localStorage.getItem('is_admin_yukidama') === 'true';
    const isCounted = sessionStorage.getItem('has_counted_this_session');
    
    const fetchUrl = (isAdmin || isCounted) ? `${WORKER_URL}?no-count=1` : WORKER_URL;
    const response = await fetch(fetchUrl);
    const data = await response.json();
    const countStr = String(data.count).padStart(6, '0');

    // Twitterリンクの中身をここで作成
    if (twitterLink) {
      const tweetText = `「ゆきだまのホームページ」でキリ番（${countStr}）を踏んだよ！\n${window.location.origin}${window.location.pathname}\n\n@yukidama_yoshi`;
      twitterLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    }

    if (!isAdmin && !isCounted) sessionStorage.setItem('has_counted_this_session', 'true');

    displayArea.innerHTML = ''; 
    for (let char of countStr) {
      const img = document.createElement('img');
      img.src = `${IMAGE_PATH}${char}.png`;
      displayArea.appendChild(img);
    }
  } catch (err) {
    displayArea.innerHTML = 'ERR';
  }
}
