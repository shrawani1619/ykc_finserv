import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    FileText,
    DollarSign,
} from 'lucide-react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';
import api from '../services/api';
import { formatInCrores } from '../utils/formatUtils';
import StatCard from '../components/StatCard';

const AccountantOverview = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [funnelFilter, setFunnelFilter] = useState('monthly'); // 'weekly', 'monthly', 'yearly'

    useEffect(() => {
        fetchDashboard();
    }, [funnelFilter]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const params = {
                funnelPeriod: funnelFilter,
            };
            const response = await api.dashboard.getAccountsDashboard(params);
            setDashboardData(response.data || response);
        } catch (error) {
            console.error('Error fetching accountant dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
            </div>
        );
    }

    const {
        totalLeads = 0,
        verifiedLeads = 0,
        disbursedCases = 0,
        activeAgents = 0,
        totalFranchises = 0,
        activeRelationshipManagers = 0,
        totalInvoices = 0,
        totalRevenue = 0,
        totalLoanAmount = 0,
        loanDistribution = [],
        funnelData = [],
        recentLeads = [],
        recentAgents = []
    } = dashboardData;

    const totalLoanAmountForChart = Array.isArray(loanDistribution)
        ? loanDistribution.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
        : 0;

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Dashboard</span>
                <span>/</span>
                <span>Home</span>
                <span>/</span>
                <span className="text-gray-900 font-medium">Analytics</span>
            </div>

            {/* Stat Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Leads"
                    value={totalLeads.toString()}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="Active Agents"
                    value={activeAgents.toString()}
                    icon={Users}
                    color="green"
                />
                <StatCard
                    title="Total Invoices"
                    value={totalInvoices.toString()}
                    icon={FileText}
                    color="orange"
                />
                <StatCard
                    title="Total Amount"
                    value={formatInCrores(totalLoanAmount || 0)}
                    icon={DollarSign}
                    color="purple"
                />
            </section>

            {/* Middle Section: Chart and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Loan Distribution Chart */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Loan Distribution</h3>
                    {loanDistribution.length > 0 ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-full sm:w-48 h-48 relative flex-shrink-0 [&_svg]:outline-none [&_*]:outline-none">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart style={{ outline: 'none' }}>
                                        <Pie
                                            data={loanDistribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="55%"
                                            outerRadius="85%"
                                            paddingAngle={1}
                                            stroke="none"
                                            style={{ cursor: 'pointer', outline: 'none' }}
                                        >
                                            {loanDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-lg font-bold text-gray-700 text-center px-2">
                                        {formatInCrores(totalLoanAmountForChart || totalLoanAmount || 0)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <ul className="space-y-2">
                                    {loanDistribution.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-center gap-2 text-sm rounded px-1 py-0.5 -mx-1"
                                        >
                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-gray-700 truncate">
                                                {item.name} ({item.count || 0})
                                            </span>
                                            <span className="font-medium text-gray-900 ml-auto">
                                                {formatInCrores(item.totalAmount || 0)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No loan distribution data</p>
                    )}
                </div>

                {/* Lead Conversion Funnel */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Lead Conversion Funnel</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFunnelFilter('weekly')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                    funnelFilter === 'weekly'
                                        ? 'bg-primary-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setFunnelFilter('monthly')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                    funnelFilter === 'monthly'
                                        ? 'bg-primary-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setFunnelFilter('yearly')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                    funnelFilter === 'yearly'
                                        ? 'bg-primary-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={funnelData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                    width={80}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    formatter={(value) => formatInCrores(value)}
                                    labelFormatter={(label) => label}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

           
        </div>
    );
};

export default AccountantOverview;
