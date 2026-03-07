import RegisterForm from '../components/auth/RegisterForm';

function Register() {
	return (
		<div className="register-page">
			<img src="/devlink.svg" alt="DevLink Logo" className="register-logo" />
			<RegisterForm />
		</div>
	);
}

export default Register;
