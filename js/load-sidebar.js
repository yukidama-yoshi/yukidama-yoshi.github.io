/* css/common.css */
body {
  margin: 0; padding: 0;
  font-family: "MS Gothic", "Osaka", monospace;
  background-image: url("../images/pg.png");
  background-repeat: repeat;
  background-size: 600px;
  display: flex !important;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  min-width: 100px;
  background: transparent !important; /* 透明 */
  border-right: 1px solid #ccc;
  padding: 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  height: 100vh;
}

#sidebar-logo { display: block !important; margin-bottom: 20px !important; text-align: center !important; }
#sidebar-logo img { width: 160px !important; height: auto !important; }

.sidebar a.menu-link {
  display: flex !important;
  align-items: center;
  margin-bottom: 12px;
  color: blue;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px !important; /* 小さめ */
}

.sidebar a.menu-link:not(#sidebar-logo)::before {
  content: "";
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background-color: #999;
  margin-right: 8px;
}

#sidebar-logo::before { content: none !important; }

.main {
  flex: 1;
  padding: 40px 20px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.65);
  position: relative;
}

.version-tag {
  position: absolute;
  top: 10px; right: 15px;
  font-size: 11px; color: #666;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid #ccc;
  padding: 2px 6px;
}

.content { display: flex !important; align-items: flex-start; gap: 32px; max-width: 1000px; margin: 0 auto; }
.image-block img { width: 360px; height: auto; }
.text-block { flex: 1; text-align: center; }
ul { list-style: none !important; padding: 0; }
.resizer { width: 5px; cursor: ew-resize; background-color: #ccc; }
#sidebar-counter-display img { height: 24px; image-rendering: pixelated; margin: 0 -1px; }
