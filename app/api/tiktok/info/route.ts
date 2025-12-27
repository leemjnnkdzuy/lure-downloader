import {NextResponse} from "next/server";
import axios from "axios";

// Helper function to resolve short URLs (e.g. vt.tiktok.com)
async function resolveUrl(url: string): Promise<string> {
	if (url.includes("vt.tiktok.com") || url.includes("vm.tiktok.com")) {
		try {
			const response = await axios.get(url, {
				maxRedirects: 10,
			});
			// In axios, when maxRedirects is used, the final URL is in response.request.res.responseUrl
			// However, in some environments or axios versions, it might be different.
			// Ideally checking response.request.res.responseUrl is correct for Node.js adapter.
			return response.request.res.responseUrl || url;
		} catch (error: any) {
			console.error("Error resolving short URL:", error.message);
			return url;
		}
	}
	return url;
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const {url} = body;

		if (!url) {
			return NextResponse.json(
				{status: "fail", message: "Vui lòng cung cấp đường dẫn TikTok"},
				{status: 400}
			);
		}

		const finalUrl = await resolveUrl(url);
		console.log("Processing URL:", finalUrl);

		const formData = new URLSearchParams();
		formData.append("url", finalUrl);
		formData.append("hd", "1");

		const response = await axios.post("https://www.tikwm.com/api/", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		if (response.data && response.data.code === 0) {
			const data = response.data.data;
			/*
                Reference backend maps to:
                cover, title, author { nickname, avatar, unique_id }, stats { plays, likes, comments, shares, downloads },
                video: "api/download?url=..." (in our case)
                images: ...
                music: ...
            */

			// Constructing the play URL that points to OUR download proxy
			// We need to encode the original video URL from tikwm so we can pass it to our download endpoint
			const playUrl = `/api/tiktok/download?url=${encodeURIComponent(
				data.play
			)}`;

			return NextResponse.json({
				status: "success",
				data: {
					cover: data.cover,
					title: data.title,
					play: playUrl,
					images: data.images,
					author: {
						nickname: data.author?.nickname,
						avatar: data.author?.avatar,
						unique_id: data.author?.unique_id,
					},
					stats: {
						plays: data.play_count,
						likes: data.digg_count,
						comments: data.comment_count,
						shares: data.share_count,
						downloads: data.download_count,
					},
				},
			});
		} else {
			console.error("API Error:", response.data);
			return NextResponse.json(
				{status: "fail", message: "Không thể lấy dữ liệu từ URL này"},
				{status: 400}
			);
		}
	} catch (error) {
		console.error("Error fetching TikTok data:", error);
		return NextResponse.json(
			{status: "error", message: "Internal Server Error"},
			{status: 500}
		);
	}
}
