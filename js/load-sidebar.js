document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');

  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      // 1. sidebar.html の中身を流し込む
      sidebar.innerHTML = data;

      // 2. ロゴ画像 (id="sidebar-logo") 用のスタイル制御
      const logoLink = document.getElementById('sidebar-logo');
      if (logoLink) {
        // リンク自体のレイアウト調整
        Object.assign(logoLink.style, {
          display: 'block',
          padding: '0',
          marginBottom: '20px',
          textAlign: 'center'
        });

        // ロゴ画像のサイズ調整
        const logoImg = logoLink.querySelector('img');
        if (logoImg) {
          logoImg.style.width = '100%';
          logoImg.style.height = 'auto';
          logoImg.style.maxWidth = '180px'; // ここでロゴの最大幅を決められます
        }

        // index.html の CSS「.sidebar a::before (丸印)」をロゴだけ強制解除
        const style = document.createElement('style');
        style.textContent = `#sidebar-logo::before { content: none !important; }`;
        document.head.appendChild(style);
      }
    })
    .catch(err => console.error("サイドバーの読み込みに失敗しました:", err));
});
