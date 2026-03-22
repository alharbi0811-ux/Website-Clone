import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/sections/Navbar";
import { Check, Trophy, Gamepad2, Info, X } from "lucide-react";
import { useLocation } from "wouter";

const CDN = "https://d442zbpa1tgal.cloudfront.net";

type Category = {
  id: string;
  name: string;
  img: string;
  flag?: string;
};

type Section = {
  name: string;
  flag?: string;
  categories: Category[];
};

const SECTIONS: Section[] = [
  {
    name: "أجدد الفئات",
    categories: [
      { id: "new-jordan", name: "الأردن", img: `${CDN}/1771768010525-771576054.jpg` },
      { id: "new-jo-logos", name: "شعارات أردنية", img: `${CDN}/1773680488694-532963419.jpg` },
      { id: "new-uae-art", name: "فن إماراتي", img: `${CDN}/1773239229651-684456354.jpg` },
      { id: "new-jo-football", name: "كرة قدم أردنية", img: `${CDN}/1771078614665-784276205.png` },
      { id: "new-gulf-outfit", name: "طقم فنان خليجي", img: `${CDN}/1772110864905-588292764.jpg` },
      { id: "new-faisal", name: "فيصل بوغازي", img: `${CDN}/1773064818148-154584863.jpg` },
      { id: "new-live1", name: "Live", img: `${CDN}/1772459128688-499091855.jpg` },
      { id: "new-live2", name: "Live", img: `${CDN}/1772459069961-721054682.jpg` },
      { id: "new-muzaffar", name: "مسرح المظفر", img: `${CDN}/1773857820860-639734911.jpg` },
      { id: "new-manae", name: "مسرح المانع", img: `${CDN}/1773857753928-637269502.jpg` },
    ],
  },
  {
    name: "الكويت",
    flag: `${CDN}/flags/kuwait.png`,
    categories: [
      { id: "kw", name: "الكويت", img: `${CDN}/1769955614865-48498592.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-parliament", name: "مجلس الأمة", img: `${CDN}/1714490868454-914972575.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-restaurants", name: "شارع المطاعم", img: `${CDN}/1722983854149-260057650.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-ads", name: "دعايات", img: `${CDN}/1739270060080-288600531.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-old", name: "جيل الطيبين", img: `${CDN}/1756575104773-387256081.png`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-location", name: "لوكيشن", img: `${CDN}/1765874335281-496463000.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-malls", name: "مجمعات الكويت", img: `${CDN}/1739335430643-464471679.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-cafe", name: "قهاوي", img: `${CDN}/1767613947069-838912003.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-traffic", name: "مرور الكويت", img: `${CDN}/1744055130505-535557156.jpg`, flag: `${CDN}/flags/kuwait.png` },
      { id: "kw-oil", name: "نفط الكويت", img: `${CDN}/1734967569913-926736893.jpg`, flag: `${CDN}/flags/kuwait.png` },
    ],
  },
  {
    name: "السعودية",
    flag: `${CDN}/flags/saudi-arabia.png`,
    categories: [
      { id: "sa", name: "السعودية", img: `${CDN}/1734415144415-690480616.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-east", name: "الشرقية", img: `${CDN}/1753288993073-542956.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-west", name: "الغربية", img: `${CDN}/1753805444920-959552235.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-south", name: "الجنوب", img: `${CDN}/1753972040397-523603644.png`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-central", name: "الوسطى", img: `${CDN}/1753971991138-879344828.png`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-haramain", name: "الحرمين", img: `${CDN}/1753972002447-271383655.png`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-north", name: "الشمال", img: `${CDN}/1754579375126-924977922.png`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-logos", name: "شعارات سعودية", img: `${CDN}/1740832530201-243136215.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-restaurants", name: "مطاعم السعودية", img: `${CDN}/1739942761501-414558443.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-supermarket", name: "سوبرماركت", img: `${CDN}/1742408837351-923826521.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-dialects", name: "لهجات سعودية", img: `${CDN}/1754482861843-234868471.png`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-riyadh", name: "موسم الرياض", img: `${CDN}/1739362163454-925091157.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-coffee", name: "حلا وقهوة", img: `${CDN}/1754923054884-208431853.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-national", name: "أغاني وطنيـة", img: `${CDN}/1758640429476-294082589.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
      { id: "sa-majd", name: "قناة المجد", img: `${CDN}/1758687766733-152826263.jpg`, flag: `${CDN}/flags/saudi-arabia.png` },
    ],
  },
  {
    name: "قطر",
    flag: `${CDN}/flags/qatar.png`,
    categories: [
      { id: "qa", name: "قطر", img: `${CDN}/1740495717434-120984037.jpg`, flag: `${CDN}/flags/qatar.png` },
      { id: "qa-restaurants", name: "مطاعم قطر", img: `${CDN}/1754928189075-761428187.png`, flag: `${CDN}/flags/qatar.png` },
      { id: "qa-jam3iya", name: "الجمعيه", img: `${CDN}/1766054919626-490780743.jpg`, flag: `${CDN}/flags/qatar.png` },
      { id: "qa-girls", name: "بنات قطر", img: `${CDN}/1758001832562-470251857.jpg`, flag: `${CDN}/flags/qatar.png` },
      { id: "qa-logos", name: "شعارات قطرية", img: `${CDN}/1756575263198-363006665.png`, flag: `${CDN}/flags/qatar.png` },
      { id: "qa-where", name: "وين في قطر", img: `${CDN}/1772372523398-49613134.jpg`, flag: `${CDN}/flags/qatar.png` },
    ],
  },
  {
    name: "عمان",
    flag: `${CDN}/flags/oman.jpeg`,
    categories: [
      { id: "om", name: "عمان", img: `${CDN}/1740284855174-295284747.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-groceries", name: "مقاضي البيت", img: `${CDN}/1751563783430-803185354.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-zanzibar", name: "زنجبار", img: `${CDN}/1750344671283-640126902.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-chars", name: "شخصيات عمانية", img: `${CDN}/1755459995038-69327796.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-brands", name: "براندات عمانية", img: `${CDN}/1749065670945-615280327.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-landmarks", name: "معالم عمانية", img: `${CDN}/1747233801212-990095310.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-restaurants", name: "مطاعم عمان", img: `${CDN}/1745990396881-560061928.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-logos", name: "شعارات عمانية", img: `${CDN}/1744649893083-36781902.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-proverbs", name: "أمثال عمانية", img: `${CDN}/1741180043878-746678093.jpg`, flag: `${CDN}/flags/oman.jpeg` },
      { id: "om-nawaledha", name: "النواخذة", img: `${CDN}/1744033171170-903765689.jpg`, flag: `${CDN}/flags/oman.jpeg` },
    ],
  },
  {
    name: "الإمارات",
    flag: `${CDN}/flags/united-arab-emirates.png`,
    categories: [
      { id: "ae", name: "الإمارات", img: `${CDN}/1740670179377-939845157.jpg`, flag: `${CDN}/flags/united-arab-emirates.png` },
      { id: "ae-restaurants", name: "مطاعم الإمارات", img: `${CDN}/1742952260623-794751297.jpg`, flag: `${CDN}/flags/united-arab-emirates.png` },
      { id: "ae-jam3iya", name: "الجمعية", img: `${CDN}/1752247982718-410154064.jpg`, flag: `${CDN}/flags/united-arab-emirates.png` },
      { id: "ae-girls", name: "بنات الإمارات", img: `${CDN}/1753972072497-447530603.png`, flag: `${CDN}/flags/united-arab-emirates.png` },
      { id: "ae-malls", name: "مجمعات الإمارات", img: `${CDN}/1750345059882-515311661.jpg`, flag: `${CDN}/flags/united-arab-emirates.png` },
      { id: "ae-logos", name: "شعارات إماراتية", img: `${CDN}/1744970570175-646711776.jpg`, flag: `${CDN}/flags/united-arab-emirates.png` },
      { id: "ae-dec2", name: "٢ ديسمبر", img: `${CDN}/1764160209572-707134012.jpg`, flag: `${CDN}/flags/united-arab-emirates.png` },
    ],
  },
  {
    name: "البحرين",
    flag: `${CDN}/flags/bahrain.jpeg`,
    categories: [
      { id: "bh", name: "البحرين", img: `${CDN}/1739947410763-115165428.jpg`, flag: `${CDN}/flags/bahrain.jpeg` },
      { id: "bh-logos", name: "شعارات بحرينية", img: `${CDN}/1747908185521-262127251.jpg`, flag: `${CDN}/flags/bahrain.jpeg` },
      { id: "bh-restaurants", name: "مطاعم البحرين", img: `${CDN}/1744986925467-649042953.jpg`, flag: `${CDN}/flags/bahrain.jpeg` },
      { id: "bh-old", name: "البحرين لوّل", img: `${CDN}/1772037917490-165167279.jpg`, flag: `${CDN}/flags/bahrain.jpeg` },
      { id: "bh-malls", name: "مجمعات البحرين", img: `${CDN}/1759322110205-244153569.jpg`, flag: `${CDN}/flags/bahrain.jpeg` },
      { id: "bh-muharraq", name: "ليالي المحرق", img: `${CDN}/1764850135355-860824023.jpg`, flag: `${CDN}/flags/bahrain.jpeg` },
      { id: "bh-circuit", name: "حلبة البحرين الدولية", img: `${CDN}/1763047320328-419717363.jpg`, flag: `${CDN}/flags/bahrain.jpeg` },
    ],
  },
  {
    name: "عام",
    categories: [
      { id: "gen-lang", name: "لغة وأدب", img: `${CDN}/1714490801753-92992552.jpg` },
      { id: "gen-poetry", name: "عالم الشعر", img: `${CDN}/1738076222656-24201363.jpg` },
      { id: "gen-history", name: "تاريخ", img: `${CDN}/1732722554184-592567878.jpg` },
      { id: "gen-info", name: "معلومات عامة", img: `${CDN}/1714490927962-855974365.jpg` },
      { id: "gen-tech", name: "تكنولوجيا", img: `${CDN}/1755459861188-495099916.jpg` },
      { id: "gen-animals", name: "عالم الحيوان", img: `${CDN}/1764093254679-304463454.jpg` },
      { id: "gen-logos", name: "شعارات", img: `${CDN}/1714490898211-217129236.jpg` },
      { id: "gen-global-logos", name: "شعارات عالمية", img: `${CDN}/1742549852188-992634557.jpg` },
      { id: "gen-products", name: "منتجات", img: `${CDN}/1714490909938-715756503.jpg` },
      { id: "gen-fridges", name: "برادات", img: `${CDN}/1761744080374-488242381.jpg` },
      { id: "gen-global-perfume", name: "عطور عالمية", img: `${CDN}/1730264280284-540083233.jpg` },
      { id: "gen-arab-perfume", name: "عطور عربية", img: `${CDN}/1730300632401-389262153.jpg` },
      { id: "gen-medicine", name: "طب عام", img: `${CDN}/1751455054389-639034112.jpg` },
      { id: "gen-dentist", name: "طب الأسنان", img: `${CDN}/1750684630717-880873314.jpg` },
      { id: "gen-celebrity-voice", name: "صوت المشهور", img: `${CDN}/1726407003679-293178624.jpg` },
      { id: "gen-influencer", name: "مين المؤثر", img: `${CDN}/1743129834094-775188715.jpg` },
      { id: "gen-celeb", name: "منو المشهور", img: `${CDN}/1714490378267-914373042.jpg` },
      { id: "gen-cars", name: "سيارات", img: `${CDN}/1714490889843-486344234.jpg` },
      { id: "gen-ai", name: "Ai", img: `${CDN}/1745426626316-573405766.jpg` },
      { id: "gen-memes", name: "ميمز", img: `${CDN}/1761550412694-487896749.jpg` },
      { id: "gen-sea", name: "أهل البحر", img: `${CDN}/1722435481839-15933924.jpg` },
      { id: "gen-land", name: "أهل البر", img: `${CDN}/1727597919229-423909262.jpg` },
      { id: "gen-watches", name: "عالم الساعات", img: `${CDN}/1728282309112-255164521.jpg` },
      { id: "gen-masbaha", name: "مسابيح", img: `${CDN}/1730098837241-909061261.jpg` },
      { id: "gen-young-celebs", name: "مشاهير صغار", img: `${CDN}/1728894055592-705280977.jpg` },
      { id: "gen-ramadan-food", name: "سفرة رمضان", img: `${CDN}/1771770008527-709681698.jpg` },
      { id: "gen-falcons", name: "Falcons", img: `${CDN}/1741245413047-631315591.jpg` },
    ],
  },
  {
    name: "إسلامي",
    categories: [
      { id: "isl", name: "إسلامي", img: `${CDN}/1714587052246-942365572.jpg` },
      { id: "isl-quran", name: "القرآن", img: `${CDN}/1714490763615-804290584.jpg` },
      { id: "isl-sira", name: "السيرة النبوية", img: `${CDN}/1745761792642-238244994.jpg` },
      { id: "isl-prophets", name: "قصص الأنبياء", img: `${CDN}/1745756957420-785833694.jpg` },
      { id: "isl-sahaba", name: "الصحابة", img: `${CDN}/1773064749476-916155318.jpg` },
      { id: "isl-meanings", name: "معاني القرآن", img: `${CDN}/1773339115646-402328276.jpg` },
      { id: "isl-juz-amma", name: "جزء عم", img: `${CDN}/1761550612337-650723201.jpg` },
      { id: "isl-juz-tabarak", name: "جزء تبارك", img: `${CDN}/1761550626433-874087255.jpg` },
      { id: "isl-reader", name: "من القارئ", img: `${CDN}/1742176948768-787080369.jpg` },
      { id: "isl-nasheeds", name: "أناشيد", img: `${CDN}/1741633698076-825972243.jpg` },
      { id: "isl-hadith", name: "أحاديث", img: `${CDN}/1741180480937-623190732.jpg` },
    ],
  },
  {
    name: "دول",
    categories: [
      { id: "geo", name: "جغرافيا", img: `${CDN}/1714490823112-594631607.jpg` },
      { id: "geo-capitals", name: "دول و عواصم", img: `${CDN}/1714490389783-90315349.jpg` },
      { id: "geo-tourism", name: "سياحة وسفر", img: `${CDN}/1751823486828-666948533.jpg` },
      { id: "geo-aviation", name: "عالم الطيران", img: `${CDN}/1737401411021-607955302.jpg` },
      { id: "geo-currencies", name: "عملات", img: `${CDN}/1753725581646-683343990.jpg` },
      { id: "geo-britain", name: "دفعة بريطانيا", img: `${CDN}/1758283744357-618177912.png` },
      { id: "geo-which", name: "ما هي الدولة", img: `${CDN}/1763215353499-90714495.jpg` },
      { id: "geo-leaders", name: "رؤساء الدول", img: `${CDN}/1747833902627-605228857.jpg` },
      { id: "geo-flags", name: "أعلام", img: `${CDN}/1722983894998-509200770.jpg` },
      { id: "geo-old-flags", name: "أعلام قديمة", img: `${CDN}/1759149433197-606488893.jpg` },
      { id: "geo-capitals2", name: "عواصم", img: `${CDN}/1735135560932-219437472.jpg` },
      { id: "geo-maps", name: "خرايط", img: `${CDN}/1735135576406-177842775.jpg` },
      { id: "geo-ww", name: "الحرب العالمية", img: `${CDN}/1768222795615-493918481.jpg` },
      { id: "geo-anthem", name: "النشيد الوطني", img: `${CDN}/1767614045560-840191955.jpg` },
      { id: "geo-langs", name: "لغات ولهجات", img: `${CDN}/1752498388016-570045889.jpg` },
    ],
  },
  {
    name: "حروف",
    categories: [
      { id: "hruf-moving", name: "حروف متحركة", img: `${CDN}/1771091376268-243364857.jpg` },
      { id: "hruf", name: "حروف", img: `${CDN}/1748246029846-706132118.png` },
      { id: "hruf-isl", name: "حروف إسلامي", img: `${CDN}/1770136313789-732561747.png` },
      { id: "hruf-ghanawi", name: "حروف غناوي", img: `${CDN}/1770136408983-879349423.png` },
      { id: "hruf-football", name: "حروف كروية", img: `${CDN}/1770136192977-789761540.jpg` },
      { id: "hruf-anime", name: "حروف أنمي", img: `${CDN}/1771283051278-419027110.jpg` },
    ],
  },
  {
    name: "ولا كلمة",
    categories: [
      { id: "wkl", name: "ولا كلمة", img: `${CDN}/1758730614435-177662848.jpg` },
      { id: "wkl-gen", name: "ولا كلمة عامة", img: `${CDN}/1758730605907-282527981.jpg` },
      { id: "wkl-proverbs", name: "ولا كلمة أمثال", img: `${CDN}/1771282358866-323638439.jpg` },
      { id: "wkl-football", name: "ولا كلمة كروية", img: `${CDN}/1743279432236-578046154.jpg` },
      { id: "wkl-foreign-art", name: "ولا كلمة فن أجنبي", img: `${CDN}/1758083049744-88645125.jpg` },
      { id: "wkl-wrestling", name: "ولا كلمة مصارعة", img: `${CDN}/1758002643221-783499255.jpg` },
      { id: "wkl-anime", name: "ولا كلمة أنمي", img: `${CDN}/1758083565554-400511051.jpg` },
    ],
  },
  {
    name: "أمثال وألغاز",
    categories: [
      { id: "amthal", name: "أمثال و ألغاز", img: `${CDN}/1714490940317-508575914.jpg` },
      { id: "amthal-riddle", name: "لغز ومثل", img: `${CDN}/1740578260875-602703145.jpg` },
      { id: "amthal-puzzles", name: "ألغاز", img: `${CDN}/1742998174143-415830477.jpg` },
      { id: "amthal-focus", name: "ركز شوي", img: `${CDN}/1718204665916-744508258.jpg` },
      { id: "amthal-guess", name: "خمن الصورة", img: `${CDN}/1743570879626-653531544.jpg` },
      { id: "amthal-reversed", name: "كلمات معكوسة", img: `${CDN}/1732211373480-958818078.jpg` },
      { id: "amthal-color", name: "لون الصورة", img: `${CDN}/1760953350974-354375971.jpg` },
      { id: "amthal-draw", name: "رسم", img: `${CDN}/1767614066641-156094918.jpg` },
    ],
  },
  {
    name: "بنات وبس",
    categories: [
      { id: "girls-brands", name: "براندات", img: `${CDN}/1726081252677-157890348.jpg` },
      { id: "girls-cosmetics", name: "Cosmetics", img: `${CDN}/1724685101801-210202219.jpg` },
      { id: "girls-jewelry", name: "زينة وخزينة", img: `${CDN}/1747054793678-44062374.jpg` },
      { id: "girls-kw", name: "بنات الكويت", img: `${CDN}/1731333109259-134377663.jpg` },
      { id: "girls-sa", name: "بنات السعودية", img: `${CDN}/1742550011192-927847914.jpg` },
    ],
  },
  {
    name: "فن خليجي",
    categories: [
      { id: "gulf-art", name: "فن خليجي", img: `${CDN}/1714490735712-435214464.jpg` },
      { id: "gulf-art-clips", name: "مقاطع فن خليجي", img: `${CDN}/1714491388445-669950502.jpg` },
      { id: "gulf-art-bh", name: "فن بحريني", img: `${CDN}/1739954488011-744028811.jpg` },
      { id: "gulf-char", name: "شنو اسم الشخصية", img: `${CDN}/1714815077632-686553553.jpg` },
      { id: "gulf-two-pics", name: "صورتين بصورة", img: `${CDN}/1771769343191-547225263.jpg` },
      { id: "gulf-suad", name: "سعاد وحياة", img: `${CDN}/1772889106254-32759284.jpg` },
      { id: "gulf-khalti", name: "خالتي قماشة", img: `${CDN}/1763560548658-846631878.jpg` },
      { id: "gulf-hayala", name: "الحيالة", img: `${CDN}/1738273915640-390797861.jpg` },
      { id: "gulf-tash", name: "طاش ما طاش", img: `${CDN}/1738273282460-786407367.jpg` },
      { id: "gulf-tofash", name: "سوالف طفاش", img: `${CDN}/1747911128022-838391338.jpg` },
      { id: "gulf-omna", name: "أمنا رويحة الجنة", img: `${CDN}/1746940859145-925621810.jpg` },
      { id: "gulf-om-banat", name: "أم البنات", img: `${CDN}/1736787053383-442943965.jpg` },
      { id: "gulf-sahir", name: "ساهر الليل", img: `${CDN}/1746369890024-706384095.jpg` },
      { id: "gulf-zawara", name: "زوارة الخميس", img: `${CDN}/1733899549104-382438137.jpg` },
      { id: "gulf-friends", name: "صديقات العمر", img: `${CDN}/1748806142262-213835596.jpg` },
      { id: "gulf-ameema", name: "أميمة", img: `${CDN}/1735565700766-546913376.jpg` },
      { id: "gulf-kanna", name: "كنة الشام", img: `${CDN}/1754496141968-37920058.png` },
      { id: "gulf-dhikar", name: "ذكريات لا تموت", img: `${CDN}/1762332489250-95200197.jpg` },
      { id: "gulf-evacuation", name: "أمر إخلاء", img: `${CDN}/1756575089117-335301942.png` },
      { id: "gulf-fall", name: "خريف القلب", img: `${CDN}/1740578286109-903127464.jpg` },
      { id: "gulf-ommi", name: "أمي", img: `${CDN}/1756289869383-242084359.png` },
      { id: "gulf-marsa", name: "المرسى", img: `${CDN}/1771768753965-862861274.jpg` },
      { id: "gulf-summer99", name: "صيف ٩٩", img: `${CDN}/1760036817018-437415972.jpg` },
      { id: "gulf-sadoon", name: "سعدون", img: `${CDN}/1766585534967-15190091.jpg` },
      { id: "gulf-hassan", name: "حسن ونور السنا", img: `${CDN}/1753287906406-5034746.jpg` },
      { id: "gulf-dawudi", name: "داووديات", img: `${CDN}/1739799918103-591006871.jpg` },
      { id: "gulf-challenge", name: "تحدي الفنانين", img: `${CDN}/1755014255038-275397763.jpg` },
      { id: "gulf-ramadan-series", name: "مسلسلات رمضانية", img: `${CDN}/1741180564946-941661648.jpg` },
      { id: "gulf-ads-programs", name: "إعلانات وبرامج", img: `${CDN}/1741181768401-240229677.jpg` },
      { id: "gulf-ramadan-sharif", name: "رمضان شريف", img: `${CDN}/1750248091861-869649829.jpg` },
      { id: "gulf-theater-boadnan", name: "مسرح بوعدنان", img: `${CDN}/1742867473710-729777991.jpg` },
      { id: "gulf-theater-rashoud", name: "مسرح الرشود", img: `${CDN}/1749382766450-639897746.png` },
      { id: "gulf-theater-horror", name: "مسرح الرعب", img: `${CDN}/1742777199760-334153659.jpg` },
      { id: "gulf-theater-tariq", name: "مسرح طارق", img: `${CDN}/1742777122153-809523528.jpg` },
      { id: "gulf-theater-balam", name: "مسرح البلام", img: `${CDN}/1733288926896-870398923.jpg` },
      { id: "gulf-theater-huda", name: "مسرح هدى حسين", img: `${CDN}/1748806181435-540297377.jpg` },
      { id: "gulf-backstage", name: "Back Stage", img: `${CDN}/1762773818116-557459536.jpg` },
      { id: "gulf-trend", name: "Trend", img: `${CDN}/1742955863192-12495038.jpg` },
      { id: "gulf-theater-zain", name: "مسرح زين", img: `${CDN}/1749135109348-358312453.jpg` },
      { id: "arab-art", name: "فن عربي", img: `${CDN}/1765375806318-812194552.jpg` },
      { id: "arab-art-clips", name: "مقاطع فن عربي", img: `${CDN}/1720496660840-4505851.jpg` },
      { id: "arab-movie-story", name: "قصة فيلم عربي", img: `${CDN}/1746940722800-877807759.jpg` },
      { id: "arab-alzeer", name: "الزير سالم", img: `${CDN}/1730393878408-322466131.jpg` },
      { id: "arab-bab-hara", name: "باب الحارة", img: `${CDN}/1724685045849-988104151.jpg` },
      { id: "arab-theater-zaeem", name: "مسرح الزعيم", img: `${CDN}/1765376649519-870039631.jpg` },
    ],
  },
  {
    name: "أغاني",
    categories: [
      { id: "music", name: "أغاني", img: `${CDN}/1714490859558-694157013.jpg` },
      { id: "music-tarab", name: "طرب", img: `${CDN}/1765109216478-218838621.jpg` },
      { id: "music-songs", name: "Songs", img: `${CDN}/1728136615085-149854564.jpg` },
      { id: "music-ghanawi", name: "غناوي", img: `${CDN}/1720910968519-908574448.jpg` },
      { id: "music-wedding", name: "أغاني عروس", img: `${CDN}/1766910920929-295266322.png` },
      { id: "music-samarat", name: "سمرات", img: `${CDN}/1766930261774-315131045.jpg` },
      { id: "music-adani", name: "عدنيات", img: `${CDN}/1721060635278-733891420.jpg` },
      { id: "music-kulthoum", name: "كلثوميات", img: `${CDN}/1731474106523-915514667.jpg` },
      { id: "music-miami", name: "فرقة ميامي", img: `${CDN}/1726038562545-261157863.jpg` },
      { id: "music-national", name: "أغاني وطنية", img: `${CDN}/1738247860152-223659632.jpg` },
      { id: "music-abdulkarim", name: "عبدالكريم عبدالقادر", img: `${CDN}/1749133021420-391756090.jpg` },
      { id: "music-abu-bakr", name: "أبوبكر سالم", img: `${CDN}/1748806134548-172345200.jpg` },
      { id: "music-ikhwa", name: "فرقة الأخوة", img: `${CDN}/1755119573163-814936561.jpg` },
      { id: "music-hussain", name: "حسين الجسمي", img: `${CDN}/1739112847363-447283424.jpg` },
      { id: "music-badr", name: "بدر الشعيبي", img: `${CDN}/1749136962840-947987768.jpg` },
      { id: "music-ayedh", name: "عايض", img: `${CDN}/1748806092072-230516932.jpg` },
      { id: "music-adam", name: "آدم", img: `${CDN}/1748806080156-146853348.jpg` },
      { id: "music-ahlam", name: "أحلام", img: `${CDN}/1748806110318-981826474.jpg` },
    ],
  },
  {
    name: "فن أجنبي",
    categories: [
      { id: "foreign-art", name: "فن أجنبي", img: `${CDN}/1714490919366-854772620.jpg` },
      { id: "foreign-art-clips", name: "مقاطع فن أجنبي", img: `${CDN}/1720103348741-83100909.jpg` },
      { id: "foreign-movie-story", name: "قصة فيلم أجنبي", img: `${CDN}/1739112830327-280552162.jpg` },
      { id: "foreign-cast", name: "طاقم الفيلم", img: `${CDN}/1740788686293-300365168.jpg` },
      { id: "foreign-poster", name: "بوستر فيلم أجنبي", img: `${CDN}/1759938529545-947148392.jpg` },
      { id: "foreign-bollywood", name: "Bollywood", img: `${CDN}/1738660855785-82268343.jpg` },
      { id: "foreign-marvel", name: "Marvel", img: `${CDN}/1726406985377-845185538.jpg` },
      { id: "foreign-dc", name: "DC", img: `${CDN}/1739291627320-849419033.jpg` },
      { id: "foreign-classic", name: "أفلام كلاسيك", img: `${CDN}/1742136651724-959612390.jpg` },
      { id: "foreign-horror", name: "أفلام رعب", img: `${CDN}/1742136642623-985620793.jpg` },
      { id: "foreign-sopranos", name: "The Sopranos", img: `${CDN}/1750683835078-559281202.jpg` },
      { id: "foreign-bbt", name: "Big Bang Theory", img: `${CDN}/1737486736370-809767922.jpg` },
      { id: "foreign-office", name: "The Office", img: `${CDN}/1725280836288-554318412.jpg` },
      { id: "foreign-friends", name: "Friends", img: `${CDN}/1717492530782-739922693.jpg` },
      { id: "foreign-boys", name: "The Boys", img: `${CDN}/1745473542312-37184629.jpg` },
      { id: "foreign-got", name: "Game Of Thrones", img: `${CDN}/1718444275296-595895167.jpg` },
      { id: "foreign-hotd", name: "House of the Dragon", img: `${CDN}/1734089759887-343138133.jpg` },
      { id: "foreign-bb", name: "Breaking Bad", img: `${CDN}/1720092800747-719457864.jpg` },
      { id: "foreign-pb", name: "Prison Break", img: `${CDN}/1726406975817-427480584.jpg` },
      { id: "foreign-dexter", name: "Dexter", img: `${CDN}/1722983884108-492195051.jpg` },
      { id: "foreign-peaky", name: "Peaky Blinders", img: `${CDN}/1756289846399-713543642.png` },
      { id: "foreign-twd", name: "The Walking Dead", img: `${CDN}/1721839043300-381622603.jpg` },
      { id: "foreign-vikings", name: "Vikings", img: `${CDN}/1752669558570-483834891.png` },
      { id: "foreign-from", name: "From", img: `${CDN}/1736103317559-469903308.jpg` },
      { id: "foreign-dark", name: "Dark", img: `${CDN}/1732537289388-873945417.jpg` },
      { id: "foreign-cobra", name: "Cobra Kai", img: `${CDN}/1736921205117-332354457.jpg` },
      { id: "foreign-stranger", name: "Stranger Things", img: `${CDN}/1725890485063-67143198.jpg` },
      { id: "foreign-bcs", name: "Better Call Saul", img: `${CDN}/1744726560174-169311458.jpg` },
      { id: "foreign-suits", name: "Suits", img: `${CDN}/1758002198694-790150692.jpg` },
      { id: "foreign-b99", name: "Brooklyn 99", img: `${CDN}/1768916127241-731682431.jpg` },
      { id: "foreign-hp", name: "Harry Potter", img: `${CDN}/1724009317636-209691787.jpg` },
      { id: "foreign-lotr", name: "Lord of the Rings", img: `${CDN}/1733901013751-352705592.jpg` },
      { id: "foreign-sw", name: "Star Wars", img: `${CDN}/1756114790950-257258177.jpg` },
      { id: "foreign-squid", name: "Squid Game", img: `${CDN}/1736788771322-300640920.jpg` },
      { id: "foreign-turkish", name: "فن تركي", img: `${CDN}/1725125346788-435294499.jpg` },
      { id: "foreign-ertugrul", name: "قيامة أرطغرل", img: `${CDN}/1732166268573-717319519.jpg` },
      { id: "foreign-osman", name: "المؤسس عثمان", img: `${CDN}/1753803560221-838751071.jpg` },
      { id: "foreign-cukur", name: "الحفرة", img: `${CDN}/1724947456822-773667789.jpg` },
      { id: "foreign-etecek", name: "قطاع الطرق", img: `${CDN}/1760945172015-896770226.jpg` },
    ],
  },
  {
    name: "كرة قدم",
    categories: [
      { id: "foot-world", name: "كرة قدم عالمية", img: `${CDN}/1714490959184-385017878.jpg` },
      { id: "foot-wc", name: "كأس العالم", img: `${CDN}/1764075632141-759526426.jpeg` },
      { id: "foot-commentator", name: "صوت المعلق", img: `${CDN}/1754680240450-13528480.png` },
      { id: "foot-career", name: "مسيرة لاعب", img: `${CDN}/1714490367620-477474326.jpg` },
      { id: "foot-number", name: "رقم اللاعب", img: `${CDN}/1714490782223-103277343.jpg` },
      { id: "foot-who", name: "من هو اللاعب", img: `${CDN}/1714815115323-120026078.jpg` },
      { id: "foot-name", name: "اسم اللاعب", img: `${CDN}/1745129939084-937542910.jpg` },
      { id: "foot-scored", name: "من سجل الهدف", img: `${CDN}/1714490772799-593869428.jpg` },
      { id: "foot-kw-league", name: "الدوري الكويتي", img: `${CDN}/1714815097527-913148726.jpg` },
      { id: "foot-challenge", name: "تحدي اللاعبين", img: `${CDN}/1755014260974-206323728.jpg` },
      { id: "foot-sa-league", name: "الدوري السعودي", img: `${CDN}/1734464261514-91994787.jpg` },
      { id: "foot-cl", name: "دوري أبطال أوروبا", img: `${CDN}/1714491303498-742742278.jpg` },
      { id: "foot-pl", name: "الدوري الإنجليزي", img: `${CDN}/1720912120398-760649898.jpg` },
      { id: "foot-laliga", name: "الليغا", img: `${CDN}/1720912131524-403523832.jpg` },
      { id: "foot-bundesliga", name: "البوندسليغا", img: `${CDN}/1726406993862-249843890.jpg` },
      { id: "foot-seriea", name: "السيريا A", img: `${CDN}/1726407012091-107765163.jpg` },
      { id: "foot-ligue1", name: "الليغ 1", img: `${CDN}/1726407022079-487700897.jpg` },
      { id: "foot-clubs", name: "أندية كروية", img: `${CDN}/1714490812997-155041978.jpg` },
      { id: "foot-kits", name: "طقم الفريق", img: `${CDN}/1719055574462-800165474.jpg` },
      { id: "foot-old-kits", name: "طقم قديم", img: `${CDN}/1728282324882-503929791.jpg` },
      { id: "foot-national", name: "منتخبات", img: `${CDN}/1714490840949-388143793.jpg` },
      { id: "foot-gulf-cup", name: "كأس الخليج", img: `${CDN}/1745214028785-702900028.jpg` },
      { id: "foot-wrestling", name: "مصارعة", img: `${CDN}/1714491372671-625064266.jpg` },
      { id: "foot-basket", name: "كرة السلة", img: `${CDN}/1714490852177-175671625.jpg` },
      { id: "foot-anime-sport", name: "أنمي رياضي", img: `${CDN}/1733897484395-261498834.jpg` },
    ],
  },
];

