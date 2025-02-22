'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AccessRights, AccessLevel } from '@/types/auth';

interface RoleCheckProps {
  feature: keyof AccessRights;
  requiredAccess: boolean | 'read' | 'write';
}

export function withRoleCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { feature, requiredAccess }: RoleCheckProps
) {
  return function WithRoleCheckWrapper(props: P) {
    const router = useRouter();
    const { checkAccess, user } = useAuth();

    useEffect(() => {
      // If user is not logged in, redirect to login
      if (!user) {
        router.replace('/login');
        return;
      }

      // Check if user has required access
      const hasAccess = checkAccess(feature);
      if (!hasAccess) {
        // Redirect to home page if user doesn't have access
        router.replace('/');
      }
    }, [user, router]);

    // Only render the component if user has access
    const hasAccess = checkAccess(feature);
    return hasAccess ? <WrappedComponent {...props} /> : null;
  };
}
