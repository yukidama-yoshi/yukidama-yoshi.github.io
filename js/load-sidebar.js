document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;
      
      // おまけ：現在地のリンクを強調する処理
      const links = sidebar.querySelectorAll('a');
      const currentFile = window.location.pathname.split("/").pop() || "index.html";
      
      links.forEach(link => {
        if (link.getAttribute('href') === currentFile) {
          link.style.color = "red"; // 今いるページは赤くするなど
        }
      });
    });
});
