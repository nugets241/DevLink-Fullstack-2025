import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } from '../utils/config.js';

// Verifies JWT from Authorization: Bearer <token>
export default function auth(req, res, next) {
	const header = req.headers.authorization || '';
	const [, token] = header.split(' ');
	if (!token)
		return res.status(401).json({ msg: 'No token, authorization denied' });

	try {
		const payload = jwt.verify(token, JWT_SECRET, {
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
		});
		req.user = payload.user; // { id: ... }
		return next();
	} catch (err) {
		return res.status(401).json({ msg: 'Token is not valid' });
	}
}
