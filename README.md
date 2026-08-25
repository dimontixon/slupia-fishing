# Słupia Fishing

Serwis rezerwacji sektorów wędkarskich dla łowiska "Słupia" — mapa satelitarna
ze klikalnymi sektorami, rezerwacje 12-godzinnych slotów, panel administratora.
Szczegóły architektury i zasad biznesowych: zobacz [`CLAUDE.md`](./CLAUDE.md).

## Wymagania

- Node.js 20+
- Docker Desktop (lokalny PostgreSQL)

## Pierwsze uruchomienie

```bash
npm install
cp .env.example .env   # uzupełnij NEXTAUTH_SECRET i ADMIN_PASSWORD_HASH
npm run db:up           # startuje PostgreSQL w Dockerze
npx prisma migrate dev  # tworzy schemat bazy danych
npx prisma db seed      # sektory (1-32) + domyślne ustawienia rezerwacji
npm run dev
```

Aplikacja: http://localhost:3000, panel administratora: http://localhost:3000/admin/login.

### Generowanie `ADMIN_PASSWORD_HASH`

```bash
node -e "console.log(require('bcryptjs').hashSync('twoje-haslo', 10))"
```

### Logowanie SMS OTP (klienci)

W trybie deweloperskim kod logowania **nie jest wysyłany SMS-em** — pojawia się
w konsoli serwera (`npm run dev`), np. `[OTP] +48123456789 -> 123456`.

## Skrypty

- `npm run dev` / `build` / `start` / `lint`
- `npm run db:up` / `db:down` — Docker Postgres
- `npm run prisma:studio` — podgląd bazy danych w przeglądarce
