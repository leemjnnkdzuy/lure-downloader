import {NextRequest, NextResponse} from "next/server";
import {verifyAccessToken} from "@/app/utils/jwt";
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
		const {code, email} = body;

		const session = sessions.get(payload.userId);

		if (!session || !session.verifiedCurrent || !session.newEmail) {
			return NextResponse.json({message: "Phiên làm việc lỗi. Vui lòng thực hiện lại."}, {status: 400});
		}

		if (Date.now() > session.expiresAt) {
			return NextResponse.json({message: "Mã xác thực hết hạn"}, {status: 400});
		}

		if (session.otp !== code) {
			return NextResponse.json({message: "Mã xác thực không đúng"}, {status: 400});
		}

		if (session.newEmail !== email) {
			return NextResponse.json({message: "Email không khớp với yêu cầu"}, {status: 400});
		}

		await connectDatabase();
		const user = await User.findById(payload.userId);
		if (!user) return NextResponse.json({message: "User not found"}, {status: 404});

		user.email = session.newEmail;
		user.isVerified = true;
		await user.save();

		sessions.delete(payload.userId);

		return NextResponse.json({success: true, message: "Đổi email thành công"});

	} catch (error) {
		console.error(error);
		return NextResponse.json({message: "Server Error"}, {status: 500});
	}
}
