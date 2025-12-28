import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let cachedConnection: typeof mongoose | null = null;

const connectDatabase = async (): Promise<void> => {
	if (cachedConnection && mongoose.connection.readyState === 1) {
		return;
	}

	try {
		const username = process.env.MONGODB_USER;
		const password = process.env.MONGODB_PASSWORD;
		const cluster = process.env.MONGODB_CLUSTER;
		const isDev = process.env.DEV === "true";
		const database = isDev ? process.env.MONGODB_DATABASE_DEV : process.env.MONGODB_DATABASE_PROD;

		if (!username || !password || !cluster || !database) {
			throw new Error("Missing MongoDB environment variables");
		}

		const uri = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority`;

		if (!cachedConnection || mongoose.connection.readyState === 0) {
			cachedConnection = await mongoose.connect(uri, {
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
			});
			console.log("MongoDB connected successfully to:", database);
		}
	} catch (error) {
		console.error("MongoDB connection error:", error);
		throw error;
	}
};

export default connectDatabase;
