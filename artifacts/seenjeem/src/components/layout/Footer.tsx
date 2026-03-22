import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground/5 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="flex flex-col items-center md:items-start gap-4">
            <img
              src="https://seenjeemkw.com/assets/logo-lg-WLxzaRHo.svg"
              alt="Seen Jeem"
              className="h-12 w-auto"
              style={{ filter: "brightness(0) saturate(100%) invert(20%) sepia(50%) saturate(400%) hue-rotate(250deg)" }}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-foreground font-medium">
            <a href="#" className="hover:text-primary transition-colors">الشروط والأحكام</a>
            <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-primary transition-colors">تواصل معنا</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="bg-foreground/8 p-3 rounded-full hover:bg-primary hover:text-white text-foreground transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="bg-foreground/8 p-3 rounded-full hover:bg-primary hover:text-white text-foreground transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="bg-foreground/8 p-3 rounded-full hover:bg-primary hover:text-white text-foreground transition-colors">
              <Youtube size={20} />
            </a>
            <a href="#" className="bg-foreground/8 p-3 rounded-full hover:bg-primary hover:text-white text-foreground font-bold text-sm transition-colors w-[44px] h-[44px] flex items-center justify-center">
              TK
            </a>
            <a href="#" className="bg-foreground/8 p-3 rounded-full hover:bg-primary hover:text-white text-foreground font-bold text-sm transition-colors w-[44px] h-[44px] flex items-center justify-center">
              SC
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
