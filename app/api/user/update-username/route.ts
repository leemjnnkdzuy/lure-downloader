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
		const {username} = body;

		if (!username || username.trim().length < 3) {
			return NextResponse.json(
				{success: false, message: "Username không hợp lệ (tối thiểu 3 ký tự)"},
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

		// Double check availability to be safe
		const existingUser = await User.findOne({
			username: {$regex: new RegExp(`^${username}$`, "i")},
			_id: {$ne: user._id}, // Exclude current user
		});

		if (existingUser) {
			return NextResponse.json(
				{success: false, message: "Username đã tồn tại"},
				{status: 400}
			);
		}

		user.username = username;
		await user.save();

		// Construct response user data
		const userData = {
			id: user._id.toString(),
			username: user.username,
			email: user.email,
			avatar: user.avatar
				? `data:${user.avatar.mime};base64,${user.avatar.data}`
				: null,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		};

		return NextResponse.json({
			success: true,
			message: "Cập nhật username thành công",
			user: userData,
		});
	} catch (error) {
		console.error("Update username error:", error);
		return NextResponse.json(
			{success: false, message: "Lỗi server. Vui lòng thử lại sau."},
			{status: 500}
		);
	}
}
