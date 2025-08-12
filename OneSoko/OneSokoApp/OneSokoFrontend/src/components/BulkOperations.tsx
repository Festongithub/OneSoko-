import React, { useState, useCallback } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  requiresInput?: boolean;
  inputType?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
}

interface BulkOperationsProps {
  selectedItems: any[];
  onBulkAction: (action: string, items: any[], value?: any) => Promise<void>;
  onClearSelection: () => void;
  availableActions: BulkAction[];
  loading?: boolean;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedItems,
  onBulkAction,
  onClearSelection,
  availableActions,
  loading = false
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<any>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleActionClick = useCallback((action: BulkAction) => {
    if (action.requiresInput) {
      setActiveAction(action.id);
      setInputValue('');
    } else {
      executeBulkAction(action.id);
    }
  }, []);

  const executeBulkAction = useCallback(async (actionId: string, value?: any) => {
    setIsProcessing(true);
    try {
      await onBulkAction(actionId, selectedItems, value);
      setActiveAction(null);
      setInputValue('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, onBulkAction]);

  const handleInputSubmit = useCallback(() => {
    if (activeAction && inputValue !== '') {
      executeBulkAction(activeAction, inputValue);
    }
  }, [activeAction, inputValue, executeBulkAction]);

  const getActionColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      green: 'bg-green-600 hover:bg-green-700 text-white',
      red: 'bg-red-600 hover:bg-red-700 text-white',
      yellow: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white',
      gray: 'bg-gray-600 hover:bg-gray-700 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const renderInputField = (action: BulkAction) => {
    const currentAction = availableActions.find(a => a.id === activeAction);
    if (!currentAction) return null;

    switch (currentAction.inputType) {
      case 'select':
        return (
          <select
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select an option</option>
            {currentAction.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(parseFloat(e.target.value))}
            placeholder="Enter value"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        );
      default:
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        );
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full mr-3">
            <CheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bulk Operations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
        <button
          onClick={onClearSelection}
          className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="w-4 h-4 mr-1" />
          Clear
        </button>
      </div>

      {/* Input Form for actions requiring input */}
      {activeAction && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {availableActions.find(a => a.id === activeAction)?.label}
              </label>
              {renderInputField(availableActions.find(a => a.id === activeAction)!)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInputSubmit}
                disabled={inputValue === '' || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </button>
              <button
                onClick={() => {
                  setActiveAction(null);
                  setInputValue('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {availableActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={loading || isProcessing}
              className={`
                flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${getActionColor(action.color)}
                hover:scale-105 active:scale-95
              `}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Indicator */}
      {(loading || isProcessing) && (
        <div className="mt-4 flex items-center justify-center">
          <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Processing bulk operation...
          </span>
        </div>
      )}
    </div>
  );
};

// Predefined bulk actions for different contexts
export const PRODUCT_BULK_ACTIONS: BulkAction[] = [
  {
    id: 'update-price',
    label: 'Update Price',
    icon: CurrencyDollarIcon,
    color: 'green',
    requiresInput: true,
    inputType: 'number'
  },
  {
    id: 'update-category',
    label: 'Change Category',
    icon: TagIcon,
    color: 'blue',
    requiresInput: true,
    inputType: 'select',
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'books', label: 'Books' },
      { value: 'home', label: 'Home & Garden' }
    ]
  },
  {
    id: 'publish',
    label: 'Publish',
    icon: EyeIcon,
    color: 'green'
  },
  {
    id: 'unpublish',
    label: 'Unpublish',
    icon: EyeSlashIcon,
    color: 'yellow'
  },
  {
    id: 'edit',
    label: 'Bulk Edit',
    icon: PencilSquareIcon,
    color: 'blue'
  },
  {
    id: 'export',
    label: 'Export',
    icon: DocumentArrowDownIcon,
    color: 'purple'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: TrashIcon,
    color: 'red'
  }
];

export const ORDER_BULK_ACTIONS: BulkAction[] = [
  {
    id: 'update-status',
    label: 'Update Status',
    icon: CheckIcon,
    color: 'blue',
    requiresInput: true,
    inputType: 'select',
    options: [
      { value: 'processing', label: 'Processing' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },
  {
    id: 'export',
    label: 'Export',
    icon: DocumentArrowDownIcon,
    color: 'purple'
  },
  {
    id: 'print-labels',
    label: 'Print Labels',
    icon: DocumentArrowDownIcon,
    color: 'green'
  }
];

export default BulkOperations;
