"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import LanguageSelector from "./LanguageSelector";
import Login from "../auth/Login";
import SignUp from "../auth/SignUp";

interface HeaderProps {
  locale: string;
  isRTL: boolean;
  onLanguageChange: (lang: "en" | "fr" | "ar") => void;
}

export default function Header({
  locale,
  isRTL,
  onLanguageChange,
}: HeaderProps) {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBanner(window.scrollY <= 50);
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 transition-all duration-300">
        {/* Top Banner */}
        {showTopBanner && (
          <div className="border-b border-white/10">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col lg:flex-row items-center justify-center lg:justify-between">
              <p className="hidden sm:block text-white text-xs md:text-sm font-semibold lg:text-left">
                Explore Fez like never before —{" "}
                <a
                  href="#"
                  className="underline hover:text-emerald-300 transition"
                >
                  Download the GO-FEZ App today!
                </a>
              </p>
              <p className="sm:hidden text-white text-xs md:text-sm font-semibold text-center">
                <a
                  href="#"
                  className="underline hover:text-emerald-300 transition"
                >
                  Download the GO-FEZ App today!
                </a>
              </p>
              <div className="hidden lg:flex items-center gap-3 mt-2 lg:mt-0">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition"
                >
                  <i className="fab fa-facebook-f text-[#02355E] text-sm"></i>
                </a>
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition"
                >
                  <i className="fab fa-telegram-plane text-[#02355E] text-sm"></i>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition"
                >
                  <i className="fab fa-instagram text-[#02355E] text-sm"></i>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div
          className={`
        border-b transition-all duration-300
        ${
          isScrolled
            ? "border-white/20 bg-[#02355E]/80 backdrop-blur-lg"
            : "border-white/10 bg-transparent"
        }
      `}
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center h-16 md:h-18">
              {/* Mobile layout only (up to md) */}
              <div className="flex md:hidden justify-between items-center w-full">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-white"
                >
                  {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex-1 flex justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                    <Image
                      src="/images/logo.png"
                      alt="GO-FEZ Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <button
                  onClick={() => setIsSignUpOpen(true)}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-semibold"
                >
                  {t("auth.signup")}
                </button>
              </div>

              {/* Medium & large screens */}
              <div className="hidden md:flex items-center justify-between w-full relative px-2 md:px-6">
                {/* Navigation Links */}
                <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
                  {/* Visible for all md+ */}
                  <a
                    href="#"
                    className="text-white hover:text-emerald-400 transition text-sm font-medium"
                  >
                    {t("nav.home")}
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-emerald-400 transition text-sm font-medium"
                  >
                    {t("nav.routes")}
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-emerald-400 transition text-sm font-medium"
                  >
                    {t("nav.pois")}
                  </a>

                  {/* Hidden on md for better visibility, visible on lg */}
                  <a
                    href="#"
                    className="hidden lg:inline-block text-white hover:text-emerald-400 transition text-sm font-medium"
                  >
                    {t("nav.rewards")}
                  </a>
                  <a
                    href="#"
                    className="hidden lg:inline-block text-white hover:text-emerald-400 transition text-sm font-medium"
                  >
                    {t("nav.partners")}
                  </a>
<a
  href="#"
  className="hidden xl:inline-block text-white hover:text-emerald-400 transition text-sm font-medium"
>
  {t("nav.contact")}
</a>


                </div>

                {/* Centered Logo */}
                <div className="absolute left-1/2 transform -translate-x-1/2 scale-90 md:scale-100">
                  <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                    <Image
                      src="/images/logo.png"
                      alt="GO-FEZ Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 md:gap-4">
                  <LanguageSelector
                    locale={locale}
                    onLanguageChange={onLanguageChange}
                  />
                                    <a
                    href="/admin"
                    className="text-emerald-400 hover:text-white font-semibold text-sm transition"
                  >
                    Admin
                  </a>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm text-white font-semibold hover:bg-white/10 transition rounded-lg"
                  >
                    {t("auth.login")}
                  </button>
                  <button
                    onClick={() => setIsSignUpOpen(true)}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-semibold"
                  >
                    {t("auth.signup")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Menu */}
        {menuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="md:hidden fixed top-0 left-0 h-full w-64 bg-[#02355E] z-50 flex flex-col shadow-2xl overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="w-16 h-16 mx-auto flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="GO-FEZ Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="flex-1 px-6 py-6 space-y-1">
                <a
                  href="#"
                  className="block text-white font-medium py-3 hover:text-emerald-400 transition"
                >
                  {t("nav.home")}
                </a>
                <a
                  href="#"
                  className="block text-white font-medium py-3 hover:text-emerald-400 transition"
                >
                  {t("nav.routes")}
                </a>
                <a
                  href="#"
                  className="block text-white font-medium py-3 hover:text-emerald-400 transition"
                >
                  {t("nav.pois")}
                </a>
                <a
                  href="#"
                  className="block text-white font-medium py-3 hover:text-emerald-400 transition"
                >
                  {t("nav.rewards")}
                </a>
                <a
                  href="#"
                  className="block text-white font-medium py-3 hover:text-emerald-400 transition"
                >
                  {t("nav.partners")}
                </a>
                <a
                  href="#"
                  className="block text-white font-medium py-3 hover:text-emerald-400 transition"
                >
                  {t("nav.contact")}
                </a>
              </div>
              <div className="p-6 space-y-4 border-t border-white/10">
                <button
                  onClick={() => setIsSignUpOpen(true)}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition"
                >
                  {t("auth.signup")}
                </button>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full px-6 py-3 text-white font-semibold border border-white/30 rounded-lg hover:bg-white/10 transition"
                >
                  {t("auth.login")}
                </button>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition"
                  >
                    <i className="fab fa-facebook-f text-[#02355E] text-sm"></i>
                  </a>
                  <a
                    href="https://telegram.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition"
                  >
                    <i className="fab fa-telegram-plane text-[#02355E] text-sm"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-full w-9 h-9 flex items-center justify-center hover:scale-105 transition"
                  >
                    <i className="fab fa-instagram text-[#02355E] text-sm"></i>
                  </a>
                  <div className="ml-1">
                    <LanguageSelector
                      dropUp={true}
                      locale={locale}
                      onLanguageChange={onLanguageChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Modals */}
      {isLoginOpen && (
        <Login
          onClose={() => setIsLoginOpen(false)}
          onSwitchToSignUp={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
          onSwitchToForgotPassword={() => setIsLoginOpen(false)}
        />
      )}
      {isSignUpOpen && (
        <SignUp
          onClose={() => setIsSignUpOpen(false)}
          onSwitchToLogin={() => {
            setIsSignUpOpen(false);
            setIsLoginOpen(true);
          }}
        />
      )}
    </>
  );
}
