/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  LayoutGrid,
  Plus,
  Minus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  PieChart as PieChartIcon,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types & Constants ---

type TaskStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Overdue';

interface Subtask {
  name: string;
  startDate: string;
  dueDate: string;
  status: TaskStatus;
  attachments: number;
  comments: number;
  checklist: { completed: number; total: number };
  loggedTime: string;
  finishedOnTime: boolean | null;
  assignedTo: { name: string; avatar: string };
}

interface Task {
  id: string;
  name: string;
  relatedTo: string;
  startDate: string;
  dueDate: string;
  status: TaskStatus;
  attachments: number;
  comments: number;
  checklist: { completed: number; total: number };
  loggedTime: string;
  finishedOnTime: boolean | null;
  assignedTo: { name: string; avatar: string };
  group: string;
  area: string;
  team: string;
  planning: string;
  subtasks?: Subtask[];
}

const GROUPS = ['AGILE', 'FAD', 'QASWA', 'HEAD OFFICE'];
const AREAS = ['Rawalpindi', 'Peshawar', 'Gujranwala', 'Burewala', 'Sahiwal', 'Faisalabad', 'Multan'];
const TEAMS: Record<string, string[]> = {
  'AGILE': ['Dr. Sadam Gondal', 'Dr. Bilal Sarmad', 'Dr. Ahmad', 'Dr. Talha'],
  'FAD': ['Dr. Sadam Gondal', 'Dr. Shakeel Ashraf', 'Dr. Bahadur Ali', 'Dr. Saad Zaffar', 'Masheed Ashraf'],
  'QASWA': ['Dr. Hafiz Zakariyya', 'Naveed Anwar', 'Abbas Khan', 'Muhammad Waseem', 'Nazakat Ali'],
  'HEAD OFFICE': ['Taimur Hassan', 'Nadeem Ahmed', 'Tauseer Babar', 'Muhammad Adil', 'Umer Kiani']
};
const PLANNING_MODULES_BY_GROUP: Record<string, string[]> = {
  'HEAD OFFICE': ['Raw Material', 'Incentive', 'Supplier', 'Budgeting', 'Car Financing', 'Meeting Minutes']
};
const DEFAULT_PLANNING_TYPES = [
  'Area Wise', 'Brick Wise', 'Product Wise', 'Hiring Plan', 
  'Market Segmentation', 'New Product Launching', 
  'Marketing Activity & Planning', 'Promotional Material', 
  'R&D', 'Farmer & Vets Gathering', 'Capacity Building', 
  'Distribution Management Planning', 'VET / Nutritionist / Consultant Plan', 
  'Digital Marketing', 'Sales Force Planning'
];

const AVATARS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&q=80'
];

// --- Mock Data Utilities ---

