import { useQuery } from '@tanstack/react-query';
import { getAdCategories } from '@/services/adsService';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AdsCategoryBarProps {
  selected: string | null;
  onSelect: (cat: string | null) => void;
}

export function AdsCategoryBar({ selected, onSelect }: AdsCategoryBarProps) {
  const { data: categories = [], isLoading } = useQuery<string[]>({
    queryKey: ['/api/ads/categories'],
    queryFn: getAdCategories,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div
      data-testid="category-bar"
      className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-3"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        data-testid="category-chip-all"
        onClick={() => onSelect(null)}
        className={cn(
          'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
          selected === null
            ? 'bg-[#4285F4] text-white shadow-sm'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        Tous
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          data-testid={`category-chip-${cat}`}
          onClick={() => onSelect(cat === selected ? null : cat)}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            selected === cat
              ? 'bg-[#4285F4] text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
