import connectDB from './db.js';
import app from './app.js';
import { PORT, NODE_ENV } from './utils/config.js';
import dns from 'node:dns/promises';

// Fix DNS resolution issue for MongoDB Atlas SRV records
dns.setServers(['1.1.1.1', '8.8.8.8']);

connectDB();

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT} [${NODE_ENV}]`);
});
