import React from 'react';
import {
    User, CreditCard, DollarSign,
    Percent, CheckCircle2, AlertCircle,
    Plus, Edit, Trash2, TrendingUp, PieChart, Calculator
} from 'lucide-react';
import { formatCurrency } from '../utils/formatUtils';

const LeadExpandedDetails = ({ lead, onAddDisbursement, onViewHistory, onEditDisbursement, onDeleteDisbursement }) => {
    const history = lead.disbursementHistory || [];
    const loanAmount = lead.loanAmount || lead.amount || 0;
    const disbursedAmount = lead.disbursedAmount || 0;
    const remainingAmount = Math.max(0, loanAmount - disbursedAmount);
    const commissionAmount = lead.commissionAmount || 0;
    const commissionPercentage = lead.commissionPercentage || 0;
    
    // Calculate totals for disbursement history
    const totalDisbursed = history.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalCommission = history.reduce((sum, item) => sum + (item.commission || 0), 0);
    const totalGST = history.reduce((sum, item) => sum + (item.gst || 0), 0);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6">
                {/* Main Loan Summary - Sticky */}
                <div className="mb-8 sticky top-0 z-10 bg-white py-4 px-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Loan Summary</h3>
                    
                    {/* Centered Container with Max Width */}
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <CreditCard size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide">Approved Amount</h4>
                                        <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(loanAmount)}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">Fixed Sanctioned Limit</p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <DollarSign size={16} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wide">Total Disbursed</h4>
                                        <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalDisbursed)}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-emerald-600 mt-2">Amount Released</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp size={16} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide">Remaining Amount</h4>
                                        <p className="text-xl font-bold text-orange-600 mt-1">{formatCurrency(remainingAmount)}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-orange-600 mt-2">Pending Disbursement</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-4xl mx-auto px-4 mt-4">
                        <div className="bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${loanAmount > 0 ? (totalDisbursed / loanAmount) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between mt-2 text-xs text-gray-600 gap-1">
                            <span className="text-center sm:text-left">0%</span>
                            <span className="text-center truncate">{formatCurrency(totalDisbursed)} / {formatCurrency(loanAmount)}</span>
                            <span className="text-center sm:text-right">100%</span>
                        </div>
                    </div>
                </div>

                {/* Disbursement History Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Disbursement History</h3>
                        <button 
                            onClick={() => onAddDisbursement(lead._id)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Disbursement
                        </button>
                    </div>

                    {history.length > 0 ? (
                        <div className="overflow-hidden border border-gray-200 rounded-2xl">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Commission</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">GST</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Net Commission</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UTR</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Ref</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((item, index) => {
                                        const netComm = (item.commission || 0) - (item.gst || 0);
                                        return (
                                            <tr key={item._id || index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.date || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-emerald-600">{formatCurrency(item.amount)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-blue-600">{formatCurrency(item.commission)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-orange-600">{formatCurrency(item.gst)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-purple-600">{formatCurrency(netComm)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.utr || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.bankRef || 'N/A'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    <button 
                                                        onClick={() => onEditDisbursement(lead._id, item)}
                                                        className="text-blue-600 hover:text-blue-800 mr-2 flex items-center gap-1"
                                                    >
                                                        <Edit size={14} />
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteDisbursement(lead._id, item)}
                                                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>No disbursement history yet</p>
                            <p className="text-sm">Click "Add Disbursement" to create your first entry</p>
                        </div>
                    )}

                    {/* Summary at Bottom */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">Total Disbursed</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalDisbursed)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">Total Commission</p>
                            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalCommission)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">Remaining Amount</p>
                            <p className="text-xl font-bold text-orange-600">{formatCurrency(remainingAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadExpandedDetails;