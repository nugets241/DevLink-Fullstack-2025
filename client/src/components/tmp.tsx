function Tmp() {
	return (
		<div className="page">
			<header className="container stack">
				<p className="eyebrow">DevLink</p>
				<h1>Welcome to DevLink</h1>
				<p className="lead">
					Global SCSS is loaded via <code>client/src/main.tsx</code>.
				</p>

				<div className="cluster">
					<span className="pill">React + Vite</span>
					<span className="pill">TypeScript</span>
					<span className="pill">SCSS</span>
				</div>

				<div className="cluster">
					<button className="btn btn--primary" type="button">
						Get Started
					</button>
					<button className="btn btn--ghost" type="button">
						Learn More
					</button>
				</div>
			</header>

			<main className="container surface">
				<div className="stack">
					<h2>Next step</h2>
					<p>
						Add routing and page structure (Home/Login/Register) under{' '}
						<code>client/src/pages</code>.
					</p>
				</div>
			</main>
		</div>
	);
}

export default Tmp;
