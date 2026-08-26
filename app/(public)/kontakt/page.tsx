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
    <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex items-center gap-3">
        <Phone className="size-7 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-semibold">Kontakt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane kontaktowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {CONTACT_ITEMS.map((item) => (
            <p key={item.label} className="flex items-center gap-3 text-sm">
              <item.icon className="size-4 shrink-0 text-muted-foreground" />
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
            className="text-muted-foreground hover:text-foreground"
          >
            Facebook
          </a>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            Instagram
          </a>
        </div>
      </div>
    </main>
  );
}
