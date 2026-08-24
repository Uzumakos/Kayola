import React from 'react';
import { Artwork } from '../../types';
import { ArtworkCard } from './ArtworkCard';

interface ArtworkGridProps {
  artworks: Artwork[];
  emptyMessage?: string;
}

export const ArtworkGrid: React.FC<ArtworkGridProps> = ({ artworks, emptyMessage }) => {
  if (artworks.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E8E6E2]">
        <p className="text-base text-[#737373]">{emptyMessage || 'Aucune œuvre disponible.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {artworks.map((artwork, idx) => (
        <ArtworkCard key={artwork.id} artwork={artwork} priority={idx < 4} />
      ))}
    </div>
  );
};
