/**
 * Utility: imagePath
 * Resuelve rutas de imágenes de tarjetas de forma robusta tanto en desarrollo local
 * como en compilación estática de producción (incluyendo subdirectorios o GitHub Pages).
 */
export function getCardImageUrl(image?: string, cardId?: string): string {
  const fallback = cardId
    ? `card_redesign/generated_visuals/${cardId}_visual_final.png`
    : 'card_redesign/card_back/mtc_card_back_art.png';

  const rawPath = (image || fallback).replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${rawPath}`;
}

export function getCardBackImageUrl(): string {
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}card_redesign/card_back/mtc_card_back_art.png`;
}
