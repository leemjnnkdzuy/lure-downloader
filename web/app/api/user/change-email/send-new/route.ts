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

		const body = await request.json();
		const {email, token} = body;

		if (token !== payload.userId) {
			return NextResponse.json({message: "Token không hợp lệ"}, {status: 403});
		}

		await connectDatabase();

		const session = sessions.get(payload.userId);
		if (!session || !session.verifiedCurrent) {
			return NextResponse.json({message: "Phiên làm việc không hợp lệ. Vui lòng thử lại từ đầu."}, {status: 403});
		}

		const existingUser = await User.findOne({email});
		if (existingUser) {
			return NextResponse.json({message: "Email này đã được sử dụng bởi tài khoản khác"}, {status: 400});
		}

		const pin = generatePIN();
		session.otp = pin;
		session.newEmail = email;
		session.expiresAt = Date.now() + 10 * 60 * 1000;

		const result = await sendVerificationEmail(email, pin, "User");
		if (!result.success) {
			return NextResponse.json({message: "Không thể gửi email đến địa chỉ mới"}, {status: 500});
		}

		return NextResponse.json({success: true, message: "PIN sent to new email"});
	} catch (error) {
		console.error(error);
		return NextResponse.json({message: "Server Error"}, {status: 500});
	}
}
