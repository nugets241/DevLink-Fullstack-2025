import LoginForm from '../auth/LoginForm';

function Landing() {
	return (
		<div className="landing">
			<div className="container">
				<section aria-label="Marketing" className="marketing">
					<img src="/devlink.svg" alt="DevLink Logo" className="logo" />
					<h2 className="tagline">
						Connect with other developers, collaborate on projects, and grow
						your network.
					</h2>
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
