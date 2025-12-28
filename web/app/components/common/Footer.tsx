"use client";
import {Heart} from "lucide-react";
import {useRouter} from "next/navigation";
import {useTheme} from "@/app/hooks/useTheme";
import {images} from "@/app/assets";
import Image from "next/image";

export default function Footer() {
	const nav = useRouter();
	const {theme} = useTheme();

	return (
		<footer className='bg-[#080808] border-t border-white/10 py-12 px-8'>
			<div className='max-w-6xl mx-auto'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
					<div className='md:col-span-2'>
						<div className='flex items-center gap-3 mb-4 group cursor-pointer'>
							<Image
								src={
									theme === "dark"
										? images.logoWhite
										: images.logoBlack
								}
								alt='Stingray Logo'
								width={32}
								height={32}
								className='w-8 h-8 object-contain transition-all group-hover:scale-110'
							/>
							<span className='text-lg font-semibold text-white tracking-tight'>
								Stingray Lab
							</span>
						</div>
						<p className='text-white/50 text-sm max-w-xs'>
							Biến những dòng code khô khan thành những tác phẩm
							nghệ thuật sống động.
						</p>
					</div>

					<div>
						<h4 className='text-white font-semibold mb-4'>
							Khám phá
						</h4>
						<ul className='space-y-2'>
							<li>
								<div
									onClick={() => nav.push("/about-us")}
									className='text-white/50 text-sm hover:text-[#ff79c6] transition-colors cursor-pointer'
								>
									Về chúng tôi
								</div>
							</li>
							<li>
								<div
									onClick={() => nav.push("/projects")}
									className='text-white/50 text-sm hover:text-[#ff79c6] transition-colors cursor-pointer'
								>
									Dự án
								</div>
							</li>
						</ul>
					</div>

					<div>
						<h4 className='text-white font-semibold mb-4'>
							Liên hệ
						</h4>
						<ul className='space-y-2'>
							<li>
								<div
									onClick={() =>
										window.open(
											"https://discord.gg/AKNeR3PM",
											"_blank"
										)
									}
									className='text-white/50 text-sm hover:text-[#ff79c6] transition-colors cursor-pointer'
								>
									Discord
								</div>
							</li>
							<li>
								<div
									onClick={() =>
										window.open(
											"https://www.facebook.com/leemjnnkdzuy",
											"_blank"
										)
									}
									className='text-white/50 text-sm hover:text-[#ff79c6] transition-colors cursor-pointer'
								>
									Facebook
								</div>
							</li>
							<li>
								<div
									onClick={() =>
										window.open(
											"https://github.com/leemjnnkdzuy/",
											"_blank"
										)
									}
									className='text-white/50 text-sm hover:text-[#ff79c6] transition-colors cursor-pointer'
								>
									GitHub
								</div>
							</li>
						</ul>
					</div>
				</div>

				<div className='border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4'>
					<p className='text-white/40 text-sm'>
						© 2024 Stingray Lab. All rights reserved.
					</p>
					<div className='flex items-center gap-1 text-white/40 text-sm'>
						Made with{" "}
						<Heart className='w-4 h-4 text-[#ff79c6] mx-1' /> in
						Vietnam
					</div>
				</div>
			</div>
		</footer>
	);
}
