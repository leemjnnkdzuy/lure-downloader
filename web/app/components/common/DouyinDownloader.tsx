import React from "react";
import {Card} from "@/app/components/ui/Card";
import {
	Play,
	Eye,
	Heart,
	MessageCircle,
	Share2,
	Download as DownloadIcon,
} from "lucide-react";

interface DouyinVideoData {
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

interface DouyinDownloaderProps {
	data: DouyinVideoData;
}

export const DouyinDownloader: React.FC<DouyinDownloaderProps> = ({data}) => {
	return (
		<div className='w-full max-w-4xl mx-auto space-y-6'>
			{/* Video Info Card */}
			<Card className='overflow-hidden'>
				<div className='relative'>
					<img
						src={data.cover}
						alt={data.title}
						className='w-full h-auto object-cover'
					/>
					<div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6'>
						<div className='text-white w-full'>
							<h2 className='text-2xl font-bold mb-2'>
								{data.title}
							</h2>
							<div className='flex items-center gap-4 text-sm'>
								<span className='flex items-center gap-2'>
									{data.author.avatar && (
										<img
											src={data.author.avatar}
											alt={data.author.nickname}
											className='w-8 h-8 rounded-full'
										/>
									)}
									{data.author.nickname}
								</span>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Stats Card */}
			<Card className='p-6'>
				<h3 className='text-lg font-semibold mb-4'>Thống kê</h3>
				<div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
					<div className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center'>
							<Eye className='text-blue-500 w-5 h-5' />
						</div>
						<div>
							<div className='text-sm text-gray-500'>
								Lượt xem
							</div>
							<div className='text-lg font-semibold'>
								{data.stats.plays.toLocaleString()}
							</div>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center'>
							<Heart className='text-pink-500 w-5 h-5' />
						</div>
						<div>
							<div className='text-sm text-gray-500'>Thích</div>
							<div className='text-lg font-semibold'>
								{data.stats.likes.toLocaleString()}
							</div>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center'>
							<MessageCircle className='text-green-500 w-5 h-5' />
						</div>
						<div>
							<div className='text-sm text-gray-500'>
								Bình luận
							</div>
							<div className='text-lg font-semibold'>
								{data.stats.comments.toLocaleString()}
							</div>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center'>
							<Share2 className='text-purple-500 w-5 h-5' />
						</div>
						<div>
							<div className='text-sm text-gray-500'>Chia sẻ</div>
							<div className='text-lg font-semibold'>
								{data.stats.shares.toLocaleString()}
							</div>
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center'>
							<DownloadIcon className='text-orange-500 w-5 h-5' />
						</div>
						<div>
							<div className='text-sm text-gray-500'>Tải về</div>
							<div className='text-lg font-semibold'>
								{data.stats.downloads.toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Download Card */}
			<Card className='p-6'>
				<h3 className='text-lg font-semibold mb-4'>Tải xuống</h3>
				<div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
					<div className='flex items-center gap-4'>
						<div className='w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center'>
							<Play className='text-red-500 w-4 h-4' />
						</div>
						<div>
							<div className='font-medium'>Video Douyin</div>
							<div className='text-sm text-gray-500'>
								Không watermark
							</div>
						</div>
					</div>
					<a
						href={data.play}
						download
						className='px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium'
					>
						Tải xuống
					</a>
				</div>
			</Card>
		</div>
	);
};
