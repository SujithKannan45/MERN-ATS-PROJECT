import * as React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center p-4 text-center">
      <div className="text-7xl font-black text-primary/30 mb-2">404</div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Sorry, we couldn’t find the page you’re looking for. It might have been moved or removed.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button className="gap-2">
            <Home className="h-4 w-4" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
