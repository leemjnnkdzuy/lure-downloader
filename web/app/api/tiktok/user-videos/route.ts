import {NextRequest, NextResponse} from "next/server";

const COOKIES_STRING =
	"ttwid=1%7CXhpoS1avwMFZJCLjooh-RgqP9zrWy8N6sC-NxcByy6I%7C1766846192%7Ca9a9ec8655363d52afbd8f58177e2dfba72a146d7b773cfcd09e65b771c406b9; tt_csrf_token=8klBPk5Z-cjcgudmjAJt4M7GBuJZBMPdSRWQ; tt_chain_token=Tfmb3zbO0Hb/BUmy69k2kg==; tiktok_webapp_theme_source=auto; tiktok_webapp_theme=dark; delay_guest_mode_vid=5; odin_tt=74e7dcbe0fd612dd80e79308b320a0c3ea9e47274b8147edd334861f446bb89012049611e871805c67ca66bb35ac7d1acee8f6e207fc24a58e8fcfcba370f35aa56bdfee0099c50c32e6210a315ebb9e; msToken=JIWGy5cgMb9luDgB4hqd0xjit1nh_3rL_frRjR6ffFggFidEurnwlstg7hYRGFel5Z6EPl84dbJvBX_whUm2Kww6qGpnIr92EAk5_k0x3j9bwU9t2ppIlsUfiLbj6GNhZXUwXieK2dkT-Pqc9DDRhvjq; msToken=6ETzAhBBOArIqqNFQYzBnjcxfF2iFgYq95guhv_J0dzvdzxJkVda37F1ksaFGSnRYx7QLGLKfep5n-LTLKBRSfT60tPtIxVvsdCNMllOmCaAnknfFj-rmOVg07GpVE9g0mvAK2jWCrLYhEdcSU9Pjmqc";

interface VideoData {
	id: string;
	desc: string;
	createTime: number;
	createDate: string;
	videoUrl: string;
	stats: {
		playCount: number;
		diggCount: number;
		commentCount: number;
		shareCount: number;
		collectCount: number;
	};
	cover: string;
	duration: number;
}

function parseCookies(cookieString: string, domain: string) {
	return cookieString
		.split(";")
		.map((pair) => {
			const [name, value] = pair.trim().split("=");
			return {name, value: value || "", domain, path: "/", secure: true, httpOnly: false};
		})
		.filter((c) => c.name && c.value);
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const profileUrl = searchParams.get("url");

	if (!profileUrl) {
		return NextResponse.json({error: "URL is required"}, {status: 400});
	}

	const usernameMatch = profileUrl.match(/@([^/?]+)/);
	if (!usernameMatch) {
		return NextResponse.json({error: "Invalid profile URL"}, {status: 400});
	}
	const username = usernameMatch[1];

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();
			const send = (event: string, data: any) => {
				controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
			};

			let browser: any = null;

			try {
				const puppeteer = require("puppeteer-extra");
				const StealthPlugin = require("puppeteer-extra-plugin-stealth");
				puppeteer.use(StealthPlugin());

				browser = await puppeteer.launch({
					headless: true,
					args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
				});

				const page = await browser.newPage();

				const cookies = parseCookies(COOKIES_STRING, ".tiktok.com");
				await page.setCookie(...cookies);

				const allVideos = new Map<string, VideoData>();

				page.on("response", async (response: any) => {
					const url = response.url();
					if (url.includes("/api/post/item_list/") || url.includes("/api/item_list/")) {
						try {
							const json = await response.json();
							if (json.itemList && Array.isArray(json.itemList)) {
								let newCount = 0;
								json.itemList.forEach((item: any) => {
									if (!allVideos.has(item.id)) {
										allVideos.set(item.id, {
											id: item.id,
											desc: item.desc || "",
											createTime: item.createTime,
											createDate: new Date(item.createTime * 1000).toISOString(),
											videoUrl: `https://www.tiktok.com/@${username}/video/${item.id}`,
											stats: {
												playCount: item.stats?.playCount || 0,
												diggCount: item.stats?.diggCount || 0,
												commentCount: item.stats?.commentCount || 0,
												shareCount: item.stats?.shareCount || 0,
												collectCount: item.stats?.collectCount || 0,
											},
											cover: item.video?.cover || "",
											duration: item.video?.duration || 0,
										});
										newCount++;
									}
								});
								if (newCount > 0) {
									send("progress", {count: allVideos.size, new: newCount});
								}
							}
						} catch (e) {
							// Ignore parse errors
						}
					}
				});

				const targetUrl = `https://www.tiktok.com/@${username}`;
				await page.goto(targetUrl, {waitUntil: "domcontentloaded", timeout: 30000});

				try {
					await page.waitForSelector('[data-e2e="user-post-item"]', {timeout: 20000});
				} catch (e) {
					send("log", {message: "Không tìm thấy element video, thử cuộn anyway..."});
				}

				let lastHeight = await page.evaluate("document.body.scrollHeight");
				let unchangedCount = 0;
				const maxUnchanged = 4;

				while (unchangedCount < maxUnchanged) {
					await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
					await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
					const newHeight = await page.evaluate("document.body.scrollHeight");

					if (newHeight === lastHeight) {
						unchangedCount++;
					} else {
						unchangedCount = 0;
						lastHeight = newHeight;
					}
				}

				const videosArray = Array.from(allVideos.values());

				send("complete", {
					username,
					totalVideos: videosArray.length,
					fetchedAt: new Date().toISOString(),
					videos: videosArray,
				});

			} catch (error: any) {
				console.error("Puppeteer Error:", error);
				send("error", {message: error.message || "Lỗi khi lấy dữ liệu video"});
			} finally {
				if (browser) await browser.close();
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
		},
	});
}
