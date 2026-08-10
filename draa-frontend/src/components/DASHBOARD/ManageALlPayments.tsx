import React, { useEffect, useState } from"react";
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  message,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Drawer,
  Descriptions,
  Typography,
  Tooltip,
  Badge,
  Modal,
  Form,
  InputNumber,
  Spin,
  Alert,
  Progress,
  Divider
} from"antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  ReloadOutlined,
  TrophyOutlined,
  CreditCardOutlined,
  BankOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined
} from"@ant-design/icons";
import { useNavigate } from"react-router-dom";
import dayjs from'dayjs';
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import { getAuthHeaders } from"../../utils/global_auth";
import usePageTitle from '../../hooks/usePageTitle';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  AreaChart
} from"recharts";

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface PaymentStats {
  overview: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalTransactions: number;
    successfulTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    avgOrderValue: number;
    successRate: number;
  };
  purchaseTypes: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  monthlyTrend: Array<{
    _id: { year: number; month: number };
    revenue: number;
    count: number;
  }>;
  gatewayStats: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
}

interface Payment {
  id: string;

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  item: {
    name: string;
    type: string;
    category: string;
  };

  financial: {
    originalPrice: number;
    finalAmount: number;
    discountAmount: number;
    currency: string;
  };

  payment: {
    gateway: string;
    status: string;
    orderId: string;
    paymentId: string;
  };

  status: string;

  purchaseDate: string;
  completedDate: string;
  invoiceNumber: string;

  delivery?: {
    required: boolean;
    status: string;
    courier?: string;
    tracking_id?: string;
    tracking_url?: string;
  };
}

interface TopSellingItem {
  itemId: string;
  name: string;
  type: string;
  category: string;
  totalSales: number;
  totalRevenue: number;
  avgPrice: number;
}

