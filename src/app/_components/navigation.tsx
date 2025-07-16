"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import NotificationBell from "./notification-bell";

export function Navigation() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">Loom</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            
            {status === "authenticated" && (
              <>
                <Link href="/cart" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Cart
                </Link>
                <Link href="/orders" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Orders
                </Link>
                {session.user.role === "seller" && (
                  <Link href="/dashboard/seller" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <span className="text-gray-700 text-sm">
                    Hi, {session.user.name || "User"}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}

            {status === "unauthenticated" && (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              
              {status === "authenticated" && (
                <>
                  <Link href="/cart" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                    Cart
                  </Link>
                  <Link href="/orders" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                    Orders
                  </Link>
                  {session.user.role === "seller" && (
                    <Link href="/dashboard/seller" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                      Dashboard
                    </Link>
                  )}
                  <div className="px-3 py-2">
                    <p className="text-gray-700 text-sm">Hi, {session.user.name || "User"}</p>
                    <button
                      onClick={() => signOut()}
                      className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}

              {status === "unauthenticated" && (
                <div className="px-3 py-2 space-y-2">
                  <Link
                    href="/login"
                    className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
