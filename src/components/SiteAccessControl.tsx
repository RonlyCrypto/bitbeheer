import { useAuth } from '../contexts/AuthContext';
import SoonOnlinePage from '../pages/SoonOnlinePage';

interface SiteAccessControlProps {
  children: React.ReactNode;
}

export default function SiteAccessControl({ children }: SiteAccessControlProps) {
  const { isSiteAccessible } = useAuth();

  if (!isSiteAccessible()) {
    return <SoonOnlinePage />;
  }

  return <>{children}</>;
}
