import {NextRequest, NextResponse} from "next/server";
import connectDatabase from "@/app/utils/ConnectDB";
import User from "@/app/models/User";
import {verifyAccessToken} from "@/app/utils/jwt";

export async function PUT(request: NextRequest) {
	try {
		const accessToken = request.cookies.get("access_token")?.value;

		if (!accessToken) {
			return NextResponse.json(
				{success: false, message: "Không tìm thấy token authentication"},
				{status: 401}
			);
		}

		const payload = verifyAccessToken(accessToken);
		if (!payload) {
			return NextResponse.json(
				{success: false, message: "Token không hợp lệ hoặc đã hết hạn"},
				{status: 401}
			);
		}

		const body = await request.json();
		const {currentPassword, newPassword} = body;

		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{success: false, message: "Vui lòng nhập đầy đủ thông tin"},
				{status: 400}
			);
		}

		if (newPassword.length < 6) {
			return NextResponse.json(
				{success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự"},
				{status: 400}
			);
		}

		await connectDatabase();

		const user = await User.findById(payload.userId);
		if (!user) {
			return NextResponse.json(
				{success: false, message: "Không tìm thấy người dùng"},
				{status: 404}
			);
		}

		const isMatch = await user.comparePassword(currentPassword);
		if (!isMatch) {
			return NextResponse.json(
				{success: false, message: "Mật khẩu hiện tại không đúng"},
				{status: 400}
			);
		}

		user.password = newPassword;
		await user.save();

		return NextResponse.json({
			success: true,
			message: "Đổi mật khẩu thành công",
		});
	} catch (error) {
		console.error("Change password error:", error);
		return NextResponse.json(
			{success: false, message: "Lỗi server. Vui lòng thử lại sau."},
			{status: 500}
		);
	}
}
