"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaBars, FaShoppingCart, FaUser, FaCaretDown } from "react-icons/fa";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, IdTokenResult } from 'firebase/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const updateDisplayName = useCallback(() => {
    if (user) {
      const name = user.displayName || user.email?.split('@')[0] || 'Khách';
      console.log('Updating display name:', name, 'from user:', user);
      setDisplayName(name);
    } else {
      setDisplayName('');
    }
  }, [user]);

  // Update display name when user changes
  useEffect(() => {
    console.log('User changed:', user?.displayName, user?.email);
    updateDisplayName();
  }, [user, updateDisplayName]);

  // Update admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsUserAdmin(idTokenResult.claims.role === 'ADMIN');
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsUserAdmin(false);
        }
      } else {
        setIsUserAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileOpen(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  // Render auth buttons
  const renderAuthButtons = () => {
    if (loading) {
      return null; // hoặc hiển thị loading spinner
    }

    if (!user) {
      return (
        <div className="space-x-4">
          <Link
            href="/auth/login"
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-500"
          >
            Đăng nhập
          </Link>
          <Link
            href="/auth/register"
            className="bg-white text-primary-600 px-4 py-2 rounded-md text-sm font-medium border border-primary-600 hover:bg-primary-50"
          >
            Đăng ký
          </Link>
        </div>
      );
    }

    return (
      <>
        <Link
          href="/cart"
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
        >
          <FaShoppingCart className="h-5 w-5" />
        </Link>
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <span className="font-medium">
              Xin chào, <span className="text-primary-600">{displayName}</span>
            </span>
            <FaUser className="h-5 w-5" />
            <FaCaretDown className="h-4 w-4" />
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsProfileOpen(false)}
              >
                Thông tin tài khoản
              </Link>
              {isUserAdmin && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Quản lý hệ thống
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Car Showroom
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/cars"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Danh mục xe
              </Link>
              <Link
                href="/new-cars"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Xe mới
              </Link>
              <Link
                href="/used-cars"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Xe đã qua sử dụng
              </Link>
              <Link
                href="/services"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Dịch vụ
              </Link>
              <Link
                href="/news"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Tin tức
              </Link>
              <Link
                href="/contact"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Liên hệ
              </Link>
              {isUserAdmin && (
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Quản lý
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {renderAuthButtons()}
            </div>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {user && displayName && (
                <div className="px-3 py-2 text-sm font-medium text-gray-700">
                  Xin chào, <span className="text-primary-600">{displayName}</span>
                </div>
              )}
              <Link
                href="/cars"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Danh mục xe
              </Link>
              <Link
                href="/new-cars"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Xe mới
              </Link>
              <Link
                href="/used-cars"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Xe đã qua sử dụng
              </Link>
              <Link
                href="/services"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Dịch vụ
              </Link>
              <Link
                href="/news"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Tin tức
              </Link>
              <Link
                href="/contact"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Liên hệ
              </Link>
              {isUserAdmin && (
                <Link
                  href="/admin"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  Quản lý
                </Link>
              )}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="space-y-1 px-2">
                {user ? (
                  <>
                    <Link
                      href="/cart"
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Giỏ hàng
                    </Link>
                    <Link
                      href="/profile"
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Tài khoản
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/login"
                      className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 