import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "كيف يمكنني إنشاء لعبة في ركز ؟",
    a: "أنشئ حساب جديد في اللعبة وبعدها اضغط على إنشاء لعبة ، قسّم المتواجدين إلى فريقين متساويين ، لكل فريق يختار ٣ فئات ، اختار اسم لكل فريق وبعدها ابدأ اللعبة ."
  },
  {
    q: "هل يمكن تجربة اللعبة قبل الشراء ؟",
    a: "لكل حساب جديد لعبة مجانية يستطيع من خلالها تجربة اللعبة ."
  },
  {
    q: "هل تتكرر الأسئلة في حال اختيار فئات تم اختيارها مسبقاً ؟",
    a: "لا ، جميع الأسئلة في جميع الفئات مختلفة و غير قابلة للتكرار ، ماعدا اللعبة المجانية لجميع الحسابات الجديدة ثابتة ."
  },
  {
    q: "في حال إيقاف اللعبة ، والرغبة في تكملتها في وقت لاحق هل يمكن الرجوع لها ؟",
    a: 'أي لعبة يتم البدأ فيها يتم حفظها بشكل مباشر في قسم " ألعابي " ، ويمكنكم الرجوع له في أعلى الصفحة .'
  },
  {
    q: "في حال إجابة نصف السؤال ، هل يمكن أخذ نص النقاط ؟",
    a: "لا ، الإجابة يجب أن تكون كاملة لأخذ نقاط السؤال ."
  },
  {
    q: "في حال تواجد كلمة < سنة > فوق السؤال ، فماهو معناها ؟",
    a: "في هذا السؤال في حال جوابك كان ( سنة ٢٠١٠ ) فجوابك يشمل سنة فوق ٢٠١٠ و سنة تحت ٢٠١٠ يعني ( ٢٠٠٩ - ٢٠١٠ - ٢٠١١ )"
  },
  {
    q: "ماهو معنى علامة VAR داخل السؤال ؟",
    a: "في حال وجود أي خطأ بالسؤال ، يمكنك استخدام هذا الزر للتبليغ عن الخطأ لتعديله ."
  },
  {
    q: "هل يمكنني أخذ سؤال من الفئة التي اختارها الفريق المنافس ؟ أو أخذ أكثر من ٣ أسئلة من نفس الفئة ؟",
    a: "نعم ، يمكنك أخذ أي سؤال في أي فئة من الفئات الستة المختارة ."
  },
  {
    q: "كم هو الوقت المحدد للإجابة لكل فريق ؟",
    a: "الفريق الذي عليه الدور لديه دقيقة واحدة فقط  و نصف، والفريق الثاني لديه 30 ثانية فقط و تُحسب من بعد جواب الفريق الأول ."
  }
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-background/50 relative">
      <div className="container mx-auto px-4 max-w-4xl">

        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-foreground"
          >
            الأسئلة الشائعة
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              key={idx}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-right hover:bg-foreground/5 transition-colors focus:outline-none"
              >
                <span className="text-lg md:text-xl font-bold text-foreground pl-4 leading-relaxed">
                  {faq.q}
                </span>
                <img
                  src="https://d2du33uhi1xfjy.cloudfront.net/static-data/new-home-page/angle-arrow-icon.png"
                  alt="Arrow"
                  className={`w-6 h-6 object-contain transition-transform duration-300 flex-shrink-0 brightness-0 ${
                    openIndex === idx ? "rotate-90" : "rotate-180"
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 text-foreground font-medium text-lg leading-relaxed border-t border-border">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
