document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;

      const style = document.createElement('style');
      style.textContent = `
        /* 1. すべての丸印を強制的に一度消去 */
        .sidebar a::before, .main a::before, a::before { 
          content: none !important; 
        }

        /* 2. サイドバーのリンクを整列 */
        .sidebar a {
          display: flex !important;
          align-items: center !important;
          text-decoration: none !important;
          margin-bottom: 12px !important;
          color: blue !important;
          font-weight: bold !important;
        }

        /* 3. 【重要】menu-linkクラスを持つものだけに丸を再付与 */
        /* 優先度を最大にするため、タグ名とクラス名を繋げて記述します */
        a.menu-link::before {
          content: "" !important;
          display: inline-block !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background-color: #999 !important;
          margin-right: 8px !important;
        }

        /* 4. レイアウト・カウンター・ロゴ設定 */
        .center-layout { margin: 0 auto !important; display: flex !important; flex-direction: column !important; align-items: center !important; width: 100% !important; text-align: center; }
        #sidebar-counter-display img { height: 24px; width: auto; image-rendering: pixelated; margin: 0 -1px; }
        #sidebar-twitter-share { display: inline !important; font-weight: normal !important; color: #1da1f2 !important; }
        #sidebar-logo { display: block !important; margin-bottom: 20px; text-align: center; }
        #sidebar-logo img { width: 160px; height: auto; }
      `;
      document.head.appendChild(style);

      // リンクの非同期遷移設定
      sidebar.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && link.id !== 'sidebar-logo') {
          link.addEventListener('click', e => {
            e.preventDefault();
            changePage(link.getAttribute('href'));
          });
        }
      });
      loadSidebarCounter();
    });

  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      mainArea.innerHTML = doc.querySelector('.main').innerHTML;
      window.history.pushState(null, '', url);
      mainArea.scrollTop = 0;
    } catch (e) { window.location.href = url; }
  }
});

// カウンター関数（以前のまま）
async function loadSidebarCounter() {
  const displayArea = document.getElementById('sidebar-counter-display');
  const twitterLink = document.getElementById('sidebar-twitter-share');
  if (!displayArea) return;
  try {
    const isAdmin = localStorage.getItem('is_admin_yukidama') === 'true';
    const isCounted = sessionStorage.getItem('has_counted_this_session');
    const fetchUrl = (isAdmin || isCounted) ? 'https://dry-silence-4f1f.y-bb0.workers.dev?no-count=1' : 'https://dry-silence-4f1f.y-bb0.workers.dev';
    const response = await fetch(fetchUrl);
    const data = await response.json();
    const countStr = String(data.count).padStart(6, '0');
    if (twitterLink) {
      twitterLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`「ゆきだまのホームページ」でキリ番（${countStr}）を踏んだよ！\n${window.location.origin}${window.location.pathname}\n\n@yukidama_yoshi`)}`;
    }
    if (!(isAdmin || isCounted)) sessionStorage.setItem('has_counted_this_session', 'true');
    displayArea.innerHTML = ''; 
    for (let char of countStr) {
      const img = document.createElement('img');
      img.src = `akusesu_kaunta_moji_sozai/${char}.png`;
      img.alt = char;
      displayArea.appendChild(img);
    }
  } catch (err) { displayArea.innerHTML = 'ERR'; }
}
