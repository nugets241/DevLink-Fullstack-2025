import LoginForm from '../auth/LoginForm';

function Landing() {
	return (
		<div className="landing">
			<div className="container landing-container">
				<section aria-label="Marketing" className="landing-marketing">
					<img src="/devlink.svg" alt="DevLink Logo" className="landing-logo" />
					<h1 className="landing-tagline">
						Connect with other developers, collaborate on projects, and grow
						your network.
					</h1>
				</section>
				<section aria-label="Login" className="form-container">
					<LoginForm />
					<p className="below">
						<strong>Create a Developer Profile</strong> to showcase your
						projects and skills.
					</p>
				</section>
			</div>
		</div>
	);
}

export default Landing;