const ALL_SECTION_NAMES = ["الكل", ...SECTIONS.map((s) => s.name)];

export default function StartGame() {
  const [, navigate] = useLocation();
  const [gameType, setGameType] = useState<"game" | "tournament">("game");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [infoCard, setInfoCard] = useState<Category | null>(null);
  const [activeSection, setActiveSection] = useState("الكل");

  const MAX = 6;

  const toggleCategory = (cat: Category) => {
    setSelectedIds((prev) => {
      if (prev.includes(cat.id)) return prev.filter((id) => id !== cat.id);
      if (prev.length >= MAX) return prev;
      return [...prev, cat.id];
    });
  };

  const team1 = selectedIds.slice(0, 3);
  const team2 = selectedIds.slice(3, 6);

  const visibleSections =
    activeSection === "الكل"
      ? SECTIONS
      : SECTIONS.filter((s) => s.name === activeSection);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />

      <main className="pt-28 pb-28">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">إنشاء لعبة</h1>
            <p className="text-foreground/60 text-lg">لعبة جماعية تفاعلية نختبر فيها معرفتكم وثقافتكم</p>
          </motion.div>

          {/* Game Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-10"
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

          {/* Selection Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-8 mb-8"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-foreground/50 font-medium">فريقك</span>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all text-sm ${
                      team1[i]
                        ? "bg-[#7B2FBE] border-[#7B2FBE] text-white scale-110"
                        : "border-purple-200 bg-white text-foreground/30"
                    }`}
                  >
                    {team1[i] ? <Check size={16} /> : i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 text-foreground/30 font-black text-xl">VS</div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-foreground/50 font-medium">الفريق المنافس</span>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all text-sm ${
                      team2[i]
                        ? "bg-violet-400 border-violet-400 text-white scale-110"
                        : "border-purple-200 bg-white text-foreground/30"
                    }`}
                  >
                    {team2[i] ? <Check size={16} /> : i + 1}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {ALL_SECTION_NAMES.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                    activeSection === sec
                      ? "bg-[#7B2FBE] text-white shadow-[0_0_16px_rgba(123,47,190,0.45)]"
                      : "bg-white border border-purple-100 text-foreground/70 hover:border-[#7B2FBE]/50 hover:text-[#7B2FBE]"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sections with categories */}
          <div className="space-y-12">
            {visibleSections.map((section, sIdx) => (
              <motion.div
                key={section.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.05 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  {section.flag && (
                    <img
                      src={section.flag}
                      alt={section.name}
                      className="h-7 w-10 object-cover rounded shadow-sm"
                    />
                  )}
                  <h2 className="text-2xl font-black text-foreground">{section.name}</h2>
                  <div className="flex-1 h-px bg-purple-100" />
                  <span className="text-sm text-foreground/40 font-medium">{section.categories.length} فئة</span>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {section.categories.map((cat, idx) => {
                    const selected = selectedIds.includes(cat.id);
                    const teamIdx = selectedIds.indexOf(cat.id);
                    const isTeam1 = teamIdx >= 0 && teamIdx < 3;
                    const disabled = !selected && selectedIds.length >= MAX;

                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: disabled ? 0.45 : 1, scale: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all group border-2 ${
                          selected
                            ? isTeam1
                              ? "border-[#7B2FBE] shadow-[0_0_18px_rgba(123,47,190,0.5)] scale-[1.03]"
                              : "border-violet-400 shadow-[0_0_18px_rgba(167,139,250,0.45)] scale-[1.03]"
                            : "border-transparent hover:border-[#7B2FBE]/50 hover:shadow-lg hover:scale-[1.02]"
                        } ${disabled ? "cursor-not-allowed" : ""}`}
                        onClick={() => !disabled && toggleCategory(cat)}
                      >
                        {/* Card image */}
                        <div className="relative aspect-[4/5] bg-purple-100">
                          <img
                            src={cat.img}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Dark gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                          {/* Selected color overlay */}
                          {selected && (
                            <div className={`absolute inset-0 ${isTeam1 ? "bg-[#7B2FBE]/35" : "bg-violet-400/35"}`} />
                          )}

                          {/* Info button - top left */}
                          <button
                            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#3193e9] hover:bg-[#2280d0] flex items-center justify-center transition-colors z-10 shadow"
                            onClick={(e) => { e.stopPropagation(); setInfoCard(cat); }}
                          >
                            <Info size={12} className="text-white" />
                          </button>

                          {/* Check badge - top right */}
                          {selected && (
                            <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10 ${isTeam1 ? "bg-[#7B2FBE]" : "bg-violet-400"}`}>
                              <Check size={14} className="text-white" />
                            </div>
                          )}

                          {/* Country flag badge - bottom right */}
                          {cat.flag && (
                            <div className="absolute bottom-10 right-2 z-10">
                              <img
                                src={cat.flag}
                                alt="flag"
                                className="h-5 w-7 object-cover rounded shadow"
                              />
                            </div>
                          )}

                          {/* Category name at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-4 z-10">
                            <p className="text-white font-black text-sm text-center leading-tight drop-shadow-lg">
                              {cat.name}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>

      {/* Floating start button */}
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

      {/* Info Modal */}
      <AnimatePresence>
        {infoCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setInfoCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-52">
                <img src={infoCard.img} alt={infoCard.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setInfoCard(null)}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
                <p className="absolute bottom-3 right-4 text-white font-black text-xl drop-shadow-lg">
                  {infoCard.name}
                </p>
              </div>
              <div className="p-6">
                <button
                  className="w-full bg-[#7B2FBE] text-white font-bold py-3 rounded-xl hover:bg-[#8B35D6] transition-colors"
                  onClick={() => { toggleCategory(infoCard); setInfoCard(null); }}
                >
                  {selectedIds.includes(infoCard.id) ? "إلغاء الاختيار" : "اختر هذه الفئة"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
