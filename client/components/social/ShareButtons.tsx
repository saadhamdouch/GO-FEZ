"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Share2, Facebook, Twitter, Mail, MessageSquare } from "lucide-react"; // lucide-react seems to be used elsewhere

interface ShareButtonsProps {
  shareUrl: string;
  title: string;
}

const ShareButtons = ({ shareUrl, title }: ShareButtonsProps) => {
  const t = useTranslations("ShareButtons");

  // Basic share URLs
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(t("emailBody") + " " + shareUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`;

  return (
    <div className="space-y-3">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Share2 size={20} />
        {t("title")}
      </h4>
      <div className="flex items-center space-x-2">
        {/* Simple anchor tags that open in a new tab */}
        <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <Facebook size={20} className="text-blue-700" />
        </a>
        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <Twitter size={20} className="text-blue-400" />
        </a>
        <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <MessageSquare size={20} className="text-green-500" />
        </a>
        <a href={emailShareUrl} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <Mail size={20} className="text-gray-600" />
        </a>
      </div>
    </div>
  );
};

export default ShareButtons;