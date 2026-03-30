document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');

  // 1. サイドバーのHTMLを読み込む
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;

      // 2. 共通のスタイル調整（ロゴの丸印消去、カウンター画像の設定など）
      const style = document.createElement('style');
      style.textContent = `
        /* ロゴの横にある「点（丸印）」を強制的に消す */
        #sidebar-logo::before { content: none !important; }
        
        /* カウンターの数字画像がボヤけないようにドットをパキッとさせる */
        #sidebar-counter-display img { 
          height: 24px; 
          width: auto; 
          image-rendering: pixelated; 
          margin: 0 -1px; 
        }
      `;
      document.head.appendChild(style);

      // 3. ロゴ画像の見た目を整えてから表示する
      const logoLink = document.getElementById('sidebar-logo');
      if (logoLink) {
        Object.assign(logoLink.style, {
          display: 'block',
          padding: '0',
          marginBottom: '15px',
          textAlign: 'center'
        });
        const logoImg = logoLink.querySelector('img');
        if (logoImg) {
          logoImg.style.width = '160px'; // ロゴの横幅（お好みで調整）
          logoImg.style.height = 'auto';
        }
        logoLink.style.display = 'block'; // 準備ができたら表示
      }

      // 4. カウンターの読み込みを開始
      loadSidebarCounter();
    })
    .catch(err => console.error("サイドバーの読み込みに失敗しました:", err));
});

/**
 * アクセスカウンターの処理
 */
async function loadSidebarCounter() {
  const displayArea = document.getElementById('sidebar-counter-display');
  if (!displayArea) return;

  const WORKER_URL = 'https://dry-silence-4f1f.y-bb0.workers.dev';
  const IMAGE_PATH = 'akusesu_kaunta_moji_sozai/'; // 数字画像が入っているフォルダ
  
  // 管理者チェック（URLに ?admin=1 をつけたことがあるブラウザか）
  const isAdmin = localStorage.getItem('is_admin_yukidama') === 'true';
  
  // 同一セッション（タブを閉じない間のページ移動）での重複カウント防止
  const isCounted = sessionStorage.getItem('has_counted_this_session');

  try {
    // 管理者、または既にカウント済みの場合は「カウントしないモード」でリクエスト
    const shouldSkip = isAdmin || isCounted;
    const fetchUrl = shouldSkip ? `${WORKER_URL}?no-count=1` : WORKER_URL;

    const response = await fetch(fetchUrl);
    const data = await response.json();
    
    // 数字を6桁に揃える（例：000123）
    const countStr = String(data.count).padStart(6, '0');

    // 初回カウント成功時に「カウント済みフラグ」を立てる
    if (!shouldSkip) {
      sessionStorage.setItem('has_counted_this_session', 'true');
    }

    // 数字を1文字ずつ画像に置き換えて表示
    displayArea.innerHTML = ''; 
    for (let char of countStr) {
      const img = document.createElement('img');
      img.src = `${IMAGE_PATH}${char}.png`; // 0.png, 1.png... を読み込む
      img.alt = char;
      displayArea.appendChild(img);
    }
  } catch (err) {
    console.error("カウンター読み込みエラー:", err);
    displayArea.innerHTML = '<span style="color:#f00; font-size:10px;">ERR</span>';
  }
}
