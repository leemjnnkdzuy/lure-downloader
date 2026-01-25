import axios from "axios";

export interface YouTubeVideoData {
	id: string;
	title: string;
	description: string;
	channel: {
		id: string;
		name: string;
		handle: string;
		avatar: Array<{url: string; width: number; height: number}>;
		subscriberCountText: string;
	};
	lengthSeconds: number;
	viewCount: number;
	likeCount: number;
	commentCountText: string;
	thumbnails: Array<{url: string; width: number; height: number}>;
	videos: {
		items: Array<{
			url: string;
			quality: string;
			sizeText: string;
			extension: string;
			hasAudio: boolean;
			height: number;
			width: number;
		}>;
	};
	audios: {
		items: Array<{
			url: string;
			mimeType: string;
			sizeText: string;
			extension: string;
		}>;
	};
}

export interface YouTubeResponse {
	status: string;
	message?: string;
	data?: YouTubeVideoData;
}

class YouTubeServiceClass {
	private baseUrl = "/api/youtube";

	async getVideoInfo(url: string): Promise<YouTubeResponse> {
		try {
			const response = await axios.post(`${this.baseUrl}/info`, {url});
			return response.data;
		} catch (error: any) {
			console.error("Error getting YouTube video info:", error);
			return {
				status: "fail",
				message:
					error.response?.data?.message ||
					"Không thể lấy thông tin video YouTube",
			};
		}
	}

	getDownloadUrl(videoUrl: string): string {
		return `${this.baseUrl}/download?url=${encodeURIComponent(videoUrl)}`;
	}
}

export const YouTubeService = new YouTubeServiceClass();
