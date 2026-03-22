import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/sections/Navbar";
import { Check, Trophy, Gamepad2, Info, X } from "lucide-react";
import { useLocation } from "wouter";

// ─── Data ────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  desc: string;
  group: string;
  emoji: string;
};

const GROUPS = ["الكل", "أجدد الفئات", "الكويت", "السعودية", "قطر", "عمان", "الإمارات", "البحرين", "عام", "إسلامي", "دول"] as const;

const CATEGORIES: Category[] = [
  // أجدد الفئات
  { id: "jo", name: "الأردن", desc: "أسئلة تتعلق بالأردن في جميع المجالات", group: "أجدد الفئات", emoji: "🇯🇴" },
  { id: "jo-logos", name: "شعارات أردنية", desc: "أسئلة تتعلق بالشعارات بجميع المجالات في الأردن", group: "أجدد الفئات", emoji: "🏷️" },
  { id: "uae-art", name: "فن إماراتي", desc: "أسئلة عن الفن والفنانين في الإمارات", group: "أجدد الفئات", emoji: "🎨" },
  { id: "jo-football", name: "كرة قدم أردنية", desc: "أسئلة تتعلق بكرة القدم الأردنية وجميع لاعبيها وأهدافها", group: "أجدد الفئات", emoji: "⚽" },
  { id: "gulf-outfit", name: "طقم فنان خليجي", desc: "صور لأطقم ملابس الفنانين وعليك معرفة اسم الفنان الخليجي أو الفيلم", group: "أجدد الفئات", emoji: "👘" },
  { id: "boghazi", name: "فيصل بوغازي", desc: "أسئلة ومقاطع تتعلق بأعمال الفنان الراحل فيصل بوغازي", group: "أجدد الفئات", emoji: "🎭" },
  { id: "ghomaidha", name: "الغميضة", desc: "أسئلة تتعلق بمسلسل الغميضة", group: "أجدد الفئات", emoji: "📺" },
  { id: "share3", name: "شارع الأعشى", desc: "أسئلة تتعلق بمسلسل شارع الأعشى الجزء الأول والثاني", group: "أجدد الفئات", emoji: "🎬" },
  { id: "muthaffar", name: "مسرح المظفر", desc: "أسئلة ومقاطع تتعلق بمسرح خالد المظفر", group: "أجدد الفئات", emoji: "🎪" },
  { id: "manea", name: "مسرح المانع", desc: "أسئلة ومقاطع تتعلق بمسرح مبارك المانع", group: "أجدد الفئات", emoji: "🎪" },

  // الكويت
  { id: "kw", name: "الكويت", desc: "أسئلة تتعلق بالكويت في جميع المجالات", group: "الكويت", emoji: "🇰🇼" },
  { id: "kw-parliament", name: "مجلس الأمة", desc: "أسئلة تتعلق بكل ما يخص مجلس الأمة وأعضاءه", group: "الكويت", emoji: "🏛️" },
  { id: "kw-restaurants", name: "شارع المطاعم", desc: "أسئلة تتعلق بالمطاعم والمأكولات الكويتية والعالمية", group: "الكويت", emoji: "🍽️" },
  { id: "kw-ads", name: "دعايات", desc: "أسئلة ومقاطع تتعلق بدعايات الشركات المحلية والعالمية", group: "الكويت", emoji: "📢" },
  { id: "kw-old", name: "جيل الطيبين", desc: "أسئلة تتعلق بالجيل السابق بالكويت في جميع المجالات", group: "الكويت", emoji: "🕰️" },
  { id: "kw-location", name: "لوكيشن", desc: "أسئلة تتعلق بمواقع الأماكن في الكويت", group: "الكويت", emoji: "📍" },
  { id: "kw-malls", name: "مجمعات الكويت", desc: "أسئلة تتعلق بكل ما يخص المجمعات في الكويت", group: "الكويت", emoji: "🛍️" },
  { id: "kw-cafe", name: "قهاوي", desc: "أسئلة تتعلق بالقهاوي والقهوة في الكويت", group: "الكويت", emoji: "☕" },
  { id: "kw-traffic", name: "مرور الكويت", desc: "أسئلة تتعلق بمرور الكويت وقوانينها", group: "الكويت", emoji: "🚦" },
  { id: "kw-oil", name: "نفط الكويت", desc: "أسئلة تتعلق بشركة نفط الكويت وتاريخها", group: "الكويت", emoji: "🛢️" },

  // السعودية
  { id: "sa", name: "السعودية", desc: "أسئلة تتعلق بالسعودية في جميع المجالات", group: "السعودية", emoji: "🇸🇦" },
  { id: "sa-east", name: "الشرقية", desc: "أسئلة تتعلق بالمنطقة الشرقية في جميع المجالات", group: "السعودية", emoji: "🏙️" },
  { id: "sa-west", name: "الغربية", desc: "أسئلة تتعلق بالمنطقة الغربية في جميع المجالات", group: "السعودية", emoji: "🕌" },
  { id: "sa-south", name: "الجنوب", desc: "أسئلة تتعلق بالمنطقة الجنوبية في جميع المجالات", group: "السعودية", emoji: "⛰️" },
  { id: "sa-center", name: "الوسطى", desc: "أسئلة تتعلق بالمنطقة الوسطى في جميع المجالات", group: "السعودية", emoji: "🏜️" },
  { id: "sa-haramain", name: "الحرمين", desc: "أسئلة تتعلق بمنطقة الحرمين في جميع المجالات", group: "السعودية", emoji: "🕋" },
  { id: "sa-north", name: "الشمال", desc: "أسئلة تتعلق بالمنطقة الشمالية في جميع المجالات", group: "السعودية", emoji: "🏔️" },
  { id: "sa-logos", name: "شعارات سعودية", desc: "أسئلة تتعلق بالشعارات بجميع المجالات في السعودية", group: "السعودية", emoji: "🏷️" },
  { id: "sa-restaurants", name: "مطاعم السعودية", desc: "أسئلة تتعلق بالمطاعم والمأكولات السعودية والعالمية", group: "السعودية", emoji: "🍽️" },
  { id: "sa-supermarket", name: "سوبرماركت", desc: "أسئلة تتعلق بالسوبرماركت والمنتجات بكل أنواعها", group: "السعودية", emoji: "🛒" },
  { id: "sa-dialect", name: "لهجات سعودية", desc: "أسئلة تتعلق بلهجات وكلمات أهل المملكة", group: "السعودية", emoji: "💬" },
  { id: "sa-riyadh", name: "موسم الرياض", desc: "أسئلة تتعلق بكل ما يخص موسم الرياض", group: "السعودية", emoji: "🎡" },
  { id: "sa-cafe", name: "حلا وقهوة", desc: "أسئلة تتعلق بالمقاهي والحلويات السعودية والعالمية", group: "السعودية", emoji: "☕" },
  { id: "sa-anthem", name: "أغاني وطنية", desc: "مقاطع صوتية ومرئية للأغاني الوطنية السعودية", group: "السعودية", emoji: "🎵" },
  { id: "sa-majd", name: "قناة المجد", desc: "أسئلة تتعلق بقناة المجد وذكرياتها", group: "السعودية", emoji: "📡" },

  // قطر
  { id: "qa", name: "قطر", desc: "أسئلة تتعلق بدولة قطر في جميع المجالات", group: "قطر", emoji: "🇶🇦" },
  { id: "qa-restaurants", name: "مطاعم قطر", desc: "أسئلة تتعلق بالمطاعم والمأكولات القطرية والعالمية", group: "قطر", emoji: "🍽️" },
  { id: "qa-supermarket", name: "الجمعية", desc: "أسئلة تتعلق بالسوبرماركت والمنتجات بكل أنواعها في قطر", group: "قطر", emoji: "🛒" },
  { id: "qa-girls", name: "بنات قطر", desc: "أسئلة تتعلق بالتسوق والصالونات وكل ما يخص البنات في قطر", group: "قطر", emoji: "👗" },
  { id: "qa-logos", name: "شعارات قطرية", desc: "أسئلة تتعلق بالشعارات بجميع المجالات في قطر", group: "قطر", emoji: "🏷️" },
  { id: "qa-location", name: "وين في قطر", desc: "أسئلة تتعلق بمواقع الأماكن في قطر", group: "قطر", emoji: "📍" },

  // عمان
  { id: "om", name: "عمان", desc: "أسئلة تتعلق بسلطنة عُمان في جميع المجالات", group: "عمان", emoji: "🇴🇲" },
  { id: "om-supermarket", name: "مقاضي البيت", desc: "أسئلة تتعلق بالسوبرماركت والمنتجات بكل أنواعها في عمان", group: "عمان", emoji: "🛒" },
  { id: "om-zanzibar", name: "زنجبار", desc: "أسئلة تتعلق بسلطنة عُمان وعلاقتها التاريخية بالزنجبار", group: "عمان", emoji: "🌍" },
  { id: "om-celebs", name: "شخصيات عمانية", desc: "أسئلة تتعلق بأعمال وإنجازات الشخصيات العمانية المشهورة", group: "عمان", emoji: "⭐" },
  { id: "om-brands", name: "براندات عمانية", desc: "أسئلة تتعلق بالماركات العمانية", group: "عمان", emoji: "🏷️" },
  { id: "om-landmarks", name: "معالم عمانية", desc: "أسئلة تتعلق بأهم المعالم في سلطنة عُمان", group: "عمان", emoji: "🏰" },
  { id: "om-restaurants", name: "مطاعم عمان", desc: "أسئلة تتعلق بالمطاعم والمأكولات العمانية والعالمية", group: "عمان", emoji: "🍽️" },
  { id: "om-logos", name: "شعارات عمانية", desc: "أسئلة تتعلق بالشعارات بجميع المجالات في عمان", group: "عمان", emoji: "🏷️" },
  { id: "om-proverbs", name: "أمثال عمانية", desc: "أسئلة تتعلق بالأمثال العمانية والعربية", group: "عمان", emoji: "📖" },
  { id: "om-sea", name: "النواخذة", desc: "أسئلة عن البحر وكل ما يتعلق فيه قديماً وحديثاً", group: "عمان", emoji: "⚓" },

  // الإمارات
  { id: "ae", name: "الإمارات", desc: "أسئلة تتعلق بدولة الإمارات في جميع المجالات", group: "الإمارات", emoji: "🇦🇪" },
  { id: "ae-restaurants", name: "مطاعم الإمارات", desc: "أسئلة تتعلق بالمطاعم والمأكولات الإماراتية والعالمية", group: "الإمارات", emoji: "🍽️" },
  { id: "ae-supermarket", name: "الجمعية", desc: "أسئلة تتعلق بالسوبرماركت والمنتجات بكل أنواعها في الإمارات", group: "الإمارات", emoji: "🛒" },
  { id: "ae-girls", name: "بنات الإمارات", desc: "أسئلة تتعلق بالتسوق والصالونات وكل ما يخص البنات في الإمارات", group: "الإمارات", emoji: "👗" },
  { id: "ae-malls", name: "مجمعات الإمارات", desc: "أسئلة تتعلق بكل ما يخص المجمعات في الإمارات", group: "الإمارات", emoji: "🛍️" },
  { id: "ae-logos", name: "شعارات إماراتية", desc: "أسئلة تتعلق بالشعارات بجميع المجالات في الإمارات", group: "الإمارات", emoji: "🏷️" },
  { id: "ae-national", name: "٢ ديسمبر", desc: "أسئلة خاصة بالإمارات والاحتفالات الوطنية", group: "الإمارات", emoji: "🎆" },

  // البحرين
  { id: "bh", name: "البحرين", desc: "أسئلة تتعلق بمملكة البحرين في جميع المجالات", group: "البحرين", emoji: "🇧🇭" },
  { id: "bh-logos", name: "شعارات بحرينية", desc: "أسئلة تتعلق بالشعارات بجميع المجالات في البحرين", group: "البحرين", emoji: "🏷️" },
  { id: "bh-restaurants", name: "مطاعم البحرين", desc: "أسئلة تتعلق بالمطاعم والمأكولات البحرينية والعالمية", group: "البحرين", emoji: "🍽️" },
  { id: "bh-old", name: "البحرين لوّل", desc: "أسئلة تتعلق بالجيل السابق بالبحرين في جميع المجالات", group: "البحرين", emoji: "🕰️" },
  { id: "bh-malls", name: "مجمعات البحرين", desc: "أسئلة تتعلق بكل ما يخص المجمعات في البحرين", group: "البحرين", emoji: "🛍️" },
  { id: "bh-muharraq", name: "ليالي المحرق", desc: "أسئلة تتعلق بليالي المحرق في البحرين", group: "البحرين", emoji: "🌙" },
  { id: "bh-circuit", name: "حلبة البحرين الدولية", desc: "أسئلة تتعلق بكل ما يخص حلبة البحرين", group: "البحرين", emoji: "🏎️" },

  // عام
  { id: "gen-lang", name: "لغة وأدب", desc: "أسئلة تتعلق باللغة والأدب والشعر", group: "عام", emoji: "📝" },
  { id: "gen-poetry", name: "عالم الشعر", desc: "أسئلة تتعلق بالشعر العربي والنبطي", group: "عام", emoji: "🖊️" },
  { id: "gen-history", name: "تاريخ", desc: "أسئلة تتعلق بتاريخ العالم", group: "عام", emoji: "🏺" },
  { id: "gen-info", name: "معلومات عامة", desc: "أسئلة تتعلق بكل ما هو عام ثقافة وسياسية واقتصاد وغيرها", group: "عام", emoji: "🌐" },
  { id: "gen-tech", name: "تكنولوجيا", desc: "أسئلة تتعلق بكل ما يخص عالم التكنولوجيا", group: "عام", emoji: "💻" },
  { id: "gen-animals", name: "عالم الحيوان", desc: "أسئلة تتعلق بعالم الحيوان وجميع ما يخصه", group: "عام", emoji: "🦁" },
  { id: "gen-logos", name: "شعارات", desc: "أسئلة تتعلق بشعارات الشركات المحلية والعالمية", group: "عام", emoji: "🏷️" },
  { id: "gen-logos-world", name: "شعارات عالمية", desc: "أسئلة تتعلق بشعارات الشركات العالمية", group: "عام", emoji: "🌍" },
  { id: "gen-products", name: "منتجات", desc: "أسئلة تتعلق بالمنتجات بكل أنواعها", group: "عام", emoji: "📦" },
  { id: "gen-perfumes-world", name: "عطور عالمية", desc: "أسئلة تتعلق بالعطور من الماركات العالمية", group: "عام", emoji: "🌸" },
  { id: "gen-perfumes-arab", name: "عطور عربية", desc: "أسئلة تتعلق بالعطور والطيب من الماركات العربية والخليجية", group: "عام", emoji: "🕯️" },
  { id: "gen-medicine", name: "طب عام", desc: "أسئلة تتعلق بعالم الطب", group: "عام", emoji: "🏥" },
  { id: "gen-dentist", name: "طب الأسنان", desc: "أسئلة تتعلق بعالم طب الأسنان", group: "عام", emoji: "🦷" },
  { id: "gen-voice", name: "صوت المشهور", desc: "مقاطع صوتية للمشاهير ويعتمد على مدى معرفتك وتركيزك", group: "عام", emoji: "🎙️" },
  { id: "gen-influencer", name: "مين المؤثر", desc: "جزء من صور خاصة بالمشاهير ويعتمد على مدى معرفتك", group: "عام", emoji: "📸" },
  { id: "gen-celeb", name: "منو المشهور", desc: "صور للمشاهير وعليك معرفة من هم", group: "عام", emoji: "⭐" },
  { id: "gen-cars", name: "سيارات", desc: "أسئلة تتعلق بكل ما يخص ماركات السيارات وأشكالها وموديلاتها", group: "عام", emoji: "🚗" },
  { id: "gen-memes", name: "ميمز", desc: "أسئلة تتعلق بالميمز", group: "عام", emoji: "😂" },
  { id: "gen-sea", name: "أهل البحر", desc: "أسئلة عن البحر وكل ما يتعلق فيه قديماً وحديثاً", group: "عام", emoji: "🌊" },
  { id: "gen-desert", name: "أهل البر", desc: "أسئلة عن البر وكل ما يتعلق فيه قديماً وحديثاً", group: "عام", emoji: "🏕️" },
  { id: "gen-watches", name: "عالم الساعات", desc: "أسئلة تتعلق بعالم الساعات وجميع ما يخصها", group: "عام", emoji: "⌚" },
  { id: "gen-beads", name: "مسابيح", desc: "أسئلة خاصة بالمسابيح وكل ما يختص فيها", group: "عام", emoji: "📿" },
  { id: "gen-celebs-young", name: "مشاهير صغار", desc: "صور تتعلق بالمشاهير وهم في مرحلة الطفولة", group: "عام", emoji: "👶" },
  { id: "gen-ramadan", name: "سفرة رمضان", desc: "أسئلة تتعلق بسفرة رمضان بمختلف الأطباق", group: "عام", emoji: "🌙" },

  // إسلامي
  { id: "isl", name: "إسلامي", desc: "أسئلة دينية وتاريخ إسلامي والسيرة النبوية", group: "إسلامي", emoji: "☪️" },
  { id: "isl-quran", name: "القرآن", desc: "أسئلة تتعلق بكل ما يخص القراء والقرآن الكريم", group: "إسلامي", emoji: "📖" },
  { id: "isl-seerah", name: "السيرة النبوية", desc: "أسئلة تتعلق بسيرة الرسول صلى الله عليه وسلم", group: "إسلامي", emoji: "🌟" },
  { id: "isl-prophets", name: "قصص الأنبياء", desc: "أسئلة تتعلق بقصص الأنبياء", group: "إسلامي", emoji: "✨" },
  { id: "isl-sahaba", name: "الصحابة", desc: "أسئلة تتعلق بصحابة الرسول عليه السلام", group: "إسلامي", emoji: "🌙" },
  { id: "isl-meanings", name: "معاني القرآن", desc: "أسئلة تتعلق بمعاني كلمات من القرآن الكريم", group: "إسلامي", emoji: "📝" },
  { id: "isl-juz-amma", name: "جزء عم", desc: "أسئلة تتعلق بكل ما يخص جزء عم من القرآن الكريم", group: "إسلامي", emoji: "📗" },
  { id: "isl-juz-tabarak", name: "جزء تبارك", desc: "أسئلة تتعلق بكل ما يخص جزء تبارك من القرآن الكريم", group: "إسلامي", emoji: "📗" },
  { id: "isl-reader", name: "من القارئ", desc: "أسئلة تتعلق بمقاطع صوتية تخص قراء القرآن الكريم", group: "إسلامي", emoji: "🎙️" },
  { id: "isl-nasheed", name: "أناشيد", desc: "مقاطع صوتية للمنشدين والأناشيد", group: "إسلامي", emoji: "🎵" },
  { id: "isl-hadith", name: "أحاديث", desc: "أسئلة تتعلق بالأحاديث النبوية الشريفة", group: "إسلامي", emoji: "📜" },

  // دول
  { id: "world-geo", name: "جغرافيا", desc: "أسئلة تتعلق بجغرافيا الدول وأهم المعالم فيها", group: "دول", emoji: "🗺️" },
  { id: "world-capitals", name: "دول وعواصم", desc: "أسئلة تتعلق بعواصم الدول وأعلامها وعملاتها وحكامها", group: "دول", emoji: "🏛️" },
  { id: "world-travel", name: "سياحة وسفر", desc: "أسئلة تتعلق بالأماكن السياحية في الدول", group: "دول", emoji: "✈️" },
  { id: "world-aviation", name: "عالم الطيران", desc: "أسئلة تتعلق بعالم الطيران وجميع ما يخصه", group: "دول", emoji: "🛫" },
  { id: "world-currency", name: "عملات", desc: "أسئلة تتعلق بكل ما يخص العملات", group: "دول", emoji: "💰" },
  { id: "world-uk", name: "دفعة بريطانيا", desc: "أسئلة تتعلق بطلبة بريطانيا في جميع المجالات والمدن", group: "دول", emoji: "🇬🇧" },
  { id: "world-which", name: "ما هي الدولة", desc: "أسئلة تتعلق بمعلومات عن الدول", group: "دول", emoji: "🌍" },
  { id: "world-presidents", name: "رؤساء الدول", desc: "أسئلة تتعلق برؤساء الدول وتاريخ الدولة", group: "دول", emoji: "👔" },
  { id: "world-flags", name: "أعلام", desc: "أسئلة تتعلق بأعلام الدول", group: "دول", emoji: "🚩" },
  { id: "world-old-flags", name: "أعلام قديمة", desc: "أسئلة تتعلق بأعلام الدول القديمة", group: "دول", emoji: "🏳️" },
  { id: "world-cap", name: "عواصم", desc: "أسئلة تتعلق بعواصم الدول", group: "دول", emoji: "🏙️" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StartGame() {
  const [, navigate] = useLocation();
  const [gameType, setGameType] = useState<"game" | "tournament">("game");
  const [activeGroup, setActiveGroup] = useState<string>("الكل");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [infoCard, setInfoCard] = useState<Category | null>(null);

  const MAX = 6;

  const filtered = activeGroup === "الكل"
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.group === activeGroup);

  const toggleCategory = (cat: Category) => {
    setSelectedIds((prev) => {
      if (prev.includes(cat.id)) return prev.filter((id) => id !== cat.id);
      if (prev.length >= MAX) return prev;
      return [...prev, cat.id];
    });
  };

  const team1 = selectedIds.slice(0, 3);
  const team2 = selectedIds.slice(3, 6);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">إنشاء لعبة</h1>
            <p className="text-foreground/60 text-lg">لعبة جماعية تفاعلية نختبر فيها معرفتكم وثقافتكم</p>
          </motion.div>

          {/* Game Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-14"
          >
            <button
              onClick={() => setGameType("game")}
              className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl border-2 transition-all font-bold text-lg ${
                gameType === "game"
                  ? "bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-[0_0_24px_rgba(123,47,190,0.5)]"
                  : "bg-white border-purple-200 text-foreground hover:border-[#7B2FBE]/50"
              }`}
            >
              <Gamepad2 size={32} />
              إنشاء لعبة
            </button>
            <button
              onClick={() => setGameType("tournament")}
              className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-2xl border-2 transition-all font-bold text-lg ${
                gameType === "tournament"
                  ? "bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-[0_0_24px_rgba(123,47,190,0.5)]"
                  : "bg-white border-purple-200 text-foreground hover:border-[#7B2FBE]/50"
              }`}
            >
              <Trophy size={32} />
              إنشاء بطولة
            </button>
          </motion.div>

          {/* Category Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-foreground mb-2">اختر الفئات</h2>
              <p className="text-foreground/60">
                ٣ فئات لفريقك، و٣ فئات للفريق المنافس، بمجموع ٦ فئات بـ ٣٦ سؤال مختلف
              </p>
            </div>

            {/* Selection Status */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-foreground/50 font-medium">فريقك</span>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                        team1[i]
                          ? "bg-[#7B2FBE] border-[#7B2FBE] text-white"
                          : "border-purple-200 bg-white text-foreground/30"
                      }`}
                    >
                      {team1[i] ? <Check size={14} /> : i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-foreground/50 font-medium">الفريق المنافس</span>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                        team2[i]
                          ? "bg-purple-400 border-purple-400 text-white"
                          : "border-purple-200 bg-white text-foreground/30"
                      }`}
                    >
                      {team2[i] ? <Check size={14} /> : i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Group Filter Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeGroup === group
                      ? "bg-[#7B2FBE] text-white shadow-[0_0_14px_rgba(123,47,190,0.4)]"
                      : "bg-white border border-purple-200 text-foreground hover:border-[#7B2FBE]/50"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((cat) => {
                  const selected = selectedIds.includes(cat.id);
                  const teamIdx = selectedIds.indexOf(cat.id);
                  const isTeam1 = teamIdx >= 0 && teamIdx < 3;
                  const disabled = !selected && selectedIds.length >= MAX;

                  return (
                    <motion.div
                      key={cat.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: disabled ? 0.4 : 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`relative rounded-2xl border-2 p-4 flex flex-col items-center text-center cursor-pointer transition-all select-none ${
                        selected
                          ? isTeam1
                            ? "bg-[#7B2FBE] border-[#7B2FBE] text-white shadow-[0_0_20px_rgba(123,47,190,0.45)]"
                            : "bg-purple-300 border-purple-400 text-white shadow-[0_0_20px_rgba(167,139,250,0.4)]"
                          : "bg-white border-purple-200 hover:border-[#7B2FBE]/60 hover:shadow-md"
                      } ${disabled ? "cursor-not-allowed" : ""}`}
                      onClick={() => !disabled && toggleCategory(cat)}
                    >
                      {/* Info button */}
                      <button
                        className={`absolute top-2 left-2 opacity-50 hover:opacity-100 transition-opacity ${selected ? "text-white" : "text-foreground"}`}
                        onClick={(e) => { e.stopPropagation(); setInfoCard(cat); }}
                      >
                        <Info size={14} />
                      </button>

                      {/* Check badge */}
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}

                      <span className="text-3xl mb-2">{cat.emoji}</span>
                      <span className={`text-sm font-bold leading-tight ${selected ? "text-white" : "text-foreground"}`}>
                        {cat.name}
                      </span>
                      <span className={`text-xs mt-1 ${selected ? "text-white/70" : "text-foreground/40"}`}>
                        {cat.group}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Start Button */}
          <AnimatePresence>
            {selectedIds.length === MAX && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
              >
                <button className="bg-[#7B2FBE] text-white font-black text-xl py-4 px-14 rounded-full shadow-[0_0_40px_rgba(123,47,190,0.6)] hover:bg-[#8B35D6] hover:shadow-[0_0_60px_rgba(123,47,190,0.8)] hover:-translate-y-1 transition-all">
                  ابدأ اللعبة 🎮
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Info Modal */}
      <AnimatePresence>
        {infoCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setInfoCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-4xl">{infoCard.emoji}</span>
                  <h3 className="text-2xl font-black text-foreground mt-2">{infoCard.name}</h3>
                  <span className="text-sm text-purple-500 font-medium">{infoCard.group}</span>
                </div>
                <button onClick={() => setInfoCard(null)} className="text-foreground/40 hover:text-foreground transition-colors">
                  <X size={24} />
                </button>
              </div>
              <p className="text-foreground/70 leading-relaxed">{infoCard.desc}</p>
              <button
                className="mt-6 w-full bg-[#7B2FBE] text-white font-bold py-3 rounded-xl hover:bg-[#8B35D6] transition-colors"
                onClick={() => { toggleCategory(infoCard); setInfoCard(null); }}
              >
                {selectedIds.includes(infoCard.id) ? "إلغاء الاختيار" : "اختر هذه الفئة"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
