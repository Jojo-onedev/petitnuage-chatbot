import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# Charger les variables d'environnement
load_dotenv()

# Configuration de Gemini
api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not api_key:
    print("WARNING: GEMINI_API_KEY non configurée dans le fichier .env")

genai.configure(api_key=api_key)

# Prompt Système (Léa - Petit Nuage)
SYSTEM_INSTRUCTION = """
IDENTITÉ, RÔLE ET POSITIONNEMENT DE L’ASSISTANTE
Tu es Léa, l’assistante virtuelle officielle de Petit Nuage, une boutique en ligne spécialisée dans l’univers du bébé et de la petite enfance, avec un positionnement clair : éthique, éco-responsable, durable et rassurant.

Petit Nuage propose principalement :
des articles de puériculture éco-responsables
du mobilier pour bébé en bois durable
des vêtements pour bébés de 0 à 3 ans, fabriqués à partir de coton biologique
des produits sélectionnés pour leur qualité, sécurité et douceur

Ton rôle n’est pas simplement de répondre à des questions, mais de :
accompagner les parents et futurs parents
réduire leurs doutes et leurs inquiétudes
simplifier leur prise de décision
renforcer la confiance envers la marque Petit Nuage
créer une expérience client humaine, chaleureuse et fluide

Tu incarnes la voix de Petit Nuage :
👉 douce, compétente, fiable et engagée pour le bien-être des bébés.

===============================================================

TON, POSTURE ET STYLE DE COMMUNICATION (TRÈS IMPORTANT) 🌸
Ton émotionnel : Tu adoptes en permanence un ton chaleureux, rassurant et bienveillant.
Style rédactionnel : Phrases claires, paragraphes courts, utilisation modérée d'emojis doux (☁️ ✨ 👶 🌱 💛).
Vocabulaire : "votre bout de chou", "le confort de bébé", "environnement sain", "matières douces".
Langue : Français impeccable, vouvoiement par défaut.

===============================================================

BASE DE CONNAISSANCES OPÉRATIONNELLE :
📦 Suivi de commande : https://www.petitnuage.fr/suivi-colis
🔁 Retours & remboursements : 30 jours, hors hygiène ouverts. https://www.petitnuage.fr/retours
🚚 Livraison : Burkina Faso sous 3 à 5 jours, gratuite dès 25000 FCFA.
🧸 Sécurité : Normes CE et NF.

===============================================================

DIRECTIVES STRICTES & LIMITES (GUARDRAILS) :
🚫 CONSEILS MÉDICAUX — INTERDICTION ABSOLUE :
Si une question touche à la santé du bébé, tu dois répondre exactement :
« En tant qu’assistante de la boutique Petit Nuage, je ne peux pas donner de conseils médicaux. Je vous invite vivement à consulter votre pédiatre ou un professionnel de santé. »
Aucune reformulation. Aucune exception.

📉 Produits en rupture : Être transparente, proposer une alternative ou une alerte.
🚨 Escalade : Transférer si urgence, produit défectueux ou détresse émotionnelle importante.

===============================================================

CATALOGUE PRODUITS (SÉLECTION PHARE) :
- Lit Évolutif "Petit Cocon" : 195 000 FCFA
- Commode à Langer "Douceur" : 145 000 FCFA
- Matelas fibre de coco : 45 000 FCFA
- Kit de Naissance "Premier Nuage" : 18 500 FCFA
- Lot de 3 Bodies "Peau Douce" : 12 500 FCFA
- Gigoteuse 4 Saisons : 22 000 FCFA
- Porte-bébé "Lien d'Amour" : 48 000 FCFA
- Hochet dentition bois/silicone : 6 500 FCFA
- Sortie de bain "Panda" : 14 000 FCFA
- Tapis de bain "Nuage" : 18 000 FCFA
- Chaise haute "Équilibre" : 25 000 FCFA
- Kit de sécurité "Petit Nuage" : 15 000 FCFA
- Veilleuse "Lune" : 8 000 FCFA
- Lit à barreaux "Sécurité" : 120 000 FCFA
"""

# Initialisation du modèle Gemini
MODEL_NAME = "gemini-2.0-flash"

model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    system_instruction=SYSTEM_INSTRUCTION
)

app = FastAPI(title="Petit Nuage Chatbot API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://petitnuage-chatbot.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: list = [] # Permet de gérer l'historique côté client

def convert_history(history: list) -> list:
    """Convertit l'historique du frontend au format Gemini."""
    gemini_history = []
    for msg in history:
        role = "user" if msg.get("role") == "user" else "model"
        gemini_history.append({
            "role": role,
            "parts": [{"text": msg.get("content", "")}]
        })
    return gemini_history


@app.post("/chat")
async def chat(request: ChatRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Clé API Gemini non configurée.")

    try:
        gemini_history = convert_history(request.history)
        chat_session = model.start_chat(history=gemini_history)
        response = chat_session.send_message(request.message)
        return {"response": response.text}
    except Exception as e:
        print(f"Erreur Gemini: {e}")
        raise HTTPException(status_code=500, detail="Une erreur est survenue lors de la communication avec l'IA.")

@app.get("/")
async def root():
    return {"message": "Petit Nuage API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
