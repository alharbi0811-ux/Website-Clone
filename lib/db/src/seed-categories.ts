import { db } from "./index";
import { categoriesTable } from "./schema";
import { count } from "drizzle-orm";

const CDN = "https://d442zbpa1tgal.cloudfront.net";
const KW_FLAG = `${CDN}/flags/kuwait.png`;

const CATEGORIES = [
  { nameAr: "طقم فنان خليجي", section: "أجدد الفئات", imageUrl: `${CDN}/1772110864905-588292764.jpg` },
  { nameAr: "فيصل بوغازي", section: "أجدد الفئات", imageUrl: `${CDN}/1773064818148-154584863.jpg` },
  { nameAr: "الغميضة", section: "أجدد الفئات", imageUrl: `${CDN}/1772459128688-499091855.jpg` },
  { nameAr: "شارع الأعشى", section: "أجدد الفئات", imageUrl: `${CDN}/1772459069961-721054682.jpg` },
  { nameAr: "مسرح المظفر", section: "أجدد الفئات", imageUrl: `${CDN}/1773857820860-639734911.jpg` },
  { nameAr: "مسرح المانع", section: "أجدد الفئات", imageUrl: `${CDN}/1773857753928-637269502.jpg` },

  { nameAr: "الكويت", section: "الكويت", imageUrl: `${CDN}/1769955614865-48498592.jpg`, flagUrl: KW_FLAG },
  { nameAr: "مجلس الأمة", section: "الكويت", imageUrl: `${CDN}/1714490868454-914972575.jpg`, flagUrl: KW_FLAG },
  { nameAr: "شارع المطاعم", section: "الكويت", imageUrl: `${CDN}/1722983854149-260057650.jpg`, flagUrl: KW_FLAG },
  { nameAr: "دعايات", section: "الكويت", imageUrl: `${CDN}/1739270060080-288600531.jpg`, flagUrl: KW_FLAG },
  { nameAr: "جيل الطيبين", section: "الكويت", imageUrl: `${CDN}/1756575104773-387256081.png`, flagUrl: KW_FLAG },
  { nameAr: "لوكيشن", section: "الكويت", imageUrl: `${CDN}/1765874335281-496463000.jpg`, flagUrl: KW_FLAG },
  { nameAr: "مجمعات الكويت", section: "الكويت", imageUrl: `${CDN}/1739335430643-464471679.jpg`, flagUrl: KW_FLAG },
  { nameAr: "قهاوي", section: "الكويت", imageUrl: `${CDN}/1767613947069-838912003.jpg`, flagUrl: KW_FLAG },
  { nameAr: "مرور الكويت", section: "الكويت", imageUrl: `${CDN}/1744055130505-535557156.jpg`, flagUrl: KW_FLAG },
  { nameAr: "نفط الكويت", section: "الكويت", imageUrl: `${CDN}/1734967569913-926736893.jpg`, flagUrl: KW_FLAG },

  { nameAr: "لغة وأدب", section: "عام", imageUrl: `${CDN}/1714490801753-92992552.jpg` },
  { nameAr: "عالم الشعر", section: "عام", imageUrl: `${CDN}/1738076222656-24201363.jpg` },
  { nameAr: "تاريخ", section: "عام", imageUrl: `${CDN}/1732722554184-592567878.jpg` },
  { nameAr: "معلومات عامة", section: "عام", imageUrl: `${CDN}/1714490927962-855974365.jpg` },
  { nameAr: "تكنولوجيا", section: "عام", imageUrl: `${CDN}/1755459861188-495099916.jpg` },
  { nameAr: "عالم الحيوان", section: "عام", imageUrl: `${CDN}/1764093254679-304463454.jpg` },
  { nameAr: "شعارات", section: "عام", imageUrl: `${CDN}/1714490898211-217129236.jpg` },
  { nameAr: "شعارات عالمية", section: "عام", imageUrl: `${CDN}/1742549852188-992634557.jpg` },
  { nameAr: "منتجات", section: "عام", imageUrl: `${CDN}/1714490909938-715756503.jpg` },
  { nameAr: "برادات", section: "عام", imageUrl: `${CDN}/1761744080374-488242381.jpg` },
  { nameAr: "عطور عالمية", section: "عام", imageUrl: `${CDN}/1730264280284-540083233.jpg` },
  { nameAr: "عطور عربية", section: "عام", imageUrl: `${CDN}/1730300632401-389262153.jpg` },
  { nameAr: "طب عام", section: "عام", imageUrl: `${CDN}/1751455054389-639034112.jpg` },
  { nameAr: "طب الأسنان", section: "عام", imageUrl: `${CDN}/1750684630717-880873314.jpg` },
  { nameAr: "صوت المشهور", section: "عام", imageUrl: `${CDN}/1726407003679-293178624.jpg` },
  { nameAr: "مين المؤثر", section: "عام", imageUrl: `${CDN}/1743129834094-775188715.jpg` },
  { nameAr: "منو المشهور", section: "عام", imageUrl: `${CDN}/1714490378267-914373042.jpg` },
  { nameAr: "سيارات", section: "عام", imageUrl: `${CDN}/1714490889843-486344234.jpg` },
  { nameAr: "Ai", section: "عام", imageUrl: `${CDN}/1745426626316-573405766.jpg` },
  { nameAr: "ميمز", section: "عام", imageUrl: `${CDN}/1761550412694-487896749.jpg` },
  { nameAr: "أهل البحر", section: "عام", imageUrl: `${CDN}/1722435481839-15933924.jpg` },
  { nameAr: "أهل البر", section: "عام", imageUrl: `${CDN}/1727597919229-423909262.jpg` },
  { nameAr: "عالم الساعات", section: "عام", imageUrl: `${CDN}/1728282309112-255164521.jpg` },
  { nameAr: "مسابيح", section: "عام", imageUrl: `${CDN}/1730098837241-909061261.jpg` },
  { nameAr: "مشاهير صغار", section: "عام", imageUrl: `${CDN}/1728894055592-705280977.jpg` },
  { nameAr: "سفرة رمضان", section: "عام", imageUrl: `${CDN}/1771770008527-709681698.jpg` },
  { nameAr: "Falcons", section: "عام", imageUrl: `${CDN}/1741245413047-631315591.jpg` },

  { nameAr: "إسلامي", section: "إسلامي", imageUrl: `${CDN}/1714587052246-942365572.jpg` },
  { nameAr: "القرآن", section: "إسلامي", imageUrl: `${CDN}/1714490763615-804290584.jpg` },
  { nameAr: "السيرة النبوية", section: "إسلامي", imageUrl: `${CDN}/1745761792642-238244994.jpg` },
  { nameAr: "قصص الأنبياء", section: "إسلامي", imageUrl: `${CDN}/1745756957420-785833694.jpg` },
  { nameAr: "الصحابة", section: "إسلامي", imageUrl: `${CDN}/1773064749476-916155318.jpg` },
  { nameAr: "معاني القرآن", section: "إسلامي", imageUrl: `${CDN}/1773339115646-402328276.jpg` },
  { nameAr: "جزء عم", section: "إسلامي", imageUrl: `${CDN}/1761550612337-650723201.jpg` },
  { nameAr: "جزء تبارك", section: "إسلامي", imageUrl: `${CDN}/1761550626433-874087255.jpg` },
  { nameAr: "من القارئ", section: "إسلامي", imageUrl: `${CDN}/1742176948768-787080369.jpg` },
  { nameAr: "أناشيد", section: "إسلامي", imageUrl: `${CDN}/1741633698076-825972443.jpg` },
  { nameAr: "أحاديث", section: "إسلامي", imageUrl: `${CDN}/1741180480937-623190732.jpg` },

  { nameAr: "جغرافيا", section: "دول", imageUrl: `${CDN}/1714490823112-594631607.jpg` },
  { nameAr: "دول و عواصم", section: "دول", imageUrl: `${CDN}/1714490389783-90315349.jpg` },
  { nameAr: "سياحة وسفر", section: "دول", imageUrl: `${CDN}/1751823486828-666948533.jpg` },
  { nameAr: "عالم الطيران", section: "دول", imageUrl: `${CDN}/1737401411021-607955302.jpg` },
  { nameAr: "عملات", section: "دول", imageUrl: `${CDN}/1753725581646-683343990.jpg` },
  { nameAr: "دفعة بريطانيا", section: "دول", imageUrl: `${CDN}/1758283744357-618177912.png` },
  { nameAr: "ما هي الدولة", section: "دول", imageUrl: `${CDN}/1763215353499-90714495.jpg` },
  { nameAr: "رؤساء الدول", section: "دول", imageUrl: `${CDN}/1747833902627-605228857.jpg` },
  { nameAr: "أعلام", section: "دول", imageUrl: `${CDN}/1722983894998-509200770.jpg` },
  { nameAr: "أعلام قديمة", section: "دول", imageUrl: `${CDN}/1759149433197-606488893.jpg` },
  { nameAr: "عواصم", section: "دول", imageUrl: `${CDN}/1735135560932-219437472.jpg` },
  { nameAr: "خرايط", section: "دول", imageUrl: `${CDN}/1735135576406-177842775.jpg` },
  { nameAr: "الحرب العالمية", section: "دول", imageUrl: `${CDN}/1768222795615-493918481.jpg` },
  { nameAr: "النشيد الوطني", section: "دول", imageUrl: `${CDN}/1767614045560-840191955.jpg` },
  { nameAr: "لغات ولهجات", section: "دول", imageUrl: `${CDN}/1752498388016-570045889.jpg` },

  { nameAr: "حروف متحركة", section: "حروف", imageUrl: `${CDN}/1771091376268-243364857.jpg` },
  { nameAr: "حروف", section: "حروف", imageUrl: `${CDN}/1748246029846-706132118.png` },
  { nameAr: "حروف إسلامي", section: "حروف", imageUrl: `${CDN}/1770136313789-732561747.png` },
  { nameAr: "حروف غناوي", section: "حروف", imageUrl: `${CDN}/1770136408983-879349423.png` },
  { nameAr: "حروف كروية", section: "حروف", imageUrl: `${CDN}/1770136192977-789761540.jpg` },
  { nameAr: "حروف أنمي", section: "حروف", imageUrl: `${CDN}/1771283051278-419027110.jpg` },

  { nameAr: "ولا كلمة", section: "ولا كلمة", imageUrl: `${CDN}/1758730614435-177662848.jpg` },
  { nameAr: "ولا كلمة عامة", section: "ولا كلمة", imageUrl: `${CDN}/1758730605907-282527981.jpg` },
  { nameAr: "ولا كلمة أمثال", section: "ولا كلمة", imageUrl: `${CDN}/1771282358866-323638439.jpg` },
  { nameAr: "ولا كلمة كروية", section: "ولا كلمة", imageUrl: `${CDN}/1743279432236-578046154.jpg` },
  { nameAr: "ولا كلمة فن أجنبي", section: "ولا كلمة", imageUrl: `${CDN}/1758083049744-88645125.jpg` },
  { nameAr: "ولا كلمة مصارعة", section: "ولا كلمة", imageUrl: `${CDN}/1758002643221-783499255.jpg` },
  { nameAr: "ولا كلمة أنمي", section: "ولا كلمة", imageUrl: `${CDN}/1758083565554-400511051.jpg` },

  { nameAr: "أمثال و ألغاز", section: "التفكير", imageUrl: `${CDN}/1714490940317-508575914.jpg` },
  { nameAr: "لغز ومثل", section: "التفكير", imageUrl: `${CDN}/1740578260875-602703145.jpg` },
  { nameAr: "ألغاز", section: "التفكير", imageUrl: `${CDN}/1742998174143-415830477.jpg` },
  { nameAr: "ركز شوي", section: "التفكير", imageUrl: `${CDN}/1718204665916-744508258.jpg` },
  { nameAr: "خمن الصورة", section: "التفكير", imageUrl: `${CDN}/1743570879626-653531544.jpg` },
  { nameAr: "كلمات معكوسة", section: "التفكير", imageUrl: `${CDN}/1732211373480-958818078.jpg` },
  { nameAr: "لون الصورة", section: "التفكير", imageUrl: `${CDN}/1760953350974-354375971.jpg` },
  { nameAr: "رسم", section: "التفكير", imageUrl: `${CDN}/1767614066641-156094918.jpg` },
];

async function seed() {
  const [{ count: existing }] = await db.select({ count: count() }).from(categoriesTable);
  if (Number(existing) > 0) {
    console.log(`Already have ${existing} categories — skipping seed.`);
    process.exit(0);
  }

  const rows = CATEGORIES.map((c) => ({
    name: c.nameAr,
    nameAr: c.nameAr,
    section: c.section,
    imageUrl: c.imageUrl,
    flagUrl: (c as any).flagUrl ?? null,
    isActive: true,
  }));

  await db.insert(categoriesTable).values(rows);
  console.log(`Seeded ${rows.length} categories.`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
