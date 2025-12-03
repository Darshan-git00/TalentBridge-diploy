import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNav = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [
      { label: 'Home', path: '/', icon: <Home className="w-4 h-4" /> }
    ];

    // Add role-based root
    if (pathnames.length > 0) {
      const role = pathnames[0];
      let roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
      
      breadcrumbs.push({
        label: `${roleLabel} Dashboard`,
        path: `/${role}/dashboard`,
        icon: null
      });
    }

    // Add nested paths
    if (pathnames.length > 1) {
      const pathMap: { [key: string]: string } = {
        'drives': 'Opportunities',
        'applications': 'Applications',
        'profile': 'Profile',
        'settings': 'Settings',
        'students': 'Students',
        'companies': 'Companies',
        'create': 'Create',
        'edit': 'Edit'
      };

      for (let i = 1; i < pathnames.length; i++) {
        const path = pathnames[i];
        const label = pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
        
        // Skip if it's just 'dashboard' since we already added it
        if (path === 'dashboard') continue;
        
        breadcrumbs.push({
          label,
          path: `/${pathnames.slice(0, i + 1).join('/')}`,
          icon: null
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (location.pathname === '/' || breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground py-2 px-4 bg-muted/30 rounded-lg">
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
            )}
            
            {isLast ? (
              <span className="text-foreground font-medium flex items-center gap-2">
                {breadcrumb.icon}
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.path}
                className="hover:text-foreground transition-colors flex items-center gap-2"
              >
                {breadcrumb.icon}
                {breadcrumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNav;
