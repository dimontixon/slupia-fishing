import { Phone, Mail, MapPin, Clock } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

const CONTACT_ITEMS = [
  { icon: Phone, label: "Telefon", value: siteConfig.phone },
  { icon: Mail, label: "E-mail", value: siteConfig.email },
  { icon: MapPin, label: "Adres", value: siteConfig.address },
  { icon: Clock, label: "Godziny otwarcia", value: siteConfig.hours },
];

export default function ContactPage() {
  return (
    <>
      <div className="bg-accent-warm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-10">
          <Phone className="size-7 text-accent-warm-foreground" />
          <h1 className="font-heading text-2xl font-semibold text-accent-warm-foreground">Kontakt</h1>
        </div>
      </div>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
        <Card className="ring-primary/15">
          <CardHeader>
            <CardTitle>Dane kontaktowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CONTACT_ITEMS.map((item) => (
              <p key={item.label} className="flex items-center gap-3 text-sm">
                <item.icon className="size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item.label}:</span>
                <span>{item.value}</span>
              </p>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h2 className="font-heading text-lg font-medium">Znajdziesz nas też na</h2>
          <div className="flex gap-4 text-sm">
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              Facebook
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              Instagram
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
