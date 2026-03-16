(function () {
	var root = document.getElementById('root');
	if (!root) return;

	root.innerHTML =
		'<div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#0b1220;color:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">' +
		'<div style="max-width:720px;width:100%;border:1px solid #273449;border-radius:10px;padding:18px;background:#111c2e;">' +
		'<h1 style="margin:0 0 10px 0;font-size:1.1rem;">Your browser is not supported</h1>' +
		'<p style="margin:0;color:#cbd5e1;">DevLink requires a modern browser with JavaScript module support. Please update your browser and try again.</p>' +
		'</div>' +
		'</div>';
})();
