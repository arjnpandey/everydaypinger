import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY!);


export async function sendEmail(subject: string, html: string) {
const from = process.env.FROM_EMAIL!;
const to = process.env.TO_EMAIL!;
await resend.emails.send({ from, to, subject, html });
}