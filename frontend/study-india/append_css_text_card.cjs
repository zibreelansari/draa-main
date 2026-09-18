const fs = require('fs');

const css = `
/* ── Text-Only Institute Card (Requested Design) ── */
.text-only-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  height: 100%;
}

.inst-card-top {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: #f8faff;
  border-bottom: 1px solid #e2e8f0;
}

.inst-icon-box {
  width: 56px;
  height: 56px;
  background: #ffffff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.inst-header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.inst-header-text h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #334155;
  margin: 0;
  line-height: 1.3;
}

.inst-header-text span {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.inst-card-bottom {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.inst-details-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.inst-details-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #475569;
}

.inst-details-list li svg {
  color: #64748b;
  flex-shrink: 0;
}

.inst-card-actions {
  display: flex;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.25rem;
  margin-top: auto;
}

.btn-inst-details {
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
}

.btn-inst-details:hover {
  text-decoration: underline;
}
`;

const filepath = './src/styles.css';
let content = fs.readFileSync(filepath, 'utf8');
if (!content.includes('.text-only-card')) {
  fs.writeFileSync(filepath, content + css);
  console.log('Appended text card CSS');
}
