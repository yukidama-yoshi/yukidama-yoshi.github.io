document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // 現在のページがゲーム部屋（gamecollectionフォルダ内）にあるかを判定
  const isGameCollection = window.location.pathname.includes('/gamecollection/');

  // ゲーム部屋にいる場合は、1つ上のフォルダの sidebar.html を見に行く
  const sidebarPath = isGameCollection ? '../sidebar.html' : 'sidebar.html';

  // サイドバーHTMLの読み込み
  fetch(sidebarPath)
    .then(response => {
      if (!response.ok) throw new Error('サイドバーの読み込みに失敗しました');
      return response.text();
    })
    .then(data => {
      sidebar.innerHTML = data;
      // カウンター起動関数にゲーム部屋かどうかの情報を渡す
      loadSidebarCounter(isGameCollection);
    })
    .catch(err => console.error(err));
});

// カウンターとTwitterリンク処理
async function loadSidebarCounter(isGameCollection = false) {
  const displayArea = document.getElementById('sidebar-counter-display');
  const twitterLink = document.getElementById('sidebar-twitter-share');
  if (!displayArea) return;

  const WORKER_URL = 'https://dry-silence-4f1f.y-bb0.workers.dev';
  
  // ゲーム部屋にいる場合は、画像の読み込みパスの頭にも「../」を付ける
  const IMAGE_PATH = isGameCollection ? '../akusesu_kaunta_moji_sozai/' : 'akusesu_kaunta_moji_sozai/';

  try {
    const isAdmin = localStorage.getItem('is_admin_yukidama') === 'true';
    const isCounted = sessionStorage.getItem('has_counted_this_session');
    
    const fetchUrl = (isAdmin || isCounted) ? `${WORKER_URL}?no-count=1` : WORKER_URL;
    const response = await fetch(fetchUrl);
    const data = await response.json();
    const countStr = String(data.count).padStart(6, '0');

    if (twitterLink) {
      const shareUrl = window.location.origin + window.location.pathname;
      const tweetText = `「ゆきだまのホームページ」でキリ番（${countStr}）を踏んだよ！\n${shareUrl}\n\n@yukidama_yoshi`;
      twitterLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      twitterLink.setAttribute('target', '_blank');
      twitterLink.setAttribute('rel', 'noopener noreferrer');
    }

    if (!isAdmin && !isCounted) {
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
    displayArea.innerHTML = 'ERR';
    console.error(err);
  }
}
