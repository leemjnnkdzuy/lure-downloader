import {NextResponse} from "next/server";
import axios from "axios";

export async function GET(req: Request) {
	const {searchParams} = new URL(req.url);
	const url = searchParams.get("url");
	const filename = searchParams.get("filename") || "video.mp4";

	if (!url) {
		return NextResponse.json(
			{status: "fail", message: "Missing video URL"},
			{status: 400}
		);
	}

	try {
		const response = await axios.get(url, {
			responseType: "stream",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
				Referer: "https://www.tiktok.com/",
			},
		});

		const headers = new Headers();
		headers.set("Content-Disposition", `attachment; filename="${filename}"`);
		
        if (filename.endsWith('.mp4')) {
            headers.set("Content-Type", "video/mp4");
        } else if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) {
             headers.set("Content-Type", "image/jpeg");
        } else if (filename.endsWith('.png')) {
             headers.set("Content-Type", "image/png");
        } else {
             headers.set("Content-Type", "application/octet-stream");
        }

		const stream = new ReadableStream({
			async start(controller) {
				for await (const chunk of response.data) {
					controller.enqueue(chunk);
				}
				controller.close();
			},
		});

		return new Response(stream, {
			headers,
			status: 200,
		});
	} catch (err: any) {
		console.error("Download failed:", err.message, "URL:", url);
		return NextResponse.json(
			{
                status: "fail", 
                message: `Download failed: ${err.message}`, 
                details: err.response?.statusText || "No details",
                url: url 
            },
			{status: 500}
		);
	}
}
