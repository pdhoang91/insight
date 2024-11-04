// components/Breadcrumbs.js
import Link from 'next/link';
import { useRouter } from 'next/router';

const Breadcrumbs = () => {
  const router = useRouter();
  const { pathname } = router;

  // Tách các segment từ pathname
  const pathSegments = pathname.split('/').filter(segment => segment);

  return (
    <nav className="text-sm mb-4 text-gray-600">
      <ul className="flex space-x-2">
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>
        {pathSegments.length > 0 && (
          <li>
            <span>/</span>
            <Link href={`/${pathSegments[0]}`} className="ml-1 hover:underline capitalize">
              {pathSegments[0]}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
