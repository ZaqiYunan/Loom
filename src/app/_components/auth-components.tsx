"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard/profile" className="hidden items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 sm:flex">
          <User className="h-4 w-4" />
          {session.user?.name}
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 no-underline transition hover:bg-gray-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-indigo-700"
    >
      <LogIn className="h-4 w-4" />
      Sign In
    </button>
  );
}
