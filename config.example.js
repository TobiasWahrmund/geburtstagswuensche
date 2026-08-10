// Diese Datei nach dem Einrichten von Supabase in "config.js" umbenennen
// und deine beiden Werte eintragen.
//
// Die anon/publishable URL und der anon/publishable Key sind für eine
// öffentliche Frontend-App gedacht. Sicherheit entsteht hier durch die
// RLS-Regeln und die Datenbankfunktion – NICHT durch das Geheimhalten
// des Frontend-Keys.

window.APP_CONFIG = {
  supabaseUrl: "https://DEIN-PROJEKT.supabase.co",
  supabaseAnonKey: "DEIN-PUBLISHABLE-KEY"
};
