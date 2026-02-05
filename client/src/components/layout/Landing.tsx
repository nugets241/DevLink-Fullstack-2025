import Login from '../auth/Login';

function Landing() {
	return (
		<div className="landing">
			<div className="container">
				<section aria-label="Marketing" className="marketing">
					<img src="/devlink.svg" alt="DevLink Logo" className="logo" />
					<h2 className="tagline">
						Connect with fellow developers, collaborate on projects, and grow
						your network.
					</h2>
				</section>
				<Login />
			</div>
		</div>
	);
}

export default Landing;
