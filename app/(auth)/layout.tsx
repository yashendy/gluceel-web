// app/(auth)/layout.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول | Gluceel",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* العمود الأيمن: الجانب التوعوي + الشعار */}
          <aside className="order-2 rounded-2xl bg-white p-8 shadow-sm lg:order-1 lg:p-12">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Gluceel logo" width={48} height={48} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-slate-800">Gluceel</h1>
                <p className="text-sm text-slate-500">عناية أسرية دافئة.</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">ليه نهتم بالسكر؟</h2>
              <ul className="list-inside space-y-2 text-slate-600">
                <li>🔹 قياس منتظم يساعدنا نفهم جسمنا ونحافظ على نشاطنا.</li>
                <li>🔹 وجبات متوازنة = طاقة ولعب بدون هبوط مفاجئ.</li>
                <li>🔹 ماء ونوم كفاية لأفضل تركيز ومزاج.</li>
                <li>🔹 سجّل قياساتك عشان الدكتور وبابا وماما يتابعوا بسهولة.</li>
              </ul>
            </div>

            <div className="mt-8 text-sm text-slate-500">
              <p>للدعم: <a className="text-sky-600 hover:underline" href="mailto:support@gluceel.com">support@gluceel.com</a></p>
            </div>

            <footer className="mt-10 flex flex-wrap gap-4 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600">الخصوصية</Link>
              <Link href="/terms" className="hover:text-slate-600">الشروط</Link>
              <span>© {new Date().getFullYear()} Gluceel</span>
            </footer>
          </aside>

          {/* العمود الأيسر: نموذج الصفحة */}
          <main className="order-1 rounded-2xl bg-white p-8 shadow-sm lg:order-2 lg:p-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
