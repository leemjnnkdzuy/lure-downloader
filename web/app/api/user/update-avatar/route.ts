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
		const {image} = body;

		if (!image) {
			return NextResponse.json(
				{success: false, message: "Vui lòng cung cấp ảnh"},
				{status: 400}
			);
		}

		const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

		if (!matches || matches.length !== 3) {
			return NextResponse.json(
				{success: false, message: "Định dạng ảnh không hợp lệ"},
				{status: 400}
			);
		}

		const mime = matches[1];
		const data = matches[2];

		if (!mime.startsWith("image/")) {
			return NextResponse.json(
				{success: false, message: "File tải lên phải là hình ảnh"},
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

		user.avatar = {
			mime: mime,
			data: data,
		};

		await user.save();

		const userData = {
			id: user._id.toString(),
			username: user.username,
			email: user.email,
			avatar: `data:${user.avatar.mime};base64,${user.avatar.data}`,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		};

		return NextResponse.json({
			success: true,
			message: "Cập nhật avatar thành công",
			user: userData,
		});
	} catch (error) {
		console.error("Update avatar error:", error);
		return NextResponse.json(
			{success: false, message: "Lỗi server. Vui lòng thử lại sau."},
			{status: 500}
		);
	}
}
