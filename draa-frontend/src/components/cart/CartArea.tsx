import React, { useEffect, useState } from"react";
import toast from '../../utils/toast';
import { Button, Card, Divider, Empty, Tag, InputNumber, Tooltip } from"antd";
import { 
  DeleteOutlined, 
  LockOutlined, 
  QuestionCircleOutlined,
  ShoppingOutlined,
  PlusOutlined,
  MinusOutlined,
  SafetyCertificateOutlined,
  TruckOutlined
} from"@ant-design/icons";
import { useNavigate } from"react-router-dom";
import { getImageUrl } from"../../url";
import { getCartKey, getUserRole } from"../../utils/global_auth";
import StylishEmptyState from"../common/StylishEmptyState";
import ImgWithFallback from"../common/ImgWithFallback";
import"./cart.css";

interface CartItem {
  cartItemId: string;
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  finalPrice: number;
  quantity: number;
}

export default function CartArea() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);


  useEffect(() => {
    const storedCart = localStorage.getItem(getCartKey());
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  const saveToStorage = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem(getCartKey(), JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const updateQuantity = (bookId: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.bookId === bookId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveToStorage(updated);
  };

  const removeItem = (bookId: string) => {
    const updated = cartItems.filter((i) => i.bookId !== bookId);
    saveToStorage(updated);
    toast.success("Item removed from cart");
  };

  // const subtotal = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const subtotal = cartItems.reduce(
  (sum, item) => sum + item.finalPrice * item.quantity,
  0
);
  // const deliveryFee = 100;
  // const freeDeliveryThreshold = 1000;
  // const isFreeDelivery = subtotal >= freeDeliveryThreshold;

  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <StylishEmptyState 
          title="Your cart feels lonely"
          description="Looks like you haven't added any books to your collection yet. Start exploring our premium library to find your next great read!"
          actionText="Start Shopping"
          actionPath="/books"
          showBack={false}
        />
      </div>
    );
  }

  return (
    <div style={styles.pageBackground}>
      <div style={styles.contentWrapper}>
        {/* Items List */}

        <div style={styles.mainGrid}>
          {/* Left: Items List */}
          <div style={{ flex:"1 1 700px" }}>
            {cartItems.map((item) => (
              <Card key={item.cartItemId} style={styles.itemCard} hoverable>
                <div className="cart-item-wrapper">
                  <div className="cart-item-image">
                    <ImgWithFallback
                      src={getImageUrl(item.coverImage)}
                      alt={item.title}
                      style={styles.bookImage}
                    />
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <div className="cart-item-info">
                        <h3 style={styles.bookTitle}>{item.title}</h3>
                        <p style={styles.authorText}>By {item.author ||'Academic Expert'}</p>
                      </div>
                      <div className="cart-item-price-block">
                        <div style={styles.priceText}>{item.finalPrice * item.quantity}</div>
                        <div style={styles.unitPrice}>{item.finalPrice} / unit</div>
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <div style={styles.qtyControls}>
                        <Button 
                          icon={<MinusOutlined />} 
                          size="small" 
                          onClick={() => updateQuantity(item.bookId, -1)} 
                          disabled={item.quantity <= 1}
                        />
                        <span style={styles.qtyDisplay}>{item.quantity}</span>
                        <Button 
                          icon={<PlusOutlined />} 
                          size="small" 
                          onClick={() => updateQuantity(item.bookId, 1)} 
                        />
                      </div>
                      
                      <Tooltip title="Remove Item">
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => removeItem(item.bookId)}
                          className="cart-remove-btn"
                        >
                          <span>Remove</span>
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Right: Summary */}
          <div style={{ flex:"1 1 350px" }}>
            <Card style={styles.summaryCard}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>
              
              {/* Delivery Progress */}
              {/* <div style={styles.deliveryStatus}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {isFreeDelivery ?' Free Delivery Unlocked!' : `Add ${freeDeliveryThreshold - subtotal} for Free Delivery`}
                  </span>
                  <TruckOutlined style={{ color: isFreeDelivery ?'#52c41a' :'#bfbfbf' }} />
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ 
                    ...styles.progressBarFill, 
                    width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%`,
                    backgroundColor: isFreeDelivery ?'#52c41a' :'var(--primary)'
                  }} />
                </div>
              </div> */}

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{subtotal}</span>
              </div>
              
              {/* <div style={styles.summaryRow}>
                <span>Estimated Delivery</span>
                <span style={{ color: isFreeDelivery ?'#52c41a' :'inherit' }}>
                   {isFreeDelivery ?'FREE' : `+ ${deliveryFee}`}
                </span>
              </div> */}

              <Divider style={{ margin:'16px 0' }} />

              <div style={styles.totalRow}>
                <span>Total Amount</span>
                {/* <span>{isFreeDelivery ? subtotal : subtotal + deliveryFee}</span> */}
                <span>{subtotal}</span>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<LockOutlined />}
                style={styles.checkoutBtn}
                onClick={() => {
                  const role = getUserRole();
                  if (role ==='TEACHER' || role ==='ADMIN') {
                    return toast.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to checkout. This feature is reserved for students.`);
                  }
                  navigate("/checkout");
                }}
              >
                Proceed to Checkout
              </Button>

              <div style={styles.secureBadge}>
                <SafetyCertificateOutlined /> 100% Secure Transaction
              </div>
            </Card>

            <div style={styles.helpSection}>
              <QuestionCircleOutlined style={{ fontSize: 24, color:'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 700 }}>Need Assistance?</div>
                <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Call us at - 080760 03728</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageBackground: {
    backgroundColor:"#f8fafc",
    minHeight:"100vh",
    padding:"60px 20px"
  },
  contentWrapper: {
    maxWidth:"var(--container)",
    margin:"0 auto"
  },
  mainTitle: {
    fontSize:"2.5rem",
    fontWeight: 900,
    color:"var(--text-main)",
    margin: 0,
    letterSpacing:"-1px"
  },
  breadcrumb: {
    color:"var(--text-muted)",
    fontSize:"14px",
    marginTop:"8px"
  },
  mainGrid: {
    display:"flex",
    gap:"32px",
    flexWrap:"wrap"
  },
  itemCard: {
    marginBottom:"20px",
    borderRadius:"var(--radius)",
    border:"1px solid var(--border)",
    boxShadow:"var(--shadow-sm)",
    overflow:"hidden"
  },
  itemFlex: {
    display:"flex",
    gap:"24px"
  },
  imageWrapper: {
    boxShadow:"0 10px 20px rgba(0,0,0,0.1)",
    borderRadius:"8px",
    overflow:"hidden"
  },
  bookImage: {
    width:"110px",
    height:"150px",
    objectFit:"cover",
    display:"block"
  },
  bookTitle: {
    fontSize:"1.2rem",
    fontWeight: 700,
    margin:"0 0 4px 0",
    color:"var(--text-main)"
  },
  authorText: {
    color:"var(--text-muted)",
    fontSize:"14px",
    marginBottom:"20px"
  },
  priceText: {
    fontSize:"1.4rem",
    fontWeight: 800,
    color:"var(--text-main)"
  },
  unitPrice: {
    fontSize:"12px",
    color:"var(--text-muted)"
  },
  actionRow: {
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginTop:"auto"
  },
  qtyControls: {
    display:"flex",
    alignItems:"center",
    background:"#f1f5f9",
    padding:"4px",
    borderRadius:"8px",
    gap:"12px"
  },
  qtyDisplay: {
    fontWeight: 700,
    minWidth:"20px",
    textAlign:"center"
  },
  summaryCard: {
    borderRadius:"16px",
    border:"none",
    boxShadow:"0 20px 25px -5px rgba(0,0,0,0.1)",
    position:"sticky",
    top:"40px"
  },
  summaryTitle: {
    fontSize:"1.25rem",
    fontWeight: 800,
    marginBottom:"24px"
  },
  deliveryStatus: {
    background:"#f8fafc",
    padding:"12px",
    borderRadius:"10px",
    marginBottom:"20px"
  },
  progressBarBg: {
    height:"6px",
    background:"#e2e8f0",
    borderRadius:"3px",
    overflow:"hidden"
  },
  progressBarFill: {
    height:"100%",
    transition:"width 0.4s ease"
  },
  summaryRow: {
    display:"flex",
    justifyContent:"space-between",
    marginBottom:"12px",
    color:"var(--text-muted)"
  },
  totalRow: {
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:"24px",
    fontSize:"1.2rem",
    fontWeight: 800,
    color:"var(--text-main)"
  },
  checkoutBtn: {
    height:"55px",
    borderRadius:"12px",
    fontSize:"16px",
    fontWeight: 700,
    backgroundColor:"var(--primary)",
    boxShadow:"0 10px 15px -3px rgba(94, 107, 255, 0.3)"
  },
  secureBadge: {
    textAlign:"center",
    marginTop:"16px",
    fontSize:"12px",
    color:"#94a3b8",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    gap:"6px"
  },
  helpSection: {
    marginTop:"24px",
    display:"flex",
    alignItems:"center",
    gap:"16px",
    padding:"20px",
    background:"white",
    borderRadius:"16px",
    border:"1px dashed var(--border)"
  },
  emptyContainer: {
    padding:"120px 20px",
    textAlign:"center",
    backgroundColor:"#f8fafc",
    minHeight:"90vh",
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
  }
};