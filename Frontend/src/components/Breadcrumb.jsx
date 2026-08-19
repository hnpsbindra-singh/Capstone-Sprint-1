import { useLocation, Link } from 'react-router-dom';
import { MdHome, MdChevronRight } from 'react-icons/md';

const LABEL_MAP = {
  victim:           'Dashboard',
  donor:            'Dashboard',
  ngo:              'Dashboard',
  admin:            'Dashboard',
  'create-report':  'Create Report',
  'my-reports':     'My Reports',
  'browse-requests':'Browse Requests',
  'my-donations':   'My Donations',
  'create-request': 'Create Request',
  'my-requests':    'My Requests',
  'manage-donations':'Manage Donations',
  'flood-reports':  'Flood Reports',
  'ngo-requests':   'NGO Requests',
  donations:        'All Donations',
  heatmap:          'Heatmap',
};

const ROLE_LABEL = {
  victim: '👤 Victim',
  donor:  '🤝 Donor',
  ngo:    '🏥 NGO',
  admin:  '🛡 Admin',
};

const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  // Only show on pages deeper than the root dashboard
  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, idx) => {
    const path  = '/' + segments.slice(0, idx + 1).join('/');
    const isLast = idx === segments.length - 1;
    // First segment is the role — use role label, others use LABEL_MAP
    const label = idx === 0
      ? (ROLE_LABEL[seg] || LABEL_MAP[seg] || seg)
      : (LABEL_MAP[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    return { path, label, isLast };
  });

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      {/* Home icon always links to role root */}
      <Link to={`/${segments[0]}`} className="breadcrumb-item breadcrumb-home" title="Home">
        <MdHome size={14} />
      </Link>

      {crumbs.map((crumb) => (
        <span key={crumb.path} className="breadcrumb-entry">
          <MdChevronRight className="breadcrumb-sep" />
          {crumb.isLast ? (
            <span className="breadcrumb-item breadcrumb-current">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="breadcrumb-item breadcrumb-link">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;



