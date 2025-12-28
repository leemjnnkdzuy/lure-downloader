import React, {useState} from "react";
import {Download, Play, Heart, MessageCircle, Clock, CheckCircle2} from "lucide-react";
import {Button} from "@/app/components/ui/Button";
import {Card} from "@/app/components/ui/Card";
import {UserVideosData, UserVideoItem} from "@/app/services/TikTokService";
import {formatNumber} from "@/app/utils/utils";
import {useGlobalNotification} from "@/app/context/GlobalNotificationContext";

interface TikTokBulkDownloaderProps {
	data: UserVideosData;
}

export const TikTokBulkDownloader: React.FC<TikTokBulkDownloaderProps> = ({data}) => {
	const {showNotification} = useGlobalNotification();
	const [downloadingAll, setDownloadingAll] = useState(false);
	const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
	const [currentDownloadIndex, setCurrentDownloadIndex] = useState(0);

	// Helper to fetch download URL
	const getDownloadUrl = async (videoUrl: string): Promise<string | null> => {
		try {
			const response = await fetch("/api/tiktok/info", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({url: videoUrl}),
			});
			const result = await response.json();
			if (result.status === "success" && result.data.play) {
				return result.data.play;
			}
			return null;
		} catch (error) {
			console.error("Failed to get download url:", error);
			return null;
		}
	};

	const triggerDownload = (url: string, filename: string) => {
		const link = document.createElement("a");
		link.href = `${url}&filename=${filename}`;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleDownloadVideo = async (video: UserVideoItem) => {
		const url = await getDownloadUrl(video.videoUrl);
		if (url) {
			triggerDownload(url, `video_${video.id}.mp4`);
			setDownloadedIds((prev) => new Set([...prev, video.id]));
			return true;
		}
		return false;
	};

	const handleDownloadAll = async () => {
		if (downloadingAll) return;

		setDownloadingAll(true);
		setCurrentDownloadIndex(0);
		showNotification(
			"Đang chuẩn bị tải... Nếu trình duyệt chặn, hãy chú ý icon trên thanh địa chỉ để cấp quyền.",
			"info"
		);

		const BATCH_SIZE = 3;
		const videosToDownload = data.videos.filter((v) => !downloadedIds.has(v.id));

		for (let i = 0; i < videosToDownload.length; i += BATCH_SIZE) {
			const batch = videosToDownload.slice(i, i + BATCH_SIZE);
			
			const downloadTasks = batch.map(async (video) => {
				const url = await getDownloadUrl(video.videoUrl);
				return {video, url};
			});

			const results = await Promise.all(downloadTasks);

			for (const res of results) {
				if (res.url) {
					triggerDownload(res.url, `video_${res.video.id}.mp4`);
					setDownloadedIds((prev) => new Set([...prev, res.video.id]));
					await new Promise((r) => setTimeout(r, 200)); 
				} else {
					console.error(`Failed to fetch url for ${res.video.id}`);
				}
				setCurrentDownloadIndex((prev) => prev + 1);
			}

			if (i + BATCH_SIZE < videosToDownload.length) {
				await new Promise((r) => setTimeout(r, 1000));
			}
		}

		showNotification("Đã hoàn tất quá trình tải xuống!", "success");
		setDownloadingAll(false);
	};

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-bold'>@{data.username}</h2>
					<p className='text-black/60 dark:text-white/60'>
						{data.totalVideos} video • {downloadedIds.size} đã tải
					</p>
				</div>
				<Button
					onClick={handleDownloadAll}
					disabled={downloadingAll}
					className='!rounded-xl !h-12 !px-6 font-bold shadow-lg'
				>
					{downloadingAll ? (
						<>
							<div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2' />
							Đang tải {currentDownloadIndex}/{data.totalVideos}
						</>
					) : (
						<>
							<Download className='w-5 h-5 mr-2' />
							Tải tất cả ({data.totalVideos} video)
						</>
					)}
				</Button>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2'>
				{data.videos.map((video, index) => (
					<Card
						key={video.id}
						className='overflow-hidden !p-0 group relative'
						hoverEffect
					>
						<div className='aspect-[9/16] relative overflow-hidden bg-black/5 dark:bg-white/5'>
							{video.cover ? (
								<img
									src={video.cover}
									alt={video.desc || `Video ${index + 1}`}
									className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center'>
									<Play className='w-12 h-12 text-black/20 dark:text-white/20' />
								</div>
							)}

							{video.duration > 0 && (
								<div className='absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1'>
									<Clock className='w-3 h-3' />
									{formatDuration(video.duration)}
								</div>
							)}

							{downloadedIds.has(video.id) && (
								<div className='absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full'>
									<CheckCircle2 className='w-4 h-4' />
								</div>
							)}

							<div className='absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg font-bold'>
								#{index + 1}
							</div>

							<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]'>
								<Button
									onClick={() => handleDownloadVideo(video)}
									disabled={downloadedIds.has(video.id)}
									className='!p-4 !rounded-full !bg-white !text-black hover:!bg-white/90 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300'
								>
									{downloadedIds.has(video.id) ? (
										<CheckCircle2 className='w-6 h-6 text-green-500' />
									) : (
										<Download className='w-6 h-6' />
									)}
								</Button>
							</div>
						</div>

						<div className='p-3 space-y-2'>
							<p className='text-sm line-clamp-2 min-h-[2.5rem]'>
								{video.desc || "Video TikTok"}
							</p>

							<p className='text-xs text-black/50 dark:text-white/50'>
								{formatDate(video.createDate)}
							</p>

							<div className='flex items-center gap-3 text-xs text-black/60 dark:text-white/60'>
								<span className='flex items-center gap-1'>
									<Play className='w-3 h-3' />
									{formatNumber(video.stats.playCount)}
								</span>
								<span className='flex items-center gap-1'>
									<Heart className='w-3 h-3 text-red-500' />
									{formatNumber(video.stats.diggCount)}
								</span>
								<span className='flex items-center gap-1'>
									<MessageCircle className='w-3 h-3 text-blue-500' />
									{formatNumber(video.stats.commentCount)}
								</span>
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};
