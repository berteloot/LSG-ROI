"use client";
import React, { useEffect, useState } from "react";
import { Edit3, Save, X, Plus, Trash2, Eye, EyeOff, Upload, Download, AlertCircle, CheckCircle, Lock } from "lucide-react";

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const CATEGORIES = [
  "Payroll Taxes", "Customary Benefits", "Administrative Overhead", 
  "IT Infrastructure", "Real Estate", "Workforce Management", "Other"
];

const COMMON_ITEMS = {
  "Payroll Taxes": ["Federal Unemployment Tax", "State Unemployment Tax", "Social Security", "Medicare"],
  "Customary Benefits": ["Health Insurance", "Dental Insurance", "Vision Insurance", "Life Insurance", "Disability Insurance", "Retirement Plan"],
  "Administrative Overhead": ["HR Administration", "Payroll Processing", "Benefits Administration", "Compliance Management"],
  "IT Infrastructure": ["Hardware", "Software", "Cloud Services", "IT Support", "Cybersecurity"],
  "Real Estate": ["Office Space", "Utilities", "Maintenance", "Insurance", "Property Tax"],
  "Workforce Management": ["Training", "Recruitment", "Performance Management", "Employee Relations"],
  "Other": ["Miscellaneous Costs", "Professional Development", "Wellness Programs"]
};

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Data state
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showOptionalColumns, setShowOptionalColumns] = useState(false);

  // CSV upload state
  const [csvUpload, setCsvUpload] = useState<{
    file: File | null;
    preview: any[] | null;
    errors: string[];
    isUploading: boolean;
    success: boolean;
  }>({
    file: null,
    preview: null,
    errors: [],
    isUploading: false,
    success: false,
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<'costs' | 'users' | 'assessments' | 'categories'>('costs');

  // User and assessment state
  const [users, setUsers] = useState<any[]>([]);
  const [costAssessments, setCostAssessments] = useState<any[]>([]);
  const [costCategories, setCostCategories] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    // Set mounted flag to prevent hydration mismatch
    setMounted(true);
    
    // Check if already authenticated (from session storage)
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchData();
      fetchUsers();
      fetchCostAssessments();
      fetchCostCategories();
    }
  }, []);

  const handleAuthentication = async () => {
    if (!password.trim()) {
      setAuthError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword('');
        setAuthError('');
        sessionStorage.setItem('adminAuthenticated', 'true');
        fetchData();
        fetchUsers();
        fetchCostAssessments();
      } else {
        const error = await response.json();
        setAuthError(error.error || 'Invalid password');
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/state-costs');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result.data.map((item: any) => ({ ...item, isEditing: false, originalData: { ...item } })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const result = await response.json();
      setUsers(result.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCostAssessments = async () => {
    setAssessmentsLoading(true);
    try {
      const response = await fetch('/api/admin/cost-assessments');
      if (!response.ok) throw new Error('Failed to fetch cost assessments');
      const result = await response.json();
      setCostAssessments(result.data);
    } catch (err) {
      console.error('Failed to fetch cost assessments:', err);
    } finally {
      setAssessmentsLoading(false);
    }
  };

  const fetchCostCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/admin/cost-categories');
      if (!response.ok) throw new Error('Failed to fetch cost categories');
      const result = await response.json();
      setCostCategories(result.data.map((category: any) => ({ 
        ...category, 
        isEditing: false, 
        originalData: { ...category } 
      })));
    } catch (err) {
      console.error('Failed to fetch cost categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    setData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isEditing: true }
        : { ...item, isEditing: false }
    ));
    setEditingId(id);
  };

  const handleSave = async (id: string) => {
    const item = data.find(d => d.id === id);
    if (!item) return;

    try {
      const response = await fetch(`/api/admin/state-costs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: item.state,
          category: item.category,
          item: item.item,
          ratePercent: item.ratePercent,
          employerCostUSD: item.employerCostUSD,
          notes: item.notes,
          source: item.source
        })
      });

      if (!response.ok) throw new Error('Failed to update item');
      const result = await response.json();
      
      setData(prev => prev.map(d => 
        d.id === id 
          ? { ...result.data, isEditing: false, originalData: { ...result.data } }
          : d
      ));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleCancel = (id: string) => {
    setData(prev => prev.map(d => 
      d.id === id 
        ? { ...d.originalData, isEditing: false }
        : d
    ));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/admin/state-costs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete item');
      
      setData(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleAddNew = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      state: '',
      category: '',
      item: '',
      ratePercent: 0,
      employerCostUSD: 0,
      notes: '',
      source: '',
      isEditing: true,
      originalData: null
    };
    setData(prev => [newItem, ...prev]);
    setEditingId(newItem.id);
  };

  const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvUpload(prev => ({ ...prev, file, preview: null, errors: [], success: false }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => Object.values(row).some(v => v));

      setCsvUpload(prev => ({ ...prev, preview }));
    };
    reader.readAsText(file);
  };

  const handleCsvUpload = async () => {
    if (!csvUpload.file) return;

    setCsvUpload(prev => ({ ...prev, isUploading: true, errors: [], success: false }));

    const formData = new FormData();
    formData.append('file', csvUpload.file);

    try {
      const response = await fetch('/api/admin/state-costs/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setCsvUpload(prev => ({ ...prev, success: true, isUploading: false }));
        fetchData(); // Refresh data
      } else {
        setCsvUpload(prev => ({ 
          ...prev, 
          errors: result.errors || [result.error || 'Upload failed'], 
          isUploading: false 
        }));
      }
    } catch (error) {
      setCsvUpload(prev => ({ 
        ...prev, 
        errors: ['Upload failed. Please try again.'], 
        isUploading: false 
      }));
    }
  };

  const clearCsvUpload = () => {
    setCsvUpload({
      file: null,
      preview: null,
      errors: [],
      isUploading: false,
      success: false
    });
  };

  const downloadCsvTemplate = () => {
    const headers = ['state', 'category', 'item', 'ratePercent', 'employerCostUSD', 'notes', 'source'];
    const csvContent = [headers.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'state-costs-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their assessment data.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      // Refresh users list
      fetchUsers();
      // Also refresh cost assessments since some may have been deleted
      fetchCostAssessments();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  // Filter data based on search and filters
  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === '' || 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesState = filterState === '' || item.state === filterState;
    const matchesCategory = filterCategory === '' || item.category === filterCategory;
    
    return matchesSearch && matchesState && matchesCategory;
  });

  const handleCategoryEdit = (id: string) => {
    setCostCategories(prev => prev.map(category => 
      category.id === id 
        ? { ...category, isEditing: true, originalData: { ...category } }
        : { ...category, isEditing: false }
    ));
  };

  const handleCategorySave = async (id: string) => {
    const category = costCategories.find(c => c.id === id);
    if (!category) return;

    // Validate required fields
    if (!category.name || category.name.trim() === '') {
      alert('Category name is required');
      return;
    }

    // Check for duplicate names (excluding current category)
    const isDuplicate = costCategories.some(c => 
      c.id !== id && 
      c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      alert('A category with this name already exists');
      return;
    }

    try {
      // Check if this is a new category (temporary ID) or existing one
      const isNewCategory = id.startsWith('new-');
      
      const response = await fetch(`/api/admin/cost-categories${isNewCategory ? '' : `/${id}`}`, {
        method: isNewCategory ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: category.name.trim(),
          description: category.description?.trim() || '',
          monthlyCost: category.monthlyCost || 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (isNewCategory ? 'Failed to create category' : 'Failed to update category'));
      }
      const result = await response.json();
      
      if (isNewCategory) {
        // For new categories, remove the temporary one and add the real one
        setCostCategories(prev => prev.filter(c => c.id !== id).map(c => ({ ...c, isEditing: false })));
        setCostCategories(prev => [result.data, ...prev]);
      } else {
        // For existing categories, update in place
        setCostCategories(prev => prev.map(c => 
          c.id === id 
            ? { ...result.data, isEditing: false, originalData: { ...result.data } }
            : c
        ));
      }
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleCategoryCancel = (id: string) => {
    // Check if this is a temporary category that hasn't been saved yet
    if (id.startsWith('new-')) {
      // For unsaved categories, just remove from the list
      setCostCategories(prev => prev.filter(c => c.id !== id));
      return;
    }

    // For existing categories, restore original data
    setCostCategories(prev => prev.map(c => 
      c.id === id 
        ? { ...c.originalData, isEditing: false }
        : c
    ));
  };

  const handleCategoryDelete = async (id: string) => {
    // Check if this is a temporary category that hasn't been saved yet
    if (id.startsWith('new-')) {
      // For unsaved categories, just remove from the list
      setCostCategories(prev => prev.filter(c => c.id !== id));
      return;
    }

    if (!confirm('Are you sure you want to delete this category? This will affect all related cost items.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cost-categories/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      
      setCostCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete category. Please try again.');
    }
  };

  const handleAddCategory = () => {
    const newCategory = {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      monthlyCost: 0,
      isEditing: true,
      originalData: { name: '', description: '', monthlyCost: 0 }
    };
    setCostCategories(prev => [newCategory, ...prev]);
  };

  const exportCostAssessments = () => {
    if (costAssessments.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Company Name', 'Email', 'Submission Date', 'Base Salary', 'FTE Count', 'Total Employer Load', 'LSG Cost', 'Inclusions'];
    const csvContent = [
      headers.join(','),
      ...costAssessments.map(assessment => [
        assessment.companyName || '',
        assessment.email || '',
        new Date(assessment.createdAt).toLocaleString(),
        assessment.baseSalary || 0,
        assessment.fteCount || 0,
        assessment.totalEmployerLoad || 0,
        assessment.lsgCost || 0,
        assessment.inclusions ? Object.keys(assessment.inclusions).filter(key => assessment.inclusions[key]).join('; ') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-assessments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Show loading state until client is ready to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication Gate - Check this FIRST
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Access Required
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter the admin password to continue
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleAuthentication(); }}>
            <div>
              <label htmlFor="password" className="sr-only">
                Admin Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {authError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{authError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  'Access Admin Dashboard'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Only check loading and error states AFTER authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading state cost data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage state costs, users, and cost assessments</p>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem('adminAuthenticated');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('costs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'costs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                State Costs
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('assessments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assessments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cost Assessments
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Role Categories
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'costs' && (
          <>
            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Item
                </button>
                <button
                  onClick={() => setShowOptionalColumns(!showOptionalColumns)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {showOptionalColumns ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showOptionalColumns ? 'Hide' : 'Show'} Optional Columns
                </button>
                <button
                  onClick={downloadCsvTemplate}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </button>
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search in all fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by State</label>
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All States</option>
                    {STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterState('');
                      setFilterCategory('');
                    }}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* CSV Upload Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bulk Update via CSV</h3>
              </div>
              
              <div className="space-y-4">
                {/* File Upload */}
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {csvUpload.file && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCsvUpload}
                        disabled={csvUpload.isUploading}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {csvUpload.isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload & Update
                          </>
                        )}
                      </button>
                      <button
                        onClick={clearCsvUpload}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Success Message */}
                {csvUpload.success && (
                  <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800">CSV uploaded successfully! Data has been updated.</span>
                  </div>
                )}

                {/* Error Messages */}
                {csvUpload.errors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
                        <ul className="mt-2 text-sm text-red-700 space-y-1">
                          {csvUpload.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* CSV Preview */}
                {csvUpload.preview && (
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700">CSV Preview (First 5 rows)</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(csvUpload.preview[0] || {}).filter(key => !key.startsWith('_')).map(header => (
                              <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csvUpload.preview.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              {Object.keys(row).filter(key => !key.startsWith('_')).map(header => (
                                <td key={header} className="px-4 py-2 text-sm text-gray-900">
                                  {row[header]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* State Costs Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  State Cost Data ({filteredData.length} items)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate % of Wage</th>
                      {showOptionalColumns && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (USD)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.isEditing ? (
                            <select
                              value={item.state}
                              onChange={(e) => setData(prev => prev.map(d => 
                                d.id === item.id ? { ...d, state: e.target.value } : d
                              ))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select State</option>
                              {STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                          ) : (
                            item.state
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.isEditing ? (
                            <select
                              value={item.category}
                              onChange={(e) => setData(prev => prev.map(d => 
                                d.id === item.id ? { ...d, category: e.target.value } : d
                              ))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Category</option>
                              {CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          ) : (
                            item.category
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.isEditing ? (
                            <select
                              value={item.item}
                              onChange={(e) => setData(prev => prev.map(d => 
                                d.id === item.id ? { ...d, item: e.target.value } : d
                              ))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Item</option>
                              {COMMON_ITEMS[item.category as keyof typeof COMMON_ITEMS] || COMMON_ITEMS['Other'] || []}
                            </select>
                          ) : (
                            item.item
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={item.ratePercent}
                              onChange={(e) => setData(prev => prev.map(d => 
                                d.id === item.id ? { ...d, ratePercent: parseFloat(e.target.value) || 0 } : d
                              ))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            `${item.ratePercent}%`
                          )}
                        </td>
                        {showOptionalColumns && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.employerCostUSD}
                                  onChange={(e) => setData(prev => prev.map(d => 
                                    d.id === item.id ? { ...d, employerCostUSD: parseFloat(e.target.value) || 0 } : d
                                  ))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                item.employerCostUSD > 0 ? `$${item.employerCostUSD.toLocaleString()}` : '-'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.isEditing ? (
                                <input
                                  type="text"
                                  value={item.notes || ''}
                                  onChange={(e) => setData(prev => prev.map(d => 
                                    d.id === item.id ? { ...d, notes: e.target.value } : d
                                  ))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                item.notes || '-'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.isEditing ? (
                                <input
                                  type="text"
                                  value={item.source || ''}
                                  onChange={(e) => setData(prev => prev.map(d => 
                                    d.id === item.id ? { ...d, source: e.target.value } : d
                                  ))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                item.source || '-'
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {item.isEditing ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(item.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(item.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Users ({users.length})
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage user accounts and their associated cost assessment data
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Showing unique users by email address
                  </p>
                </div>
                <button onClick={fetchUsers} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {usersLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-gray-400">👥</div>
                            <p>No users found</p>
                            <p className="text-sm">Users will appear here after they submit cost assessments</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.companyName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.assessmentCount || 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Cost Assessments ({costAssessments.length})
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchCostAssessments}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={exportCostAssessments}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              {assessmentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FTE Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Employer Load
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        LSG Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inclusions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {costAssessments.map((assessment) => (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assessment.companyName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assessment.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assessment.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${assessment.baseSalary?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assessment.fteCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${assessment.totalEmployerLoad?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${assessment.lsgCost?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            {assessment.inclusions?.payrollTaxes && <div>• Payroll Taxes</div>}
                            {assessment.inclusions?.customaryBenefits && <div>• Customary Benefits</div>}
                            {assessment.inclusions?.administrativeOverhead && <div>• Admin Overhead</div>}
                            {assessment.inclusions?.itInfrastructure && <div>• IT Infrastructure</div>}
                            {assessment.inclusions?.realEstate && <div>• Real Estate</div>}
                            {assessment.inclusions?.workforceManagement && <div>• Workforce Mgmt</div>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Role Categories ({costCategories.length})
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </button>
                  <button
                    onClick={fetchCostCategories}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              {categoriesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly Cost
                        </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {costCategories.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="text-gray-400">📊</div>
                            <p>No role categories found</p>
                            <p className="text-sm">Add your first role category to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      costCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.isEditing ? (
                              <input
                                type="text"
                                value={category.name}
                                onChange={(e) => setCostCategories(prev => prev.map(c => 
                                  c.id === category.id ? { ...c, name: e.target.value } : c
                                ))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Category name"
                              />
                            ) : (
                              category.name
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {category.isEditing ? (
                              <input
                                type="text"
                                value={category.description || ''}
                                onChange={(e) => setCostCategories(prev => prev.map(c => 
                                  c.id === category.id ? { ...c, description: e.target.value } : c
                                ))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Category description"
                              />
                            ) : (
                              category.description || '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {category.isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={category.monthlyCost || 0}
                                onChange={(e) => setCostCategories(prev => prev.map(c => 
                                  c.id === category.id ? { ...c, monthlyCost: parseFloat(e.target.value) || 0 } : c
                                ))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                            ) : (
                              <span className="text-gray-900">
                                ${(category.monthlyCost || 0).toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {category.isEditing ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleCategorySave(category.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Save"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCategoryCancel(category.id)}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleCategoryEdit(category.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCategoryDelete(category.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
