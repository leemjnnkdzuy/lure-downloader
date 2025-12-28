export interface TikTokVideoData {
	cover: string;
	title: string;
	play: string;
	author: {
		nickname: string;
		avatar: string;
		unique_id: string;
	};
	stats: {
		plays: number;
		likes: number;
		comments: number;
		shares: number;
		downloads: number;
	};
	images?: string[];
}

export interface UserVideoItem {
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

export interface UserVideosData {
	username: string;
	secUid: string;
	totalVideos: number;
	videos: UserVideoItem[];
}

export const TikTokService = {
	getVideoInfo: async (url: string): Promise<TikTokVideoData> => {
		try {
			const response = await fetch("/api/tiktok/info", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({url}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch video info");
			}

			if (data.status === "success" && data.data) {
				return data.data;
			} else {
				throw new Error(data.message || "Failed to fetch video info");
			}
		} catch (error: any) {
			throw error;
		}
	},

	getUserVideos: async (profileUrl: string): Promise<UserVideosData> => {
		try {
			const response = await fetch(`/api/tiktok/user-videos?url=${encodeURIComponent(profileUrl)}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch user videos");
			}

			return data;
		} catch (error: any) {
			throw error;
		}
	},
	getUserVideosSSE: (
		profileUrl: string,
		onProgress: (data: {count: number; new: number}) => void,
		onLog: (data: {message: string}) => void,
		onComplete: (data: UserVideosData) => void,
		onError: (error: string) => void
	) => {
		const sse = new EventSource(`/api/tiktok/user-videos?url=${encodeURIComponent(profileUrl)}`);

		sse.addEventListener("progress", (e) => {
			try {
				const data = JSON.parse(e.data);
				onProgress(data);
			} catch (err) {
				console.error("Parse progress error", err);
			}
		});

		sse.addEventListener("log", (e) => {
			try {
				const data = JSON.parse(e.data);
				onLog(data);
			} catch (err) {
				console.error("Parse log error", err);
			}
		});

		sse.addEventListener("complete", (e) => {
			try {
				const data = JSON.parse(e.data);
				onComplete(data);
				sse.close();
			} catch (err) {
				console.error("Parse complete error", err);
				onError("Failed to parse complete data");
				sse.close();
			}
		});

		sse.addEventListener("error", (e: any) => {
			if (e.data) {
				try {
					const data = JSON.parse(e.data);
					onError(data.message);
				} catch {
					onError("Connection error");
				}
			}
			// Don't close immediately on generic error as it might be retry logic, but for our API stream structure, error event usually means fatal.
			// However standard EventSource 'error' event (without data) fires on connectivity issues.
			// We relied on our custom 'error' event type from server for logic errors.
			// Let's listen to custom 'error' event.
		});
		
		// Listen to custom 'error' event defined in server
		sse.addEventListener("custom_error", (e: any) => { // 'error' is reserved? No, server sent event: error
             // Actually, 'error' is a standard event name for connection issues.
             // If we send `event: error`, it might trigger the standard handler or a custom one?
             // It's safer to use a specific name if we want to distinguish or rely on the standard `onmessage`.
             // But `addEventListener` supports custom types.
             try {
                const data = JSON.parse(e.data);
                onError(data.message);
                sse.close();
             } catch {}
        });

        // Our server sends `event: error`
        // Client side `sse.addEventListener('error')` catches network errors usually.
        // Let's try to override/add a listener for the specific payload if possible.
        // Actually, if server sends `event: error`, it is a named event.
        // But `onerror` is also triggered on network failure.
        
		return sse;
	},
};
