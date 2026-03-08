import { memo, useRef, useEffect } from 'react';
import { Star, Phone, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isProviderVerified } from '@/utils/verificationUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import type { CityHealthProvider } from '@/data/providers';

interface ProviderListItemProps {
  provider: CityHealthProvider;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  distance?: number;
}

export const ProviderListItem = memo(({ 
  provider, 
  isSelected, 
  isHovered,
  onSelect, 
  onHover,
  distance
}: ProviderListItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVerified = isProviderVerified(provider);
  const { t } = useLanguage();

  // Auto-scroll into view when selected from map
  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={ref}
      className={cn(
        "p-3 mx-1.5 my-1 rounded-xl cursor-pointer transition-all duration-200",
        isSelected && "bg-primary/5 ring-1 ring-primary/30 shadow-sm",
        isHovered && !isSelected && "bg-muted/50",
        !isSelected && !isHovered && "hover:bg-muted/30"
      )}
      onClick={() => onSelect(provider.id)}
      onMouseEnter={() => onHover(provider.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badge row */}
          <div className="flex items-center gap-1.5 mb-1">
            {isVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                <CheckCircle size={10} />
                Vérifié
              </span>
            )}
            {provider.emergency && (
              <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                {t('provider', 'emergency')}
              </span>
            )}
          </div>

          <h4 className="font-semibold text-sm truncate text-foreground">{provider.name}</h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {provider.specialty || provider.type}
          </p>

          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <div className="flex items-center gap-0.5">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{provider.rating}</span>
              <span className="text-muted-foreground">({provider.reviewsCount})</span>
            </div>
            {distance && (
              <span className="text-muted-foreground">{distance} km</span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground mt-1 truncate">{provider.address}</p>
        </div>

        {/* Right: Avatar */}
        <div className="flex flex-col items-center gap-1.5">
          <ProviderAvatar
            image={provider.image}
            name={provider.name}
            type={provider.type}
            className="w-14 h-14 rounded-xl"
            iconSize={24}
          />
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              title={t('provider', 'callNow')}
            >
              <Phone size={13} className="text-muted-foreground" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

ProviderListItem.displayName = 'ProviderListItem';
