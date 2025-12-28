type EmailChangeSession = {
	otp: string;
	newEmail?: string;
	verifiedCurrent: boolean;
	expiresAt: number;
};

declare global {
	var emailChangeSessions: Map<string, EmailChangeSession> | undefined;
}

const sessions = globalThis.emailChangeSessions || new Map<string, EmailChangeSession>();

if (process.env.NODE_ENV !== "production") {
	globalThis.emailChangeSessions = sessions;
}

export default sessions;
