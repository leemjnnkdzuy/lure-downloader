import {NextRequest, NextResponse} from "next/server";
import {verifyAccessToken} from "@/app/utils/jwt";
import {generatePIN, sendVerificationEmail} from "@/app/utils/SendMail";
import sessions from "../store";
import User from "@/app/models/User";
import connectDatabase from "@/app/utils/ConnectDB";

export async function POST(request: NextRequest) {
	try {
		const accessToken = request.cookies.get("access_token")?.value;
		if (!accessToken) return NextResponse.json({message: "Unauthorized"}, {status: 401});
		const payload = verifyAccessToken(accessToken);
		if (!payload) return NextResponse.json({message: "Invalid Token"}, {status: 401});

		await connectDatabase();
		const user = await User.findById(payload.userId);
		if (!user) return NextResponse.json({message: "User not found"}, {status: 404});

		const pin = generatePIN();
		
		sessions.set(payload.userId, {
			otp: pin,
			verifiedCurrent: false,
			expiresAt: Date.now() + 10 * 60 * 1000
		});

		const result = await sendVerificationEmail(user.email, pin, user.username);
		if (!result.success) {
			return NextResponse.json({message: "Failed to send email"}, {status: 500});
		}

		return NextResponse.json({success: true, message: "PIN sent"});
	} catch (error) {
		console.error(error);
		return NextResponse.json({message: "Server Error"}, {status: 500});
	}
}
