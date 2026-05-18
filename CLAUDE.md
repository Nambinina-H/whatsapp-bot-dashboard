# WhatsApp Bot Dashboard

Interface web responsive pour visualiser les conversations entamées par mon bot WhatsApp
(orchestré sur n8n, données stockées dans Google Sheets).

## Stack
- Frontend: React 18 + Vite + TypeScript (strict mode)
- Style: Tailwind CSS v4 + shadcn/ui
- Data fetching: TanStack Query (polling pour rafraîchir)
- Routing: React Router uniquement si plusieurs vues nécessaires
- Backend: aucun. Les données viennent d'un webhook n8n qui proxy Google Sheets.
- Deploy: Vercel

## Design
Interface inspirée de WhatsApp Web :
- Colonne de gauche : liste des conversations (avatar, nom du prospect, dernier message, timestamp, badge non-lu)
- Colonne de droite : fil de messages de la conversation sélectionnée
- Responsive : sur mobile (<768px), bascule entre liste et conversation (pas de split-view)
- Thème clair + dark mode
- Couleurs inspirées de WhatsApp (vert #25D366) mais pas un clone pixel-perfect

## Conventions de code
- TypeScript strict, jamais de `any`
- Composants fonctionnels uniquement, hooks personnalisés pour la logique réutilisable
- TanStack Query pour TOUT appel réseau (jamais de fetch nu dans un composant)
- Variables d'env via `.env.local` (jamais commitées) : VITE_N8N_WEBHOOK_URL
- Tests avec Vitest + Testing Library pour la logique critique uniquement
- Structure de dossiers : src/components, src/hooks, src/lib, src/types, src/pages

## Intégration n8n
Le frontend appelle un seul endpoint : VITE_N8N_WEBHOOK_URL

Format JSON attendu en réponse :
```json
{
  "conversations": [
    {
      "id": "string",
      "contact": { "name": "string", "phone": "string", "avatar": "string?" },
      "messages": [
        { "id": "string", "from": "bot" | "user", "text": "string", "timestamp": "ISO 8601" }
      ],
      "unreadCount": "number"
    }
  ]
}
```

- Polling toutes les 3 secondes via TanStack Query (refetchInterval: 3000)
- Pas d'écriture côté frontend pour l'instant (lecture seule)

## Hors-scope (pour l'instant)
- Authentification utilisateur (dashboard accessible via URL Vercel privée)
- Envoyer des messages depuis l'interface
- Notifications push navigateur
- Recherche/filtrage avancé des conversations

## Workflow Git
- Branche `main` protégée, tout passe par des PRs (même solo, pour garder l'historique propre)
- Commits conventionnels (feat:, fix:, chore:, refactor:, docs:)
- Pas de commit direct sur main une fois le squelette en place
