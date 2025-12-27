
import React from "react";
import {Download, Video, Play, Heart, MessageCircle, Share2} from "lucide-react";
import {Button} from "@/app/components/ui/Button";
import {Card} from "@/app/components/ui/Card";
import {TikTokVideoData} from "@/app/services/TikTokService";
import {formatNumber} from "@/app/utils/utils";

interface TikTokDownloaderProps {
	data: TikTokVideoData;
}

export const TikTokDownloader: React.FC<TikTokDownloaderProps> = ({data}) => {
	if (data.images) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<div className='w-12 h-12 rounded-full overflow-hidden border border-black/5 dark:border-white/5'>
							{data.author.avatar && (
								<img
									src={data.author.avatar}
									alt={data.author.nickname}
									className='w-full h-full object-cover'
								/>
							)}
						</div>
						<div>
							<h3 className='font-bold text-xl'>
								{data.author.nickname}
							</h3>
							<p className='text-base text-black/60 dark:text-white/60'>
								@{data.author.unique_id}
							</p>
						</div>
					</div>
					<Button
						onClick={async () => {
							if (!data.images) return;
							for (let i = 0; i < data.images.length; i++) {
								const img = data.images[i];
								const link = document.createElement("a");
								link.href = `/api/tiktok/download?url=${encodeURIComponent(
									img
								)}&filename=image_${i + 1}.jpeg`;
								link.click();
								await new Promise((resolve) => setTimeout(resolve, 500));
							}
						}}
						className='!rounded-xl'
					>
						<Download className='w-5 h-5 mr-2' />
						Tải tất cả ảnh
					</Button>
				</div>
				
				<p className='text-lg font-medium leading-relaxed'>
					{data.title || "Không có mô tả"}
				</p>

				<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
					{data.images.map((img, index) => (
						<div
							key={index}
							className='relative group aspect-[3/4] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5'
						>
							<img
								src={img}
								alt={`Image ${index + 1}`}
								className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
							/>
							<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]'>
								<Button
									onClick={() => {
										const link = document.createElement("a");
										link.href = `/api/tiktok/download?url=${encodeURIComponent(
											img
										)}&filename=image_${index + 1}.jpeg`;
										link.click();
									}}
									className='!p-3 h-12 w-12 !rounded-full !bg-white !text-black hover:!bg-white/90 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300'
									title='Tải ảnh này'
								>
									<Download className='w-5 h-5' />
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col sm:flex-row gap-6 md:gap-8'>
			<div className='w-full sm:w-[280px] aspect-[9/16] relative rounded-2xl overflow-hidden shadow-2xl bg-black/5 dark:bg-white/5 group'>
				<img
					src={data.cover}
					alt={data.title}
					className='w-full h-full object-cover'
				/>
				<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60' />
				<div className='absolute bottom-4 left-4 text-white flex items-center gap-2'>
					<div className='flex items-center gap-1 text-sm font-medium'>
						<Video className='w-4 h-4' />
						<span>Video</span>
					</div>
				</div>
			</div>

			<div className='flex-1 flex flex-col justify-center py-2'>
				<div className='mb-6'>
					<div className='flex items-center gap-3 mb-4'>
						<div className='w-12 h-12 rounded-full overflow-hidden border border-black/10 dark:border-white/10'>
							{data.author.avatar && (
								<img
									src={data.author.avatar}
									alt={data.author.nickname}
									className='w-full h-full object-cover'
								/>
							)}
						</div>
						<div>
							<h3 className='font-bold text-xl'>
								{data.author.nickname}
							</h3>
							<p className='text-base text-black/60 dark:text-white/60'>
								@{data.author.unique_id}
							</p>
						</div>
					</div>
					
					<h3 className='font-medium text-lg leading-relaxed mb-3'>
						{data.title || "Video TikTok"}
					</h3>
				</div>

				<div className='grid grid-cols-4 gap-3 mb-8'>
					<Card
						className='aspect-square flex flex-col items-center justify-center p-4 gap-2 !bg-black/5 dark:!bg-white/5 !border-black/10 dark:!border-white/10'
						hoverEffect
					>
						<Play className='w-5 h-5 text-black/60 dark:text-white/60' />
						<span className='font-bold text-lg'>
							{formatNumber(data.stats.plays)}
						</span>
					</Card>
					<Card
						className='aspect-square flex flex-col items-center justify-center p-4 gap-2 !bg-black/5 dark:!bg-white/5 !border-black/10 dark:!border-white/10'
						hoverEffect
					>
						<Heart className='w-5 h-5 text-red-500' />
						<span className='font-bold text-lg'>
							{formatNumber(data.stats.likes)}
						</span>
					</Card>
					<Card
						className='aspect-square flex flex-col items-center justify-center p-4 gap-2 !bg-black/5 dark:!bg-white/5 !border-black/10 dark:!border-white/10'
						hoverEffect
					>
						<MessageCircle className='w-5 h-5 text-blue-500' />
						<span className='font-bold text-lg'>
							{formatNumber(data.stats.comments)}
						</span>
					</Card>
					<Card
						className='aspect-square flex flex-col items-center justify-center p-4 gap-2 !bg-black/5 dark:!bg-white/5 !border-black/10 dark:!border-white/10'
						hoverEffect
					>
						<Share2 className='w-5 h-5 text-green-500' />
						<span className='font-bold text-lg'>
							{formatNumber(data.stats.shares)}
						</span>
					</Card>
				</div>

				<Button
					onClick={() => {
						if (data.play) {
							const link = document.createElement("a");
							// data.play already contains /api/tiktok/download?url=...
							link.href = `${data.play}&filename=video_${Date.now()}.mp4`;
							link.click();
						}
					}}
					className='!h-14 w-full sm:w-auto !rounded-xl !text-lg font-bold shadow-lg hover:translate-y-[-2px] transition-transform active:translate-y-[1px]'
				>
					<Download className='w-6 h-6 mr-2' />
					Tải Video Không Logo
				</Button>
			</div>
		</div>
	);
};
