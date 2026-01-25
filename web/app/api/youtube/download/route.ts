import {NextResponse} from "next/server";
import axios from "axios";

export async function GET(req: Request) {
	try {
		const {searchParams} = new URL(req.url);
		const videoUrl = searchParams.get("url");

		if (!videoUrl) {
			return NextResponse.json(
				{error: "URL parameter is required"},
				{status: 400},
			);
		}

		console.log(
			"Downloading YouTube video from:",
			videoUrl.substring(0, 100),
		);

		const response = await axios.get(videoUrl, {
			responseType: "stream",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
			},
			maxRedirects: 10,
		});

		const headers = new Headers();
		headers.set("Content-Type", "video/mp4");
		headers.set(
			"Content-Disposition",
			'attachment; filename="youtube-video.mp4"',
		);
		headers.set("Access-Control-Allow-Origin", "*");

		if (response.headers["content-length"]) {
			headers.set("Content-Length", response.headers["content-length"]);
		}

		// Stream the video response
		return new NextResponse(response.data, {
			status: 200,
			headers,
		});
	} catch (error: any) {
		console.error("YouTube download error:", error.message);
		return NextResponse.json(
			{error: error.message || "Download failed"},
			{status: 500},
		);
	}
}
