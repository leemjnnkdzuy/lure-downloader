import {
	useGlobalNotification,
	NotificationType,
} from "@/app/context/GlobalNotificationContext";

export const useGlobalNotificationPopup = () => {
	const {showNotification} = useGlobalNotification();

	return {
		showNotification,
		success: (message: string, title?: string, duration?: number) =>
			showNotification(message, "success", title, duration),
		error: (message: string, title?: string, duration?: number) =>
			showNotification(message, "error", title, duration),
		info: (message: string, title?: string, duration?: number) =>
			showNotification(message, "info", title, duration),
		warning: (message: string, title?: string, duration?: number) =>
			showNotification(message, "warning", title, duration),
	};
};
