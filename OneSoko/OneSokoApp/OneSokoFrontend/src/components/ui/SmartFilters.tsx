import React, { useState } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon, 
  ChevronDownIcon,
  CheckIcon,
  StarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

interface PriceRange {
  min: number;
  max: number;
}

interface FilterSection {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'rating' | 'color';
  options?: FilterOption[];
  value?: any;
  expanded?: boolean;
}

interface SmartFiltersProps {
  onFiltersChange: (filters: Record<string, any>) => void;
  categories?: FilterOption[];
  priceRange?: PriceRange;
  className?: string;
}

export const SmartFilters: React.FC<SmartFiltersProps> = ({
  onFiltersChange,
  categories = [],
  priceRange = { min: 0, max: 10000 },
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['category', 'price']));

  const filterSections: FilterSection[] = [
    {
      id: 'category',
      label: 'Categories',
      type: 'checkbox',
      options: categories.length > 0 ? categories : [
        { id: 'electronics', label: 'Electronics', count: 1250 },
        { id: 'fashion', label: 'Fashion', count: 890 },
        { id: 'home', label: 'Home & Garden', count: 650 },
        { id: 'sports', label: 'Sports', count: 420 },
        { id: 'books', label: 'Books', count: 380 },
      ]
    },
    {
      id: 'price',
      label: 'Price Range',
      type: 'range'
    },
    {
      id: 'rating',
      label: 'Customer Rating',
      type: 'rating'
    },
    {
      id: 'brand',
      label: 'Brands',
      type: 'checkbox',
      options: [
        { id: 'apple', label: 'Apple', count: 45 },
        { id: 'samsung', label: 'Samsung', count: 38 },
        { id: 'nike', label: 'Nike', count: 62 },
        { id: 'adidas', label: 'Adidas', count: 41 },
        { id: 'sony', label: 'Sony', count: 29 },
      ]
    },
    {
      id: 'color',
      label: 'Colors',
      type: 'color',
      options: [
        { id: 'black', label: 'Black', color: '#000000', count: 234 },
        { id: 'white', label: 'White', color: '#FFFFFF', count: 198 },
        { id: 'red', label: 'Red', color: '#EF4444', count: 156 },
        { id: 'blue', label: 'Blue', color: '#3B82F6', count: 142 },
        { id: 'green', label: 'Green', color: '#10B981', count: 98 },
      ]
    },
    {
      id: 'location',
      label: 'Seller Location',
      type: 'checkbox',
      options: [
        { id: 'nairobi', label: 'Nairobi', count: 456 },
        { id: 'mombasa', label: 'Mombasa', count: 234 },
        { id: 'kisumu', label: 'Kisumu', count: 123 },
        { id: 'nakuru', label: 'Nakuru', count: 89 },
      ]
    },
    {
      id: 'features',
      label: 'Features',
      type: 'checkbox',
      options: [
        { id: 'free_shipping', label: 'Free Shipping', count: 567 },
        { id: 'verified_seller', label: 'Verified Seller', count: 789 },
        { id: 'return_policy', label: 'Return Policy', count: 445 },
        { id: 'warranty', label: 'Warranty', count: 334 },
      ]
    }
  ];

  const handleFilterChange = (sectionId: string, value: any) => {
    const newFilters = { ...activeFilters };
    
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[sectionId];
    } else {
      newFilters[sectionId] = value;
    }
    
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCheckboxChange = (sectionId: string, optionId: string, checked: boolean) => {
    const currentValues = activeFilters[sectionId] || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, optionId];
    } else {
      newValues = currentValues.filter((id: string) => id !== optionId);
    }
    
    handleFilterChange(sectionId, newValues.length > 0 ? newValues : null);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    handleFilterChange('price', { min, max });
  };

  const handleRatingChange = (rating: number) => {
    const currentRating = activeFilters.rating;
    handleFilterChange('rating', currentRating === rating ? null : rating);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const renderColorOptions = (options: FilterOption[]) => (
    <div className="grid grid-cols-5 gap-2">
      {options.map((option) => {
        const isSelected = (activeFilters.color || []).includes(option.id);
        return (
          <button
            key={option.id}
            onClick={() => handleCheckboxChange('color', option.id, !isSelected)}
            className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${
              isSelected ? 'border-primary-500 scale-110' : 'border-neutral-300 dark:border-neutral-600'
            }`}
            style={{ backgroundColor: option.color }}
            title={`${option.label} (${option.count})`}
          >
            {isSelected && (
              <CheckIcon className="absolute inset-0 h-4 w-4 text-white mx-auto my-auto" />
            )}
          </button>
        );
      })}
    </div>
  );

  const renderRatingFilter = () => (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const isSelected = activeFilters.rating === rating;
        return (
          <button
            key={rating}
            onClick={() => handleRatingChange(rating)}
            className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
              isSelected
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-neutral-300 dark:text-neutral-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating} & up</span>
          </button>
        );
      })}
    </div>
  );

  const renderPriceRange = () => {
    const currentMin = activeFilters.price?.min || priceRange.min;
    const currentMax = activeFilters.price?.max || priceRange.max;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              Min Price
            </label>
            <input
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={currentMin}
              onChange={(e) => handlePriceRangeChange(Number(e.target.value), currentMax)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-800"
            />
          </div>
          <span className="text-neutral-400 mt-5">-</span>
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              Max Price
            </label>
            <input
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={currentMax}
              onChange={(e) => handlePriceRangeChange(currentMin, Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-800"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={currentMin}
            onChange={(e) => handlePriceRangeChange(Number(e.target.value), currentMax)}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={currentMax}
            onChange={(e) => handlePriceRangeChange(currentMin, Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          ${currentMin} - ${currentMax}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg w-full"
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Filter Panel */}
      <div
        className={`lg:block lg:relative lg:transform-none lg:opacity-100 lg:pointer-events-auto
          fixed top-0 right-0 z-50 h-full w-80 bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              Filters
            </h2>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filterSections.map((section) => (
            <div key={section.id} className="border-b border-neutral-200 dark:border-neutral-700 pb-6 last:border-b-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full mb-3"
              >
                <h3 className="font-medium text-neutral-900 dark:text-white">
                  {section.label}
                </h3>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.has(section.id) ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSections.has(section.id) && (
                <div className="space-y-2">
                  {section.type === 'checkbox' && section.options?.map((option) => {
                    const isChecked = (activeFilters[section.id] || []).includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(section.id, option.id, e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                        <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">
                          {option.label}
                        </span>
                        {option.count && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            ({option.count})
                          </span>
                        )}
                      </label>
                    );
                  })}

                  {section.type === 'color' && section.options && renderColorOptions(section.options)}
                  {section.type === 'rating' && renderRatingFilter()}
                  {section.type === 'range' && section.id === 'price' && renderPriceRange()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