const generateRandomTask = (filters: any, index: number): Task => {
  const idStr = `${Math.floor(Math.random() * 9000 + 1000)}-${Date.now()}-${index}`;
  
  // Adjusted status distribution to match screenshot (~56% Complete, ~31% Pending, ~13% Overdue)
  const rand = Math.random();
  let status: TaskStatus;
  if (rand < 0.56) status = 'Complete';
  else if (rand < 0.87) status = 'In Progress';
  else status = 'Overdue';

  const group = filters.group || GROUPS[Math.floor(Math.random() * GROUPS.length)];
  const area = filters.area || AREAS[Math.floor(Math.random() * AREAS.length)];
  const possiblePlanning = filters.group && PLANNING_MODULES_BY_GROUP[filters.group] ? PLANNING_MODULES_BY_GROUP[filters.group] : DEFAULT_PLANNING_TYPES;
  const planning = filters.planning || possiblePlanning[Math.floor(Math.random() * possiblePlanning.length)];
  
  const possibleTeams = TEAMS[group] || ['Dr. Sadam Gondal'];
  const team = (Array.isArray(filters.team) && filters.team.length > 0) 
    ? filters.team[Math.floor(Math.random() * filters.team.length)]
    : possibleTeams[Math.floor(Math.random() * possibleTeams.length)];
  const projects = ['Skyline Expansion', 'Agri-Tech v2', 'Market Penetration', 'Strategic Alliance', 'Livestock Welfare', 'Nutri-Boost Deployment'];
  const project = projects[Math.floor(Math.random() * projects.length)];

  const hasSubtasks = Math.random() > 0.6;
  const subtasks: Subtask[] | undefined = hasSubtasks ? Array.from({ length: Math.floor(Math.random() * 3 + 2) }, (_, i) => ({
    name: `${planning} Step ${i + 1}`,
    startDate: '2026-04-01',
    dueDate: '2026-04-30',
    status: 'In Progress',
    attachments: 2,
    comments: 6,
    checklist: { completed: 1, total: 3 },
    loggedTime: '19:30',
    finishedOnTime: null,
    assignedTo: { 
      name: team, 
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] 
    }
  })) : undefined;

  return {
    id: idStr,
    name: `${planning} - Phase ${Math.floor(Math.random() * 5 + 1)}`,
    relatedTo: `Related to project: ${project}`,
    startDate: '2026-04-01',
    dueDate: status === 'Overdue' ? '2026-04-15' : '2026-04-30',
    status,
    attachments: Math.floor(Math.random() * 4),
    comments: Math.floor(Math.random() * 8),
    checklist: { completed: subtasks ? subtasks.filter(s => s.status === 'Complete').length : Math.floor(Math.random() * 6), total: subtasks ? subtasks.length : 6 },
    loggedTime: `${Math.floor(Math.random() * 15 + 5).toString().padStart(2, '0')}:30`,
    finishedOnTime: status === 'Complete' ? Math.random() > 0.2 : null,
    assignedTo: { 
      name: team, 
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] 
    },
    group,
    area,
    team,
    planning,
    subtasks
  };
};

const generateMockData = (filters: any, count: number = 20): Task[] => {
  return Array.from({ length: count }, (_, idx) => generateRandomTask(filters, idx));
};

// --- Summary Dashboard Component ---

