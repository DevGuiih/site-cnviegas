'use client';

import React from 'react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full bg-[#C8C1B4] text-[#524F4A] mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-[27px] py-6 sm:py-7 flex flex-col md:flex-row items-start md:items-stretch justify-between gap-6">
        {/* Left: Brand & Copyright */}
        <div className="flex flex-col justify-between gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-4 sm:gap-6 pt-1">
            <Image
              src="/images/logo-cnviegas.png"
              alt="Logo Biblioteca CN Viegas"
              width={75}
              height={75}
              className="w-14 h-14 sm:w-[75px] sm:h-[75px] rounded-full object-cover shrink-0"
            />
            <span className="font-bold text-xl sm:text-2xl lg:text-[32px] leading-tight text-[#524F4A]">
              Biblioteca do Coletivo Negro Viegas D’Abreu
            </span>
          </div>

          <p
            suppressHydrationWarning
            className="text-xs sm:text-[15px] font-semibold text-[#524F4A] sm:pl-7"
          >
            © {new Date().getFullYear()} Biblioteca Coletivo Negro Viegas D&apos;Abreu. Todos os direitos compartilhados.
          </p>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px bg-[#360E07] self-stretch shrink-0" />

        {/* Right: More Info */}
        <div className="md:w-[390px] shrink-0 space-y-3 text-[#524F4A]">
          <h4 className="text-2xl lg:text-[32px] font-bold leading-tight">
            Mais Informações:
          </h4>
          <ul className="space-y-2.5 text-sm sm:text-base font-bold list-disc pl-6">
            <li>
              Faculdade de Engenharia Elétrica e de Computação - FEEC (UNICAMP)
            </li>
            <li>@cn.viegasdabreufeec</li>
            <li>cnviegas@unicamp.br</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
