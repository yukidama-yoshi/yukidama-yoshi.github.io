document.addEventListener("DOMContentLoaded", () => {
  fetch('sidebar.html')
    .then(r => r.text())
    .then(d => sidebar.innerHTML = d);
});
