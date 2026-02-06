import RegisterForm from '../components/auth/RegisterForm';

function Register() {
	return (
		<div className="register">
			<img src="/devlink.svg" alt="DevLink Logo" className="logo" />
			<RegisterForm />
		</div>
	);
}

export default Register;
