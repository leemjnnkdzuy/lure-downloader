import React from "react";
import {YouTubeVideoData} from "@/app/services/YouTubeService";
import {Card} from "@/app/components/ui/Card";
import {
	Play,
	Eye,
	Heart,
	MessageCircle,
	Music,
	Info,
	Grid,
	List,
} from "lucide-react";
import {motion} from "framer-motion";
import Image from "next/image";

interface YouTubeDownloaderProps {
	data: YouTubeVideoData;
}

export const YouTubeDownloader: React.FC<YouTubeDownloaderProps> = ({data}) => {
	const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

	const handleDownload = (url: string, filename: string) => {
		const link = document.createElement("a");
		link.href = `/api/youtube/download?url=${encodeURIComponent(url)}`;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Get largest thumbnail
	const thumbnail =
		data.thumbnails && data.thumbnails.length > 0 ?
			data.thumbnails[data.thumbnails.length - 1].url
		:	"";

	// Get avatar
	const avatar =
		data.channel.avatar && data.channel.avatar.length > 0 ?
			data.channel.avatar[0].url
		:	"";

	// Format duration
	const formatDuration = (seconds: number) => {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0)
			return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<div className='w-full max-w-4xl mx-auto space-y-6 mb-10'>
			{/* Video Info Card */}
			<Card className='overflow-hidden'>
				<div className='relative aspect-video w-full'>
					{thumbnail && (
						<img
							src={thumbnail}
							alt={data.title}
							className='w-full h-full object-cover'
						/>
					)}
					<div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4 md:p-6'>
						<div className='text-white w-full space-y-3'>
							<h2 className='text-base md:text-2xl font-bold line-clamp-2'>
								{data.title}
							</h2>

							<a
								href={`https://youtube.com/${data.channel.handle}`}
								target='_blank'
								rel='noreferrer'
								className='flex items-center gap-2 hover:text-red-400 transition-colors w-fit'
							>
								{avatar && (
									<img
										src={avatar}
										alt={data.channel.name}
										className='w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/20'
									/>
								)}
								<span className='font-medium text-sm md:text-base truncate max-w-[150px] md:max-w-none'>
									{data.channel.name}
								</span>
							</a>

							<div className='flex items-center gap-2 flex-wrap'>
								{data.lengthSeconds > 0 && (
									<span className='flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-xs backdrop-blur-sm'>
										<Play className='w-3 h-3' />
										{formatDuration(data.lengthSeconds)}
									</span>
								)}
								{data.viewCount && (
									<span className='flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-xs backdrop-blur-sm'>
										<Eye className='w-3 h-3' />
										{data.viewCount.toLocaleString()}
									</span>
								)}
								{data.likeCount && (
									<span className='flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-xs backdrop-blur-sm'>
										<Heart className='w-3 h-3' />
										{data.likeCount.toLocaleString()}
									</span>
								)}
								{data.commentCountText && (
									<span className='flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-xs backdrop-blur-sm'>
										<MessageCircle className='w-3 h-3' />
										{data.commentCountText}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* View Mode Toggle */}
			<div className='flex justify-end'>
				<div className='bg-gray-100 dark:bg-white/10 p-1 rounded-lg flex items-center relative gap-1'>
					<button
						onClick={() => setViewMode("list")}
						className={`relative z-10 p-2 rounded-md transition-colors ${viewMode === "list" ? "text-blue-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
						title='Danh sách'
					>
						<List className='w-5 h-5' />
						{viewMode === "list" && (
							<motion.div
								layoutId='viewModeBg'
								className='absolute inset-0 bg-white dark:bg-black/50 rounded-md shadow-sm -z-10'
								transition={{
									type: "spring",
									bounce: 0.2,
									duration: 0.6,
								}}
							/>
						)}
					</button>
					<button
						onClick={() => setViewMode("grid")}
						className={`relative z-10 p-2 rounded-md transition-colors ${viewMode === "grid" ? "text-blue-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
						title='Lưới'
					>
						<Grid className='w-5 h-5' />
						{viewMode === "grid" && (
							<motion.div
								layoutId='viewModeBg'
								className='absolute inset-0 bg-white dark:bg-black/50 rounded-md shadow-sm -z-10'
								transition={{
									type: "spring",
									bounce: 0.2,
									duration: 0.6,
								}}
							/>
						)}
					</button>
				</div>
			</div>

			{data.videos?.items?.length > 0 && (
				<div>
					<h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
						<Play className='w-5 h-5 text-red-500' />
						Danh sách video
					</h3>
					<div
						className={
							viewMode === "grid" ?
								"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
							:	"flex flex-col gap-2"
						}
					>
						{data.videos.items.map((video, index) => (
							<div
								key={index}
								className={`
									flex ${viewMode === "grid" ? "flex-col text-center" : "flex-row justify-between"} 
									p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 
									hover:border-red-500/30 transition-all group
								`}
							>
								<div
									className={`flex items-center gap-4 ${viewMode === "grid" ? "flex-col justify-center w-full mb-3" : ""}`}
								>
									<div className='flex flex-col'>
										<span
											className={`font-bold flex items-center gap-2 ${viewMode === "grid" ? "justify-center" : ""}`}
										>
											{video.quality}
											{!video.hasAudio && (
												<span className='text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded'>
													Ko tiếng
												</span>
											)}
										</span>
										<span className='text-xs text-gray-500'>
											{video.extension.toUpperCase()} •{" "}
											{video.sizeText || "N/A"}
										</span>
									</div>
								</div>
								<button
									onClick={() =>
										handleDownload(
											video.url,
											`youtube-${data.id}-${video.quality}.mp4`,
										)
									}
									className={`
										px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors 
										flex items-center gap-2 ${viewMode === "grid" ? "w-full justify-center" : ""}
									`}
								>
									Tải xuống
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{data.audios?.items?.length > 0 && (
				<div>
					<h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
						<Music className='w-5 h-5 text-purple-500' />
						Danh sách audio
					</h3>
					<div
						className={
							viewMode === "grid" ?
								"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
							:	"flex flex-col gap-2"
						}
					>
						{data.audios.items.map((audio, index) => (
							<div
								key={index}
								className={`
									flex ${viewMode === "grid" ? "flex-col text-center" : "flex-row justify-between"} 
									p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 
									hover:border-purple-500/30 transition-all
								`}
							>
								<div
									className={`flex items-center gap-4 ${viewMode === "grid" ? "flex-col justify-center w-full mb-3" : ""}`}
								>
									<div className='flex flex-col'>
										<span className='font-bold'>
											Audio only
										</span>
										<span className='text-xs text-gray-500'>
											{audio.extension.toUpperCase()} •{" "}
											{audio.sizeText || "N/A"}
										</span>
									</div>
								</div>
								<button
									onClick={() =>
										handleDownload(
											audio.url,
											`youtube-${data.id}-audio.${audio.extension}`,
										)
									}
									className={`
										px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors
										${viewMode === "grid" ? "w-full justify-center" : ""}
									`}
								>
									Tải xuống
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
