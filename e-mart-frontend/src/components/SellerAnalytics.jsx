import React from 'react';
import { FiEye, FiTrendingUp, FiPackage, FiBox } from 'react-icons/fi';

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-surface/50 dark:bg-dark_surface/50 p-6 rounded-xl flex items-center space-x-4 border ${color}`}>
    <div className="p-3 rounded-full bg-primary/10 dark:bg-dark_primary/20">{icon}</div>
    <div>
      <p className="text-sm text-text-dark dark:text-dark_text-dark">{title}</p>
      <p className="text-2xl font-bold text-text-light dark:text-dark_text-light">{value}</p>
    </div>
  </div>
);

const ProductList = ({ title, products, field }) => (
  <div>
    <h4 className="font-bold text-text-light dark:text-dark_text-light mb-2">{title}</h4>
    <ul className="space-y-2">
      {products.map(p => (
        <li key={p._id} className="flex justify-between text-sm text-text-default dark:text-dark_text-default">
          <span>{p.name}</span>
          <span className="font-semibold">{p[field]}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SellerAnalytics = ({ analytics }) => {
  if (!analytics) return null;

  const { totalProducts, totalStock, totalViews, totalSales, topViewed, topSold } = analytics;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FiPackage size={24} className="text-primary dark:text-dark_primary"/>} title="Total Products" value={totalProducts} color="border-primary/50 dark:border-dark_primary/50" />
        <StatCard icon={<FiBox size={24} className="text-green-500 dark:text-green-400"/>} title="Total Stock" value={totalStock} color="border-green-500/50 dark:border-green-400/50" />
        <StatCard icon={<FiEye size={24} className="text-yellow-500 dark:text-yellow-400"/>} title="Total Views" value={totalViews} color="border-yellow-500/50 dark:border-yellow-400/50" />
        <StatCard icon={<FiTrendingUp size={24} className="text-red-500 dark:text-red-400"/>} title="Total Sales" value={totalSales} color="border-red-500/50 dark:border-red-400/50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProductList title="Top 5 Most Viewed" products={topViewed} field="views" />
        <ProductList title="Top 5 Best Selling" products={topSold} field="sales" />
      </div>
    </div>
  );
};

export default SellerAnalytics;