const PaymentManagement: React.FC = () => {
  usePageTitle('All Payments | Admin');
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    purchase_type:'all',
    payment_status:'all',
    status:'all',
    payment_gateway:'all',
    customer_name:'',
    date_range: null as any,
    amount_range: [null, null] as [number | null, number | null]
  });

  // Drawer states
  const [paymentDrawer, setPaymentDrawer] = useState({
    visible: false,
    data: null as any
  });

  // Modal states
  const [statusModal, setStatusModal] = useState({
    visible: false,
    payment: null as Payment | null
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    purchaseTypes: [],
    paymentGateways: [],
    paymentStatuses: [],
    statuses: []
  });

  const [form] = Form.useForm();

  //  Chart Data Preparation 
  const CHART_COLORS = ['#4a59f8','#52c41a','#ff4d4f','#faad14','#722ed1','#13c2c2','#eb2f96','#fa8c16'];

  const statusPieData = stats ? [
    { name:'Successful', value: stats.overview.successfulTransactions, color:'#52c41a' },
    { name:'Pending', value: stats.overview.pendingTransactions, color:'#faad14' },
    { name:'Failed', value: stats.overview.failedTransactions, color:'#ff4d4f' }
  ].filter(d => d.value > 0) : [];

  const purchaseTypePieData = stats?.purchaseTypes.map((item, i) => ({
    name: item._id,
    value: item.revenue,
    count: item.count,
    color: CHART_COLORS[i % CHART_COLORS.length]
  })) || [];

  const monthlyBarData = stats?.monthlyTrend.map(item => ({
    month: dayjs().month(item._id.month - 1).format('MMM'),
    year: item._id.year,
    revenue: item.revenue,
    count: item.count
  })) || [];

  const gatewayBarData = stats?.gatewayStats.map(item => ({
    name: item._id,
    revenue: item.revenue,
    count: item.count
  })) || [];

  //  Custom Tooltip 
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius: 8, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ margin: 0, color: p.color, fontSize: 13 }}>
            {p.name}: {p.name.includes('Revenue') || p.name ==='revenue'
              ? `${p.value.toLocaleString('en-IN')}`
              : p.value}
          </p>
        ))}
      </div>
    );
  };

  //  Pie Label 
  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) =>
    `${name} ${(percent * 100).toFixed(0)}%`;

  // Check authentication
  useEffect(() => {
    if (!localStorage.getItem("edudocs")) {
      message.warning("Please log in first");
      navigate("/admin-login");
    }
  }, [navigate]);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadPayments();
  }, [filters, pagination.current, pagination.pageSize]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadPayments(),
        loadTopSellingItems(),
        loadFilterOptions()
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      const errorMsg = error.response?.data?.message || error.message ||'Failed to load payment data';
      // Only show message if it's not a 401 (handled globally)
      if (error.response?.status !== 401) {
        message.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await fetch(`${url}/admin/payments/dashboard/stats`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadPayments = async () => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => {
            if (value ==='all' || value ==='' || value === null) return false;
            if (Array.isArray(value) && value.every(v => v === null)) return false;
            return true;
          }).map(([key, value]) => {
            if (key ==='date_range' && value) {
              return [
                ['date_from', value[0].format('YYYY-MM-DD')],
                ['date_to', value[1].format('YYYY-MM-DD')]
              ];
            }
            if (key ==='amount_range') {
              const result = [];
              if (value[0] !== null) result.push(['min_amount', value[0].toString()]);
              if (value[1] !== null) result.push(['max_amount', value[1].toString()]);
              return result;
            }
            return [[key, value.toString()]];
          }).flat()
        )
      });

      const response = await fetch(`${url}/admin/payments/payments?${params}`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data.payments);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error loading payments:', error);
      const errorMsg = error.response?.data?.message || error.message ||'Failed to load payments';
      if (error.response?.status !== 401) {
        message.error(errorMsg);
      }
    } finally {
      setTableLoading(false);
    }
  };

  const loadTopSellingItems = async () => {
    try {
      const response = await fetch(`${url}/admin/payments/top-selling?limit=10`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (data.success) {
        setTopSellingItems(data.data);
      }
    } catch (error) {
      console.error('Error loading top selling items:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const response = await fetch(`${url}/admin/payments/filters`, { headers: getAuthHeaders() });
      const data = await response.json();
      
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      purchase_type:'all',
      payment_status:'all',
      status:'all',
      payment_gateway:'all',
      customer_name:'',
      date_range: null,
      amount_range: [null, null]
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
'paid':'success',
'completed':'success',
'pending':'processing',
'initiated':'default',
'failed':'error',
'cancelled':'error',
'refunded':'warning',
'unpaid':'default'
    };
    return statusColors[status] ||'default';
  };

  const getPaymentGatewayIcon = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case'razorpay': return'';
      case'stripe': return'';
      case'paypal': return'';
      default: return'';
    }
  };

  const columns = [
    {
      title:'Customer',
      key:'customer',
      width: 200,
      render: (record: Payment) => (
        <div>
          <Text strong style={{ display:'block' }}>{record.customer.name}</Text>
          <Text type="secondary" style={{ fontSize:'12px' }}>{record.customer.email}</Text>
        </div>
      )
    },
    {
      title:'Item',
      key:'item',
      width: 250,
      render: (record: Payment) => (
        <div>
          <Text strong style={{ display:'block' }}>{record.item.name}</Text>
          <Space size={4}>
            <Tag size="small" color="blue">{record.item.type}</Tag>
            {record.item.category && (
              <Tag size="small" color="purple">{record.item.category}</Tag>
            )}
          </Space>
        </div>
      )
    },
    {
      title:'Amount',
      key:'amount',
      width: 120,
      render: (record: Payment) => (
        <div>
          <Text strong style={{ color:'#52c41a' }}>
            {record.financial.finalAmount.toLocaleString('en-IN')}
          </Text>
          {record.financial.discountAmount > 0 && (
            <Text type="secondary" style={{ display:'block', fontSize:'12px' }}>
              Discount: {record.financial.discountAmount}
            </Text>
          )}
        </div>
      )
    },
    {
      title:'Payment',
      key:'payment',
      width: 150,
      render: (record: Payment) => (
        <div>
          <Space size={4}>
            <span>{getPaymentGatewayIcon(record.payment.gateway)}</span>
            <Text style={{ textTransform:'capitalize' }}>{record.payment.gateway}</Text>
          </Space>
          <div style={{ marginTop:'4px' }}>
            <Tag color={getStatusColor(record.payment.status)} size="small">
              {record.payment.status.toUpperCase()}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title:'Status',
      key:'status',
      width: 100,
      render: (record: Payment) => (
        <Tag color={getStatusColor(record.status)}>
          {record.status.toUpperCase()}
        </Tag>
      )
    },
    {
      title:'Date',
      key:'date',
      width: 120,
      render: (record: Payment) => (
        <div>
          <Text style={{ display:'block', fontSize:'12px' }}>
            {dayjs(record.purchaseDate).format('DD MMM YYYY')}
          </Text>
          <Text type="secondary" style={{ fontSize:'11px' }}>
            {dayjs(record.purchaseDate).format('HH:mm')}
          </Text>
        </div>
      )
    },
   {
  title:"Delivery",
  key:"delivery",
  width: 140,
  render: (record: Payment) => {

    // Digital products
    if (record.item.type !=="book") {
      return <Tag color="default">Digital</Tag>;
    }

    const status = record.delivery?.status ||"pending";

    const statusColor: any = {
      pending:"default",
      packed:"processing",
      shipped:"blue",
      out_for_delivery:"purple",
      delivered:"success"
    };

    return (
      <Tag color={statusColor[status]}>
        {status.toUpperCase()}
      </Tag>
    );
  }
},
    {
      title:'Actions',
      key:'actions',
      width: 120,
      render: (record: Payment) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setPaymentDrawer({ visible: true, data: record })}
            />
          </Tooltip>
          <Tooltip title="Edit Status">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => setStatusModal({ visible: true, payment: record })}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const topSellingColumns = [
    {
      title:'Item',
      key:'item',
      render: (record: TopSellingItem) => (
        <div>
          <Text strong>{record.name}</Text>
          <div style={{ marginTop:'4px' }}>
            <Tag size="small" color="blue">{record.type}</Tag>
            {record.category && <Tag size="small" color="purple">{record.category}</Tag>}
          </div>
        </div>
      )
    },
    {
      title:'Sales',
      dataIndex:'totalSales',
      key:'sales',
      width: 80,
      render: (value: number) => <Text strong>{value}</Text>
    },
    {
      title:'Revenue',
      dataIndex:'totalRevenue',
      key:'revenue',
      width: 120,
      render: (value: number) => (
        <Text strong style={{ color:'#52c41a' }}>
          {value.toLocaleString('en-IN')}
        </Text>
      )
    },
    {
      title:'Avg Price',
      dataIndex:'avgPrice',
      key:'avgPrice',
      width: 100,
      render: (value: number) => (
        <Text>{value.toLocaleString('en-IN')}</Text>
      )
    }
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight:"100vh" }}>
        <Topbar />
        <Layout>
          <Sidebar />
          <Layout style={{ padding:"16px" }}>
            <Content style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'400px' }}>
              <div style={{ textAlign:'center' }}>
                <Spin size="large" />
                <Title level={4} style={{ marginTop:'16px', color:'#666' }}>
                  Loading Payment Management...
                </Title>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight:"100vh" }}>
      <Topbar />
      <Layout>
        <Sidebar />
        <Layout style={{ padding:"16px" }}>
          <Content>
            {/* Header */}
            <div style={{ marginBottom:'24px' }}>
              <Title level={2} style={{ margin: 0 }}>
                 Payment Management
              </Title>
              <Text type="secondary">
                Monitor and manage all payment transactions across your platform
              </Text>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom:'24px' }}>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ borderRadius:'8px' }}>
                  <Statistic
                    title="Total Revenue"
                    value={stats?.overview.totalRevenue || 0}
                    prefix={<DollarOutlined style={{ color:'#52c41a' }} />}
                    formatter={(value) => `${Number(value).toLocaleString('en-IN')}`}
                    valueStyle={{ color:'#52c41a' }}
                  />
                  <div style={{ marginTop:'8px' }}>
                    <Text type="secondary" style={{ fontSize:'12px' }}>
                      Monthly: {(stats?.overview.monthlyRevenue || 0).toLocaleString('en-IN')}
                    </Text>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card style={{ borderRadius:'8px' }}>
                  <Statistic
                    title="Total Transactions"
                    value={stats?.overview.totalTransactions || 0}
                    prefix={<ShoppingCartOutlined style={{ color:'#1890ff' }} />}
                    valueStyle={{ color:'#1890ff' }}
                  />
                  <div style={{ marginTop:'8px' }}>
                    <Progress 
                      percent={stats?.overview.successRate || 0} 
                      size="small" 
                      status="active"
                      format={(percent) => `${percent}% success`}
                    />
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card style={{ borderRadius:'8px' }}>
                  <Statistic
                    title="Successful"
                    value={stats?.overview.successfulTransactions || 0}
                    prefix={<CheckCircleOutlined style={{ color:'#52c41a' }} />}
                    valueStyle={{ color:'#52c41a' }}
                  />
                  <div style={{ marginTop:'8px' }}>
                    <Text type="secondary" style={{ fontSize:'12px' }}>
                      Pending: {stats?.overview.pendingTransactions || 0}
                    </Text>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card style={{ borderRadius:'8px' }}>
                  <Statistic
                    title="Avg Order Value"
                    value={stats?.overview.avgOrderValue || 0}
                    prefix={<LineChartOutlined style={{ color:'#722ed1' }} />}
                    formatter={(value) => `${Number(value).toLocaleString('en-IN')}`}
                    valueStyle={{ color:'#722ed1' }}
                  />
                  <div style={{ marginTop:'8px' }}>
                    <Text type="secondary" style={{ fontSize:'12px' }}>
                      Failed: {stats?.overview.failedTransactions || 0}
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]} style={{ marginBottom:'24px' }}>
              {/* Payment Status Pie Chart */}
              <Col xs={24} md={8}>
                <Card
                  title={
                    <Space>
                      <LineChartOutlined style={{ color:'#4a59f8' }} />
                      <Text strong>Payment Status Distribution</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ borderRadius:'8px' }}
                >
                  {statusPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                          paddingAngle={3}
                          label={renderPieLabel}
                          labelLine={false}
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [value, name]}
                          contentStyle={{ borderRadius: 8, border:'1px solid #e8e8e8' }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          iconSize={8}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign:'center', color:'#999', padding:'60px 0' }}>
                      No data available
                    </div>
                  )}
                  <div style={{ textAlign:'center', marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Total: {stats?.overview.totalTransactions || 0} transactions
                    </Text>
                  </div>
                </Card>
              </Col>

              {/* Monthly Revenue Bar Chart */}
              <Col xs={24} md={8}>
                <Card
                  title={
                    <Space>
                      <LineChartOutlined style={{ color:'#4a59f8' }} />
                      <Text strong>Monthly Revenue Trend</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ borderRadius:'8px' }}
                >
                  {monthlyBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={monthlyBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4a59f8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4a59f8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke:'#e8e8e8' }}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#4a59f8"
                          strokeWidth={2}
                          fill="url(#revenueGradient)"
                          dot={{ fill:'#4a59f8', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign:'center', color:'#999', padding:'60px 0' }}>
                      No monthly data available
                    </div>
                  )}
                  <div style={{ textAlign:'center', marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Monthly: {(stats?.overview.monthlyRevenue || 0).toLocaleString('en-IN')}
                    </Text>
                  </div>
                </Card>
              </Col>

              {/* Purchase Type Pie Chart */}
              <Col xs={24} md={8}>
                <Card
                  title={
                    <Space>
                      <ShoppingCartOutlined style={{ color:'#4a59f8' }} />
                      <Text strong>Revenue by Purchase Type</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ borderRadius:'8px' }}
                >
                  {purchaseTypePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={purchaseTypePieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                          paddingAngle={3}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {purchaseTypePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString('en-IN')}`,
                            name
                          ]}
                          contentStyle={{ borderRadius: 8, border:'1px solid #e8e8e8' }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => (
                            <span style={{ color:'#333', fontSize: 12 }}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign:'center', color:'#999', padding:'60px 0' }}>
                      No purchase type data available
                    </div>
                  )}
                  <div style={{ textAlign:'center', marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Total: {(stats?.overview.totalRevenue || 0).toLocaleString('en-IN')}
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Second Charts Row */}
            <Row gutter={[16, 16]} style={{ marginBottom:'24px' }}>
              {/* Transactions Count Bar */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <BankOutlined style={{ color:'#4a59f8' }} />
                      <Text strong>Monthly Transaction Count</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ borderRadius:'8px' }}
                >
                  {monthlyBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={monthlyBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke:'#e8e8e8' }}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="count"
                          name="Transactions"
                          fill="#4a59f8"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign:'center', color:'#999', padding:'40px 0' }}>
                      No data available
                    </div>
                  )}
                </Card>
              </Col>

              {/* Payment Gateway Bar */}
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CreditCardOutlined style={{ color:'#4a59f8' }} />
                      <Text strong>Revenue by Payment Gateway</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ borderRadius:'8px' }}
                >
                  {gatewayBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={gatewayBarData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          tickLine={false}
                          axisLine={{ stroke:'#e8e8e8' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          width={80}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          fill="#52c41a"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign:'center', color:'#999', padding:'40px 0' }}>
                      No gateway data available
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
            <Card style={{ marginBottom:'24px', borderRadius:'8px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={4}>
                  <Input
                    placeholder="Search customer..."
                    prefix={<SearchOutlined />}
                    value={filters.customer_name}
                    onChange={(e) => handleFilterChange('customer_name', e.target.value)}
                    allowClear
                  />
                </Col>

                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Purchase Type"
                    value={filters.purchase_type}
                    onChange={(value) => handleFilterChange('purchase_type', value)}
                    style={{ width:'100%' }}
                  >
                    <Option value="all">All Types</Option>
                    {filterOptions.purchaseTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Payment Status"
                    value={filters.payment_status}
                    onChange={(value) => handleFilterChange('payment_status', value)}
                    style={{ width:'100%' }}
                  >
                    <Option value="all">All Status</Option>
                    {filterOptions.paymentStatuses.map(status => (
                      <Option key={status} value={status}>
                        <Tag color={getStatusColor(status)} size="small">
                          {status.toUpperCase()}
                        </Tag>
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={4}>
                  <Select
                    placeholder="Gateway"
                    value={filters.payment_gateway}
                    onChange={(value) => handleFilterChange('payment_gateway', value)}
                    style={{ width:'100%' }}
                  >
                    <Option value="all">All Gateways</Option>
                    {filterOptions.paymentGateways.map(gateway => (
                      <Option key={gateway} value={gateway}>
                        {getPaymentGatewayIcon(gateway)} {gateway}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={4}>
                  <RangePicker
                    style={{ width:'100%' }}
                    value={filters.date_range}
                    onChange={(dates) => handleFilterChange('date_range', dates)}
                    placeholder={['Start Date','End Date']}
                  />
                </Col>

                <Col xs={24} sm={12} md={4}>
                  <Space>
                    <Button 
                      type="default"
                      icon={<FilterOutlined />}
                      onClick={clearFilters}
                    >
                      Clear
                    </Button>
                    <Button 
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={loadPayments}
                      loading={tableLoading}
                    >
                      Refresh
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Row gutter={[16, 16]}>
              {/* Payments Table */}
              <Col xs={24} lg={16}>
                <Card 
                  title={
                    <Space>
                      <CreditCardOutlined />
                      <Text strong>All Transactions</Text>
                      <Badge count={pagination.total} overflowCount={999} />
                    </Space>
                  } 
                  bordered={false}
                  style={{ borderRadius:'8px' }}
                  extra={
                    <Button icon={<DownloadOutlined />} type="link">
                      Export
                    </Button>
                  }
                >
                  <Table
                    dataSource={payments}
                    columns={columns}
                    loading={tableLoading}
                    pagination={{
                      current: pagination.current,
                      pageSize: pagination.pageSize,
                      total: pagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} transactions`,
                      onChange: (page, pageSize) => {
                        setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 50 }));
                      }
                    }}
                    scroll={{ x: 1200 }}
                    size="small"
                    rowKey="id"
                  />
                </Card>
              </Col>

              {/* Top Selling Items */}
              <Col xs={24} lg={8}>
                <Card 
                  title={
                    <Space>
                      <TrophyOutlined style={{ color:'#faad14' }} />
                      <Text strong>Top Selling Items</Text>
                    </Space>
                  }
                  bordered={false}
                  style={{ borderRadius:'8px' }}
                >
                  <Table
                    dataSource={topSellingItems}
                    columns={topSellingColumns}
                    pagination={false}
                    size="small"
                    rowKey="itemId"
                  />
                </Card>
              </Col>
            </Row>

            {/* Payment Details Drawer */}
           <Drawer
