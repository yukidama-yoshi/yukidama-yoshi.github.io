// ページ書き換え関数（ここを差し替え）
  async function changePage(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. 【掃除】前のページが追加した「一時的なスタイル」があれば消去する
      // head内にある、JSで追加したstyleタグなどをリセットしたい場合に有効です
      
      // 2. メインコンテンツを入れ替え
      const newMainContent = doc.querySelector('.main').innerHTML;
      mainArea.innerHTML = newMainContent;

      // 3. 【最重要】もし新しいページに独自の <style> がある場合、それを強制適用
      // これをしないと、ブラウザは「前のページのスタイル」を使い続けてしまいます
      const newStyles = doc.querySelectorAll('style');
      newStyles.forEach(style => {
        document.head.appendChild(style.cloneNode(true));
      });

      // 4. URLを更新
      window.history.pushState(null, '', url);
      
      // 5. ページの一番上へ
      mainArea.scrollTop = 0;

      // 6. 丸印の暴走を再度止める（念押し）
      const fixStyle = document.createElement('style');
      fixStyle.textContent = '.main a::before { content: none !important; }';
      document.head.appendChild(fixStyle);

    } catch (err) {
      // 失敗したら普通のページ遷移に切り替え（安全策）
      window.location.href = url;
    }
  }
