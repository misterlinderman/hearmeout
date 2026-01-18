import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  LightBulbIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Share Your Vision',
    description: 'Submit your concepts, inventions, and business ideas with structured templates designed for each type.',
    icon: LightBulbIcon,
    color: 'from-amber-400 to-orange-500',
  },
  {
    name: 'Protect Your IP',
    description: 'Get guided assistance for trademarks, copyrights, patents, and NDAs with step-by-step workflows.',
    icon: ShieldCheckIcon,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'Secure Funding',
    description: 'Request investment with clear equity structures and connect with potential investors and partners.',
    icon: CurrencyDollarIcon,
    color: 'from-blue-400 to-indigo-500',
  },
  {
    name: 'Build Together',
    description: 'Find collaborators with the expertise, resources, and passion to help bring your idea to life.',
    icon: UserGroupIcon,
    color: 'from-purple-400 to-pink-500',
  },
];

const stats = [
  { id: 1, name: 'Ideas Submitted', value: '2,500+' },
  { id: 2, name: 'Successful Partnerships', value: '840+' },
  { id: 3, name: 'Funding Raised', value: '$4.2M' },
  { id: 4, name: 'Active Contributors', value: '12K+' },
];

const categories = [
  { name: 'Inventions', icon: RocketLaunchIcon, count: 423, href: '/explore?category=invention' },
  { name: 'Business Ideas', icon: ChartBarIcon, count: 687, href: '/explore?category=business' },
  { name: 'Creative Projects', icon: SparklesIcon, count: 312, href: '/explore?category=creative' },
  { name: 'Tech Solutions', icon: DocumentCheckIcon, count: 559, href: '/explore?category=technology' },
];

export default function Home() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4" />
              Where ideas become reality
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-white">Got an idea?</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-transparent bg-clip-text">
                Hear Me Out.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed">
              Submit your concepts, inventions, and business ideas. Get help with IP protection, 
              find investors, and connect with partners who believe in your vision.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold text-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                >
                  Submit Your Idea
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => loginWithRedirect()}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold text-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                >
                  Get Started Free
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              )}
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-stone-800 text-white font-semibold text-lg hover:bg-stone-700 transition-all border border-stone-700"
              >
                Explore Ideas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-stone-800 bg-stone-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <dt className="text-sm font-medium text-stone-500 mb-1">{stat.name}</dt>
                <dd className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to launch
            </h2>
            <p className="text-lg text-stone-400">
              From initial concept to official protection and funding, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative p-8 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-stone-700 transition-all group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.name}</h3>
                <p className="text-stone-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 sm:py-32 bg-stone-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Explore by Category
            </h2>
            <p className="text-lg text-stone-400">
              Discover ideas across different domains and find your next opportunity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="p-6 rounded-xl bg-stone-800/50 border border-stone-700 hover:border-amber-500/50 hover:bg-stone-800 transition-all group"
              >
                <category.icon className="w-10 h-10 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
                <p className="text-sm text-stone-500">{category.count} active ideas</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-3xl" />
            </div>

            <div className="p-12 sm:p-16 rounded-3xl bg-stone-900/80 border border-stone-800">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to share your idea?
              </h2>
              <p className="text-lg text-stone-400 mb-8 max-w-xl mx-auto">
                Join thousands of innovators who are turning their concepts into reality. 
                Your next big breakthrough starts here.
              </p>
              {isAuthenticated ? (
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold text-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
                >
                  Submit Your Idea
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => loginWithRedirect()}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 font-semibold text-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
                >
                  Create Free Account
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
