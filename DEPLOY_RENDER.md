# Deploy EchoIA su Render.com

## Metodo più semplice (consigliato)

### Passo 1: Carica il progetto su GitHub

1. Crea un nuovo repository su GitHub (può essere privato).
2. Carica tutta la cartella `echoia` dentro il repository.

### Passo 2: Deploy su Render

1. Vai su [https://render.com](https://render.com) e fai login (o registrati gratis).
2. Clicca su **"New +"** → **"Web Service"**.
3. Collega il tuo account GitHub e seleziona il repository che hai creato.
4. Render leggerà automaticamente il file `render.yaml` e configurerà tutto.
5. Clicca su **"Create Web Service"**.

### Passo 3: Aspetta il deploy

Render builda il progetto e lo deploya.  
Quando finisce, ti darà un URL del tipo:

```
https://echoia-xxxx.onrender.com
```

Apri quell’URL e potrai usare EchoIA dal browser (anche dal telefono).

---

## Note

- Il piano Free è sufficiente per testare.
- Il server si spegne dopo 15 minuti di inattività e si riaccende al primo accesso (può volerci qualche secondo).
- Se vuoi che rimanga sempre acceso, puoi passare a un piano a pagamento in futuro.

---

Una volta deployato, fammi sapere l’URL e ti aiuto a testarlo o a migliorarlo ulteriormente.