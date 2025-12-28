"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {Loader2} from "lucide-react";
import {useAuthContext} from "@/app/context/AuthContext";

export function PrivateRoute({children}: {children: React.ReactNode}) {
	const router = useRouter();
	const {user, loading} = useAuthContext();

	useEffect(() => {
		if (!loading && !user) {
			router.push("/");
		}
	}, [loading, user, router]);

	if (loading) {
		return (
			<div className='min-h-screen bg-black text-white flex items-center justify-center'>
				<Loader2 className='w-8 h-8 animate-spin text-white/50' />
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return <>{children}</>;
}

export function PublicRoute({children}: {children: React.ReactNode}) {
	return <>{children}</>;
}
