import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    UserCheck,
    FileText,
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
import StatCard from '../components/StatCard';
import api from '../services/api';

const AccountantOverview = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.dashboard.getAccountsDashboard();
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
        totalInvoices = 0,
        totalRevenue = 0,
        loanDistribution = [],
        funnelData = [],
        recentLeads = [],
        recentAgents = []
    } = dashboardData;

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

            {/* Stats Grid */}
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
                    icon={UserCheck}
                    color="green"
                />
                <StatCard
                    title="Total Invoices"
                    value={totalInvoices.toString()}
                    icon={FileText}
                    color="orange"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
                    icon={DollarSign}
                    color="purple"
                />
            </section>

            {/* Middle Section: Chart and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Loan Distribution Chart */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Loan Distribution</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-48 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={loanDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {loanDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-800">
                                    {loanDistribution[0]?.value || 0}%
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                            {loanDistribution.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-gray-600 truncate max-w-[100px]">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lead Conversion Funnel */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Lead Conversion Funnel</h3>
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

            {/* Bottom Section: Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent Leads Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-6 flex items-center justify-between border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Recent Leads</h3>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name/ID</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-8 text-center text-gray-500">No recent leads found</td>
                                    </tr>
                                ) : (
                                    recentLeads.map((lead) => (
                                        <tr key={lead.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-sm text-gray-900">{lead.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{lead.id} • {lead.date}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-gray-900">{lead.amount}</div>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${['Logged', 'logged'].includes(lead.status) ? 'bg-orange-100 text-orange-700' :
                                                    ['Sanctioned', 'sanctioned'].includes(lead.status) ? 'bg-lime-100 text-lime-700' :
                                                        ['Disbursed', 'disbursed', 'Partial_disbursed', 'partial_disbursed'].includes(lead.status) ? 'bg-blue-100 text-blue-700' :
                                                            ['Completed', 'completed'].includes(lead.status) ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Agents */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-6 flex items-center justify-between border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Recent Agents</h3>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="divide-y divide-gray-50">
                            {recentAgents.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">No agents found</div>
                            ) : (
                                recentAgents.map((agent, idx) => (
                                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                        <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-900 truncate">{agent.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{agent.email}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${['active', 'Active'].includes(agent.status) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {agent.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountantOverview;
