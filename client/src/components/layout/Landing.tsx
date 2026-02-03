function Landing() {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<div className="fb-landing">
			<div className="container">
				<div className="fb-landing__grid">
					<section aria-label="Marketing" className="fb-landing__marketing">
						<h1 className="fb-landing__brand">DevLink</h1>
						<p className="fb-landing__tagline">
							Connect with friends and the world around you on DevLink.
						</p>
					</section>

					<section aria-label="Login" className="fb-landing__login-area">
						<div className="card fb-landing__card">
							<form className="fb-landing__form" onSubmit={handleSubmit}>
								<label className="visually-hidden" htmlFor="login-identifier">
									Email or phone number
								</label>
								<input
									id="login-identifier"
									name="identifier"
									type="text"
									autoComplete="username"
									placeholder="Email or phone number"
									required
								/>

								<label className="visually-hidden" htmlFor="login-password">
									Password
								</label>
								<input
									id="login-password"
									name="password"
									type="password"
									autoComplete="current-password"
									placeholder="Password"
									required
								/>

								<button
									className="btn btn--primary fb-landing__login"
									type="submit"
								>
									Log In
								</button>

								<a
									className="fb-landing__forgot"
									href="#"
									onClick={(e) => e.preventDefault()}
								>
									Forgot password?
								</a>

								<div className="fb-landing__divider" role="separator" />

								<button className="btn fb-landing__create" type="button">
									Create new account
								</button>
							</form>
						</div>

						<p className="fb-landing__below">
							<a href="#" onClick={(e) => e.preventDefault()}>
								Create a Page
							</a>{' '}
							for a celebrity, brand or business.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}

export default Landing;
