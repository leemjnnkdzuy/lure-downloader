import axios from "axios";

export interface DouyinVideoData {
	cover: string;
	title: string;
	play: string;
	images: string[] | null;
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
}

export interface DouyinResponse {
	status: string;
	message?: string;
	data?: DouyinVideoData;
}

class DouyinServiceClass {
	private baseUrl = "/api/douyin";

	async getVideoInfo(url: string): Promise<DouyinVideoData> {
		const response = await axios.post(`${this.baseUrl}/info`, {url});

		if (response.data.status === "success" && response.data.data) {
			return response.data.data;
		}

		throw new Error(
			response.data.message || "Không thể lấy thông tin video Douyin",
		);
	}

	getDownloadUrl(videoUrl: string): string {
		return `${this.baseUrl}/download?url=${encodeURIComponent(videoUrl)}`;
	}
}

export const DouyinService = new DouyinServiceClass();
