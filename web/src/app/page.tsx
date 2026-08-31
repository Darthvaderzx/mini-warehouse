'use client';

import React, { useState } from 'react';

type Section = 
  | 'dashboard' 
  | 'items' 
  | 'locations' 
  | 'inventory' 
  | 'tasks' 
  | 'movements' 
  | 'users' 
  | 'settings';

export default function BackOfficeApp() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#0F766E',
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontWeight: 500
        }}>
          â {toastMessage}
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-light)' }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          MiniWarehouse
        </div>
        
        <div className="sidebar-nav">
          <div className="nav-section">Overview</div>
          <a className={activeSection === 'dashboard' ? 'active' : ''} onClick={() => setActiveSection('dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>

          <div className="nav-section">Warehouse</div>
          <a className={activeSection === 'items' ? 'active' : ''} onClick={() => setActiveSection('items')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Items &amp; Barcodes
          </a>
          <a className={activeSection === 'locations' ? 'active' : ''} onClick={() => setActiveSection('locations')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Locations
          </a>
          <a className={activeSection === 'inventory' ? 'active' : ''} onClick={() => setActiveSection('inventory')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Inventory
          </a>

          <div className="nav-section">Operations</div>
          <a className={activeSection === 'tasks' ? 'active' : ''} onClick={() => setActiveSection('tasks')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            Tasks
          </a>
          <a className={activeSection === 'movements' ? 'active' : ''} onClick={() => setActiveSection('movements')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
            Movement Ledger
          </a>

          <div className="nav-section">Administration</div>
          <a className={activeSection === 'users' ? 'active' : ''} onClick={() => setActiveSection('users')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Users &amp; Devices
          </a>
          <a className={activeSection === 'settings' ? 'active' : ''} onClick={() => setActiveSection('settings')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </a>
        </div>

        <div className="sidebar-footer">
          Tenant: <strong style={{ color: 'var(--sidebar-text)' }}>Acme Logistics</strong><br />
          v1.0.0 Â· Backend Online
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="breadcrumbs" id="breadcrumbs">
            <a onClick={() => setActiveSection('dashboard')}>Home</a>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            <span id="breadcrumb-current" style={{ textTransform: 'capitalize' }}>{activeSection}</span>
          </div>
          
          <div className="topbar-actions">
            <button className="notification-btn" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="notification-badge">3</span>
            </button>
            <div className="user-avatar" title="Admin User">AD</div>
          </div>
        </header>

        <main className="content" id="app-content">
          {activeSection === 'dashboard' && (
            <section id="dashboard" className="page-section active">
              <div className="page-header">
                <div>
                  <h2>Dashboard</h2>
                  <div className="page-subtitle">Warehouse overview â real-time operational status</div>
                </div>
                <div className="btn-group">
                  <button className="btn btn-default" onClick={() => showToast('Export Report CSV generated')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export Report
                  </button>
                </div>
              </div>

              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon teal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">1,247</div>
                    <div className="kpi-label">Total SKUs</div>
                    <div className="kpi-change up">â 12 new this week</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">38,492</div>
                    <div className="kpi-label">Units On Hand</div>
                    <div className="kpi-change up">â 3.2% vs last week</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon amber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">24</div>
                    <div className="kpi-label">Active Tasks</div>
                    <div className="kpi-change down">â 6 pending assignment</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon red">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">7</div>
                    <div className="kpi-label">Low Stock Alerts</div>
                    <div className="kpi-change down">â 3 new today</div>
                  </div>
                </div>
              </div>

              <div className="two-col">
                <div className="panel">
                  <div className="panel-header">
                    Recent Tasks
                    <a onClick={() => setActiveSection('tasks')} style={{ fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>View All â</a>
                  </div>
                  <div className="panel-body no-pad">
                    <div className="task-list" style={{ padding: '0.75rem 1.25rem' }}>
                      <div className="task-card">
                        <span className="task-type-badge task-type-pick">PICK</span>
                        <div className="task-info">
                          <div className="task-title">SO-20260428-001 Â· 14 lines</div>
                          <div className="task-meta">Assigned: Device PDT-03 Â· Zone A</div>
                        </div>
                        <span className="status-badge status-active">In Progress</span>
                      </div>
                      <div className="task-card">
                        <span className="task-type-badge task-type-putaway">PUT</span>
                        <div className="task-info">
                          <div className="task-title">Receipt RCP-0089 Â· 6 items</div>
                          <div className="task-meta">Assigned: Device PDT-01 Â· Receiving Dock</div>
                        </div>
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                      <div className="task-card">
                        <span className="task-type-badge task-type-count">COUNT</span>
                        <div className="task-info">
                          <div className="task-title">Cycle Count Â· Zone B, Aisle 4</div>
                          <div className="task-meta">Assigned: Operator Maria S.</div>
                        </div>
                        <span className="status-badge status-info">Scheduled</span>
                      </div>
                      <div className="task-card">
                        <span className="task-type-badge task-type-receipt">RCV</span>
                        <div className="task-info">
                          <div className="task-title">PO-4521 Â· Vendor: FastPack Supply</div>
                          <div className="task-meta">Expected: 48 units Â· 3 lines</div>
                        </div>
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">Alerts &amp; Notifications</div>
                  <div className="panel-body">
                    <div className="alert alert-danger">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <div><strong>Low Stock:</strong> SKU-0042 (Packing Tape 48mm) â 12 units remaining, reorder point is 50.</div>
                    </div>
                    <div className="alert alert-warning">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      <div><strong>Expiry Alert:</strong> Lot LT-2026-0312 (Organic Solvent) expires in 14 days â 200 units in Bin C-02-03-01.</div>
                    </div>
                    <div className="alert alert-info">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <div><strong>Sync Complete:</strong> PDT-03 synced 18 events at 14:32. All movements applied successfully.</div>
                    </div>
                    <div className="alert alert-success">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      <div><strong>Count Completed:</strong> Zone A, Aisle 2 cycle count â 0 variances detected.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  Latest Movements
                  <a onClick={() => setActiveSection('movements')} style={{ fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>View Ledger â</a>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Type</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono text-sm">2026-04-28 14:32:18</td>
                        <td><span className="movement-direction out">â OUT</span></td>
                        <td>Steel Bolt M8Ã40 (Box)</td>
                        <td><strong>-24</strong></td>
                        <td>A-01-03-02</td>
                        <td>â</td>
                        <td className="text-muted">SO-20260428-001</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-sm">2026-04-28 14:30:05</td>
                        <td><span className="movement-direction in">â IN</span></td>
                        <td>Corrugated Box 40Ã30Ã20</td>
                        <td><strong>+120</strong></td>
                        <td>â</td>
                        <td>B-02-01-01</td>
                        <td className="text-muted">RCP-0089</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-sm">2026-04-28 14:28:44</td>
                        <td><span className="movement-direction transfer">â TRANSFER</span></td>
                        <td>HDPE Granules (25kg bag)</td>
                        <td><strong>15</strong></td>
                        <td>C-01-02-04</td>
                        <td>C-02-03-01</td>
                        <td className="text-muted">Rebalance</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-sm">2026-04-28 13:55:12</td>
                        <td><span className="movement-direction out">â OUT</span></td>
                        <td>Packing Tape 48mm Clear</td>
                        <td><strong>-6</strong></td>
                        <td>A-03-01-01</td>
                        <td>â</td>
                        <td className="text-muted">SO-20260428-001</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-sm">2026-04-28 13:42:30</td>
                        <td><span className="movement-direction in">â IN</span></td>
                        <td>Organic Solvent 5L (Lot LT-2026-0312)</td>
                        <td><strong>+200</strong></td>
                        <td>â</td>
                        <td>C-02-03-01</td>
                        <td className="text-muted">RCP-0088</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'items' && (
            <section id="items" className="page-section active">
              <div className="page-header">
                <div>
                  <h2>Items &amp; Barcodes</h2>
                  <div className="page-subtitle">Manage product catalog, pack levels (ItemUnits), and barcode mappings</div>
                </div>
                <div className="btn-group">
                  <button className="btn btn-default" onClick={() => showToast('CSV template downloaded')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Import CSV
                  </button>
                  <button className="btn btn-primary" onClick={() => showToast('New Item Created')}>+ New Item</button>
                </div>
              </div>

              <div className="panel">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}><input type="checkbox" /></th>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Pack Levels</th>
                        <th>Tracking</th>
                        <th>On Hand</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td className="font-mono">SKU-0001</td>
                        <td><strong>Steel Bolt M8Ã40</strong><br /><span className="text-muted text-xs">Fastener, Grade 8.8</span></td>
                        <td>Raw Materials</td>
                        <td>Each â Box (50) â Crate (500)</td>
                        <td>â</td>
                        <td><strong>2,340</strong> ea</td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td><a className="text-sm" onClick={() => showToast('Editing SKU-0001')}>Edit</a> Â· <a className="text-sm" onClick={() => showToast('Barcode labels ready')}>Barcodes</a></td>
                      </tr>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td className="font-mono">SKU-0015</td>
                        <td><strong>Organic Solvent 5L</strong><br /><span className="text-muted text-xs">Chemical, flammable class</span></td>
                        <td>Raw Materials</td>
                        <td>Each â Pallet (40)</td>
                        <td><span className="status-badge status-info" style={{ fontSize: '0.65rem' }}>LOT</span> <span className="status-badge status-error" style={{ fontSize: '0.65rem' }}>EXP</span></td>
                        <td><strong>200</strong> ea</td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td><a className="text-sm" onClick={() => showToast('Editing SKU-0015')}>Edit</a> Â· <a className="text-sm" onClick={() => showToast('Barcode labels ready')}>Barcodes</a></td>
                      </tr>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td className="font-mono">SKU-0042</td>
                        <td><strong>Packing Tape 48mm Clear</strong><br /><span className="text-muted text-xs">Packaging consumable</span></td>
                        <td>Consumables</td>
                        <td>Each â Roll (6) â Case (72)</td>
                        <td>â</td>
                        <td><strong style={{ color: 'var(--danger)' }}>12</strong> ea</td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td><a className="text-sm" onClick={() => showToast('Editing SKU-0042')}>Edit</a> Â· <a className="text-sm" onClick={() => showToast('Barcode labels ready')}>Barcodes</a></td>
                      </tr>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td className="font-mono">SKU-0058</td>
                        <td><strong>Corrugated Box 40Ã30Ã20</strong><br /><span className="text-muted text-xs">Standard shipping box</span></td>
                        <td>Packaging</td>
                        <td>Each â Bundle (25) â Pallet (500)</td>
                        <td>â</td>
                        <td><strong>1,840</strong> ea</td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td><a className="text-sm" onClick={() => showToast('Editing SKU-0058')}>Edit</a> Â· <a className="text-sm" onClick={() => showToast('Barcode labels ready')}>Barcodes</a></td>
                      </tr>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td className="font-mono">SKU-0103</td>
                        <td><strong>HDPE Granules (25kg bag)</strong><br /><span className="text-muted text-xs">Polymer raw material</span></td>
                        <td>Raw Materials</td>
                        <td>Bag â Pallet (40)</td>
                        <td><span className="status-badge status-info" style={{ fontSize: '0.65rem' }}>LOT</span></td>
                        <td><strong>380</strong> bags</td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td><a className="text-sm" onClick={() => showToast('Editing SKU-0103')}>Edit</a> Â· <a className="text-sm" onClick={() => showToast('Barcode labels ready')}>Barcodes</a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'locations' && (
            <section id="locations" className="page-section active">
              <div className="page-header">
                <div>
                  <h2>Locations</h2>
                  <div className="page-subtitle">Warehouse location hierarchy â Zone â Aisle â Rack â Bin</div>
                </div>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => showToast('New Location Created')}>+ Add Location</button>
                </div>
              </div>

              <div className="two-col">
                <div className="panel">
                  <div className="panel-header">Location Hierarchy</div>
                  <div className="panel-body no-pad">
                    <ul className="location-tree">
                      <li>
                        <span className="tree-toggle">â¾</span>
                        <span className="tree-label">Zone A â Fast Moving</span>
                        <span className="tree-meta">4 aisles Â· 92% full</span>
                      </li>
                      <li className="tree-indent">
                        <span className="tree-toggle">â¾</span>
                        <span className="tree-label">Aisle 1</span>
                        <span className="tree-meta">88% full</span>
                      </li>
                      <li className="tree-indent-2">
                        <span className="tree-label" style={{ fontWeight: 400 }}>A-01-01-01</span>
                        <span className="tree-meta">Bin Â· 3 SKUs</span>
                      </li>
                      <li className="tree-indent-2">
                        <span className="tree-label" style={{ fontWeight: 400 }}>A-01-01-02</span>
                        <span className="tree-meta">Bin Â· 5 SKUs</span>
                      </li>
                      <li>
                        <span className="tree-toggle">â¸</span>
                        <span className="tree-label">Zone B â Bulk Storage</span>
                        <span className="tree-meta">6 aisles Â· 68% full</span>
                      </li>
                      <li>
                        <span className="tree-toggle">â¸</span>
                        <span className="tree-label">Zone C â Chemical / Hazard</span>
                        <span className="tree-meta">3 aisles Â· 45% full</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">Location Details â A-01-01-01</div>
                  <div className="panel-body">
                    <dl className="detail-grid">
                      <dt>Full Code:</dt>
                      <dd><code className="font-mono">WH1-ZA-A01-R01-B01</code></dd>
                      <dt>Type:</dt>
                      <dd>Storage Bin (Standard Shelf)</dd>
                      <dt>Barcode:</dt>
                      <dd><code className="font-mono">LOC-A010101</code></dd>
                      <dt>Max Weight:</dt>
                      <dd>250 kg</dd>
                      <dt>Status:</dt>
                      <dd><span className="status-badge status-active">Available</span></dd>
                    </dl>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'inventory' && (
            <section id="inventory" className="page-section active">
              <div className="page-header">
                <div>
                  <h2>Inventory Balances</h2>
                  <div className="page-subtitle">Derived on-hand stock aggregated from the immutable Movement ledger</div>
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-item">
                  <div className="stat-value">38,492</div>
                  <div className="stat-label">Total Base Units</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: 'var(--success)' }}>36,120</div>
                  <div className="stat-label">Available</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: 'var(--info)' }}>1,872</div>
                  <div className="stat-label">Reserved (Active Picks)</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: 'var(--warning)' }}>200</div>
                  <div className="stat-label">Quarantined / Hold</div>
                </div>
              </div>

              <div className="panel">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Item Name</th>
                        <th>Location</th>
                        <th>Lot / Serial</th>
                        <th>On Hand</th>
                        <th>Available</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono">SKU-0001</td>
                        <td><strong>Steel Bolt M8Ã40</strong></td>
                        <td><code className="font-mono">A-01-01-01</code></td>
                        <td className="text-muted">â</td>
                        <td><strong>450</strong> ea</td>
                        <td><strong>400</strong> ea</td>
                        <td><span className="status-badge status-active">Available</span></td>
                      </tr>
                      <tr>
                        <td className="font-mono">SKU-0015</td>
                        <td><strong>Organic Solvent 5L</strong></td>
                        <td><code className="font-mono">C-02-03-01</code></td>
                        <td className="font-mono text-xs">LT-2026-0312</td>
                        <td><strong>200</strong> ea</td>
                        <td><strong>200</strong> ea</td>
                        <td><span className="status-badge status-quarantined">Quarantine</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'tasks' && (
            <section id="tasks" className="page-section active">
              <div className="page-header">
                <div>
                  <h2>Tasks Management</h2>
                  <div className="page-subtitle">Assign, monitor, and prioritize floor operations</div>
                </div>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => showToast('New Task created')}>+ New Task</button>
                </div>
              </div>
              <div className="panel">
                <div className="panel-body no-pad">
                  <div className="task-list" style={{ padding: '1rem' }}>
                    <div className="task-card">
                      <span className="task-type-badge task-type-pick">PICK</span>
                      <div className="task-info">
                        <div className="task-title">SO-20260428-001 Â· 14 lines</div>
                        <div className="task-meta">Assigned: Device PDT-03 Â· Zone A</div>
                      </div>
                      <span className="status-badge status-active">In Progress</span>
                    </div>
                    <div className="task-card">
                      <span className="task-type-badge task-type-putaway">PUT</span>
                      <div className="task-info">
                        <div className="task-title">Receipt RCP-0089 Â· 6 items</div>
                        <div className="task-meta">Assigned: Device PDT-01 Â· Receiving Dock</div>
                      </div>
                      <span className="status-badge status-pending">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'movements' && (
            <section id="movements" className="page-section active">
              <div className="page-header">
                <div>
                  <h2>Movement Ledger</h2>
                  <div className="page-subtitle">Immutable audit trail of all warehouse stock movements</div>
                </div>
              </div>
              <div className="panel">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Type</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono text-sm">2026-04-28 14:32:18</td>
                        <td><span className="movement-direction out">â OUT</span></td>
                        <td>Steel Bolt M8Ã40 (Box)</td>
                        <td><strong>-24</strong></td>
                        <td>A-01-03-02</td>
                        <td>â</td>
                        <td className="text-muted">SO-20260428-001</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'users' && (
            <section id="users" className="page-section active">
              <div className="page-header">
                <div>
                  <h2>Users &amp; Devices</h2>
                  <div className="page-subtitle">Tenant user accounts and connected Android PDT scanners</div>
                </div>
              </div>
              <div className="two-col">
                <div className="panel">
                  <div className="panel-header">User Accounts</div>
                  <div className="panel-body">
                    <p><strong>Admin User</strong> (admin@acme.com) â Admin</p>
                    <p><strong>Maria Santos</strong> (maria@acme.com) â Supervisor</p>
                    <p><strong>John Floor</strong> (john@acme.com) â Operator</p>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-header">PDT Handheld Devices</div>
                  <div className="panel-body">
                    <p><strong>PDT-01</strong> (Zebra TC26 #1) â <span className="status-badge status-active">In Use</span></p>
                    <p><strong>PDT-02</strong> (Honeywell EDA51 #2) â <span className="status-badge status-info">Online</span></p>
                    <p><strong>PDT-03</strong> (Zebra TC26 #3) â <span className="status-badge status-active">In Use</span></p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'settings' && (
            <section id="settings" className="page-section active">
              <div className="page-header">
                <div>
                  <h2>System Settings</h2>
                  <div className="page-subtitle">Multi-tenancy parameters and warehouse policies</div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-body">
                  <p><strong>Tenant ID:</strong> 00000000-0000-0000-0000-000000000001</p>
                  <p><strong>Stock Soft-Reservation TTL:</strong> 4 Hours</p>
                  <p><strong>Picking Strategy:</strong> FEFO for expiry items, FIFO default</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
