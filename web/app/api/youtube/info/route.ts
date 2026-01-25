import {NextResponse} from "next/server";
import axios from "axios";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

function extractYouTubeId(url: string): string | null {
	const regex =
		/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
	const matches = url.match(regex);
	return matches ? matches[1] : null;
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const {url} = body;

		if (!url) {
			return NextResponse.json(
				{
					status: "fail",
					message: "Vui lòng cung cấp đường dẫn YouTube",
				},
				{status: 400},
			);
		}

		console.log("Processing YouTube URL:", url);

		const videoId = extractYouTubeId(url);
		if (!videoId) {
			return NextResponse.json(
				{status: "fail", message: "URL YouTube không hợp lệ"},
				{status: 400},
			);
		}

		console.log("Extracted YouTube video ID:", videoId);

		try {
			const response = await axios.get(
				`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`,
				{
					headers: {
						"x-rapidapi-key": RAPIDAPI_KEY,
						"x-rapidapi-host":
							"youtube-media-downloader.p.rapidapi.com",
					},
					timeout: 30000,
				},
			);

			console.log("RapidAPI YouTube response status:", response.status);

			if (response.data) {
				const data = response.data;

				// Return full data from RapidAPI
				return NextResponse.json({
					status: "success",
					data: data,
				});
			}

			console.log(
				"RapidAPI YouTube response:",
				JSON.stringify(response.data).substring(0, 500),
			);
		} catch (apiError: any) {
			console.log("RapidAPI YouTube failed:", apiError.message);
			console.log("Error details:", apiError.response?.data);
		}

		return NextResponse.json(
			{
				status: "fail",
				message:
					"Không thể lấy dữ liệu video YouTube. Vui lòng thử lại sau.",
			},
			{status: 400},
		);
	} catch (error) {
		console.error("Error fetching YouTube data:", error);
		return NextResponse.json(
			{status: "error", message: "Internal Server Error"},
			{status: 500},
		);
	}
}
