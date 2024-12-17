import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Account } from '@/types/account';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function Warmup() {
  const { accounts, warmupAccount, removeFromWarmup } = useAccounts();
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>(
    accounts.filter(a => a.status === 'active')
  );
  const [autoWarmupAccounts, setAutoWarmupAccounts] = useState<Account[]>(
    accounts.filter(a => a.status === 'Auto Warmup')
  );
  const [manualWarmupAccounts, setManualWarmupAccounts] = useState<Account[]>(
    accounts.filter(a => a.status === 'Manual Warmup')
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, account: Account, source: 'available' | 'auto' | 'manual') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ account, source }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, target: 'available' | 'auto' | 'manual') => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      
      const { account, source } = JSON.parse(data) as { account: Account; source: 'available' | 'auto' | 'manual' };
      if (!account.id) return;

      if (source === target) return;

      // Remove from source
      if (source === 'available') {
        setAvailableAccounts(prev => prev.filter(a => a.id !== account.id));
      } else if (source === 'auto') {
        setAutoWarmupAccounts(prev => prev.filter(a => a.id !== account.id));
      } else if (source === 'manual') {
        setManualWarmupAccounts(prev => prev.filter(a => a.id !== account.id));
      }

      // Add to target
      if (target === 'available') {
        await removeFromWarmup(account.id);
        const updatedAccount = { ...account, status: 'active' };
        setAvailableAccounts(prev => [...prev, updatedAccount]);
        toast({
          title: "Account Removed from Warmup",
          description: `${account.username} has been removed from warmup.`
        });
      } else if (target === 'auto') {
        await warmupAccount(account.id, 'Auto Warmup');
        const updatedAccount = { ...account, status: 'Auto Warmup' };
        setAutoWarmupAccounts(prev => [...prev, updatedAccount]);
        toast({
          title: "Added to Auto Warmup",
          description: `${account.username} has been added to auto warmup queue.`
        });
      } else if (target === 'manual') {
        await warmupAccount(account.id, 'Manual Warmup');
        const updatedAccount = { ...account, status: 'Manual Warmup' };
        setManualWarmupAccounts(prev => [...prev, updatedAccount]);
        toast({
          title: "Added to Manual Warmup",
          description: `${account.username} has been added to manual warmup queue.`
        });
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      toast({
        title: "Error",
        description: "Failed to move account.",
        variant: "destructive"
      });
    }
  };

  const AccountCard = ({ account, source }: { account: Account; source: 'available' | 'auto' | 'manual' }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, account, source)}
      className="flex items-center justify-between rounded-lg border p-4 mb-2 cursor-move hover:bg-accent"
    >
      <div className="space-y-1">
        <div className="font-medium">{account.username}</div>
        <div className="flex items-center gap-2">
          <Progress value={account.healthScore} className="w-[60px]" />
          <span className="text-sm text-muted-foreground">
            {account.healthScore}%
          </span>
        </div>
      </div>
      <Badge variant="secondary">{account.status}</Badge>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Warmup</h1>
        <p className="text-muted-foreground">
          Manage your account warmup process
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Available Accounts */}
        <Card
          className="p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'available')}
        >
          <h2 className="font-semibold mb-4">Available Accounts</h2>
          <div className="space-y-2">
            {availableAccounts.map((account) => (
              <AccountCard key={account.id} account={account} source="available" />
            ))}
          </div>
        </Card>

        {/* Auto Warmup */}
        <Card
          className="p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'auto')}
        >
          <h2 className="font-semibold mb-4">Auto Warmup</h2>
          <div className="space-y-2">
            {autoWarmupAccounts.map((account) => (
              <AccountCard key={account.id} account={account} source="auto" />
            ))}
          </div>
        </Card>

        {/* Manual Warmup */}
        <Card
          className="p-4 relative"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'manual')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Manual Warmup</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {manualWarmupAccounts.map((account) => (
              <AccountCard key={account.id} account={account} source="manual" />
            ))}
          </div>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary" className="text-lg">Coming Soon</Badge>
          </div>
        </Card>
      </div>

      {/* Warmup Stats */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Warmup Statistics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">Active Warmups</div>
            <div className="text-2xl font-bold">
              {autoWarmupAccounts.length + manualWarmupAccounts.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Average Health Score</div>
            <div className="text-2xl font-bold">
              {Math.round(
                [...autoWarmupAccounts, ...manualWarmupAccounts].reduce(
                  (acc, curr) => acc + curr.healthScore,
                  0
                ) /
                  (autoWarmupAccounts.length + manualWarmupAccounts.length) || 0
              )}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Messages Sent Today</div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manual Warmup Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Groups to Join (comma-separated)</Label>
              <Textarea placeholder="group1, group2, group3" />
              <Button variant="outline" className="w-full">
                Upload CSV
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Message Frequency (per month)</Label>
              <Input type="number" min="1" placeholder="Enter frequency" />
            </div>
            <div className="space-y-2">
              <Label>Messages (one per line)</Label>
              <Textarea placeholder="Enter messages..." className="min-h-[100px]" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}