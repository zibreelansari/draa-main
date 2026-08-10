import React, { useState } from'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  alpha,
  Paper,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination as MuiPagination,
  MenuItem,
  Select
} from'@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  LocalLibrary as BookIcon,
  PlayCircleOutline as CourseIcon,
  Quiz as TestIcon,
  Stars as PlanIcon,
  CheckCircle as PaidIcon,
  CalendarMonth as CalendarIcon
} from'@mui/icons-material';
import { motion } from'framer-motion';
import { usePurchaseHistory, Purchase } from'../../hooks/usePurchaseHistory';
import DashboardLayout from'../../layouts/DashboardLayout';
import InvoiceV2 from'../../components/InvoiceV2';
import dayjs from'dayjs';
import EmptyState from'../../components/EmptyState';
import DashboardLoader from'../../components/DashboardLoader';
import usePageTitle from '../../../hooks/usePageTitle';

const PurchaseHistory: React.FC = () => {
  const { purchases, pagination, loading, filter, setFilter, page, setPage } = usePurchaseHistory();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  usePageTitle('Purchase History | Draa');
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const totalSpent = purchases.reduce((acc, p) => acc + p.pricing.final_amount, 0);

  const getSourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case'course': return <CourseIcon sx={{ fontSize: 20 }} />;
      case'book':
      case'ebook': return <BookIcon sx={{ fontSize: 20 }} />;
      case'test_series': return <TestIcon sx={{ fontSize: 20 }} />;
      case'subscription': return <PlanIcon sx={{ fontSize: 20 }} />;
      default: return <ReceiptIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getSourceColor = (type: string) => {
    switch (type.toLowerCase()) {
      case'course': return'#6366f1';
      case'book':
      case'ebook': return'#10b981';
      case'test_series': return'#f59e0b';
      case'subscription': return'#ec4899';
      default: return'#64748b';
    }
  };

  const handleOpenInvoice = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setInvoiceOpen(true);
  };

  if (loading && purchases.length === 0) {
    return (
      <DashboardLayout>
        <DashboardLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color:'#6366f1', width: 40, height: 40 }}>
                <ReceiptIcon sx={{ fontSize: 22 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>Purchase History</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
              Review your orders, download invoices, and track your subscriptions.
            </Typography>
          </Box>
          <Paper sx={{ px: 3, py: 1.5, borderRadius: 2, display:'flex', alignItems:'baseline', gap: 2, bgcolor: alpha('#6366f1', 0.04), border:'1px solid', borderColor: alpha('#6366f1', 0.08) }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color:'text.secondary', textTransform:'uppercase', letterSpacing: 0.5 }}>Total Spent</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color:'#6366f1' }}>{totalSpent.toLocaleString()}</Typography>
          </Paper>
        </Box>

        {/* Filters */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 4, overflowX:'auto', pb: 1,'&::-webkit-scrollbar': { display:'none' } }}>
          {[
            { key:'all', label:'All Orders' },
            { key:'course', label:'Courses' },
            { key:'book', label:'Books' },
            { key:'test_series', label:'Tests' },
            { key:'subscription', label:'Plans' },
          ].map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              onClick={() => setFilter(f.key)}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                px: 1.5,
                bgcolor: filter === f.key ?'primary.main' :'background.paper',
                color: filter === f.key ?'white' :'text.primary',
                border:'1px solid',
                borderColor: filter === f.key ?'primary.main' :'divider',
'&:hover': { bgcolor: filter === f.key ?'primary.dark' : alpha('#6366f1', 0.08) },
              }}
            />
          ))}
        </Stack>

        {/* Content Card */}
        {purchases.length === 0 ? (
          <EmptyState
            type="no-purchases"
            size="large"
            title="No Purchases Found"
            description="You haven't made any purchases yet. Explore our offerings and start learning today!"
            actionLabel="Browse Courses"
            onAction={() => window.location.href ='/courses'}
          />
        ) : (
          <Card sx={{ overflow:'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: alpha('#6366f1', 0.04) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }}>ORDER DETAILS</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }}>TYPE</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="center">DATE</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="center">STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="right">AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize:'0.75rem', letterSpacing: 0.5, color:'text.secondary' }} align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchases.map((purchase, idx) => (
                    <TableRow
                      key={purchase._id}
                      component={motion.tr}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      sx={{
'&:hover': { bgcolor: alpha('#6366f1', 0.03) },
                        cursor:'pointer',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
                          <Avatar
                            variant="rounded"
                            src={purchase.item_details.image}
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: alpha(getSourceColor(purchase.purchase_type), 0.1),
                              color: getSourceColor(purchase.purchase_type),
                            }}
                          >
                            {getSourceIcon(purchase.purchase_type)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.3 }}>
                              {purchase.item_details.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Order #{purchase._id.slice(-8).toUpperCase()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={purchase.purchase_type.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize:'0.6rem',
                            bgcolor: alpha(getSourceColor(purchase.purchase_type), 0.08),
                            color: getSourceColor(purchase.purchase_type),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {dayjs(purchase.createdAt).format('MMM DD, YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {dayjs(purchase.createdAt).format('hh:mm A')}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<PaidIcon sx={{ fontSize:'1rem !important' }} />}
                          label="PAID"
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: alpha('#10b981', 0.08),
                            color:'#10b981',
'& .MuiChip-icon': { color:'#10b981' },
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color:'#0f172a' }}>
                          {purchase.pricing.final_amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download Invoice">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleOpenInvoice(purchase); }}
                            sx={{
                              bgcolor: alpha('#6366f1', 0.06),
                              color:'#6366f1',
'&:hover': { bgcolor: alpha('#6366f1', 0.12), color:'#4f46e5' },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Box sx={{ display:'flex', justifyContent:'center', mt: 4 }}>
            <MuiPagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
              variant="outlined"
              shape="rounded"
              sx={{'& .MuiPaginationItem-root': { fontWeight: 700 } }}
            />
          </Box>
        )}

        {selectedPurchase && (
          <InvoiceV2
            open={invoiceOpen}
            onClose={() => setInvoiceOpen(false)}
            purchase={selectedPurchase}
            user={JSON.parse(localStorage.getItem('edudocs') ||'{}')}
          />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default PurchaseHistory;