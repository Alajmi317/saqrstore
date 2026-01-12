export async function handler(event) {
  try {
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      return { statusCode: 500, body: "Missing DISCORD_WEBHOOK_URL" };
    }

    const order = JSON.parse(event.body || "{}");
    const p = order.product;
    const c = order.customer || {};

    const embed = {
      title: "طلب جديد - SAQR STORE",
      description: p
        ? `المنتج: ${p.name}\nالسعر: ${p.price} KWD\nID: ${p.id}`
        : "طلب مخصص",
      fields: [
        { name: "الاسم", value: c.name || "—", inline: true },
        { name: "Discord", value: c.discord || "—", inline: true },
        { name: "Framework", value: c.framework || "—", inline: true },
        { name: "اسم السيرفر", value: c.serverName || "—", inline: true },
        { name: "الدفع", value: order.payment || "—", inline: true },
        { name: "Email", value: c.email || "—", inline: true },
        { name: "تفاصيل الطلب", value: (order.details || "—").slice(0, 1000) }
      ],
      footer: { text: new Date().toISOString() }
    };

    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] })
    });

    if (!resp.ok) {
      const t = await resp.text();
      return { statusCode: 502, body: "Discord webhook failed: " + t };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: "Server error" };
  }
}
