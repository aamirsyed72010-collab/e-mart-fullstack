import React from 'react';

const FilterSidebar = ({ filters, setFilters, allTags, allCategories }) => {
  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    const newTags = checked
      ? [...filters.tags, value]
      : filters.tags.filter((tag) => tag !== value);
    setFilters({ ...filters, tags: newTags });
  };

  const handleCategoryChange = (e) => {
    setFilters({ ...filters, category: e.target.value });
  };

  const handlePriceChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 bg-surface/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:bg-dark_surface/70 dark:border-dark_surface/50">
      <h3 className="text-xl font-bold mb-4 text-text-light dark:text-dark_text-light">Filters</h3>
      
      {/* Sort By */}
      <div className="mb-6">
        <label htmlFor="sort" className="block text-sm font-bold mb-2 text-text-default dark:text-dark_text-default">Sort By</label>
        <select id="sort" value={filters.sortBy} onChange={handleSortChange} className="w-full p-2 rounded-lg bg-surface/50 dark:bg-dark_surface/50 border border-gray-200 dark:border-dark_surface/50">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-text-default dark:text-dark_text-default">Price Range</label>
        <div className="flex space-x-2">
          <input type="number" name="price_min" placeholder="Min" value={filters.price_min} onChange={handlePriceChange} className="w-full p-2 rounded-lg bg-surface/50 dark:bg-dark_surface/50 border border-gray-200 dark:border-dark_surface/50" />
          <input type="number" name="price_max" placeholder="Max" value={filters.price_max} onChange={handlePriceChange} className="w-full p-2 rounded-lg bg-surface/50 dark:bg-dark_surface/50 border border-gray-200 dark:border-dark_surface/50" />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-text-default dark:text-dark_text-default">Category</label>
        <select value={filters.category} onChange={handleCategoryChange} className="w-full p-2 rounded-lg bg-surface/50 dark:bg-dark_surface/50 border border-gray-200 dark:border-dark_surface/50">
          <option value="">All</option>
          {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-bold mb-2 text-text-default dark:text-dark_text-default">Tags</label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {allTags.map(tag => (
            <label key={tag} className="flex items-center">
              <input type="checkbox" value={tag} checked={filters.tags.includes(tag)} onChange={handleTagChange} className="form-checkbox h-5 w-5 text-primary dark:text-dark_primary" />
              <span className="ml-2 text-text-default dark:text-dark_text-default">{tag}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
