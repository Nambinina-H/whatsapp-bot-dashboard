import type { ConversationsPayload } from '@/types/conversation'

export const mockConversationsPayload: ConversationsPayload = {
  conversations: [
    {
      id: 'conv-001',
      contact: {
        name: 'Hery Rakoto',
        phone: '+261 34 12 345 67',
      },
      unreadCount: 2,
      messages: [
        {
          id: 'm-001-1',
          from: 'user',
          text: 'Bonjour, je voudrais des infos sur vos services.',
          timestamp: '2026-05-12T08:14:00.000Z',
        },
        {
          id: 'm-001-2',
          from: 'bot',
          text: 'Bonjour Hery ! Avec plaisir. Vous cherchez quoi exactement ?',
          timestamp: '2026-05-12T08:14:12.000Z',
        },
        {
          id: 'm-001-3',
          from: 'user',
          text: "J'aimerais comprendre vos forfaits mensuels.",
          timestamp: '2026-05-12T08:15:40.000Z',
        },
        {
          id: 'm-001-4',
          from: 'user',
          text: 'Et si possible un devis pour 5 utilisateurs.',
          timestamp: '2026-05-12T08:16:02.000Z',
        },
      ],
    },
    {
      id: 'conv-002',
      contact: {
        name: 'Mialy Andriana',
        phone: '+261 33 22 110 88',
      },
      unreadCount: 0,
      messages: [
        {
          id: 'm-002-1',
          from: 'bot',
          text: 'Bonjour Mialy, votre commande #4521 a bien été expédiée.',
          timestamp: '2026-05-11T17:02:00.000Z',
        },
        {
          id: 'm-002-2',
          from: 'user',
          text: 'Super, merci ! Livraison prévue quand ?',
          timestamp: '2026-05-11T17:05:18.000Z',
        },
        {
          id: 'm-002-3',
          from: 'bot',
          text: 'Mardi 13 mai, entre 9h et 12h.',
          timestamp: '2026-05-11T17:05:40.000Z',
        },
      ],
    },
    {
      id: 'conv-003',
      contact: {
        name: 'Tovo R.',
        phone: '+261 32 90 555 41',
      },
      unreadCount: 5,
      messages: [
        {
          id: 'm-003-1',
          from: 'user',
          text: 'Allo ?',
          timestamp: '2026-05-12T11:00:00.000Z',
        },
        {
          id: 'm-003-2',
          from: 'user',
          text: 'Vous êtes là ?',
          timestamp: '2026-05-12T11:00:30.000Z',
        },
        {
          id: 'm-003-3',
          from: 'user',
          text: "J'ai un souci avec ma facture du mois.",
          timestamp: '2026-05-12T11:01:00.000Z',
        },
        {
          id: 'm-003-4',
          from: 'bot',
          text: 'Bonjour Tovo, je transfère ça au support.',
          timestamp: '2026-05-12T11:01:30.000Z',
        },
        {
          id: 'm-003-5',
          from: 'user',
          text: 'Ok merci.',
          timestamp: '2026-05-12T11:02:00.000Z',
        },
      ],
    },
    {
      id: 'conv-004',
      contact: {
        name: 'Nirina V.',
        phone: '+261 34 70 010 22',
      },
      unreadCount: 0,
      messages: [
        {
          id: 'm-004-1',
          from: 'user',
          text: 'Merci pour le suivi !',
          timestamp: '2026-05-10T09:30:00.000Z',
        },
        {
          id: 'm-004-2',
          from: 'bot',
          text: 'Avec plaisir, bonne journée à vous.',
          timestamp: '2026-05-10T09:30:25.000Z',
        },
      ],
    },
  ],
}
