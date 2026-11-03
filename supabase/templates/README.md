# Modelos de e-mail do login

Em português, com o link e o código do e-mail. O link leva o `token_hash` direto para `/auth/callback`, então abre em qualquer navegador; o código serve para o app instalado no iPhone.

Os e-mails saem pelo Resend (SMTP `smtp.resend.com`, remetente `entrar@anabolia.app`, domínio verificado em 03/11/2026, DNS na Hostinger). O plano gratuito do Supabase só aceita trocar os modelos com esse SMTP próprio. Os modelos abaixo foram aplicados pela API de gestão em 03/11/2026; para mudar, edite o arquivo e aplique de novo (ou cole no modelo correspondente em Authentication → Emails):

| Arquivo | Modelo no Supabase | Assunto |
|---|---|---|
| magic_link.html | Magic Link | Seu link para entrar no Anaból[IA] |
| confirmation.html | Confirm signup | Confirme seu e-mail no Anaból[IA] |
| email_change.html | Change Email Address | Confirme seu e-mail no Anaból[IA] |
