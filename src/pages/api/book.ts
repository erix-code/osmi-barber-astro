import type { APIRoute } from "astro";

export const prerender = false;

interface BookingPayload {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
}

const PHONE_PATTERN = /^[\d+\s()-]{8,20}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function clean(value: unknown, maxLength = 120): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validatePayload(data: Record<string, unknown>): BookingPayload {
  const payload: BookingPayload = {
    name: clean(data.name, 80),
    phone: clean(data.phone, 25),
    service: clean(data.service, 80),
    date: clean(data.date, 10),
    time: clean(data.time, 5),
    notes: clean(data.notes, 240)
  };

  if (!payload.name || !payload.phone || !payload.service || !payload.date || !payload.time) {
    throw new Error("Completa todos los campos obligatorios.");
  }
  if (!PHONE_PATTERN.test(payload.phone)) {
    throw new Error("Telefono invalido. Usa un formato valido de WhatsApp.");
  }
  if (!DATE_PATTERN.test(payload.date)) {
    throw new Error("Fecha invalida.");
  }
  if (!TIME_PATTERN.test(payload.time)) {
    throw new Error("Hora invalida.");
  }

  return payload;
}

function buildWhatsAppLink(payload: BookingPayload): string | null {
  const barberPhone = (import.meta.env.BARBER_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (!barberPhone) return null;

  const lines = [
    "Nueva reserva OSMI",
    `Cliente: ${payload.name}`,
    `Telefono: ${payload.phone}`,
    `Servicio: ${payload.service}`,
    `Fecha: ${payload.date}`,
    `Hora: ${payload.time}`
  ];
  if (payload.notes) lines.push(`Notas: ${payload.notes}`);

  return `https://wa.me/${barberPhone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = validatePayload(body);

    const webhookUrl = import.meta.env.GOOGLE_SCRIPT_WEBHOOK_URL;
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: "Falta configurar GOOGLE_SCRIPT_WEBHOOK_URL en el servidor." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const webhookApiKey = import.meta.env.GOOGLE_SCRIPT_API_KEY;
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        status: "new",
        ...(webhookApiKey ? { apiKey: webhookApiKey } : {})
      })
    });

    let webhookResult: { ok?: boolean; error?: string } | null = null;
    try {
      webhookResult = (await webhookResponse.json()) as { ok?: boolean; error?: string };
    } catch {
      webhookResult = null;
    }

    if (!webhookResponse.ok || webhookResult?.ok === false) {
      console.log(webhookResult);
      return new Response(
        JSON.stringify({
          error: webhookResult?.error || "No se pudo guardar la reserva en Google Sheets."
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const waLink = buildWhatsAppLink(payload);
    return new Response(JSON.stringify({ ok: true, waLink }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado al crear la reserva.";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const GET: APIRoute = async () =>
  new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
