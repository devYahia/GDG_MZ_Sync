export default function TestPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex border border-white/20 bg-white/10 backdrop-blur-xl p-12 rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center gap-6 w-full">
                    <h1 className="text-6xl font-black text-white tracking-tighter animate-pulse">
                        Hello Egypt Hackathon
                    </h1>
                    <p className="text-xl text-white/80 font-medium">
                        Project Environment Verified & Ready for Development
                    </p>
                    <div className="flex gap-4 mt-8">
                        <span className="px-4 py-2 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest">Next.js 14.2</span>
                        <span className="px-4 py-2 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest">Tailwind v4</span>
                        <span className="px-4 py-2 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest">Supabase</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
