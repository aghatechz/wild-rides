import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Zap, ShieldCheck, MapPin, Database, ArrowRight, Server, Compass, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  const { user } = useContext(AppContext);

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '80px',
      color: 'var(--text-main)'
    }}>
      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px',
        padding: '40px 0'
      }}>
        <div className="badge badge-primary" style={{ padding: '6px 16px', gap: '6px', fontSize: '0.85rem' }}>
          <Zap size={14} /> Serverless Unicorn Fleet Dispatcher
        </div>
        
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '900',
          lineHeight: '1.1',
          background: 'linear-gradient(135deg, #fff 30%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          maxWidth: '800px',
          letterSpacing: '-0.02em',
          margin: '10px 0'
        }}>
          Unicorns of the Future, <br />
          <span style={{
            background: 'linear-gradient(to right, #00f2fe, #4facfe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Dispatched on Demand.</span>
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          lineHeight: '1.6',
          fontWeight: '300'
        }}>
          Request a ride from legendary mythical beasts. Powered by state-of-the-art serverless architecture to deploy unicorns instantly.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <Link to={user?.isAuthenticated ? "/ride" : "/register"} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>
            {user?.isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'} <ArrowRight size={20} />
          </Link>
          {!user?.isAuthenticated && (
            <Link to="/signin" className="btn-secondary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>
              Sign In
            </Link>
          )}
        </div>
      </section>

      {/* AWS Cloud Architecture Visualization */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '10px' }}>How it Works (AWS Serverless)</h2>
          <p style={{ color: 'var(--text-muted)' }}>Learn how seven AWS services power this end-to-end web application.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {/* Service 1: Web Hosting */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Compass size={24} style={{ color: 'var(--secondary)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>1. Static Hosting</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              The React frontend is served as a static site. When deployed, AWS Amplify handles build pipeline hosting and fast content delivery.
            </p>
          </div>

          {/* Service 2: Cognito Authentication */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>2. Auth (Cognito)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Cognito User Pools authenticate riders, verifying signups via email codes, and securing app routes with signed JSON Web Tokens (JWT).
            </p>
          </div>

          {/* Service 3: API Gateway */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} style={{ color: 'var(--secondary)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>3. Route (API Gateway)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Exposes the HTTPS REST interface. It blocks unauthorized requests using a Cognito Authorizer and routes verified calls to Lambda.
            </p>
          </div>

          {/* Service 4: Lambda & DynamoDB */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.2)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Database size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>4. Backend & DB</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              AWS Lambda matches requests with a unicorn from the fleet and writes ride details to a NoSQL DynamoDB table for permanent audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* Fleet Showcase */}
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between', padding: '40px 0' }}>
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700' }}>Dispatched from our Sacred Stables</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            We recruit only the most noble and swift unicorns. Each is equipped with high-durability horseshoes, star-navigation headbands, and full-spectrum rainbow trails.
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} /> <strong>Shadowfax</strong>: Sleek white stallion, speed-demon, runs on light.</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} /> <strong>Rainbow Dash</strong>: Pegasus variant, flies at mach speeds, trail generator.</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} /> <strong>Rocinante</strong>: Sturdy grey hybrid, highly reliable in bad weather.</li>
          </ul>
        </div>
        
        <div style={{
          flex: '1 1 450px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div className="glass-card glass-card-glow-cyan" style={{
            padding: '40px',
            fontSize: '8rem',
            borderRadius: '24px',
            animation: 'float 3s ease-in-out infinite alternate',
            userSelect: 'none'
          }}>
            🦄
          </div>
          
          <style>{`
            @keyframes float {
              from { transform: translateY(0px) rotate(-3deg); }
              to { transform: translateY(-15px) rotate(3deg); }
            }
          `}</style>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
