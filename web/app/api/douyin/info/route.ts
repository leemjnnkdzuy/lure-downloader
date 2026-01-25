import {NextResponse} from "next/server";
import axios from "axios";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

async function resolveUrl(url: string): Promise<string> {
	if (url.includes("v.douyin.com")) {
		try {
			const response = await axios.get(url, {
				maxRedirects: 10,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				},
			});
			return response.request.res.responseUrl || url;
		} catch (error: any) {
			console.error("Error resolving short URL:", error.message);
			return url;
		}
	}
	return url;
}

function extractVideoId(url: string): string | null {
	const matches = url.match(/\/video\/(\d+)/);
	return matches ? matches[1] : null;
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const {url} = body;

		if (!url) {
			return NextResponse.json(
				{status: "fail", message: "Vui lòng cung cấp đường dẫn Douyin"},
				{status: 400},
			);
		}

		console.log("Processing Douyin URL:", url);

		const resolvedUrl = await resolveUrl(url);
		const cleanUrl = resolvedUrl.split("?")[0];
		const videoId = extractVideoId(cleanUrl);

		if (!videoId) {
			return NextResponse.json(
				{
					status: "fail",
					message: "Không thể trích xuất Video ID từ URL",
				},
				{status: 400},
			);
		}

		console.log("Extracted video ID:", videoId);

		try {
			const response = await axios.post(
				"https://all-media-api.p.rapidapi.com/v1/social/douyin/app/aweme/detail_id",
				{id: videoId},
				{
					headers: {
						"x-rapidapi-key": RAPIDAPI_KEY,
						"x-rapidapi-host": "all-media-api.p.rapidapi.com",
						"Content-Type": "application/json",
					},
					timeout: 30000,
				},
			);

			console.log("RapidAPI Douyin response status:", response.status);

			if (response.data && response.data.data) {
				const data = response.data.data;

				const videoUrl =
					data.video?.play_addr?.url_list?.[0] ||
					data.video?.download_addr?.url_list?.[0] ||
					"";
				const playUrl =
					videoUrl ?
						`/api/douyin/download?url=${encodeURIComponent(videoUrl)}`
					:	"";

				return NextResponse.json({
					status: "success",
					data: {
						cover:
							data.video?.cover?.url_list?.[0] ||
							data.video?.origin_cover?.url_list?.[0] ||
							"",
						title: data.desc || "Video Douyin",
						play: playUrl,
						images: null,
						author: {
							nickname: data.author?.nickname || "Douyin User",
							avatar:
								data.author?.avatar_thumb?.url_list?.[0] || "",
							unique_id:
								data.author?.unique_id ||
								data.author?.short_id ||
								videoId,
						},
						stats: {
							plays: data.statistics?.play_count || 0,
							likes: data.statistics?.digg_count || 0,
							comments: data.statistics?.comment_count || 0,
							shares: data.statistics?.share_count || 0,
							downloads: data.statistics?.download_count || 0,
						},
					},
				});
			}

			console.log(
				"RapidAPI response data:",
				JSON.stringify(response.data).substring(0, 500),
			);
		} catch (apiError: any) {
			console.log("RapidAPI Douyin failed:", apiError.message);
		}

		return NextResponse.json(
			{
				status: "fail",
				message:
					"Không thể lấy dữ liệu video Douyin. Vui lòng thử lại sau.",
			},
			{status: 400},
		);
	} catch (error) {
		console.error("Error fetching Douyin data:", error);
		return NextResponse.json(
			{status: "error", message: "Internal Server Error"},
			{status: 500},
		);
	}
}
