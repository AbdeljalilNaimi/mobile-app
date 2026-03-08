import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface GuestBlockMessageProps {
  title: string;
  description: string;
}

export function GuestBlockMessage({ title, description }: GuestBlockMessageProps) {
  return (
    <div className="container-wide section-spacing-sm flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center py-12 px-6">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
          <div className="flex flex-col gap-2 w-full">
            <Button asChild className="w-full">
              <Link to="/citizen/login">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/citizen/register">Créer un compte</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
