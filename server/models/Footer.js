// models/Footer.js
import mongoose from 'mongoose';

const textFields = {
  brandAmbassadors: String,
  sponsorship: String,
  paymentMethods: String,
  responsibleGaming: String,
  followUs: String,
  tagline: String,
  copyright: String,
  trustedCasino: String,
  description: String,
  official: String,
};

const textsSchema = new mongoose.Schema({
  en: textFields,
  bn: textFields,
});

const itemSchema = new mongoose.Schema({
  name: String,
  season: String,
  img: String,
});

const paymentSchema = new mongoose.Schema({
  name: String,
  img: String,
});

const responsibleSchema = new mongoose.Schema({
  name: String,
  img: String,
});

const footerSchema = new mongoose.Schema({
  texts: textsSchema,
  logo: String,
  social: {
    facebook: String,
    youtube: String,
    instagram: String,
    twitter: String,
    telegram: String,
  },
  ambassadors: [itemSchema],
  sponsors: [itemSchema],
  payments: [paymentSchema],
  responsible: [responsibleSchema],
});

// Default data (extracted from your client code)
footerSchema.statics.getDefault = function() {
  return {
    texts: {
      en: {
        brandAmbassadors: "Brand Ambassadors",
        sponsorship: "Sponsorship",
        paymentMethods: "Payment Methods",
        responsibleGaming: "Responsible Gaming",
        followUs: "Follow Us",
        tagline: "Bangladesh's No.1 - The Biggest and Most Trusted",
        copyright: "Copyright © 2026 | Brand | All Rights Reserved",
        trustedCasino: "Bangladesh's Trusted Online Casino and Cricket Exchange",
        description: "Babu88 is Bangladesh's premier online casino, offering a wide variety of games for both mobile and desktop users. Players can enjoy slots, poker, baccarat, blackjack, and other cricket exchange games with the chance to win real money online. Our platform guarantees maximum security and fast transactions. We provide 24/7 support to ensure your experience is always smooth.",
        official: "Official",
      },
      bn: {
        brandAmbassadors: "ব্র্যান্ড অ্যাম্বাসেডর",
        sponsorship: "স্পনসরশিপ",
        paymentMethods: "মূল্যপরিশোধ পদ্ধতি",
        responsibleGaming: "দায়বদ্ধ গেমিং",
        followUs: "আমাদের অনুসরণ করো",
        tagline: "বাংলাদেশের নং.১ - সবচেয়ে বড় এবং সবচেয়ে বিশ্বস্ত",
        copyright: "কপিরাইট © 2026 | ব্র্যান্ড | সমস্ত অধিকার সংরক্ষিত",
        trustedCasino: "বাংলাদেশের বিশ্বস্ত অনলাইন ক্যাসিনো এবং ক্রিকেট এক্সচেঞ্জ",
        description: "Babu88 হল বাংলাদেশের প্রথম অনলাইন ক্যাসিনো, মোবাইল এবং ডেস্কটপ ব্যবহারকারীদের জন্য বিভিন্ন ধরনের গেম অফার করে। খেলোয়াড়রা অনলাইনে আসল টাকা জেতার সুযোগ সহ স্লট, পোকার, ব্যাকারাট, ব্ল্যাকজ্যাক এবং অন্যান্য ক্রিকেট এক্সচেঞ্জ গেম উপভোগ করতে পারে। আমাদের প্ল্যাটফর্ম সর্বোচ্চ নিরাপত্তা এবং দ্রুত লেনদেনের নিশ্চয়তা দেয়। আমরা 24/7 সাপোর্ট প্রদান করি যাতে আপনার অভিজ্ঞতা সবসময় স্মুথ থাকে।",
        official: "অফিসিয়াল",
      },
    },
    logo: "https://i.ibb.co/LhrtCJcH/babu88-official.png",
    social: {
      facebook: "#",
      youtube: "#",
      instagram: "#",
      twitter: "#",
      telegram: "#",
    },
    ambassadors: [
      { name: "Samira Mahi Khan", season: "2024/2025", img: "https://i.ibb.co/7kQ5m2m/jili.png" },
      { name: "Apu Biswas", season: "2023/2024", img: "https://i.ibb.co/YfQb0yD/pg.png" },
    ],
    sponsors: [
      { name: "Vegas Vikings", season: "2025/2026", img: "https://i.ibb.co/2Sg9P4w/inout.png" },
      { name: "Sudurpaschim Royals", season: "2024/2025", img: "https://i.ibb.co/8D2K2bD/jdb.png" },
      { name: "Telugu Warriors", season: "2024/2025", img: "https://i.ibb.co/mB3z6tF/bng.png" },
      { name: "Colombo Strikers", season: "2024/2025", img: "https://i.ibb.co/3f8bPPv/habanero.png" },
      { name: "Grand Cayman Jaguars", season: "2024/2025", img: "https://i.ibb.co/4K3MZfM/smartsoft.png" },
      { name: "Montreal Tigers", season: "2023/2024", img: "https://i.ibb.co/5h1sZsQ/microgaming.png" },
      { name: "Dambulla Aurea", season: "2023/2024", img: "https://i.ibb.co/9yQ3PpH/onegame.png" },
      { name: "Northern Warriors", season: "2023/2024", img: "https://i.ibb.co/6bJt7m4/playtech.png" },
    ],
    payments: [
      { name: "bKash", img: "https://i.ibb.co/0GZK9XJ/netent.png" },
      { name: "Nagad", img: "https://i.ibb.co/vc2qKc9/nolimit.png" },
      { name: "Rocket", img: "https://i.ibb.co/8Y7dB3f/relax.png" },
      { name: "Upay", img: "https://i.ibb.co/3mKcQ9t/pragmatic.png" },
    ],
    responsible: [
      { name: "18+", img: "https://i.ibb.co/1Zp3f9j/spade.png" },
      { name: "GamCare", img: "https://i.ibb.co/1Mck7Wb/playngo.png" },
    ],
  };
};

export default mongoose.model('Footer', footerSchema);