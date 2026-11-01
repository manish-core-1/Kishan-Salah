import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <h2 className="text-2xl font-bold mb-2">पेज नहीं मिला (Page Not Found)</h2>
      <p className="text-sm text-gray-600 mb-4">जो पेज आप ढूंढ रहे हैं वह उपलब्ध नहीं है।</p>
      <Link
        href="/"
        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors"
      >
        होम पेज पर जाएं (Back to Home)
      </Link>
    </div>
  );
}
