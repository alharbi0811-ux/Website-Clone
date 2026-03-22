import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#130722] border-t border-white/5 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <img 
              src="https://seenjeemkw.com/assets/logo-lg-WLxzaRHo.svg" 
              alt="Seen Jeem" 
              className="h-12 w-auto opacity-80"
            />
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} سين جيم. جميع الحقوق محفوظة.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-white/70 font-medium">
            <a href="#" className="hover:text-primary transition-colors">الشروط والأحكام</a>
            <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-primary transition-colors">تواصل معنا</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="bg-white/5 p-3 rounded-full hover:bg-primary text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="bg-white/5 p-3 rounded-full hover:bg-primary text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="bg-white/5 p-3 rounded-full hover:bg-primary text-white transition-colors">
              <Youtube size={20} />
            </a>
            {/* Custom Icons for TikTok/Snapchat could go here, using standard text for now */}
            <a href="#" className="bg-white/5 p-3 rounded-full hover:bg-primary text-white font-bold text-sm transition-colors w-[44px] h-[44px] flex items-center justify-center">
              TK
            </a>
            <a href="#" className="bg-white/5 p-3 rounded-full hover:bg-primary text-white font-bold text-sm transition-colors w-[44px] h-[44px] flex items-center justify-center">
              SC
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
