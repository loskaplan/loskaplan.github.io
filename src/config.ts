export const site = {
  name: 'Los Kaplan',
  tagline: 'Associació cultural',
  description:
    "Associació sense ànim de lucre de Terrassa que promou la cultura, l’art i la tecnologia en totes les seves formes.",

  email: 'hola@loskaplan.org',

  address: {
    street: 'Carrer Frederic Soler, 65',
    city: '08222 Terrassa',
    region: 'Barcelona',
  },

  nav: [
    { href: '/serveis', label: 'Serveis' },
    { href: '/qui-som', label: 'Qui som' },
    { href: '/contacte', label: 'Contacte' },
  ],
} as const;
