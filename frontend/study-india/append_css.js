import fs from 'fs';

const css = `
/* ==========================================================================
   MODAL AND WIZARD STYLES (COURSE DETAILS & APPLY)
   ========================================================================== */

/* ── Course Dialog (Quick View) ── */
.course-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

.course-dialog-container {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

.course-dialog-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.course-dialog-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.course-dialog-header {
  padding: 2.5rem 2.5rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
}

.course-dialog-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--teal-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.scholarship-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #fff7ed;
  color: #ea580c;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid #ffedd5;
}

.course-dialog-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  margin-bottom: 1rem;
}

.course-dialog-institution {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  font-size: 0.95rem;
}

.course-dialog-institution strong {
  color: #1e293b;
}

.course-dialog-body {
  padding: 2.5rem;
}

.course-dialog-facts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.course-dialog-fact {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.course-dialog-fact small {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.course-dialog-fact strong {
  font-size: 1.05rem;
  color: #0f172a;
}

.course-dialog-tuition-strip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-dialog-tuition-strip small {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.dual-price {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.price-usd {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.price-sep {
  color: #cbd5e1;
}

.price-inr {
  font-size: 1.25rem;
  font-weight: 600;
  color: #64748b;
}

.scholarship-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 600;
  background: #f0fdf4;
  padding: 0.75rem;
  border-radius: 8px;
}

.course-dialog-section {
  margin-bottom: 2rem;
}

.course-dialog-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.course-dialog-section p {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
}

.course-dialog-bullet-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.course-dialog-bullet-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.5;
}

.course-dialog-bullet-list li svg {
  margin-top: 0.15rem;
  flex-shrink: 0;
}

.course-dialog-footer {
  padding: 1.5rem 2.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-dialog-apply {
  flex: 1;
  background: var(--orange-600);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dialog-apply:hover {
  background: var(--orange-700);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(234, 88, 12, 0.4);
}

.btn-dialog-cancel {
  padding: 1rem 1.5rem;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-dialog-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ── Admission Wizard ── */
.admission-wizard-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

.admission-wizard-dialog {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 800px;
  height: 90vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.admission-wizard-header {
  padding: 2rem 2.5rem;
  background: #0f172a;
  color: white;
  position: relative;
}

.admission-header-info {
  padding-right: 3rem;
}

.admission-header-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #cbd5e1;
  letter-spacing: 1px;
  margin-bottom: 0.75rem;
}

.admission-header-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.admission-header-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #94a3b8;
  flex-wrap: wrap;
}

.fee-pill {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  color: white;
  font-weight: 500;
}

.admission-wizard-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.admission-wizard-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.admission-steps-tracker {
  display: flex;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  gap: 1rem;
  overflow-x: auto;
}

.tracker-step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: all 0.3s;
  white-space: nowrap;
}

.tracker-step.current {
  opacity: 1;
}

.tracker-step.completed {
  opacity: 1;
}

.tracker-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #cbd5e1;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tracker-step.current .tracker-circle {
  background: var(--teal-600);
  box-shadow: 0 0 0 3px rgba(11, 101, 93, 0.2);
}

.tracker-step.completed .tracker-circle {
  background: #16a34a;
}

.tracker-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.tracker-step.current .tracker-label {
  color: var(--teal-700);
}

.tracker-step.completed .tracker-label {
  color: #0f172a;
}

.admission-wizard-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wizard-step-pane {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem;
  animation: fadeIn 0.3s ease-out;
}

.wizard-notice-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  padding: 1.25rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.wizard-notice-box strong {
  display: block;
  color: var(--teal-800);
  margin-bottom: 0.25rem;
}

.wizard-notice-box p {
  color: var(--teal-700);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.wizard-form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.wizard-form-row > * {
  flex: 1;
}

.wizard-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.wizard-form-field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.wizard-form-field .req {
  color: #dc2626;
}

.wizard-form-field input,
.wizard-form-field select,
.wizard-form-field textarea {
  padding: 0.875rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  color: #0f172a;
  background: #ffffff;
  transition: all 0.2s;
  font-family: inherit;
}

.wizard-form-field input:focus,
.wizard-form-field select:focus,
.wizard-form-field textarea:focus {
  outline: none;
  border-color: var(--teal-500);
  box-shadow: 0 0 0 3px rgba(11, 101, 93, 0.1);
}

.wizard-scholarship-card {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.wizard-scholarship-card .card-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #9a3412;
  font-size: 1.1rem;
}

.wizard-scholarship-card p {
  color: #c2410c;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.scholarship-checkbox,
.declaration-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.scholarship-checkbox input,
.declaration-checkbox input {
  margin-top: 0.25rem;
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--orange-600);
}

.scholarship-checkbox span {
  font-weight: 600;
  color: #9a3412;
}

.declaration-checkbox span {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
}

.wizard-summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed #cbd5e1;
}

.summary-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-row span {
  color: #64748b;
  font-size: 0.95rem;
}

.summary-row strong {
  color: #0f172a;
  font-size: 0.95rem;
  text-align: right;
  max-width: 60%;
}

.admission-wizard-error {
  margin: 1rem 2.5rem 0;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.admission-wizard-footer {
  padding: 1.5rem 2.5rem;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-wizard-back,
.btn-wizard-cancel {
  padding: 0.875rem 1.5rem;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-wizard-back:hover,
.btn-wizard-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-wizard-next,
.btn-wizard-submit {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-wizard-next {
  background: #0f172a;
  color: white;
}

.btn-wizard-next:hover {
  background: #1e293b;
}

.btn-wizard-submit {
  background: var(--orange-600);
  color: white;
}

.btn-wizard-submit:hover:not(:disabled) {
  background: var(--orange-700);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(234, 88, 12, 0.4);
}

.btn-wizard-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Success Screen */
.admission-success-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.success-icon-wrap {
  width: 96px;
  height: 96px;
  background: #f0fdf4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 0 10px rgba(22, 163, 74, 0.1);
}

.success-badge {
  background: #1e293b;
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  letter-spacing: 1px;
  margin-bottom: 1.25rem;
}

.success-heading {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
}

.success-desc {
  font-size: 1.1rem;
  color: #475569;
  max-width: 600px;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.success-ref-card {
  display: flex;
  gap: 2rem;
  background: #f8fafc;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
  margin-bottom: 3rem;
}

.success-ref-card .ref-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.success-ref-card .ref-item small {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.success-ref-card .ref-item strong {
  font-size: 1.1rem;
  color: #0f172a;
}

.next-steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
  max-width: 600px;
  width: 100%;
  margin-bottom: 3rem;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
}

.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.timeline-item.done .timeline-dot {
  background: #16a34a;
  color: white;
}

.timeline-item.active .timeline-dot {
  background: var(--teal-600);
  color: white;
  box-shadow: 0 0 0 4px rgba(11, 101, 93, 0.2);
}

.timeline-item strong {
  display: block;
  font-size: 1.05rem;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.timeline-item p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.btn-wizard-finish {
  background: #0f172a;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-wizard-finish:hover {
  background: #1e293b;
  transform: translateY(-2px);
}
`;

const filepath = './src/styles.css';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('.course-dialog-backdrop')) {
  content += css;
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Successfully appended CSS');
} else {
  console.log('CSS already exists');
}
