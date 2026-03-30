/* --- ページ全体の基盤 --- */
body {
  margin: 0;
  padding: 0;
  font-family: "MS Gothic", "Osaka", monospace;
  background-image: url("../images/pg.png"); /* 背景画像 */
  background-repeat: repeat;
  background-size: 600px;
  display: flex !important;
  height: 100vh;
  overflow: hidden;
}

/* --- 【修正】サイドバー（背景を完全透明に） --- */
.sidebar {
  width: 200px;
  min-width: 100px;
  background: none !important; /* 背景色・画像を一切持たせない */
  background-color: transparent !important; 
  border-right: 1px solid #ccc;
  padding: 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  height: 100vh;
  z-index: 10;
}

/* --- 【修正】サイドバーのロゴ（表示されない問題を解決） --- */
#sidebar-logo {
  display: block !important;
  margin-bottom: 20px !important;
  text-align: center !important;
  width: 100% !important;
}
#sidebar-logo img {
  display: block !important;
  width: 160px !important; /* サイズ固定 */
  height: auto !important;
  margin: 0 auto !important;
}

/* --- 【修正】サイドバーのリンク（文字サイズを小さく） --- */
.sidebar a.menu-link {
  display: flex !important;
  align-items: center;
  margin-bottom: 12px;
  color: blue;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px !important; /* 16pxから14pxへサイズダウン */
}

/* メニューの丸印 */
.sidebar a.menu-link:not(#sidebar-logo)::before {
  content: "";
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background-color: #999;
  margin-right: 8px;
}

/* ロゴの丸印を強制非表示 */
#sidebar-logo::before {
  content: none !important;
}

/* --- メインエリア（半透明白） --- */
.main {
  flex: 1;
  padding: 40px 20px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.65);
  position: relative;
}

/* バージョン表記（メインの右上） */
.version-tag {
  position: absolute;
  top: 10px; right: 15px;
  font-size: 11px; color: #666;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid #ccc;
  padding: 2px 6px;
  z-index: 100;
}

/* index.html 用レイアウト */
.content {
  display: flex !important;
  align-items: flex-start;
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}
.image-block img { width: 360px; height: auto; display: block; }
.text-block { flex: 1; text-align: center; }

/* その他 */
ul { list-style: none !important; padding: 0; }
.resizer { width: 5px; cursor: ew-resize; background-color: #ccc; }
#sidebar-counter-display img { height: 24px; image-rendering: pixelated; margin: 0 -1px; }
