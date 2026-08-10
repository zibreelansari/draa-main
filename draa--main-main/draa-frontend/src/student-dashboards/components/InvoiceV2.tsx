import React, { useRef } from'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
  alpha,
  Paper,
  Stack,
  useTheme,
  Tooltip
} from'@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Paid as PaidIcon,
  Business as CompanyIcon,
  Person as UserIcon,
  Receipt as ReceiptIcon,
  CreditCard as PaymentIcon
} from'@mui/icons-material';
import { motion, AnimatePresence } from'framer-motion';
import html2canvas from'html2canvas';
import jsPDF from'jspdf';
import dayjs from'dayjs';

interface InvoiceV2Props {
  open: boolean;
  onClose: () => void;
  purchase: any;
  user: any;
}

const InvoiceV2: React.FC<InvoiceV2Props> = ({ open, onClose, purchase, user }) => {
  const theme = useTheme();
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!purchase) return null;

  const invoiceNumber = `EDU-${purchase._id.slice(-8).toUpperCase()}`;
  const paymentDate = dayjs(purchase.payment_completed_at || purchase.createdAt);
  
  const pricing = purchase.pricing || {};
  const amount = pricing.final_amount ?? 0;
  const originalPrice = pricing.original_price ?? amount;
  const tax = pricing.tax_amount ?? (amount * 0.18); // Default 18% if not specified

  const downloadInvoice = async () => {
    const el = invoiceRef.current;
    if (!el) return;
    
    try {
      const canvas = await html2canvas(el, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor:'#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p','mm','a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData,'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor:'background.paper',
          backgroundImage:'none',
          boxShadow:'0 24px 48px rgba(0,0,0,0.2)',
          maxHeight:'90vh'
        }
      }}
    >
      {/* Action Bar (Not Printed) */}
      <Box 
        sx={{ 
          p: 2, 
          display:'flex', 
          justifyContent:'space-between', 
          alignItems:'center',
          borderBottom:'1px solid',
          borderColor:'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
'@media print': { display:'none' }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color:'text.secondary', display:'flex', alignItems:'center', gap: 1 }}>
          <ReceiptIcon fontSize="small" /> INVOICE PREVIEW
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Print Invoice">
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<PrintIcon />} 
              onClick={handlePrint}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Print
            </Button>
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button 
              size="small" 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              onClick={downloadInvoice}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 700,
                background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              Download
            </Button>
          </Tooltip>
          <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 0, overflowY:'auto' }}>
        <Box 
          id="invoice-printable-area"
          ref={invoiceRef}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            bgcolor:'white', 
            color:'#1a202c',
            fontFamily:"'DM Sans', sans-serif"
          }}
        >
          {/* Header */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 2, 
                    bgcolor:'#6366f1',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color:'white'
                  }}
                >
                  <img src="/EduDocsNewLogo.png" alt="Logo" style={{ width:'80%', height:'80%', objectFit:'contain' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>Draa</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Sabko Padhao  Quality Learning</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color:'text.secondary', maxWidth: 350 }}>
                Building no 1, 3rd floor, opp. Sapna cinema,<br />
                above Bikanervala Community centre, D Block,<br />
                East of Kailash, New Delhi, Delhi 110065
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md:'right' } }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  fontWeight: 900, 
                  color:'primary.main', 
                  letterSpacing: 2,
                  bgcolor: alpha('#6366f1', 0.1),
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  mb: 2,
                  display:'inline-block'
                }}
              >
                Tax Invoice
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, mt: 1 }}>{invoiceNumber}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Issued on {paymentDate.format('MMMM DD, YYYY')}
              </Typography>
              
              <Box 
                sx={{ 
                  display:'inline-flex', 
                  alignItems:'center', 
                  gap: 1, 
                  mt: 2,
                  px: 2,
                  py: 0.75,
                  borderRadius: 10,
                  bgcolor: alpha('#10b981', 0.1),
                  color:'#10b981',
                  border:'1px solid',
                  borderColor: alpha('#10b981', 0.2)
                }}
              >
                <PaidIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>SUCCESSFULLY PAID</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 6 }} />

          {/* Billing Info */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ fontWeight: 800, color:'text.secondary', textTransform:'uppercase', letterSpacing: 1 }}>Bill To</Typography>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{user?.name ||'Student User'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{user?.email ||'user@example.com'}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ fontWeight: 800, color:'text.secondary', textTransform:'uppercase', letterSpacing: 1 }}>Payment Method</Typography>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{purchase.payment_gateway ||'Online Payment'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Order ID: {purchase.gateway_details?.order_id || purchase._id.slice(-10)}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="caption" sx={{ fontWeight: 800, color:'text.secondary', textTransform:'uppercase', letterSpacing: 1 }}>Transaction Details</Typography>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>TXN #{purchase.gateway_details?.payment_id ||'N/A'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{paymentDate.format('MMM DD, YYYY  hh:mm A')}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          {/* Table */}
          <Paper elevation={0} sx={{ border:'1px solid', borderColor:'divider', borderRadius: 3, overflow:'hidden', mb: 4 }}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), display:'flex', borderBottom:'1px solid', borderColor:'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color:'text.secondary', flex: 1, pl: 1 }}>ITEM DESCRIPTION</Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color:'text.secondary', width: 100, textAlign:'center' }}>TYPE</Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color:'text.secondary', width: 80, textAlign:'center' }}>QTY</Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color:'text.secondary', width: 120, textAlign:'right', pr: 1 }}>AMOUNT</Typography>
            </Box>
            <Box sx={{ p: 2, display:'flex', alignItems:'center' }}>
              <Box sx={{ flex: 1, pl: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{purchase.item_details.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{purchase.item_details.category ||'Educational Resource'}</Typography>
              </Box>
              <Box sx={{ width: 100, textAlign:'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 800, 
                    px: 1, 
                    py: 0.25, 
                    borderRadius: 1, 
                    bgcolor: alpha('#6366f1', 0.1), 
                    color:'#6366f1' 
                  }}
                >
                  {purchase.purchase_type.toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ width: 80, textAlign:'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>1</Typography>
              </Box>
              <Box sx={{ width: 120, textAlign:'right', pr: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{amount.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Summary */}
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} md={5}>
              <Stack spacing={1.5}>
                <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color:'text.secondary' }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{originalPrice.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color:'text.secondary' }}>Tax (GST 18%)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Included</Typography>
                </Box>
                {pricing.discount_amount > 0 && (
                  <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color:'text.secondary' }}>Discount</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color:'#10b981' }}>-{pricing.discount_amount.toLocaleString()}</Typography>
                  </Box>
                )}
                <Box 
                  sx={{ 
                    mt: 1, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor:'#0f172a', 
                    color:'#ffffff', // Explicit high contrast white
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, opacity: 0.9, color:'inherit' }}>TOTAL PAID</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color:'inherit' }}>{amount.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          {/* Footer Info */}
          <Box sx={{ mt: 8, pt: 4, borderTop:'1px dashed', borderColor:'divider' }}>
            <Grid container spacing={4} alignItems="flex-end">
              <Grid item xs={12} md={8}>
                <Typography variant="caption" color="text.secondary" sx={{ display:'block', mb: 1, fontWeight: 700, textTransform:'uppercase' }}>Terms & Conditions</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display:'block', maxWidth: 450, lineHeight: 1.5, fontWeight: 500 }}>
                  Thank you for your purchase from Draa. This is a computer-generated invoice and does not require a physical signature. Returns and refunds are subject to our standard policy. For any billing inquiries, please contact our support team.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign:'right' }}>
                <Box 
                  sx={{ 
                    display:'inline-block',
                    p: 1.5,
                    border:'2px solid #10b981',
                    borderRadius: 1,
                    transform:'rotate(-3deg)',
                    color:'#10b981',
                    fontWeight: 900,
                    textTransform:'uppercase',
                    letterSpacing: 2,
                    fontSize:'0.9rem'
                  }}
                >
                  Paid & Confirmed
                </Box>
                <Typography variant="caption" sx={{ display:'block', mt: 2, color:'text.disabled', fontWeight: 600 }}>
                  REF: TXN-{purchase.gateway_details?.payment_id?.slice(-8).toUpperCase() || purchase._id.slice(-8).toUpperCase()}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-printable-area, #invoice-printable-area * { visibility: visible !important; }
          #invoice-printable-area { position: absolute; left: 0; top: 0; width: 100% !important; background: white !important; }
          .MuiDialog-container { display: block !important; }
          .MuiPaper-root { position: absolute; left: 0; top: 0; width: 100% !important; max-width: none !important; box-shadow: none !important; border: none !important; background: white !important; }
        }
      `}</style>
    </Dialog>
  );
};

export default InvoiceV2;
