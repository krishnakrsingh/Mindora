import React, { useState } from 'react';
import { 
  Database as DatabaseIcon, 
  Table as TableIcon, 
  Kanban, 
  List, 
  LayoutGrid, 
  Plus, 
  Filter, 
  Trash2, 
  ExternalLink,
  Download,
  Upload,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  X,
  Check,
  Calendar,
  Tag
} from 'lucide-react';
import { Database, DatabaseRecord, BaseViewType, DatabaseProperty } from '../../types';
import { storage } from '../../services/storage';
import { formulaEngine } from '../../services/formula';
import { rollupService } from '../../services/rollup';
import { csvService } from '../../services/csv';

interface BaseViewContainerProps {
  database: Database;
  records: DatabaseRecord[];
  onUpdateDatabase: (updates: Partial<Database>) => void;
  onNavigateToPage: (pageId: string) => void;
}

export const BaseViewContainer: React.FC<BaseViewContainerProps> = ({
  database,
  records,
  onUpdateDatabase,
  onNavigateToPage,
}) => {
  const [activeViewType, setActiveViewType] = useState<BaseViewType>('table');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortField, setSortField] = useState<'title' | 'createdAt' | string>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<DatabaseProperty['type']>('text');
  const [selectedRecord, setSelectedRecord] = useState<DatabaseRecord | null>(null);

  // Filter & sort records
  const processedRecords = records
    .filter((r) => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const matchProps = Object.values(r.properties || {}).some((v) =>
        String(v).toLowerCase().includes(q)
      );
      return matchTitle || matchProps;
    })
    .sort((a, b) => {
      let valA: any = a.title;
      let valB: any = b.title;

      if (sortField === 'createdAt') {
        valA = a.createdAt;
        valB = b.createdAt;
      } else if (sortField !== 'title') {
        valA = a.properties[sortField] || '';
        valB = b.properties[sortField] || '';
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  // Add record
  const handleAddRecord = (initialProps: Record<string, any> = {}) => {
    const newRec = storage.createRecord(database.id, 'New Item');
    if (Object.keys(initialProps).length > 0) {
      storage.updateRecord(newRec.id, { properties: initialProps });
    }
  };

  // Update cell property
  const handleUpdateCell = (recordId: string, propId: string, value: any) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;
    const updatedProps = { ...record.properties, [propId]: value };
    storage.updateRecord(recordId, { properties: updatedProps });
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord({ ...selectedRecord, properties: updatedProps });
    }
  };

  // Add new property column
  const handleAddProperty = () => {
    if (!newPropName.trim()) return;
    const newProp: DatabaseProperty = {
      id: `prop-${Date.now()}`,
      name: newPropName.trim(),
      type: newPropType,
      options:
        newPropType === 'select' || newPropType === 'status'
          ? [
              { id: 'opt-1', name: 'Option 1', color: '#94a3b8' },
              { id: 'opt-2', name: 'Option 2', color: '#38bdf8' },
            ]
          : undefined,
    };

    onUpdateDatabase({ properties: [...database.properties, newProp] });
    setNewPropName('');
    setIsAddPropertyOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = csvService.exportDatabase(database, records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${database.title.toLowerCase().replace(/\s+/g, '-')}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const { headers, rows } = csvService.parseCSV(text);
      if (headers.length === 0) return;

      // Create new properties for any header not already existing
      const existingPropNames = new Set(database.properties.map((p) => p.name.toLowerCase()));
      const newProps: DatabaseProperty[] = [...database.properties];

      headers.slice(1).forEach((header) => {
        if (!existingPropNames.has(header.toLowerCase())) {
          newProps.push({
            id: `prop-csv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: header,
            type: 'text',
          });
        }
      });

      onUpdateDatabase({ properties: newProps });

      // Create records
      rows.forEach((row) => {
        const titleVal = row['Title'] || row[headers[0]] || 'Imported Item';
        const recProps: Record<string, any> = {};

        newProps.forEach((p) => {
          if (row[p.name] !== undefined) {
            recProps[p.id] = row[p.name];
          }
        });

        const created = storage.createRecord(database.id, titleVal);
        storage.updateRecord(created.id, { properties: recProps });
      });

      alert(`Successfully imported ${rows.length} records from CSV.`);
    };
    reader.readAsText(file);
  };

  // Find status property for board view
  const statusProp =
    database.properties.find((p) => p.type === 'status' || p.type === 'select') ||
    database.properties[0];

  const columns = statusProp?.options?.map((o) => o.name) || ['Unassigned', 'In Progress', 'Completed'];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#171717] select-text transition-colors">
      {/* Database Title Bar */}
      <div className="h-12 border-b border-[#e5e5e5] dark:border-[#262626] px-6 flex items-center justify-between select-none">
        {/* Left: View Mode Switcher Pills */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 p-0.5 rounded-full border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#1f1f1f]">
            <button
              onClick={() => setActiveViewType('table')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeViewType === 'table'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <TableIcon size={12} />
                <span>Table</span>
              </span>
            </button>
            <button
              onClick={() => setActiveViewType('board')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeViewType === 'board'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Kanban size={12} />
                <span>Board</span>
              </span>
            </button>
            <button
              onClick={() => setActiveViewType('gallery')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeViewType === 'gallery'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <LayoutGrid size={12} />
                <span>Gallery</span>
              </span>
            </button>
            <button
              onClick={() => setActiveViewType('list')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeViewType === 'list'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <List size={12} />
                <span>List</span>
              </span>
            </button>
          </div>

          <span className="font-mono text-[11px] text-[#737373] dark:text-[#a3a3a3] ml-2">
            {records.length} items
          </span>
        </div>

        {/* Right: Actions, CSV, & Add Record */}
        <div className="flex items-center space-x-2">
          {/* Search Filter */}
          <div className="relative hidden sm:block">
            <Search size={12} className="absolute left-2.5 top-2.5 text-[#737373]" />
            <input
              type="text"
              placeholder="Filter items..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-7 pr-3 py-1 text-xs rounded-full border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#1f1f1f] text-black dark:text-white focus:outline-none w-36 focus:w-48 transition-all"
            />
          </div>

          {/* Add Column Pill */}
          <button
            onClick={() => setIsAddPropertyOpen(true)}
            className="btn-pill btn-pill-sm"
            title="Add a new column / property"
          >
            <Plus size={11} />
            <span className="hidden sm:inline">Column</span>
          </button>

          {/* CSV Export Pill */}
          <button
            onClick={handleExportCSV}
            className="btn-pill btn-pill-sm"
            title="Export database as CSV"
          >
            <Download size={11} />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* CSV Import */}
          <label className="btn-pill btn-pill-sm cursor-pointer">
            <Upload size={11} />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          {/* New Item CTA */}
          <button
            onClick={() => handleAddRecord()}
            className="btn-pill-primary btn-pill-sm"
          >
            <Plus size={12} />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Table View */}
        {activeViewType === 'table' && (
          <div className="border border-[#e5e5e5] dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#1a1a1a]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#1f1f1f]">
                  <th className="py-2.5 px-4 font-semibold text-black dark:text-white w-64">
                    Item Name
                  </th>
                  {database.properties.map((prop) => (
                    <th key={prop.id} className="py-2.5 px-4 font-semibold text-[#525252] dark:text-[#a3a3a3]">
                      {prop.name}
                    </th>
                  ))}
                  <th className="py-2.5 px-4 w-16 text-right text-[#737373]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#262626]">
                {processedRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className="hover:bg-[#fafafa] dark:hover:bg-[#222222] transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4 font-medium text-black dark:text-white">
                      <input
                        type="text"
                        value={rec.title}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => storage.updateRecord(rec.id, { title: e.target.value })}
                        className="bg-transparent focus:outline-none font-medium w-full"
                      />
                    </td>

                    {database.properties.map((prop) => {
                      const val = rec.properties[prop.id];
                      return (
                        <td 
                          key={prop.id} 
                          className="py-2.5 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prop.type === 'status' || prop.type === 'select' ? (
                            <select
                              value={val || ''}
                              onChange={(e) => handleUpdateCell(rec.id, prop.id, e.target.value)}
                              className="bg-[#f5f5f5] dark:bg-[#252525] border border-[#e5e5e5] dark:border-[#333] rounded-full px-2.5 py-0.5 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                            >
                              <option value="">(None)</option>
                              {prop.options?.map((opt) => (
                                <option key={opt.id} value={opt.name}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={val !== undefined ? String(val) : ''}
                              onChange={(e) => handleUpdateCell(rec.id, prop.id, e.target.value)}
                              placeholder="Empty"
                              className="bg-transparent text-black dark:text-white focus:outline-none w-full placeholder:text-[#a3a3a3]"
                            />
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          storage.deleteRecord(rec.id);
                        }}
                        className="p-1 rounded text-[#a3a3a3] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Item"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban Board View */}
        {activeViewType === 'board' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((colName) => {
              const colRecords = processedRecords.filter(
                (r) => (r.properties[statusProp?.id || ''] || 'Unassigned') === colName
              );

              return (
                <div
                  key={colName}
                  className="w-72 flex-shrink-0 bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] rounded-2xl p-3 flex flex-col max-h-[calc(100vh-180px)]"
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#e5e5e5] dark:border-[#262626]">
                    <div className="flex items-center space-x-2">
                      <span className="font-heading font-semibold text-xs text-black dark:text-white">
                        {colName}
                      </span>
                      <span className="font-mono text-[10px] text-[#737373] bg-white dark:bg-[#242424] px-1.5 py-0.5 rounded-full border border-[#e5e5e5] dark:border-[#333]">
                        {colRecords.length}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddRecord({ [statusProp?.id || '']: colName })}
                      className="p-1 rounded-full hover:bg-white dark:hover:bg-[#242424] text-[#737373] hover:text-black dark:hover:text-white"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    {colRecords.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecord(rec)}
                        className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#2e2e2e] shadow-sm hover:border-black dark:hover:border-white transition-all cursor-pointer group"
                      >
                        <div className="font-medium text-xs text-black dark:text-white mb-2">
                          {rec.title}
                        </div>

                        {/* Extra properties chips */}
                        <div className="flex flex-wrap gap-1">
                          {database.properties.slice(1, 3).map((p) => {
                            const val = rec.properties[p.id];
                            if (!val) return null;
                            return (
                              <span
                                key={p.id}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-[#fafafa] dark:bg-[#2a2a2a] text-[#737373] dark:text-[#a3a3a3] border border-[#e5e5e5] dark:border-[#333]"
                              >
                                {val}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Gallery View */}
        {activeViewType === 'gallery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {processedRecords.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className="p-4 rounded-2xl border border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#1a1a1a] hover:border-black dark:hover:border-white transition-all cursor-pointer flex flex-col justify-between h-44 group"
              >
                <div>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-[#252525] border border-[#e5e5e5] dark:border-[#333] flex items-center justify-center text-sm mb-3">
                    📄
                  </div>
                  <div className="font-heading font-semibold text-sm text-black dark:text-white group-hover:underline">
                    {rec.title}
                  </div>
                </div>

                <div className="border-t border-[#e5e5e5] dark:border-[#262626] pt-2 flex items-center justify-between text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                  <span>{rec.properties[statusProp?.id || ''] || 'No Status'}</span>
                  <span className="font-mono text-[10px]">
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {activeViewType === 'list' && (
          <div className="max-w-3xl divide-y divide-[#e5e5e5] dark:divide-[#262626] border border-[#e5e5e5] dark:border-[#262626] rounded-2xl bg-white dark:bg-[#1a1a1a]">
            {processedRecords.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className="p-3.5 flex items-center justify-between hover:bg-[#fafafa] dark:hover:bg-[#202020] cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">▪</span>
                  <span className="font-medium text-xs text-black dark:text-white">
                    {rec.title}
                  </span>
                  {rec.properties[statusProp?.id || ''] && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f5f5f5] dark:bg-[#252525] border border-[#e5e5e5] dark:border-[#333] text-[#525252] dark:text-[#a3a3a3]">
                      {rec.properties[statusProp?.id || '']}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    storage.deleteRecord(rec.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#a3a3a3] hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Column / Property Modal */}
      {isAddPropertyOpen && (
        <div 
          onClick={() => setIsAddPropertyOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#333] rounded-2xl p-5 shadow-2xl text-xs"
          >
            <div className="font-heading font-semibold text-sm mb-4 text-black dark:text-white">
              Add New Column
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#737373] mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Priority, Assignee, Due Date"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-transparent text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#737373] mb-1">
                  Type
                </label>
                <select
                  value={newPropType}
                  onChange={(e) => setNewPropType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-transparent text-black dark:text-white focus:outline-none"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="status">Status</option>
                  <option value="select">Select</option>
                  <option value="date">Date</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="url">URL</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#e5e5e5] dark:border-[#333]">
                <button
                  onClick={() => setIsAddPropertyOpen(false)}
                  className="btn-pill btn-pill-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProperty}
                  className="btn-pill-primary btn-pill-sm"
                >
                  Add Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspection Modal / Drawer */}
      {selectedRecord && (
        <div 
          onClick={() => setSelectedRecord(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#333] rounded-2xl p-6 shadow-2xl text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5] dark:border-[#2e2e2e]">
              <input
                type="text"
                value={selectedRecord.title}
                onChange={(e) => {
                  storage.updateRecord(selectedRecord.id, { title: e.target.value });
                  setSelectedRecord({ ...selectedRecord, title: e.target.value });
                }}
                className="font-heading font-bold text-lg text-black dark:text-white bg-transparent focus:outline-none w-full"
              />
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-full text-[#737373] hover:text-black dark:hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              {database.properties.map((prop) => (
                <div key={prop.id} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-[#737373] font-medium">{prop.name}</span>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={selectedRecord.properties[prop.id] || ''}
                      onChange={(e) => handleUpdateCell(selectedRecord.id, prop.id, e.target.value)}
                      placeholder="Empty"
                      className="w-full px-2.5 py-1 rounded-lg border border-[#e5e5e5] dark:border-[#333] bg-transparent text-black dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {selectedRecord.pageId && (
              <div className="pt-3 border-t border-[#e5e5e5] dark:border-[#2e2e2e]">
                <button
                  onClick={() => {
                    onNavigateToPage(selectedRecord.pageId!);
                    setSelectedRecord(null);
                  }}
                  className="btn-pill btn-pill-sm w-full"
                >
                  <ExternalLink size={11} />
                  <span>Open Linked Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