const DashboardStatCard = ({ title, value, percentage, icon: Icon, colorClass, iconBgClass, barColor }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 flex-1 min-w-[200px]">
    <div className={`p-4 rounded-xl ${iconBgClass} ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex flex-col">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
      {percentage !== undefined && (
        <p className={`text-[11px] font-bold mt-1 ${colorClass}`}>{percentage}%</p>
      )}
      {barColor && (
        <div className="w-16 h-1 mt-2 bg-slate-100 rounded-full overflow-hidden">
           <div className={`h-full ${barColor}`} style={{ width: `${value}%` }}></div>
        </div>
      )}
    </div>
  </div>
);

function SummaryDashboard({ tasks }: { tasks: Task[] }) {
  const [sortField, setSortField] = useState<'completed' | 'name' | 'total' | 'subtasks' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const stats = useMemo(() => {
    const total = tasks.length || 1;
    const completed = tasks.filter(t => t.status === 'Complete').length;
    const overdue = tasks.filter(t => t.status === 'Overdue').length;
    const pending = tasks.filter(t => t.status === 'In Progress' || t.status === 'Not Started').length;
    const totalSubtasks = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0);
    
    return {
      total: tasks.length,
      subtasks: totalSubtasks,
      completed,
      pending,
      overdue,
      compRate: Math.round((completed / total) * 100),
      compValue: ((completed / total) * 100).toFixed(2),
      pendValue: ((pending / total) * 100).toFixed(2),
      overValue: ((overdue / total) * 100).toFixed(2),
    };
  }, [tasks]);

  const currentPlanningTypes = useMemo(() => {
    // Collect all unique planning types from the tasks to ensure the summary covers everything visible
    const fromTasks = Array.from(new Set(tasks.map(t => t.planning)));
    // Also include categories that should be there for the current group
    // This ensures a consistent view even if some categories have 0 tasks currently
    return fromTasks.length > 0 ? fromTasks : DEFAULT_PLANNING_TYPES;
  }, [tasks]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, { total: number; subtasks: number; completed: number; pending: number; overdue: number }> = {};
    
    currentPlanningTypes.forEach(type => {
      summary[type] = { total: 0, subtasks: 0, completed: 0, pending: 0, overdue: 0 };
    });

    tasks.forEach(t => {
      if (summary[t.planning]) {
        summary[t.planning].total++;
        summary[t.planning].subtasks += (t.subtasks?.length || 0);
        if (t.status === 'Complete') summary[t.planning].completed++;
        else if (t.status === 'Overdue') summary[t.planning].overdue++;
        else summary[t.planning].pending++;
      }
    });

    let result = Object.entries(summary).map(([name, data]) => ({
      name,
      ...data,
      compRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField as keyof typeof a];
        const bVal = b[sortField as keyof typeof b];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tasks, sortField, sortDirection]);

  const handleSort = (field: 'completed' | 'name' | 'total' | 'subtasks') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Metrics Row */}
      <div className="flex flex-wrap gap-4">
        <DashboardStatCard 
          title="Total Tasks" 
          value={stats.total} 
          icon={ClipboardList} 
          iconBgClass="bg-indigo-50" 
          colorClass="text-indigo-600" 
        />
        <DashboardStatCard 
          title="Total Subtasks" 
          value={stats.subtasks} 
          icon={LayoutGrid} 
          iconBgClass="bg-indigo-50" 
          colorClass="text-indigo-400" 
        />
        <DashboardStatCard 
          title="Completed Tasks" 
          value={stats.completed} 
          percentage={stats.compValue}
          icon={CheckCircle2} 
          iconBgClass="bg-emerald-50" 
          colorClass="text-emerald-600" 
        />
        <DashboardStatCard 
          title="Pending Tasks" 
          value={stats.pending} 
          percentage={stats.pendValue}
          icon={Clock} 
          iconBgClass="bg-amber-50" 
          colorClass="text-amber-500" 
        />
        <DashboardStatCard 
          title="Overdue Tasks" 
          value={stats.overdue} 
          percentage={stats.overValue}
          icon={AlertCircle} 
          iconBgClass="bg-rose-50" 
          colorClass="text-rose-600" 
        />
        <DashboardStatCard 
          title="Completion Rate" 
          value={`${stats.compRate}%`} 
          icon={PieChartIcon} 
          iconBgClass="bg-indigo-50" 
          colorClass="text-indigo-600" 
          barColor="bg-indigo-600"
        />
      </div>

      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-900 text-white font-bold uppercase text-xs tracking-widest flex justify-between items-center">
          <span>Category Wise Task Summary</span>
          <span className="text-[10px] opacity-70">Full Report Overview</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 italic bg-slate-50">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Category {sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />) : <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />}
                  </div>
                </th>
                <th className="py-3 px-2 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('total')}>
                  <div className="flex items-center justify-center gap-1">
                    Total Tasks {sortField === 'total' ? (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />) : <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />}
                  </div>
                </th>
                <th className="py-3 px-2 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('subtasks')}>
                  <div className="flex items-center justify-center gap-1">
                    Subtasks {sortField === 'subtasks' ? (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />) : <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />}
                  </div>
                </th>
                <th className="py-3 px-2 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('completed')}>
                  <div className="flex items-center justify-center gap-1">
                    Completed {sortField === 'completed' ? (sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />) : <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />}
                  </div>
                </th>
                <th className="py-3 px-2 text-center">Pending</th>
                <th className="py-3 px-2 text-center">Overdue</th>
                <th className="py-3 px-4 text-right">Completion %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categorySummary.map((cat, idx) => (
                <tr key={cat.name} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-[10px] font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-2 font-bold text-slate-700 text-xs">{cat.name}</td>
                  <td className="py-3 px-2 text-center font-bold text-slate-600 text-xs">{cat.total}</td>
                  <td className="py-3 px-2 text-center font-bold text-indigo-500 text-xs bg-indigo-50/10">{cat.subtasks}</td>
                  <td className="py-3 px-2 text-center font-bold text-emerald-600 text-xs">{cat.completed}</td>
                  <td className="py-3 px-2 text-center font-bold text-slate-600 text-xs">{cat.pending}</td>
                  <td className="py-3 px-2 text-center font-bold text-slate-600 text-xs">{cat.overdue}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-[11px] font-bold text-slate-900 w-8">{cat.compRate}%</span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.compRate}%` }}
                          className={`h-full rounded-full ${cat.compRate > 75 ? 'bg-emerald-500' : cat.compRate > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-black text-slate-900 uppercase text-[10px]">
                <td className="py-4 px-4" colSpan={2}>Total</td>
                <td className="py-4 px-2 text-center">{stats.total}</td>
                <td className="py-4 px-2 text-center text-indigo-600 font-black">{stats.subtasks}</td>
                <td className="py-4 px-2 text-center text-emerald-600 font-black">{stats.completed}</td>
                <td className="py-4 px-2 text-center">{stats.pending}</td>
                <td className="py-4 px-2 text-center">{stats.overdue}</td>
                <td className="py-4 px-4 text-right text-indigo-600">{stats.compRate}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Components ---

const StatCard = ({ title, value, colorClass, barColor, isPercent = false }: { title: string, value: number | string, colorClass: string, barColor: string, isPercent?: boolean }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-w-[200px]">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    <p className={`text-3xl font-light mt-1 ${colorClass}`}>{isPercent ? value : Number(value).toLocaleString()}</p>
    <div className={`h-1 w-12 ${barColor} mt-3`}></div>
  </div>
);

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Task | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filters State
  const [filters, setFilters] = useState({
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    group: 'AGILE',
    area: 'Faisalabad',
    team: ['Dr. Sadam Gondal'],
    planning: 'New Product Launching'
  });

  const [activeFilters, setActiveFilters] = useState(filters);

  useEffect(() => {
    handleApplyFilters();
  }, []);

  const handleApplyFilters = () => {
    setLoading(true);
    setTimeout(() => {
      const newData = generateMockData(filters, 50 + Math.floor(Math.random() * 50));
      setTasks(newData);
      setActiveFilters(filters);
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    const defaultFilters = {
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      group: '',
      area: '',
      team: [] as string[],
      planning: ''
    };
    setFilters(defaultFilters);
    setSearch('');
    setSortField(null);
    setSortDirection('asc');
    setLoading(true);
    setTimeout(() => {
      setTasks(generateMockData(defaultFilters, 60));
      setActiveFilters(defaultFilters);
      setLoading(false);
    }, 500);
  };

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length || 1;
    const totalSubtasks = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0);
    return {
      total: tasks.length,
      subtasks: totalSubtasks,
      completed: tasks.filter(t => t.status === 'Complete').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      overdue: tasks.filter(t => t.status === 'Overdue').length,
      progress: Math.round((tasks.filter(t => t.status === 'Complete').length / total) * 100)
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(task => {
        const taskMatches = task.name.toLowerCase().includes(lowerSearch) || 
                            task.relatedTo.toLowerCase().includes(lowerSearch) ||
                            task.area.toLowerCase().includes(lowerSearch);
        
        const subtaskMatch = task.subtasks?.some(sub => 
          sub.name.toLowerCase().includes(lowerSearch)
        );

        return taskMatches || subtaskMatch;
      });
    }

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [tasks, search, sortField, sortDirection]);

  // Auto-expand tasks that contain matching subtasks
  useEffect(() => {
    if (!search) return;
    const lowerSearch = search.toLowerCase();
    const matches = tasks.filter(t => t.subtasks?.some(s => s.name.toLowerCase().includes(lowerSearch)));
    if (matches.length > 0) {
      const newExpanded = new Set(expandedTasks);
      matches.forEach(m => newExpanded.add(m.id));
      setExpandedTasks(newExpanded);
    }
  }, [search, tasks]);

  const [activeTab, setActiveTab] = useState<'overview' | 'summary'>('overview');
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTeamDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-wide border-2 ${
              activeTab === 'overview' 
                ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            Tasks Overview
          </button>
          <button 
            onClick={() => setActiveTab('summary')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-wide border-2 ${
              activeTab === 'summary' 
                ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            Tasks Summary
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400 italic font-medium hidden md:flex">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Environment • Q3 Update
          </span>
        </div>
      </nav>

      <main className="p-4 md:p-8 flex-1 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider">From Date</label>
            <div className="relative">
              <input 
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full bg-slate-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 py-2.5 px-3 appearance-none cursor-pointer outline-none"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider">To Date</label>
            <div className="relative">
              <input 
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full bg-slate-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 py-2.5 px-3 appearance-none cursor-pointer outline-none"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider">Group Selection</label>
            <div className="relative">
              <select 
                value={filters.group}
                onChange={(e) => setFilters({...filters, group: e.target.value, team: []})}
                className="w-full bg-slate-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 py-2.5 px-3 appearance-none cursor-pointer"
              >
                <option value="">Select Group</option>
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[180px] relative" ref={dropdownRef}>
            <label className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider">Team Lead</label>
            <div 
              className="w-full bg-slate-50 border-none text-sm rounded-lg py-2.5 px-3 cursor-pointer flex items-center justify-between min-h-[40px] hover:ring-2 hover:ring-indigo-200 transition-all"
              onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
            >
              <span className="truncate pr-4 flex-1">
                {filters.team.length === 0 ? 'All Leads' : 
                 filters.team.length === 1 ? filters.team[0] : 
                 `${filters.team.length} selected`}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${teamDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {teamDropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-[100] p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                {(() => {
                  const leadOptions = filters.group ? 
                    TEAMS[filters.group] : 
                    Array.from(new Set(Object.values(TEAMS).flat()));
                  
                  return leadOptions.map(lead => {
                    const isSelected = filters.team.includes(lead);
                    return (
                      <div 
                        key={lead}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                        onClick={() => {
                          const newTeams = isSelected 
                            ? filters.team.filter(t => t !== lead) 
                            : [...filters.team, lead];
                          setFilters({...filters, team: newTeams});
                        }}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                           {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-semibold">{lead}</span>
                      </div>
                    );
                  });
                })()}
                {filters.team.length > 0 && (
                  <button 
                    className="mt-1 p-2 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 rounded-lg text-left"
                    onClick={() => setFilters({...filters, team: []})}
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 flex-[2] min-w-[250px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider">Planning Module</label>
            <div className="relative">
              <select 
                value={filters.planning}
                onChange={(e) => {
                  const newPlanning = e.target.value;
                  setFilters({...filters, planning: newPlanning});
                  // Trigger immediate refresh for planning selection
                  setLoading(true);
                  setTimeout(() => {
                    const newData = generateMockData({...filters, planning: newPlanning}, 50 + Math.floor(Math.random() * 50));
                    setTasks(newData);
                    setActiveFilters({...filters, planning: newPlanning});
                    setLoading(false);
                  }, 400);
                }}
                className="w-full bg-slate-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 py-2.5 px-3 appearance-none cursor-pointer"
              >
                <option value="">All Planning</option>
                {(() => {
                  const options = filters.group && PLANNING_MODULES_BY_GROUP[filters.group] 
                    ? PLANNING_MODULES_BY_GROUP[filters.group] 
                    : DEFAULT_PLANNING_TYPES;
                  return options.map(p => <option key={p}>{p}</option>);
                })()}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApplyFilters}
            className="md:mt-5 px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Apply Filters
          </motion.button>
        </div>

        {activeTab === 'summary' ? (
          <SummaryDashboard tasks={filteredTasks} />
        ) : (
          <>
            {/* Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="Total Tasks" value={stats.total} colorClass="text-slate-900" barColor="bg-indigo-500" />
              <StatCard title="Sub Tasks" value={stats.subtasks} colorClass="text-indigo-400" barColor="bg-indigo-300" />
              <StatCard title="Due Tasks" value={stats.overdue} colorClass="text-rose-500" barColor="bg-rose-500" />
              <StatCard title="Completed" value={stats.completed} colorClass="text-emerald-500" barColor="bg-emerald-500" />
              <StatCard title="Total Progress" value={`${stats.progress}%`} colorClass="text-indigo-600" barColor="bg-indigo-600" isPercent />
            </div>

        {/* Data Grid Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-x-auto flex flex-col min-h-[500px]">
          {/* Header Controls */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white min-w-[1200px]">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all text-[10px] font-black uppercase bg-white"
                title="Reset ALL Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9 w-72 bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-sm">
              <div className="px-3 border-r border-slate-100 flex items-center justify-center h-full bg-slate-50/30">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs text-slate-600 outline-none placeholder:text-slate-300 font-medium"
              />
            </div>
          </div>

          {/* Grid Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_2fr] gap-4 text-[11px] font-bold text-slate-600 uppercase tracking-tight min-w-[1200px]">
            <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('name')}>
              Name {sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('startDate')}>
              Start Date {sortField === 'startDate' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('dueDate')}>
              Due Date {sortField === 'dueDate' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('status')}>
              Status {sortField === 'status' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
            </div>
            <div>Total attachments</div>
            <div>Total comments</div>
            <div>Checklist Items</div>
            <div>Total Logged Time</div>
            <div>Finished on time?</div>
            <div>Assigned to</div>
          </div>
          
          {/* Grid Body */}
          <div className="flex-1 overflow-y-auto min-w-[1200px]">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  Recalculating dashboard metrics...
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => {
                  const isExpanded = expandedTasks.has(task.id);
                  const progressValue = (task.checklist.completed / task.checklist.total) * 100;

                  return (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.01 }}
                      className="border-b border-slate-100 items-start hover:bg-slate-50/50 cursor-pointer group transition-colors"
                      onClick={() => task.subtasks && toggleExpand(task.id)}
                    >
                      <div className="px-6 py-4 grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_2fr] gap-4 items-start">
                        <div className="flex flex-col h-full">
                          <div className="flex items-center gap-2">
                            {task.subtasks && (
                              <button className="p-0.5 hover:bg-slate-200 rounded transition-colors text-indigo-600 -ml-6">
                                {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <span className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{task.name}</span>
                            {task.subtasks && (
                              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md border border-indigo-100">
                                {task.subtasks.length} SUBTASKS
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 font-medium italic">{task.relatedTo}</span>
                          
                          {/* Task Progress Meter */}
                          <div className="mt-2 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                task.status === 'Complete' ? 'bg-emerald-500' : 
                                task.status === 'Overdue' ? 'bg-rose-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${progressValue}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 font-medium py-1">{task.startDate}</div>
                        <div className="text-xs text-slate-500 font-medium py-1">{task.dueDate}</div>
                        <div className="text-xs font-bold flex items-center gap-2 py-1">
                          <span className={`w-2 h-2 rounded-full ${
                            task.status === 'Complete' ? 'bg-emerald-500' :
                            task.status === 'Overdue' ? 'bg-rose-500' :
                            task.status === 'In Progress' ? 'bg-amber-500' :
                            'bg-slate-300'
                          }`}></span>
                          <span className={
                            task.status === 'Complete' ? 'text-emerald-600' :
                            task.status === 'Overdue' ? 'text-rose-600' :
                            task.status === 'In Progress' ? 'text-amber-600' :
                            'text-slate-400'
                          }>{task.status}</span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium text-center py-1">{task.attachments}</div>
                        <div className="text-xs text-slate-600 font-medium text-center py-1">{task.comments}</div>
                        <div className="text-xs text-slate-600 font-medium text-center py-1">{task.checklist.completed}/{task.checklist.total}</div>
                        <div className="text-xs font-mono text-slate-600 font-semibold py-1">{task.loggedTime}</div>
                        <div className="text-xs text-center font-bold py-1">
                          {task.finishedOnTime === true ? <span className="text-emerald-600">YES</span> : task.finishedOnTime === false ? <span className="text-rose-600">NO</span> : <span className="text-slate-300">—</span>}
                        </div>
                        <div className="flex items-center gap-2 py-1">
                          <img src={task.assignedTo.avatar} alt="" className="w-6 h-6 rounded-full border border-slate-200" />
                          <span className="text-xs font-semibold text-slate-700 truncate">{task.assignedTo.name}</span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && task.subtasks && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/50"
                          >
                            <div className="flex flex-col">
                              {task.subtasks.filter(sub => 
                                !search || 
                                sub.name.toLowerCase().includes(search.toLowerCase()) ||
                                task.name.toLowerCase().includes(search.toLowerCase())
                              ).map((sub, sIdx) => (
                                <div key={sIdx} className="px-6 py-3 border-t border-slate-100 grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_2fr] gap-4 items-center">
                                  <div className="flex items-start gap-3 pl-8">
                                    <div className={`w-2 h-2 mt-1.5 rounded-full ${
                                      sub.status === 'Complete' ? 'bg-emerald-500' :
                                      sub.status === 'In Progress' ? 'bg-amber-500' :
                                      'bg-slate-300'
                                    }`}></div>
                                    <span className="text-xs font-bold text-slate-700 leading-relaxed max-w-[150px]">{sub.name}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-medium">{sub.startDate}</div>
                                  <div className="text-[11px] text-slate-500 font-medium">{sub.dueDate}</div>
                                  <div className="text-[11px] font-bold flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      sub.status === 'Complete' ? 'bg-emerald-500' :
                                      sub.status === 'In Progress' ? 'bg-amber-500' :
                                      'bg-slate-300'
                                    }`}></span>
                                    <span className={
                                      sub.status === 'Complete' ? 'text-emerald-600' :
                                      sub.status === 'In Progress' ? 'text-amber-600' :
                                      'text-slate-400'
                                    }>{sub.status}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 font-medium text-center">{sub.attachments}</div>
                                  <div className="text-[11px] text-slate-600 font-medium text-center">{sub.comments}</div>
                                  <div className="text-[11px] text-slate-600 font-medium text-center">{sub.checklist.completed}/{sub.checklist.total}</div>
                                  <div className="text-[11px] font-mono text-slate-600 font-semibold">{sub.loggedTime}</div>
                                  <div className="text-[11px] text-center font-bold text-slate-300">—</div>
                                  <div className="flex items-center gap-2">
                                    <img src={sub.assignedTo.avatar} alt="" className="w-5 h-5 rounded-full border border-slate-200" />
                                    <span className="text-[11px] font-semibold text-slate-700 truncate">{sub.assignedTo.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                  );
                })) : (
                <div className="p-20 text-center flex flex-col items-center">
                  <LayoutGrid className="w-12 h-12 text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">No results found for your search query.</p>
                  <button onClick={() => setSearch('')} className="text-indigo-600 text-xs mt-2 hover:underline">Clear search</button>
                </div>
              )}
            </AnimatePresence>
          </div>
          
            {/* Pagination/Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-500 font-medium min-w-[1200px]">
              <div>Showing {filteredTasks.length} of {tasks.length.toLocaleString()} Tasks</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 bg-white border border-indigo-600 rounded-md text-indigo-600 font-bold shadow-sm">1</button>
                <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
            </div>
          </>
        )}
      </main>

      <footer className="px-8 py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">
        Professional Planning & Deployment System • Secure v2.4.1
      </footer>
    </div>
  );
}
