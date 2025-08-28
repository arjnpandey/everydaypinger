import { prisma } from "./db";


const msPerDay = 24 * 60 * 60 * 1000;


export async function pickPrompt() {
const MIN_GAP_DAYS = Number(process.env.MIN_GAP_DAYS || 7);


const prompts = await prisma.prompt.findMany({
where: { active: true },
select: { id: true, text: true, lastSent: true, timesSent: true, cooldown: true }
});


if (!prompts.length) return null;
const now = Date.now();


const eligible = [] as { id:number; text:string; weight:number }[];
const fallback = [] as { id:number; text:string; weight:number }[];


for (const p of prompts) {
const gap = Math.max(MIN_GAP_DAYS, p.cooldown || 0);
let daysSince = 9999;
if (p.lastSent) daysSince = Math.floor((now - new Date(p.lastSent).getTime()) / msPerDay);


const weight = Math.max(1, daysSince);


if (!p.lastSent || daysSince >= gap) {
eligible.push({ id: p.id, text: p.text, weight });
}
fallback.push({ id: p.id, text: p.text, weight });
}


const pool = eligible.length ? eligible : fallback;
const total = pool.reduce((a, b) => a + b.weight, 0);
let r = Math.random() * total;
for (const item of pool) {
r -= item.weight;
if (r <= 0) return item;
}
return pool[pool.length - 1];
}