import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <div className="card mt-10">
        <h1 className="text-2xl font-semibold mb-2">Gluceel</h1>
        <p className="text-sm text-gray-600">ابدأ بتسجيل الدخول.</p>
        <div className="mt-4 flex gap-3">
          <Link className="btn btn-primary" href="/login">تسجيل الدخول</Link>
        </div>
      </div>
    </main>
  );
}
