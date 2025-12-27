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

		// Create a new headers object for the response
		const headers = new Headers();
		headers.set("Content-Disposition", `attachment; filename="${filename}"`);
		
        // Attempt to guess content type from filename or default to octet-stream/video depending on context
        // But better yet, use the upstream content-type if available, or just map common extensions.
        if (filename.endsWith('.mp4')) {
            headers.set("Content-Type", "video/mp4");
        } else if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) {
             headers.set("Content-Type", "image/jpeg");
        } else if (filename.endsWith('.png')) {
             headers.set("Content-Type", "image/png");
        } else {
             headers.set("Content-Type", "application/octet-stream");
        }

		// Return the stream
		// Next.js App Router route handlers can return a Response object with a ReadableStream
		// Axios 'stream' response.data is a NodeJS Readable stream.
		// We can pass it directly to the Response constructor if we cast it properly or use iterator
		// But for better compatibility in Next.js edge/node envs, explicit streaming is better.
		// Since we are likely in Node environment (default), we can use the iterator approach or simple pass it if compatible.
		// NOTE: response.data from axios with responseType: 'stream' is a node stream.
		// We can wrap it in a Web ReadableStream.

		// Simplified approach: iterate the node stream and yield chunks
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
