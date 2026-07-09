import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Terminal, Trash2, X, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const AwsDevConsole = ({ isOpen, onClose }) => {
  const { consoleLogs, clearLogs, isMockMode, awsConfig, user } = useContext(AppContext);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const filteredLogs = consoleLogs.filter(log => {
    if (filter === 'ALL') return true;
    return log.service.toUpperCase().includes(filter);
  });

  const toggleLogExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getServiceColor = (service) => {
    const s = service.toLowerCase();
    if (s.includes('cognito')) return '#8a2be2'; // purple
    if (s.includes('api')) return '#00f2fe'; // cyan
    if (s.includes('lambda')) return '#f97316'; // orange
    if (s.includes('dynamodb')) return '#22c55e'; // green
    return '#64748b'; // slate
  };

  if (!isOpen) return null;

  return (
    <div className="glass-card" style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      width: '100%',
      maxWidth: '460px',
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(5, 6, 11, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} style={{ color: isMockMode ? 'var(--primary)' : 'var(--secondary)' }} />
          <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.05em' }}>AWS DEVELOPER CONSOLE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={clearLogs}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px',
              transition: 'var(--transition)'
            }}
            title="Clear logs"
            className="hover-bright"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px'
            }}
            className="hover-bright"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Connection Info Panel */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        fontSize: '0.8rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Backend Engine:</span>
          <span style={{ fontWeight: 'bold', color: isMockMode ? 'var(--primary)' : 'var(--secondary)' }}>
            {isMockMode ? 'LOCAL SIMULATOR' : 'LIVE AWS INFRASTRUCTURE'}
          </span>
        </div>
        {!isMockMode ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--text-muted)' }}>API Gateway:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontSize: '0.75rem' }} title={awsConfig.apiGatewayUrl}>
                {awsConfig.apiGatewayUrl ? awsConfig.apiGatewayUrl.substring(0, 32) + '...' : 'Not Configured'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cognito Pool:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontSize: '0.75rem' }}>
                {awsConfig.userPoolId || 'Not Configured'}
              </span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Active Database:</span>
            <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>localStorage (Rides)</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        background: 'rgba(5, 6, 11, 0.2)',
        borderBottom: '1px solid var(--border-color)',
        padding: '4px',
        gap: '2px',
        overflowX: 'auto'
      }}>
        {['ALL', 'COGNITO', 'API', 'LAMBDA', 'DYNAMODB'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: filter === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: filter === tab ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Logs View */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontFamily: 'monospace',
        fontSize: '0.75rem'
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '8px' }}>
            <Terminal size={24} />
            <span>No console logs recorded yet.</span>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const borderCol = getServiceColor(log.service);

            return (
              <div 
                key={log.id}
                style={{
                  borderLeft: `3px solid ${borderCol}`,
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '0 6px 6px 0',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  cursor: log.payload ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
                onClick={() => log.payload && toggleLogExpand(log.id)}
                className="console-log-row"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      color: borderCol, 
                      fontWeight: 'bold', 
                      background: `${borderCol}1A`, 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontSize: '0.7rem'
                    }}>
                      {log.service}
                    </span>
                    <span style={{ color: '#fff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{log.message}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <span>{log.timestamp}</span>
                    {log.payload && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                  </div>
                </div>

                {isExpanded && log.payload && (
                  <pre style={{
                    marginTop: '6px',
                    padding: '8px',
                    background: '#040608',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    color: '#34d399',
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                    lineHeight: '1.3'
                  }}>
                    {log.payload}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AwsDevConsole;
