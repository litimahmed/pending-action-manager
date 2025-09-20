import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardButton = () => {
  return (
    <Link to="/dashboard">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        View Dashboard
      </Button>
    </Link>
  );
};