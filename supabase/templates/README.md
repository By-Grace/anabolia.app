# Modelos de e-mail do login

Em português, com o link e o código do e-mail. O link leva o `token_hash` direto para `/auth/callback`, então abre em qualquer navegador; o código serve para o app instalado no iPhone.

O Supabase só aceita trocar estes modelos com um serviço de e-mail próprio (SMTP), no plano gratuito. Depois de configurar o SMTP (Authentication → Emails → SMTP), cole cada arquivo no modelo correspondente:

| Arquivo | Modelo no Supabase | Assunto |
|---|---|---|
| magic_link.html | Magic Link | Seu link para entrar no Anaból[IA] |
| confirmation.html | Confirm signup | Confirme seu e-mail no Anaból[IA] |
| email_change.html | Change Email Address | Confirme seu e-mail no Anaból[IA] |
