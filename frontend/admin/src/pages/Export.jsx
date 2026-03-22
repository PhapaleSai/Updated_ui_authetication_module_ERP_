import React, { useState } from 'react';
import api from '../api';

const Export = () => {
    const [loading, setLoading] = useState(false);
    const [dataType, setDataType] = useState('users');
    const [format, setFormat] = useState('csv');

    const handleExport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/export/data?data_type=${dataType}`);
            const data = res.data;
            
            if (format === 'csv') {
                exportToCSV(data, `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                // PDF - Simple print-friendly view trigger
                const printWindow = window.open('', '_blank');
                printWindow.document.write('<html><head><title>System Export</title><style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;}</style></head><body>');
                printWindow.document.write(`<h1>${dataType.toUpperCase()} DATA EXPORT</h1>`);
                printWindow.document.write('<table><thead><tr>');
                Object.keys(data[0]).forEach(key => printWindow.document.write(`<th>${key}</th>`));
                printWindow.document.write('</tr></thead><tbody>');
                data.forEach(row => {
                    printWindow.document.write('<tr>');
                    Object.values(row).forEach(val => printWindow.document.write(`<td>${val}</td>`));
                    printWindow.document.write('</tr>');
                });
                printWindow.document.write('</tbody></table></body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        } catch (err) {
            console.error(err);
            alert("Export failed. Please check your permissions.");
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="export-view">
            <header className="page-header">
                <h1 className="page-title">Data Export Hub</h1>
                <p className="page-subtitle" style={{ color: 'var(--text-secondary)' }}>
                    Generate and download comprehensive system reports.
                </p>
            </header>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>1. Select Data Source</h3>
                    <div className="quick-actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        <div 
                            className={`action-card ${dataType === 'users' ? 'active' : ''}`} 
                            onClick={() => setDataType('users')}
                            style={{ borderColor: dataType === 'users' ? 'var(--accent-primary)' : '' }}
                        >
                            <div className="action-icon">👥</div>
                            <div className="action-label">User Accounts</div>
                            <div className="action-desc">Full list of all registered users, roles, and status.</div>
                        </div>
                        <div 
                            className={`action-card ${dataType === 'audit' ? 'active' : ''}`} 
                            onClick={() => setDataType('audit')}
                            style={{ borderColor: dataType === 'audit' ? 'var(--accent-secondary)' : '' }}
                        >
                            <div className="action-icon">📜</div>
                            <div className="action-label">Audit Logs</div>
                            <div className="action-desc">Historical record of all system access and token events.</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>2. Choose Export Format</h3>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <button 
                            className={`btn ${format === 'csv' ? 'btn-primary' : ''}`} 
                            onClick={() => setFormat('csv')}
                            style={{ flex: 1, background: format !== 'csv' ? 'rgba(255,255,255,0.05)' : '' }}
                        >
                            💾 Export as CSV
                        </button>
                        <button 
                            className={`btn ${format === 'pdf' ? 'btn-primary' : ''}`} 
                            onClick={() => setFormat('pdf')}
                            style={{ flex: 1, background: format !== 'pdf' ? 'rgba(255,255,255,0.05)' : '' }}
                        >
                            📄 Export as PDF
                        </button>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', textAlign: 'center' }}>
                    <button 
                        className="btn btn-primary shimmer-effect" 
                        style={{ padding: '1rem 3rem', fontSize: '1rem' }}
                        disabled={loading}
                        onClick={handleExport}
                    >
                        {loading ? 'Processing...' : '🚀 Generate Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Export;
