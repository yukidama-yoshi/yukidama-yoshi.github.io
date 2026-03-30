style.textContent = `
        /* 1. 全リンクの丸を一旦消す */
        .sidebar a::before, .main a::before { content: none !important; }

        /* 2. サイドバー内のリンク（ロゴと報告以外）に丸を出す */
        /* class="menu-link" がついていれば確実ですが、なくてもサイドバー内なら出す設定に強化します */
        .sidebar a:not(#sidebar-logo):not(#sidebar-twitter-share) {
          display: flex !important;
          align-items: center;
          margin-bottom: 12px;
          color: blue;
          text-decoration: none;
          font-weight: bold;
          padding: 6px 0;
        }

        .sidebar a:not(#sidebar-logo):not(#sidebar-twitter-share)::before {
          content: "" !important;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #999;
          margin-right: 8px;
        }

        /* 3. 中央揃え設定 */
        .center-layout {
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          width: 100% !important;
          text-align: center;
        }

        /* 4. カウンター画像設定 */
        #sidebar-counter-display img { height: 24px; width: auto; image-rendering: pixelated; margin: 0 -1px; }

        /* 5. 報告リンク（丸を出さない） */
        #sidebar-twitter-share { display: inline !important; padding: 0 !important; color: #1da1f2 !important; font-weight: normal !important; }
      `;