title="Payment Details"
placement="right"
onClose={() => setPaymentDrawer({ visible: false, data: null })}
open={paymentDrawer.visible}
width={600}

>

{paymentDrawer.data && ( <div> <Descriptions column={1} bordered size="small">
<Descriptions.Item label="Customer Name">
{paymentDrawer.data.customer.name}
</Descriptions.Item>


    <Descriptions.Item label="Email">
      {paymentDrawer.data.customer.email}
    </Descriptions.Item>

    <Descriptions.Item label="Phone">
      {paymentDrawer.data.customer.phone ||"N/A"}
    </Descriptions.Item>

    <Descriptions.Item label="Item">
      {paymentDrawer.data.item.name}
    </Descriptions.Item>

    <Descriptions.Item label="Category">
      <Tag color="purple">
        {paymentDrawer.data.item.category ||"N/A"}
      </Tag>
    </Descriptions.Item>

    <Descriptions.Item label="Amount">
      <Text strong style={{ color:"#52c41a" }}>
        {paymentDrawer.data.financial.finalAmount.toLocaleString("en-IN")}
      </Text>
    </Descriptions.Item>

    <Descriptions.Item label="Payment Gateway">
      {getPaymentGatewayIcon(paymentDrawer.data.payment.gateway)}{""}
      {paymentDrawer.data.payment.gateway}
    </Descriptions.Item>

    <Descriptions.Item label="Payment Status">
      <Tag color={getStatusColor(paymentDrawer.data.payment.status)}>
        {paymentDrawer.data.payment.status.toUpperCase()}
      </Tag>
    </Descriptions.Item>

    <Descriptions.Item label="Order ID">
      {paymentDrawer.data.payment.orderId}
    </Descriptions.Item>

    <Descriptions.Item label="Payment ID">
      {paymentDrawer.data.payment.paymentId ||"N/A"}
    </Descriptions.Item>

    <Descriptions.Item label="Purchase Date">
      {dayjs(paymentDrawer.data.purchaseDate).format(
"DD MMM YYYY HH:mm"
      )}
    </Descriptions.Item>

    {paymentDrawer.data.completedDate && (
      <Descriptions.Item label="Completed Date">
        {dayjs(paymentDrawer.data.completedDate).format(
"DD MMM YYYY HH:mm"
        )}
      </Descriptions.Item>
    )}

    {/* DELIVERY SECTION (ONLY FOR BOOK PURCHASES) */}

    {paymentDrawer.data.item.type ==="book" && (
      <>
        <Divider orientation="left">Delivery Details</Divider>

        <Descriptions.Item label="Delivery Status">
          <Tag color="blue">
            {(paymentDrawer.data.delivery?.status ||"pending").toUpperCase()}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Courier">
          {paymentDrawer.data.delivery?.courier ||"Not Assigned"}
        </Descriptions.Item>

        <Descriptions.Item label="Tracking ID">
          {paymentDrawer.data.delivery?.tracking_id ||"N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Tracking URL">
          {paymentDrawer.data.delivery?.tracking_url ? (
            <a
              href={paymentDrawer.data.delivery.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Track Package
            </a>
          ) : (
"N/A"
          )}
        </Descriptions.Item>
      </>
    )}
  </Descriptions>
</div>


)} </Drawer>

            {/* Status Update Modal */}
           <Modal
title="Update Payment Status"
open={statusModal.visible}
onCancel={() => setStatusModal({ visible: false, payment: null })}
onOk={() => form.submit()}

>

{statusModal.payment && (
<Form
form={form}
layout="vertical"
onFinish={async (values) => {
try {

      const response = await fetch(
        `${url}/admin/payments/payments/${statusModal.payment!.id}/status`,
        {
          method:"PUT",
          headers: { 
"Content-Type":"application/json",
            ...getAuthHeaders() 
          },
          body: JSON.stringify(values)
        }
      );

      const data = await response.json();

      if (data.success) {

        if (values.delivery_status) {
          await fetch(
            `${url}/admin/payments/payments/${statusModal.payment!.id}/delivery`,
            {
              method:"PUT",
              headers: { 
"Content-Type":"application/json",
                ...getAuthHeaders() 
              },
              body: JSON.stringify({
                status: values.delivery_status,
                courier: values.courier,
                tracking_id: values.tracking_id,
                tracking_url: values.tracking_url
              })
            }
          );
        }

        message.success("Payment updated");

        setStatusModal({ visible: false, payment: null });

        loadPayments();
      }

    } catch (err) {
      message.error("Update failed");
    }
  }}
  initialValues={{
    status: statusModal.payment.status,
    payment_status: statusModal.payment.payment.status
  }}
>

  <Form.Item label="Payment Status" name="payment_status">
    <Select>
      {filterOptions.paymentStatuses.map(status => (
        <Option key={status} value={status}>
          <Tag color={getStatusColor(status)} size="small">
            {status.toUpperCase()}
          </Tag>
        </Option>
      ))}
    </Select>
  </Form.Item>

  <Form.Item label="Order Status" name="status">
    <Select>
      {filterOptions.statuses.map(status => (
        <Option key={status} value={status}>
          <Tag color={getStatusColor(status)} size="small">
            {status.toUpperCase()}
          </Tag>
        </Option>
      ))}
    </Select>
  </Form.Item>

  <Form.Item label="Internal Notes" name="internal_notes">
    <Input.TextArea rows={3} placeholder="Add internal notes..." />
  </Form.Item>

  {statusModal.payment?.item.type ==="book" && (
    <>
      <Divider orientation="left">Delivery Management</Divider>

      <Form.Item label="Delivery Status" name="delivery_status">
        <Select>
          <Option value="pending">Pending</Option>
          <Option value="packed">Packed</Option>
          <Option value="shipped">Shipped</Option>
          <Option value="out_for_delivery">Out for Delivery</Option>
          <Option value="delivered">Delivered</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Courier" name="courier">
        <Input placeholder="Delhivery / BlueDart / DTDC" />
      </Form.Item>

      <Form.Item label="Tracking ID" name="tracking_id">
        <Input placeholder="Tracking Number" />
      </Form.Item>

      <Form.Item label="Tracking URL" name="tracking_url">
        <Input placeholder="Tracking Link" />
      </Form.Item>
    </>
  )}

</Form>

)} </Modal>

           
          </Content>

          <Footer style={{ textAlign:"center" }}>
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} md={8}>
                <h4>About Us</h4>
                <p>
                  We provide high-quality services and ensure customer
                  satisfaction with innovative solutions.
                </p>
              </Col>
              <Col xs={24} md={8}>
                <h4>Quick Links</h4>
                <div style={{ display:"flex", justifyContent:"center", gap: 16 }}>
                  <a href="/">Home</a>
                  <a href="/about">About</a>
                  <a href="/services">Services</a>
                  <a href="/contact">Contact</a>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <h4>Follow Us</h4>
                <div style={{ display:"flex", gap: 8, justifyContent:"center" }}>
                  <a href="#">FB</a>
                  <a href="#">Twitter</a>
                  <a href="#">Instagram</a>
                  <a href="#">LinkedIn</a>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <b>© 2026 Draa. All Rights Reserved.</b>
            </div>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default PaymentManagement;
