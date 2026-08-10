import React, { useEffect, useState, useCallback } from 'react';
import {
  Layout, Table, Tag, Button, Select, Space, Typography, Card, Statistic,
  Row, Col, Tooltip, Modal, Input, message, Divider, Badge, Descriptions,
  Popconfirm,
} from 'antd';
import {
  FlagOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EyeOutlined, ReloadOutlined, FilterOutlined, SearchOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined, SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import url from '../../url';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import usePageTitle from '../../hooks/usePageTitle';

dayjs.extend(relativeTime);

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Types ───────────────────────────────────────────────────────────────────

interface IssueReport {
  _id: string;
  reportedBy?: { _id: string; name: string; email: string };
  reporterName: string;
  reporterEmail: string;
  testSeriesId?: { _id: string; title: string };
  testSeriesTitle: string;
  attemptId: string;
  questionId: string;
  questionNumber: number;
  questionText: string;
  issueType: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  adminNote: string;
  resolvedAt?: string;
  createdAt: string;
}

interface Stats {
  open: number;
  under_review: number;
  resolved: number;
  dismissed: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ISSUE_TYPE_LABELS: Record<string, string> = {
  wrong_answer: 'Wrong Answer',
  wrong_explanation: 'Wrong Explanation',
  typo_in_question: 'Typo in Question',
  typo_in_options: 'Typo in Options',
  image_not_loading: 'Image Not Loading',
  other: 'Other',
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  open: { color: 'volcano', icon: <ExclamationCircleOutlined />, label: 'Open' },
  under_review: { color: 'processing', icon: <SyncOutlined spin />, label: 'Under Review' },
  resolved: { color: 'success', icon: <CheckCircleOutlined />, label: 'Resolved' },
  dismissed: { color: 'default', icon: <CloseCircleOutlined />, label: 'Dismissed' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const QuestionIssuesDashboard: React.FC = () => {
  usePageTitle('Question Issue Reports');

  const [reports, setReports] = useState<IssueReport[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>({ open: 0, under_review: 0, resolved: 0, dismissed: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('edudocs') || '{}')?.token; } catch { return ''; }
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const res = await fetch(`${url}/student/test-series/attempt/admin/question-issues?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
        setTotal(data.total);
        setStats(data.stats);
      } else {
        message.error(data.message || 'Failed to load reports');
      }
    } catch {
      message.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateReport = async (reportId: string, patch: { status?: string; adminNote?: string }) => {
    setUpdating(true);
    try {
      const res = await fetch(`${url}/student/test-series/attempt/admin/question-issues/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (data.success) {
        message.success('Report updated successfully');
        fetchReports();
        if (selectedReport?._id === reportId) {
          setSelectedReport({ ...selectedReport, ...patch, status: (patch.status as any) || selectedReport.status });
        }
      } else {
        message.error(data.message || 'Update failed');
      }
    } catch {
      message.error('Network error.');
    } finally {
      setUpdating(false);
    }
  };

  const openDetail = (record: IssueReport) => {
    setSelectedReport(record);
    setAdminNote(record.adminNote || '');
    setDetailModalOpen(true);
  };

  // ─── Table columns ────────────────────────────────────────────────────────

  const columns = [
    {
      title: 'Q#',
      dataIndex: 'questionNumber',
      width: 60,
      render: (n: number) => <Text strong>#{n}</Text>,
    },
    {
      title: 'Test Series',
      dataIndex: 'testSeriesTitle',
      ellipsis: true,
      render: (title: string, rec: IssueReport) => (
        <Tooltip title={title}>
          <Text>{rec.testSeriesId?.title || title || '—'}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Question',
      dataIndex: 'questionText',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text style={{ maxWidth: 260, display: 'block' }} ellipsis>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Issue Type',
      dataIndex: 'issueType',
      render: (t: string) => <Tag color="orange">{ISSUE_TYPE_LABELS[t] || t}</Tag>,
    },
    {
      title: 'Reported By',
      dataIndex: 'reporterName',
      render: (name: string, rec: IssueReport) => (
        <Space direction="vertical" size={0}>
          <Text strong>{rec.reportedBy?.name || name || '—'}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{rec.reportedBy?.email || rec.reporterEmail}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.open;
        return <Badge status={s === 'open' ? 'error' : s === 'under_review' ? 'processing' : s === 'resolved' ? 'success' : 'default'} text={<Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>} />;
      },
    },
    {
      title: 'Reported',
      dataIndex: 'createdAt',
      render: (d: string) => <Tooltip title={dayjs(d).format('DD MMM YYYY, hh:mm A')}><Text type="secondary">{dayjs(d).fromNow()}</Text></Tooltip>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: any, rec: IssueReport) => (
        <Space wrap>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(rec)}>View</Button>
          {rec.status === 'open' && (
            <Popconfirm title="Mark as Under Review?" onConfirm={() => updateReport(rec._id, { status: 'under_review' })}>
              <Button size="small" type="primary" ghost icon={<SyncOutlined />}>Review</Button>
            </Popconfirm>
          )}
          {rec.status !== 'resolved' && rec.status !== 'dismissed' && (
            <Popconfirm title="Mark as Resolved?" onConfirm={() => updateReport(rec._id, { status: 'resolved' })}>
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', border: 'none' }}>Resolve</Button>
            </Popconfirm>
          )}
          {rec.status !== 'dismissed' && rec.status !== 'resolved' && (
            <Popconfirm title="Dismiss this report?" onConfirm={() => updateReport(rec._id, { status: 'dismissed' })}>
              <Button size="small" danger icon={<CloseCircleOutlined />}>Dismiss</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Content style={{ margin: '16px', padding: '0 8px' }}>
          {/* Header */}
          <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                <FlagOutlined style={{ marginRight: 10, color: '#ff4d4f' }} />
                Question Issue Reports
              </Title>
              <Text type="secondary">Student-reported problems with test questions</Text>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={fetchReports} loading={loading}>
                Refresh
              </Button>
            </Col>
          </Row>

          {/* Stat Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { key: 'open', label: 'Open', color: '#ff4d4f', icon: <ExclamationCircleOutlined /> },
              { key: 'under_review', label: 'Under Review', color: '#1890ff', icon: <SyncOutlined /> },
              { key: 'resolved', label: 'Resolved', color: '#52c41a', icon: <CheckCircleOutlined /> },
              { key: 'dismissed', label: 'Dismissed', color: '#8c8c8c', icon: <CloseCircleOutlined /> },
            ].map(({ key, label, color, icon }) => (
              <Col xs={12} sm={6} key={key}>
                <Card
                  hoverable
                  style={{ borderTop: `4px solid ${color}`, cursor: 'pointer', borderRadius: 8 }}
                  onClick={() => { setStatusFilter(key); setPage(1); }}
                >
                  <Statistic
                    title={<Space>{icon}<span>{label}</span></Space>}
                    value={stats[key as keyof Stats]}
                    valueStyle={{ color }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Filter bar */}
          <Card style={{ marginBottom: 16, borderRadius: 8 }}>
            <Row gutter={16} align="middle">
              <Col>
                <FilterOutlined style={{ marginRight: 8 }} />
                <Text strong>Filter by Status:</Text>
              </Col>
              <Col>
                <Select
                  value={statusFilter}
                  onChange={(val) => { setStatusFilter(val); setPage(1); }}
                  style={{ width: 180 }}
                >
                  <Option value="all">All Reports</Option>
                  <Option value="open">Open</Option>
                  <Option value="under_review">Under Review</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="dismissed">Dismissed</Option>
                </Select>
              </Col>
              <Col flex="auto" />
              <Col>
                <Text type="secondary">Total: <Text strong>{total}</Text> reports</Text>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Card style={{ borderRadius: 8 }}>
            <Table
              columns={columns}
              dataSource={reports}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total,
                onChange: setPage,
                showSizeChanger: false,
                showTotal: (t) => `Total ${t} reports`,
              }}
              scroll={{ x: 1100 }}
              rowClassName={(rec) => rec.status === 'open' ? 'issue-row-open' : ''}
            />
          </Card>

          {/* Detail + Action Modal */}
          <Modal
            open={detailModalOpen}
            onCancel={() => setDetailModalOpen(false)}
            title={
              <Space>
                <FlagOutlined style={{ color: '#ff4d4f' }} />
                <span>Issue Report — Q#{selectedReport?.questionNumber}</span>
                {selectedReport && (
                  <Tag color={STATUS_CONFIG[selectedReport.status]?.color}>
                    {STATUS_CONFIG[selectedReport.status]?.label}
                  </Tag>
                )}
              </Space>
            }
            width={760}
            footer={null}
          >
            {selectedReport && (
              <>
                <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
                  <Descriptions.Item label="Test Series">
                    {selectedReport.testSeriesId?.title || selectedReport.testSeriesTitle || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Question #">
                    Q{selectedReport.questionNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Question Text">
                    {selectedReport.questionText}
                  </Descriptions.Item>
                  <Descriptions.Item label="Issue Type">
                    <Tag color="orange">{ISSUE_TYPE_LABELS[selectedReport.issueType] || selectedReport.issueType}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Student Description">
                    {selectedReport.description || <Text type="secondary">None provided</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reported By">
                    {selectedReport.reportedBy?.name || selectedReport.reporterName} ({selectedReport.reportedBy?.email || selectedReport.reporterEmail})
                  </Descriptions.Item>
                  <Descriptions.Item label="Reported At">
                    {dayjs(selectedReport.createdAt).format('DD MMM YYYY, hh:mm A')} ({dayjs(selectedReport.createdAt).fromNow()})
                  </Descriptions.Item>
                  {selectedReport.resolvedAt && (
                    <Descriptions.Item label="Resolved At">
                      {dayjs(selectedReport.resolvedAt).format('DD MMM YYYY, hh:mm A')}
                    </Descriptions.Item>
                  )}
                  {selectedReport.adminNote && (
                    <Descriptions.Item label="Previous Admin Note">
                      {selectedReport.adminNote}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <Divider orientation="left">Admin Note & Status Update</Divider>

                <TextArea
                  rows={3}
                  placeholder="Add a note (e.g. 'Fixed in question bank', 'Will update explanation')..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  maxLength={500}
                  showCount
                  style={{ marginBottom: 16 }}
                />

                <Row gutter={8} justify="end">
                  <Col>
                    <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
                  </Col>
                  <Col>
                    <Button
                      loading={updating}
                      onClick={() => updateReport(selectedReport._id, { adminNote })}
                    >
                      Save Note
                    </Button>
                  </Col>
                  {selectedReport.status !== 'under_review' && (
                    <Col>
                      <Button
                        type="primary" ghost
                        icon={<SyncOutlined />}
                        loading={updating}
                        onClick={() => updateReport(selectedReport._id, { status: 'under_review', adminNote })}
                      >
                        Mark Under Review
                      </Button>
                    </Col>
                  )}
                  {selectedReport.status !== 'resolved' && (
                    <Col>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={updating}
                        style={{ background: '#52c41a', border: 'none' }}
                        onClick={() => updateReport(selectedReport._id, { status: 'resolved', adminNote })}
                      >
                        Mark Resolved
                      </Button>
                    </Col>
                  )}
                  {selectedReport.status !== 'dismissed' && selectedReport.status !== 'resolved' && (
                    <Col>
                      <Popconfirm title="Dismiss this issue report?" onConfirm={() => { updateReport(selectedReport._id, { status: 'dismissed', adminNote }); setDetailModalOpen(false); }}>
                        <Button danger icon={<CloseCircleOutlined />} loading={updating}>
                          Dismiss
                        </Button>
                      </Popconfirm>
                    </Col>
                  )}
                </Row>
              </>
            )}
          </Modal>
        </Content>
      </Layout>

      <style>{`
        .issue-row-open {
          background: #fff2f0 !important;
        }
        .issue-row-open:hover > td {
          background: #ffe0d8 !important;
        }
      `}</style>
    </Layout>
  );
};

export default QuestionIssuesDashboard;
