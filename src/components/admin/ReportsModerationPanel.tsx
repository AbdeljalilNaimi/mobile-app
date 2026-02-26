import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, AlertTriangle, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProviderReport {
  id: string;
  provider_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}

type StatusFilter = 'all' | 'pending' | 'resolved' | 'dismissed';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  resolved: { label: 'Traité', variant: 'default' },
  dismissed: { label: 'Rejeté', variant: 'outline' },
};

export function ReportsModerationPanel() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ['admin-provider-reports'];

  const { data: reports = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProviderReport[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('provider_reports')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Statut mis à jour' });
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' });
    },
  });

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-destructive" />
          <div>
            <CardTitle>Signalements de profils</CardTitle>
            <CardDescription>{counts.pending} signalement(s) en attente</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">Tous ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">En attente ({counts.pending})</TabsTrigger>
            <TabsTrigger value="resolved">Traités ({counts.resolved})</TabsTrigger>
            <TabsTrigger value="dismissed">Rejetés ({counts.dismissed})</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mb-2" />
            <p>Aucun signalement trouvé</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider ID</TableHead>
                <TableHead>Reporter ID</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((report) => {
                const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate">{report.provider_id}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate">{report.reporter_id}</TableCell>
                    <TableCell className="text-sm">{report.reason}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate text-muted-foreground">
                      {report.details || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(report.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      {report.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => updateStatus.mutate({ id: report.id, status: 'resolved' })}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Traité
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => updateStatus.mutate({ id: report.id, status: 'dismissed' })}
                            disabled={updateStatus.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
