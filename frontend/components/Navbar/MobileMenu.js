// components/Shared/MobileMenu.js
import SearchForm from './SearchForm';
import WritePublishButton from './WritePublishButton';
import UserMenu from './UserMenu';

const MobileMenu = ({ onClose }) => {
  return (
    <div className="fixed top-16 left-0 w-full bg-white border-b border-gray-300 z-20 md:hidden">
      <div className="flex flex-col p-4 space-y-4">
        {/* Search Form for Mobile */}
        <SearchForm onSearch={onClose} />

        {/* Write/Publish Button */}
        <WritePublishButton onAction={onClose} />

        {/* User Menu with isMobile=true */}
        <UserMenu isMobile={true} onClose={onClose} />
      </div>
    </div>
  );
};

export default MobileMenu;

