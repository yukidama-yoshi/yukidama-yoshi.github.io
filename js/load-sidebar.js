document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main');

  // サイドバーの中身を読み込む
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;
      setupNavigation();
      loadSidebarCounter();
    });

  function setupNavigation() {
    sidebar.querySelectorAll('a').forEach(link => {
      if (link.hostname === window.location.hostname && 
          link.id !== 'sidebar-logo' && 
          link.id !== 'sidebar-twitter-share') {
        link.onclick = (e) => {
          e.preventDefault();
          changePage(link.getAttribute('href'));
        };
      }
    });
  }

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

  window.onpopstate = () => changePage(window.location.pathname);
});

// カウンター処理
async function loadSidebarCounter() {
  const displayArea = document.getElementById('sidebar-counter-display');
  if (!displayArea) return;
  const WORKER_URL = 'https://dry-silence-4f1f.y-bb0.workers.dev';
  try {
    const isAdmin = localStorage.getItem('is_admin_yukidama') === 'true';
    const isCounted = sessionStorage.getItem('has_counted_this_session');
    const response = await fetch((isAdmin || isCounted) ? `${WORKER_URL}?no-count=1` : WORKER_URL);
    const data = await response.json();
    const countStr = String(data.count).padStart(6, '0');
    if (!isAdmin && !isCounted) sessionStorage.setItem('has_counted_this_session', 'true');
    displayArea.innerHTML = ''; 
    for (let char of countStr) {
      const img = document.createElement('img');
      img.src = `akusesu_kaunta_moji_sozai/${char}.png`;
      displayArea.appendChild(img);
    }
  } catch (err) { displayArea.innerHTML = 'ERR'; }
}
