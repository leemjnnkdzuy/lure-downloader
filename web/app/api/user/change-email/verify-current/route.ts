import {NextRequest, NextResponse} from "next/server";
import {verifyAccessToken} from "@/app/utils/jwt";
import sessions from "../store";

export async function POST(request: NextRequest) {
	try {
		const accessToken = request.cookies.get("access_token")?.value;
		if (!accessToken) return NextResponse.json({message: "Unauthorized"}, {status: 401});
		const payload = verifyAccessToken(accessToken);
		if (!payload) return NextResponse.json({message: "Invalid Token"}, {status: 401});

		const body = await request.json();
		const {code} = body;

		const session = sessions.get(payload.userId);

		if (!session || Date.now() > session.expiresAt) {
			return NextResponse.json({message: "Mã xác thực đã hết hạn hoặc không tồn tại"}, {status: 400});
		}

		if (session.otp !== code) {
			return NextResponse.json({message: "Mã xác thực không chính xác"}, {status: 400});
		}

		session.verifiedCurrent = true;
		session.otp = "";

		return NextResponse.json({
			success: true, 
			message: "Verified",
			token: payload.userId
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json({message: "Server Error"}, {status: 500});
	}
}
