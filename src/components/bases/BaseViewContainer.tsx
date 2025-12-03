import React, { useState } from 'react';
import { 
  Database as DatabaseIcon, 
  Table as TableIcon, 
  Kanban, 
  List, 
  LayoutGrid, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  ExternalLink,
  MoreHorizontal,
  Download
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
  const [filterText, setFilterText] = useState('');
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<DatabaseProperty['type']>('text');
  const [newPropFormula, setNewPropFormula] = useState('');

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (!filterText) return true;
    const matchTitle = r.title.toLowerCase().includes(filterText.toLowerCase());
    const matchProps = Object.values(r.properties).some((v) =>
      String(v).toLowerCase().includes(filterText.toLowerCase())
    );
    return matchTitle || matchProps;
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
  };

  // Add new property column
  const handleAddProperty = () => {
    if (!newPropName.trim()) return;
    const newProp: DatabaseProperty = {
      id: `prop-${Date.now()}`,
      name: newPropName.trim(),
      type: newPropType,
      formulaExpression: newPropType === 'formula' ? (newPropFormula.trim() || 'prop("Title")') : undefined,
      options:
        newPropType === 'select' || newPropType === 'status'
          ? [
              { id: 'opt-1', name: 'Option 1', color: '#818CF8' },
              { id: 'opt-2', name: 'Option 2', color: '#34D399' },
            ]
          : undefined,
    };
    onUpdateDatabase({ properties: [...database.properties, newProp] });
    setNewPropName('');
    setNewPropFormula('');
    setIsAddPropertyOpen(false);
  };

  // Export database table to CSV
  const handleExportCSV = () => {
    const csv = csvService.exportDatabase(database, records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${database.title || 'database'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    storage.deleteRecord(id);
  };

  // Group records for Kanban Board
  const statusProp = database.properties.find((p) => p.type === 'status') || database.properties[0];
  const kanbanColumns = statusProp?.options || [
    { id: 'opt-in-progress', name: 'In Progress', color: '#38BDF8' },
    { id: 'opt-completed', name: 'Completed', color: '#4ADE80' },
    { id: 'opt-planned', name: 'Planned', color: '#A78BFA' },
  ];

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0e0f12] overflow-hidden select-text">
      {/* Base Header */}
      <div className="p-6 border-b border-white/5 bg-[#121318]/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{database.icon || '📊'}</span>
            <div>
              <input
                type="text"
                value={database.title}
                onChange={(e) => onUpdateDatabase({ title: e.target.value })}
                className="text-2xl font-bold bg-transparent border-none text-white focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-0.5">
                {database.description || 'Relational collection of records and structured knowledge.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAddRecord()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Plus size={14} />
            <span>New Item</span>
          </button>
        </div>

        {/* View Switcher Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-[#1a1b23] p-0.5 rounded-lg border border-white/5 text-xs">
            <button
              onClick={() => setActiveViewType('table')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
                activeViewType === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon size={13} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setActiveViewType('board')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
                activeViewType === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban size={13} />
              <span>Board</span>
            </button>
            <button
              onClick={() => setActiveViewType('list')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
                activeViewType === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List size={13} />
              <span>List</span>
            </button>
            <button
              onClick={() => setActiveViewType('gallery')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
                activeViewType === 'gallery' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Gallery</span>
            </button>
          </div>

          {/* Filter Input */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter records..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-48 px-2.5 py-1 pl-7 bg-[#1a1b23] border border-white/5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
              <Filter size={12} className="absolute left-2.5 top-2 text-slate-500" />
            </div>

            <button
              onClick={() => setIsAddPropertyOpen(!isAddPropertyOpen)}
              className="px-2 py-1 bg-[#1a1b23] border border-white/5 rounded-lg text-xs text-slate-300 hover:text-white flex items-center space-x-1"
            >
              <Plus size={12} />
              <span>Add Property</span>
            </button>

            <button
              onClick={handleExportCSV}
              title="Export database as CSV"
              className="px-2 py-1 bg-[#1a1b23] border border-white/5 rounded-lg text-xs text-slate-300 hover:text-white flex items-center space-x-1"
            >
              <Download size={12} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Add Property Dropdown */}
        {isAddPropertyOpen && (
          <div className="mt-3 p-3 bg-[#1e2029] border border-white/10 rounded-lg flex flex-wrap items-center gap-3 text-xs animate-fade-in max-w-xl">
            <input
              type="text"
              placeholder="Property name (e.g. Priority, ROI, Score)"
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              className="flex-1 min-w-[140px] px-2.5 py-1 bg-black/30 border border-white/10 rounded text-slate-200 focus:outline-none"
            />
            <select
              value={newPropType}
              onChange={(e) => setNewPropType(e.target.value as any)}
              className="px-2 py-1 bg-black/30 border border-white/10 rounded text-slate-200 focus:outline-none"
            >
              <option value="text">Text</option>
              <option value="select">Select</option>
              <option value="status">Status</option>
              <option value="number">Number</option>
              <option value="checkbox">Checkbox</option>
              <option value="formula">Formula (fx)</option>
              <option value="date">Date</option>
              <option value="url">URL</option>
            </select>
            {newPropType === 'formula' && (
              <input
                type="text"
                placeholder='Formula e.g. prop("Status") === "Completed" ? "✅" : "⏳"'
                value={newPropFormula}
                onChange={(e) => setNewPropFormula(e.target.value)}
                className="w-full px-2.5 py-1 bg-black/30 border border-purple-500/30 rounded text-purple-300 font-mono text-[11px] focus:outline-none"
              />
            )}
            <button
              onClick={handleAddProperty}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Main Base View Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Table View */}
        {activeViewType === 'table' && (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#121318]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold select-none">
                  <th className="p-3 w-8">#</th>
                  <th className="p-3 min-w-[200px]">Title</th>
                  {database.properties.map((prop) => (
                    <th key={prop.id} className="p-3 min-w-[140px]">
                      {prop.name}
                    </th>
                  ))}
                  <th className="p-3 w-16 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] group transition-colors">
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{index + 1}</td>
                    <td className="p-3 font-medium text-slate-200">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={record.title}
                          onChange={(e) => storage.updateRecord(record.id, { title: e.target.value })}
                          className="bg-transparent border-none text-slate-200 focus:outline-none w-full"
                        />
                        {record.pageId && (
                          <button
                            onClick={() => onNavigateToPage(record.pageId!)}
                            title="Open linked document"
                            className="p-1 hover:text-indigo-400 text-slate-500"
                          >
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                    {database.properties.map((prop) => (
                      <td key={prop.id} className="p-3 text-slate-300">
                        {prop.type === 'formula' ? (
                          <div className="flex items-center space-x-1.5 font-mono text-purple-300 text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 w-fit">
                            <span className="text-[10px] text-purple-400 font-bold">fx</span>
                            <span>{String(formulaEngine.evaluate(prop.formulaExpression || '', record, database.properties))}</span>
                          </div>
                        ) : prop.type === 'status' || prop.type === 'select' ? (
                          <select
                            value={record.properties[prop.id] || ''}
                            onChange={(e) => handleUpdateCell(record.id, prop.id, e.target.value)}
                            className="bg-[#1a1b23] border border-white/10 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="">Select...</option>
                            {prop.options?.map((opt) => (
                              <option key={opt.id} value={opt.name}>
                                {opt.name}
                              </option>
                            ))}
                          </select>
                        ) : prop.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={!!record.properties[prop.id]}
                            onChange={(e) => handleUpdateCell(record.id, prop.id, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-600 bg-white/5 text-indigo-600 cursor-pointer"
                          />
                        ) : (
                          <input
                            type="text"
                            value={record.properties[prop.id] || ''}
                            onChange={(e) => handleUpdateCell(record.id, prop.id, e.target.value)}
                            placeholder="Empty"
                            className="bg-transparent border-none text-slate-300 focus:outline-none w-full placeholder:text-slate-700"
                          />
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/[0.03] border-t border-white/10 text-[11px] text-slate-400 font-mono">
                <tr>
                  <td className="p-2.5"></td>
                  <td className="p-2.5 font-semibold text-slate-300">
                    Count: {filteredRecords.length}
                  </td>
                  {database.properties.map((prop) => {
                    const values = filteredRecords.map((r) => r.properties[prop.id]);
                    let summary = '';
                    if (prop.type === 'number') {
                      const sum = rollupService.aggregate(values, 'sum');
                      const avg = rollupService.aggregate(values, 'avg');
                      summary = `Sum: ${sum} · Avg: ${avg}`;
                    } else if (prop.type === 'checkbox') {
                      summary = `Checked: ${rollupService.aggregate(values, 'percent_checked')}`;
                    } else if (prop.type === 'status' || prop.type === 'select') {
                      summary = `Unique: ${rollupService.aggregate(values, 'count_unique')}`;
                    } else {
                      summary = `Filled: ${rollupService.aggregate(values, 'count')}`;
                    }
                    return (
                      <td key={`footer-${prop.id}`} className="p-2.5 text-slate-400">
                        {summary}
                      </td>
                    );
                  })}
                  <td className="p-2.5"></td>
                </tr>
              </tfoot>
            </table>
            <div className="p-2 border-t border-white/5 bg-white/[0.01]">
              <button
                onClick={() => handleAddRecord()}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded transition-colors"
              >
                <Plus size={13} />
                <span>Add Record</span>
              </button>
            </div>
          </div>
        )}

        {/* Board View (Kanban) */}
        {activeViewType === 'board' && (
          <div className="flex space-x-4 overflow-x-auto pb-4 h-full">
            {kanbanColumns.map((col) => {
              const colRecords = filteredRecords.filter(
                (r) => (r.properties[statusProp?.id || ''] || '') === col.name
              );
              return (
                <div
                  key={col.id}
                  className="w-72 shrink-0 bg-[#121318] border border-white/5 rounded-xl p-3 flex flex-col"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: col.color || '#818CF8' }}
                      />
                      <span className="font-semibold text-xs text-slate-200">{col.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({colRecords.length})</span>
                    </div>
                    <button
                      onClick={() => handleAddRecord({ [statusProp?.id || '']: col.name })}
                      className="p-1 hover:text-white text-slate-500"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {colRecords.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-[#181a23] hover:bg-[#1e202c] border border-white/5 rounded-lg shadow-sm transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-medium text-xs text-slate-200">{r.title}</span>
                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 text-slate-500"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(r.properties).map(([k, v]) => {
                            if (!v || k === statusProp?.id) return null;
                            return (
                              <span
                                key={k}
                                className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-400"
                              >
                                {String(v)}
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

        {/* List View */}
        {activeViewType === 'list' && (
          <div className="space-y-2 max-w-4xl mx-auto">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="p-3 bg-[#121318] border border-white/5 hover:border-white/10 rounded-lg flex items-center justify-between group transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="font-medium text-xs text-slate-200">{record.title}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  {Object.values(record.properties).filter(Boolean).slice(0, 3).map((val, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[11px]">
                      {String(val)}
                    </span>
                  ))}
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gallery View */}
        {activeViewType === 'gallery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 bg-[#121318] border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all shadow-sm group"
              >
                <div className="h-20 bg-gradient-to-br from-indigo-950/40 to-purple-950/20 rounded-lg mb-3 flex items-center justify-center text-2xl">
                  📄
                </div>
                <h4 className="font-semibold text-sm text-slate-200 mb-2 truncate">{record.title}</h4>
                <div className="space-y-1 text-xs text-slate-400">
                  {Object.entries(record.properties).map(([k, v]) => {
                    const prop = database.properties.find((p) => p.id === k);
                    if (!v) return null;
                    return (
                      <div key={k} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{prop?.name || k}:</span>
                        <span className="text-slate-300 font-medium truncate max-w-[120px]">{String(v)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

