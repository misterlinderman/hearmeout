import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Fragment, useState } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon },
  { name: 'My Ideas', href: '/dashboard', icon: LightBulbIcon, requiresAuth: true },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const location = useLocation();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-stone-900 px-6 pb-4 ring-1 ring-white/10">
                  <div className="flex h-16 shrink-0 items-center">
                    <Link to="/" className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <LightBulbIcon className="w-6 h-6 text-stone-900" />
                      </div>
                      <span className="text-xl font-bold text-white tracking-tight">Hear Me Out</span>
                    </Link>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => {
                            if (item.requiresAuth && !isAuthenticated) return null;
                            const isActive = location.pathname === item.href;
                            return (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={classNames(
                                    isActive
                                      ? 'bg-stone-800 text-amber-400'
                                      : 'text-stone-400 hover:text-white hover:bg-stone-800',
                                    'group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-medium transition-colors'
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-white',
                                      'h-6 w-6 shrink-0 transition-colors'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                      {isAuthenticated && (
                        <li className="mt-auto">
                          <Link
                            to="/submit"
                            onClick={() => setSidebarOpen(false)}
                            className="group -mx-2 flex gap-x-3 rounded-lg p-2 text-sm font-semibold leading-6 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 hover:from-amber-400 hover:to-orange-400 transition-all"
                          >
                            <PlusCircleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                            Submit Idea
                          </Link>
                        </li>
                      )}
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-stone-900/50 backdrop-blur-xl px-6 pb-4 border-r border-stone-800">
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <LightBulbIcon className="w-6 h-6 text-stone-900" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Hear Me Out</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    if (item.requiresAuth && !isAuthenticated) return null;
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            isActive
                              ? 'bg-stone-800/80 text-amber-400'
                              : 'text-stone-400 hover:text-white hover:bg-stone-800/50',
                            'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200'
                          )}
                        >
                          <item.icon
                            className={classNames(
                              isActive ? 'text-amber-400' : 'text-stone-500 group-hover:text-white',
                              'h-6 w-6 shrink-0 transition-colors'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              {isAuthenticated && (
                <li className="mt-auto space-y-2">
                  <Link
                    to="/submit"
                    className="group -mx-2 flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                  >
                    <PlusCircleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    Submit Your Idea
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-stone-800 bg-stone-950/80 backdrop-blur-xl px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-stone-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-stone-800 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search */}
            <form className="relative flex flex-1" action="/explore" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search ideas
              </label>
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-stone-500"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-white placeholder:text-stone-500 bg-transparent focus:ring-0 sm:text-sm"
                placeholder="Search ideas, categories, creators..."
                type="search"
                name="q"
              />
            </form>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-stone-400 hover:text-stone-300 transition-colors"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Separator */}
                  <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-stone-800" aria-hidden="true" />

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="-m-1.5 flex items-center p-1.5">
                      <span className="sr-only">Open user menu</span>
                      {user?.picture ? (
                        <img
                          className="h-8 w-8 rounded-full bg-stone-800 ring-2 ring-stone-700"
                          src={user.picture}
                          alt=""
                        />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-stone-400" />
                      )}
                      <span className="hidden lg:flex lg:items-center">
                        <span
                          className="ml-4 text-sm font-medium leading-6 text-white"
                          aria-hidden="true"
                        >
                          {user?.name}
                        </span>
                      </span>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-xl bg-stone-900 py-2 shadow-lg ring-1 ring-stone-800 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-stone-800' : '',
                                'flex items-center gap-3 px-4 py-2 text-sm text-stone-300'
                              )}
                            >
                              <UserCircleIcon className="h-5 w-5 text-stone-500" />
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/dashboard"
                              className={classNames(
                                active ? 'bg-stone-800' : '',
                                'flex items-center gap-3 px-4 py-2 text-sm text-stone-300'
                              )}
                            >
                              <ChartBarIcon className="h-5 w-5 text-stone-500" />
                              Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={classNames(
                                active ? 'bg-stone-800' : '',
                                'flex items-center gap-3 px-4 py-2 text-sm text-stone-300'
                              )}
                            >
                              <Cog6ToothIcon className="h-5 w-5 text-stone-500" />
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <div className="my-1 border-t border-stone-800" />
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-stone-800' : '',
                                'flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400'
                              )}
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5" />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </>
              ) : (
                <button
                  onClick={() => loginWithRedirect()}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
