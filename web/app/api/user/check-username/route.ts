import {NextRequest, NextResponse} from "next/server";
import connectDatabase from "@/app/utils/ConnectDB";
import User from "@/app/models/User";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {username} = body;

		if (!username) {
			return NextResponse.json(
				{success: false, message: "Username cannot be empty"},
				{status: 400}
			);
		}

		await connectDatabase();

		// Check if username exists (case insensitive)
		const existingUser = await User.findOne({
			username: {$regex: new RegExp(`^${username}$`, "i")},
		});

		if (existingUser) {
			return NextResponse.json({
				success: true,
				available: false,
				message: "Username đã tồn tại",
			});
		}

		return NextResponse.json({
			success: true,
			available: true,
			message: "Username khả dụng",
		});
	} catch (error) {
		console.error("Check username error:", error);
		return NextResponse.json(
			{success: false, message: "Lỗi server"},
			{status: 500}
		);
	}
}
