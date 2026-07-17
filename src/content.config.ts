import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pagines = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pagines' }),
  schema: z.object({
    // Nom curt: surt al menú i a la pestanya del navegador.
    title: z.string(),
    // Només per a Google i per compartir a xarxes. No es veu mai a la pàgina.
    description: z.string(),
    // El titular gran.
    heading: z.string(),
    /* L'entradeta sota el titular. Opcional: si el titular ja ho diu tot, no cal
       repetir-ho. Abans es feia servir la description per a les dues coses, i això
       obligava a triar entre un bon text per a Google i un bon text per a la pàgina. */
    lede: z.string().optional(),
  }),
});

export const collections = { pagines };
