import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0[1-9](?:\d{2}){4}$/;

export async function POST({ request }) {
  try {
    const data = await request.json();

    const {
      lastname,
      firstname,
      job,
      email,
      phone,
      place,
      city,
      message,
    } = data;

    // --- Validation serveur (ne JAMAIS faire confiance au client) ---
    const requiredFields = { lastname, firstname, job, email, phone, place, city, message };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return new Response(
          JSON.stringify({ message: `Le champ "${key}" est requis.` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ message: 'Adresse email invalide.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Nettoyage du téléphone (espaces retirés) avant validation
    const cleanPhone = phone.replace(/\s/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ message: 'Numéro de téléphone invalide.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // --- Anti-spam basique : honeypot recommandé, mais au minimum on check la longueur ---
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ message: 'Message trop long.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // --- Envoi via Resend ---
    const { error } = await resend.emails.send({
      from: 'Ready 4 Work <onboarding@resend.dev>',
      to: ['mvrioxel.dev@proton.me'], // 👈 à remplacer par ton vrai email
      reply_to: email,
      subject: `Nouvelle demande de contact — ${firstname} ${lastname}`,
      html: `
        <h2>Nouvelle demande via le formulaire Ready 4 Work</h2>
        <p><strong>Nom :</strong> ${lastname}</p>
        <p><strong>Prénom :</strong> ${firstname}</p>
        <p><strong>Fonction :</strong> ${job}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone}</p>
        <p><strong>Établissement :</strong> ${place}</p>
        <p><strong>Ville :</strong> ${city}</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return new Response(
        JSON.stringify({ message: "Erreur lors de l'envoi de l'email." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Email envoyé avec succès.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Erreur serveur:', err);
    return new Response(
      JSON.stringify({ message: 'Erreur serveur.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}