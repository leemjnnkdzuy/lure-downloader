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
};
