# ☁️ Petit Nuage - AI Customer Support Chatbot

Bienvenue dans le projet **Petit Nuage**, une solution de chatbot intelligente et chaleureuse conçue pour accompagner les parents et futurs parents dans l'univers de la petite enfance.

Ce projet utilise une architecture moderne combinant un backend **FastAPI** puissant et un frontend **React** élégant, le tout propulsé par l'IA **Gemini 2.0 Flash**.

---

## ✨ Fonctionnalités

- **Léa, l'Assistante Virtuelle** : Un agent IA avec une personnalité douce, rassurante et une expertise sur les articles éco-responsables de Petit Nuage.
- **Support Client Intelligent** : Répond aux questions sur le catalogue, le suivi de commande, les retours et les livraisons.
- **Interface Premium** : Design "Glassmorphism", arrière-plan animé avec des bulles flottantes et animations fluides.
- **Garde-fous Sécurisés** : Interdiction stricte de donner des avis médicaux avec redirection vers des professionnels.
- **Performance** : Réponses instantanées grâce au modèle Gemini 2.0 Flash.

---

## 🛠️ Stack Technique

### Backend

- **FastAPI** (Python) : Serveur performant et asynchrone.
- **Gemini SDK** : Intégration de l'IA de Google.
- **Uvicorn** : Serveur ASGI pour la production.

### Frontend

- **React 19** : Interface utilisateur réactive.
- **Vite** : Outil de build ultra-rapide.
- **Tailwind CSS v4** : Styling moderne avec glassmorphism et animations CSS.
- **Axios** : Communication avec l'API backend.

---

## 🚀 Installation et Démarrage

### 1. Prérequis

- Python 3.9+
- Node.js 18+
- Une clé API Gemini (gratuite sur [Google AI Studio](https://aistudio.google.com/))

### 2. Configuration du Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

Créez un fichier `.env` dans le dossier `/backend` :

```env
GEMINI_API_KEY=votre_cle_api_ici
```

Lancez le backend :

```bash
uvicorn main:app --reload
```

### 3. Configuration du Frontend

```bash
cd frontend
npm install
```

Créez un fichier `.env` (optionnel pour le local) dans le dossier `/frontend` :

```env
VITE_API_URL=http://localhost:8000
```

Lancez le frontend :

```bash
npm run dev
```

---

## 🌐 Déploiement

- **Backend** : Prêt pour [Render](https://render.com) (n'oubliez pas d'ajouter la variable d'env `GEMINI_API_KEY`).
- **Frontend** : Prêt pour [Vercel](https://vercel.com) (ajoutez la variable d'env `VITE_API_URL` pointant vers votre backend Render).

---

## 🔒 Sécurité

Le projet inclut un fichier `.gitignore` robuste pour s'assurer que vos clés API et dossiers de dépendances ne soient jamais poussés sur GitHub. Utilisez toujours `.env.example` comme référence.

---

Développé avec ☁️ et ✨ pour l'univers de **Petit Nuage**.
