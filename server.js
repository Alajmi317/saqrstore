import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ضع Webhook URL هنا (لا تنشره علنًا)
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1460314817494520054/I8xhZstnN6kp0DzjPx88Id33hFkkBPHVht49XVVogvQEYcFdqCnq3fx5S-E7cYUyzEVU";

app.post("/api/order", async (req, res) => {
    try {
        if (!DISCORD_WEBHOOK_URL) {
            return res.status(500).json({ ok: false, error: "Missing DISCORD_WEBHOOK_URL" });
        }

        const order = req.body || {};
        const p = order.product;
        const c = order.customer || {};

        // رسالة مرتبة للديسكورد (Embeds)
        const embed = {
            title: "طلب جديد - SAQR STORE",
            description: p
                ? `**المنتج:** ${p.name}\n**السعر:** ${p.price} KWD\n**ID:** ${p.id}`
                : "**طلب مخصص**",
            fields: [
                { name: "العميل", value: c.name || "—", inline: true },
                { name: "Discord", value: c.discord || "—", inline: true },
                { name: "Framework", value: c.framework || "—", inline: true },
                { name: "اسم السيرفر", value: c.serverName || "—", inline: true },
                { name: "الدفع", value: order.payment || "—", inline: true },
                { name: "Email", value: c.email || "—", inline: true },
                { name: "تفاصيل الطلب", value: (order.details || "—").slice(0, 1000) }
            ],
            footer: { text: `CreatedAt: ${order.createdAt || new Date().toISOString()}` }
        };

        const payload = {
            content: null,
            embeds: [embed]
        };

        const resp = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const text = await resp.text();
            return res.status(502).json({ ok: false, error: "Discord webhook failed", details: text });
        }

        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ ok: false, error: "Server error" });
    }
});

app.get("/health", (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
