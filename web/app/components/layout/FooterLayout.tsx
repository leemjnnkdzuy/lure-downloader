import Footer from "@/app/components/common/Footer";

interface FooterLayoutProps {
	children: React.ReactNode;
}

export default function FooterLayout({children}: FooterLayoutProps) {
	return (
		<div className='min-h-screen flex flex-col'>
			<main className='flex-1'>{children}</main>
			<Footer />
		</div>
	);
}
