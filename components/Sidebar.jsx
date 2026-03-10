import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const Sidebar = ({ className, ...props }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('Reports');

  const menuItems = [
    {
      id: 'reports',
      label: 'Reports',
      icon: '/images/img_vector.svg',
      isActive: true
    },
    {
      id: 'library',
      label: 'Library',
      icon: '/images/img_icon_quiz.svg',
      isActive: false
    },
    {
      id: 'people',
      label: 'People',
      icon: '/images/img_icon_people.svg',
      isActive: false
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: '/images/img_icon_assignments.svg',
      isActive: false
    }
  ];

  const supportItems = [
    {
      id: 'get-started',
      label: 'Get Started',
      icon: '/images/img_icon_bulb.svg'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '/images/img_icon_settings.svg'
    }
  ];

  const handleMenuClick = (itemId) => {
    setActiveMenuItem(itemId);
  };

  return (
    <aside
      className={twMerge(
        'flex flex-col h-screen bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark',
        'w-full max-w-[250px] lg:w-[16%] min-w-[200px]',
        'hidden lg:flex',
        className
      )}
      {...props}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center pt-10 pb-6 px-6">
        <img
          src="/images/img_sidebar_logo.png"
          alt="Learning Analytics Hub"
          className="w-[138px] h-[16px] object-contain dark:brightness-200"
        />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-2.5">
          {menuItems?.map((item) => (
            <button
              key={item?.id}
              onClick={() => handleMenuClick(item?.id)}
              className={twMerge(
                'w-full flex items-center px-3.5 py-3 rounded-lg text-left transition-all duration-200',
                'hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1',
                item?.label === activeMenuItem
                  ? 'bg-primary/10 text-primary font-bold' : 'text-textSecondary-light dark:text-textSecondary-dark hover:text-text-light dark:hover:text-text-dark'
              )}
              style={{
                fontSize: '14px',
                fontFamily: 'Inter',
                lineHeight: '17px'
              }}
              role="menuitem"
            >
              <img
                src={item?.icon}
                alt=""
                className="w-5 h-5 mr-3 flex-shrink-0 dark:invert opacity-80"
                style={{
                  width: item?.label === 'Library' ? '24px' : '20px',
                  height: item?.label === 'People' || item?.label === 'Activities' ? '24px' : '20px'
                }}
              />
              <span>{item?.label}</span>
            </button>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-12 space-y-2.5">
          <h3
            className="px-3.5 text-sm font-bold text-textSecondary-light dark:text-textSecondary-dark mb-4 uppercase tracking-wider"
            style={{
              fontSize: '12px',
              fontFamily: 'Inter',
              lineHeight: '20px',
            }}
          >
            Support
          </h3>

          {supportItems?.map((item) => (
            <button
              key={item?.id}
              onClick={() => handleMenuClick(item?.id)}
              className="w-full flex items-center px-3.5 py-2.5 rounded-lg text-left transition-all duration-200 text-textSecondary-light dark:text-textSecondary-dark hover:text-text-light dark:hover:text-text-dark hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
              style={{
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '500',
                lineHeight: '17px'
              }}
              role="menuitem"
            >
              <img
                src={item?.icon}
                alt=""
                className="w-6 h-6 mr-4 flex-shrink-0 dark:invert opacity-80"
              />
              <span>{item?.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom User Profile Section */}
      <div className="border-t border-border-light dark:border-border-dark p-4 mt-auto">
        <div className="flex items-start space-x-3 px-4">
          <img
            src="/images/img_photo.png"
            alt="Sam Wheeler"
            className="w-[34px] h-[34px] rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold text-text-light dark:text-text-dark truncate leading-tight"
              style={{
                fontFamily: 'Inter',
              }}
            >
              Sam Wheeler
            </p>
            <p
              className="text-xs text-textSecondary-light dark:text-textSecondary-dark truncate mt-0.5"
              style={{
                fontFamily: 'Inter',
              }}
            >
              samwheeler@example.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
