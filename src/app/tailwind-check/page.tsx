export default function TailwindCheck() {
    return (
    <main className="container-max space-y-6 py-8">
    <h1 className="text-2xl font-semibold">Tailwind Check</h1>
    <div className="grid grid-cols-2 gap-4">
    <div className="h-16 bg-black text-white grid place-items-center rounded-xl">bg-black</div>
    <div className="h-16 bg-emerald-500 text-white grid place-items-center rounded-xl">bg-emerald-500</div>
    <div className="p-4 border rounded-xl">border + rounded</div>
    <button className="btn">.btn utility</button>
    </div>
    </main>
    );
}