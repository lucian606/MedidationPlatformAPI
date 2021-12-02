# Proba tehnica - BACKEND

## Rularea aplicatiei

    node server.js

## Pachete folosite

- express
- mongoose (pentru scheme la baza de date)
- bcrypt (pentru hashing)
- dotenv (sa pot accesa variabilele de mediu din .env)
- jwt (sa pot genera tokens)
- nodemailer (sa pot trimite mailuri)

## Feature-uri implementate

Am implementat to ce s-a cerut la baza, plus bonusuri.\
- Contact request:
    - trimitere de mail cand se face post
    - filtrare + sortare la getAll
- Users:
    - parola criptata + min 8 chars
    - utilizarea unui token de autentificare (bearer token) pentru delete/patch in baza userului logat