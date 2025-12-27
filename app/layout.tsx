import type {Metadata} from "next";
import {Outfit, JetBrains_Mono} from "next/font/google";
import "./globals.css";

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Lure Downloader",
	description: "Premium file downloader",
};

import {GlobalNotificationProvider} from "./context/GlobalNotificationContext";
import {ThemeProvider} from "./hooks/useTheme";
import {AuthProvider} from "./context/AuthContext";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
			>
				<ThemeProvider>
					<AuthProvider>
						<GlobalNotificationProvider>
							{children}
						</GlobalNotificationProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
