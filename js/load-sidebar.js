async function loadSidebarCounter() {
  const displayArea = document.getElementById('sidebar-counter-display');
  if (!displayArea) return;

  const WORKER_URL = 'https://dry-silence-4f1f.y-bb0.workers.dev';
  const IMAGE_PATH = 'akusesu_kaunta_moji_sozai/';
  
  // 管理者チェック
  const isAdmin = localStorage.getItem('is_admin_yukidama') === 'true';
  
  // ★追加：同一セッション（ページ移動）での重複カウント防止
  const isCounted = sessionStorage.getItem('has_counted_this_session');

  try {
    // 管理者、または既にこのセッションでカウント済みの場合は「no-count=1」を送る
    const shouldSkip = isAdmin || isCounted;
    const fetchUrl = shouldSkip ? `${WORKER_URL}?no-count=1` : WORKER_URL;

    const response = await fetch(fetchUrl);
    const data = await response.json();
    const countStr = String(data.count).padStart(6, '0');

    // 初回カウント成功時にフラグを立てる
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
