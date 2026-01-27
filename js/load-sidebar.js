document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;
        }
      });
    });
});
