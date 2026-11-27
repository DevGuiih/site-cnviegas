'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const router = useRouter();
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push('/');
  };

  const navigateTo = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

return (
    <header className="relative z-40 w-full bg-[#C8C1B4] rounded-br-[45px] sm:rounded-br-[65px] lg:rounded-br-[80px] shadow-sm">
      <div className="w-full px-5 sm:px-8 lg:px-12 h-[68px] sm:h-[76px] lg:h-[84px] flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 sm:gap-4 lg:gap-5 group min-w-0"
        >
          <Image
            src="/images/logo-cnviegas.png"
            alt="Logo Biblioteca CN Viegas"
            width={56}
            height={56}
            priority
            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover shrink-0 transition-transform group-hover:scale-105"
          />
          <span className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-[#524F4A] truncate">
            Biblioteca CN Viegas
          </span>
        </Link>

        {/* Right Side: Login or Authenticated Avatar Pop-up */}
        <div className="relative shrink-0" ref={menuRef}>
          {isAuthenticated && currentUser ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Abrir menu do usuário"
                aria-expanded={menuOpen}
                className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border-[3px] lg:border-4 border-black bg-[#E2E2E2] flex items-center justify-center overflow-hidden hover:scale-105 transition-transform cursor-pointer"
              >
                <svg
                  viewBox="0 0 64 64"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <circle cx="32" cy="32" r="32" fill="#D4D4D4" />
                  <circle cx="32" cy="24" r="11" fill="#FAFAFA" />
                  <path
                    d="M12 56c2-11 10-16 20-16s18 5 20 16"
                    fill="#FAFAFA"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="dialog"
                  aria-label={role === 'admin' ? 'Menu do Administrador' : 'Menu do Leitor'}
                  className="absolute right-0 top-full mt-3 z-50 w-[290px] sm:w-[360px] bg-[#EBE3D4] border-[3px] border-[#D29F96] rounded-[30px] shadow-coletivo-card p-6 flex flex-col gap-3"
                >
                  <div className="pb-1">
                    <p className="text-2xl sm:text-[30px] font-normal text-black leading-tight truncate">
                      {role === 'admin' ? 'Admin' : `“${currentUser.name}”`}
                    </p>
                    {role === 'admin' && (
                      <p className="text-xs text-[#524F4A] font-medium truncate mt-0.5">
                        {currentUser.name}
                      </p>
                    )}
                  </div>

                  {role === 'admin' ? (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => navigateTo('/admin/readers')}
                        className="w-full py-2.5 px-6 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer"
                      >
                        Leitores
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('/admin')}
                        className="w-full py-2.5 px-6 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer"
                      >
                        Livros
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('/admin/historico')}
                        className="w-full py-2.5 px-6 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer"
                      >
                        Empréstimos
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-2.5 px-6 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer"
                      >
                        Sair
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => navigateTo('/readers?tab=wishlist')}
                        className="w-full py-2.5 px-6 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer"
                      >
                        Meus Favoritos
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('/readers')}
                        className="w-full py-2.5 px-6 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer"
                      >
                        Meus Empréstimos
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-2.5 px-6 rounded-[10px] bg-[#D29F96] hover:bg-[#C98B81] active:bg-[#BE7467] text-black text-xl sm:text-2xl font-normal shadow-coletivo-btn transition-colors cursor-pointer"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="font-bold text-lg sm:text-xl lg:text-2xl text-[#524F4A] hover:text-[#3B3935] transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
