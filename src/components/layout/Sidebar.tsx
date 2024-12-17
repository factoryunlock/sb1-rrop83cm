import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  MessageSquare,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.svg';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Accounts', href: '/accounts', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Warmup', href: '/warmup', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-14 items-center justify-center border-b px-4">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8"
            style={{ filter: 'var(--svg-filter)' }}
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary/10'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}