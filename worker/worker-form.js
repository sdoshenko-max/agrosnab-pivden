// =====================================================================
// Cloudflare Worker: приём заявок з форми сайту АГРОСНАБ-ПІВДЕНЬ
// Надсилає заявки у Telegram-групу "Ліди МИНЕРАЛ-ТРЕЙД" (та сама група)
// Адаптовано з worker-form.js mltd.com.ua
// =====================================================================

const ALLOWED_ORIGINS = new Set([
  "https://agrosnab-pivden.com",
  "https://www.agrosnab-pivden.com",
  "https://agrosnab-pivden.com.ua",
  "https://www.agrosnab-pivden.com.ua",
  "https://agrosnab-pivden.pages.dev",
  "http://localhost:3000",
  "http://localhost:3001",
]);

export default {
  async fetch(request, env) {
    const reqOrigin = request.headers.get("origin") || "";
    const allowOrigin = ALLOWED_ORIGINS.has(reqOrigin) ? reqOrigin : "";
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }
    if (!allowOrigin) {
      return new Response("Forbidden", { status: 403 });
    }

    // Parse body
    let data;
    try {
      const ct = request.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await request.json();
      } else {
        const fd = await request.formData();
        data = Object.fromEntries(fd);
      }
    } catch (e) {
      return json({ error: "Bad request" }, 400, cors);
    }

    // Honeypot anti-spam
    if (data.website) {
      return json({ ok: true }, 200, cors);
    }

    const formType = (data.formType || "full").toString();
    const name = trim(data.name, 100);
    const phone = trim(data.phone, 30);
    const region = trim(data.region, 50);
    const product = trim(data.product, 200);
    const area = trim(data.area, 20);
    const delivery = trim(data.delivery, 50);
    const payment = trim(data.payment, 50);
    const comment = trim(data.comment, 500);
    const productUrl = trim(data.productUrl, 200);
    const lang = trim(data.lang || "uk", 4);

    if (!phone || phone.length < 10) {
      return json({ error: "Phone required" }, 400, cors);
    }

    // Determine source site from Origin / Referer header
    const origin = request.headers.get("origin") || request.headers.get("referer") || "";
    let sourceHost = "";
    try {
      sourceHost = origin ? new URL(origin).hostname : "";
    } catch { sourceHost = ""; }
    const fullProductUrl = productUrl
      ? (productUrl.startsWith("http") ? productUrl : (sourceHost ? `https://${sourceHost}${productUrl}` : productUrl))
      : "";

    // Compose Telegram message (HTML format)
    const time = new Date().toLocaleString("uk-UA", {
      timeZone: "Europe/Kyiv",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const phoneClean = "+" + phone.replace(/\D/g, "");

    let text;
    if (formType === "quick-call") {
      text =
        `📞 <b>ШВИДКИЙ ДЗВІНОК — АГРОСНАБ-ПІВДЕНЬ</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 <b>Ім'я:</b> ${esc(name) || "<i>(не вказано)</i>"}\n` +
        `📞 <b>Телефон:</b> ${esc(phoneClean)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        (sourceHost ? `🌍 <b>Сайт:</b> ${esc(sourceHost)}\n` : "") +
        `🌐 Мова: ${esc(lang.toUpperCase())}\n` +
        `⏰ ${time} (Київ)`;
    } else {
      text =
        `🌾 <b>НОВА ЗАЯВКА — АГРОСНАБ-ПІВДЕНЬ</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 <b>Ім'я:</b> ${esc(name) || "<i>(не вказано)</i>"}\n` +
        `📞 <b>Телефон:</b> ${esc(phoneClean)}\n` +
        (region ? `📍 <b>Область:</b> ${esc(region)}\n` : "") +
        (product ? `🛒 <b>Товар:</b> ${esc(product)}\n` : "") +
        (area ? `🌾 <b>Площа:</b> ${esc(area)} га\n` : "") +
        (payment ? `💰 <b>Оплата:</b> ${esc(payment)}\n` : "") +
        (delivery ? `🚚 <b>Доставка:</b> ${esc(delivery)}\n` : "") +
        (comment ? `💬 <b>Коментар:</b> ${esc(comment)}\n` : "") +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        (sourceHost ? `🌍 <b>Сайт:</b> ${esc(sourceHost)}\n` : "") +
        `🌐 Мова: ${esc(lang.toUpperCase())}\n` +
        (fullProductUrl ? `🔗 ${esc(fullProductUrl)}\n` : "") +
        `⏰ ${time} (Київ)`;
    }

    // Send to Telegram
    const tgUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
    const tgResp = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text: text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!tgResp.ok) {
      const errText = await tgResp.text();
      return json({ error: "Telegram error", details: errText }, 500, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

function trim(v, max) {
  return (v || "").toString().trim().slice(0, max);
}

function esc(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
