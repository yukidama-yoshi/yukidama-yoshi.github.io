document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');

  // 1. サイドバーのHTMLを読み込む
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;

      // 2. スタイル調整（ロゴと報告リンクの丸印を消去）
      const style = document.createElement('style');
      style.textContent = `
        /* 指定したIDのリンクだけ、横の「点（丸印）」を強制的に消す */
        #sidebar-logo::before,
        #sidebar-twitter-share::before { 
          content: none !important; 
        }
        
        /* カウンターの数字画像の設定 */
        #sidebar-counter-display img { 
          height: 24px; 
          width: auto; 
          image-rendering: pixelated; 
          margin: 0 -1px; 
        }

        /* サイドバー内のリンク共通設定（報告リンクが変にズレないように調整） */
        #sidebar-twitter-share {
          display: inline !important; /* 横並びのテキストとして扱う */
          padding: 0 !important;
          color: #1da1f2 !important;
        }
      `;
      document.head.appendChild(style);

      // 3. ロゴ画像の見た目を整える
      const logoLink = document.getElementById('sidebar-logo');
      if (logoLink) {
        Object.assign(logoLink.style, {
          display: 'block',
          padding: '0',
          marginBottom: '20px',
          textAlign: 'center'
        });
        const logoImg = logoLink.querySelector('img');
        if (logoImg) {
          logoImg.style.width = '160px'; 
          logoImg.style.height = 'auto';
        }
        logoLink.style.display = 'block';
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

    // キリ番報告リンクのURL生成
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
