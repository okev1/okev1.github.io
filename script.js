document.addEventListener('DOMContentLoaded', function() {
  const landing = document.getElementById('landing');
  const main = document.getElementById('main');

  function startSite() {
    landing.classList.add('hidden');
    main.classList.remove('hidden');
    document.removeEventListener('click', startSite);
    document.removeEventListener('keydown', startSite);
  }

  document.addEventListener('click', startSite);
  document.addEventListener('keydown', startSite);
});
