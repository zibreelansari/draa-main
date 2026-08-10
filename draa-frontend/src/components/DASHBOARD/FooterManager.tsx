import React, { useEffect, useState } from"react";
import {
  Layout, Button, Modal, Form, Input, Select,
  InputNumber, Switch, message, Popconfirm, Tag, Tooltip
} from"antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  LinkOutlined, EyeOutlined, CloseOutlined,
  CheckCircleOutlined, StopOutlined, AppstoreOutlined,
  GlobalOutlined, NodeIndexOutlined, ArrowUpOutlined
} from"@ant-design/icons";
import Sidebar from"./Sidebar";
import Topbar from"./Topbar";
import url from"../../url";
import usePageTitle from '../../hooks/usePageTitle';
import"./FooterManager.css";

const { Content } = Layout;
const { Option } = Select;

/*  helpers  */
const getToken = () => JSON.parse(localStorage.getItem("edudocs") ||"{}").token ||"";

const LINK_TYPE_META: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  topic:    { color:"#5E6BFF", label:"Topic",    icon: <NodeIndexOutlined /> },
  internal: { color:"#16a34a", label:"Internal", icon: <AppstoreOutlined /> },
  external: { color:"#d97706", label:"External", icon: <GlobalOutlined /> },
};

/* 
   MAIN COMPONENT
 */
const FooterManager: React.FC = () => {
  usePageTitle('Footer Manager | Admin');
  const [sections, setSections]     = useState<any[]>([]);
  const [loading,  setLoading]      = useState(false);
  const [preview,  setPreview]      = useState(false);

  /* section modal */
  const [sectionModal, setSectionModal]     = useState(false);
  const [editSection,  setEditSection]      = useState<any>(null);
  const [sectionForm]                       = Form.useForm();

  /* link modal */
  const [linkModal,      setLinkModal]      = useState(false);
  const [editLink,       setEditLink]       = useState<any>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [linkForm]                          = Form.useForm();

  /* expanded sections */
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => { fetchSections(); }, []);

  /*  FETCH  */
  const fetchSections = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${url}/admin/footer/sections`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
        setExpanded(new Set(data.data.map((s: any) => s._id)));
      } else {
        message.error("Failed to load footer data");
      }
    } catch {
      message.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  /*  SECTION CRUD  */
  const submitSection = async (values: any) => {
    const endpoint = editSection
      ? `${url}/admin/footer/sections/${editSection._id}`
      : `${url}/admin/footer/sections`;
    const method = editSection ?"PUT" :"POST";
    try {
      const res  = await fetch(endpoint, {
        method,
        headers: {"Content-Type":"application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        message.success(editSection ?"Section updated!" :"Section created!");
        setSectionModal(false);
        fetchSections();
      } else { message.error(data.message); }
    } catch { message.error("Operation failed"); }
  };

  const deleteSection = async (id: string) => {
    try {
      const res  = await fetch(`${url}/admin/footer/sections/${id}`, {
        method:"DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) { message.success("Section deleted"); fetchSections(); }
      else message.error(data.message);
    } catch { message.error("Error deleting section"); }
  };

  /*  LINK CRUD  */
  const submitLink = async (values: any) => {
    const base = `${url}/admin/footer/sections/${activeSectionId}/links`;
    const endpoint = editLink ? `${base}/${editLink._id}` : base;
    const method   = editLink ?"PUT" :"POST";
    try {
      const res  = await fetch(endpoint, {
        method,
        headers: {"Content-Type":"application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        message.success(editLink ?"Link updated!" :"Link added!");
        setLinkModal(false);
        fetchSections();
      } else { message.error(data.message); }
    } catch { message.error("Operation failed"); }
  };

  const deleteLink = async (sectionId: string, linkId: string) => {
    try {
      const res  = await fetch(`${url}/admin/footer/sections/${sectionId}/links/${linkId}`, {
        method:"DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) { message.success("Link removed"); fetchSections(); }
      else message.error(data.message);
    } catch { message.error("Error deleting link"); }
  };

  /*  helpers  */
  const openSectionModal = (section?: any) => {
    setEditSection(section || null);
    sectionForm.resetFields();
    if (section) sectionForm.setFieldsValue(section);
    else sectionForm.setFieldsValue({ isActive: true, order: 0 });
    setSectionModal(true);
  };

  const openLinkModal = (sectionId: string, link?: any) => {
    setActiveSectionId(sectionId);
    setEditLink(link || null);
    linkForm.resetFields();
    if (link) linkForm.setFieldsValue(link);
    else linkForm.setFieldsValue({ linkType:"topic", isActive: true, order: 0 });
    setLinkModal(true);
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* stats */
  const totalLinks  = sections.reduce((acc, s) => acc + (s.links?.length || 0), 0);
  const activeSecs  = sections.filter(s => s.isActive).length;
  const activeLinks = sections.reduce((acc, s) => acc + (s.links || []).filter((l: any) => l.isActive).length, 0);

  /* 
     RENDER
   */
  return (
    <Layout style={{ minHeight:"100vh", background:"#f5f6fa" }}>
      <Topbar />
      <Layout>
        <Sidebar />
        <Layout style={{ padding:"28px 28px 60px", background:"#f5f6fa" }}>
          <Content style={{ maxWidth: 1200, margin:"0 auto", width:"100%" }}>

            {/*  PAGE HEADER  */}
            <div className="fm-page-header">
              <div className="fm-header-left">
                <div className="fm-header-icon">
                  <AppstoreOutlined />
                </div>
                <div>
                  <h1 className="fm-page-title">Footer Manager</h1>
                  <p className="fm-page-sub">Manage footer sections &amp; deep-link navigation for the live website</p>
                </div>
              </div>
              <div className="fm-header-actions">
                <button className="fm-btn-preview" onClick={() => setPreview(true)}>
                  <EyeOutlined /> Live Preview
                </button>
                <button className="fm-btn-primary" onClick={() => openSectionModal()}>
                  <PlusOutlined /> New Section
                </button>
              </div>
            </div>

            {/*  STATS ROW  */}
            <div className="fm-stats-row">
              {[
                { label:"Total Sections",    value: sections.length,  clr:"#5E6BFF", bg:"#eef0ff" },
                { label:"Active Sections",   value: activeSecs,       clr:"#16a34a", bg:"#dcfce7" },
                { label:"Total Links",       value: totalLinks,       clr:"#d97706", bg:"#fef3c7" },
                { label:"Active Links",      value: activeLinks,      clr:"#dc2626", bg:"#fee2e2" },
              ].map(s => (
                <div className="fm-stat-card" key={s.label} style={{ borderTop: `3px solid ${s.clr}` }}>
                  <div className="fm-stat-value" style={{ color: s.clr }}>{s.value}</div>
                  <div className="fm-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/*  SECTIONS  */}
            {loading ? (
              <div className="fm-skeleton-wrap">
                {[1,2,3].map(i => <div key={i} className="fm-skeleton-card" />)}
              </div>
            ) : sections.length === 0 ? (
              <div className="fm-empty-state">
                <AppstoreOutlined className="fm-empty-icon" />
                <h3>No footer sections yet</h3>
                <p>Create your first section to start building the footer navigation.</p>
                <button className="fm-btn-primary" onClick={() => openSectionModal()}>
                  <PlusOutlined /> Create First Section
                </button>
              </div>
            ) : (
              <div className="fm-sections-list">
                {[...sections].sort((a, b) => a.order - b.order).map(section => (
                  <div key={section._id} className={`fm-section-card ${!section.isActive ?'inactive' :''}`}>

                    {/* Section header row */}
                    <div className="fm-section-header">
                      <button
                        className="fm-expand-btn"
                        onClick={() => toggleExpand(section._id)}
                        aria-label="toggle"
                      >
                        <span className={`fm-chevron ${expanded.has(section._id) ?'open' :''}`}></span>
                      </button>

                      <div className="fm-section-meta">
                        <span className="fm-section-title">{section.title}</span>
                        <div className="fm-section-badges">
                          <span className="fm-badge-order">#{section.order}</span>
                          <span className={`fm-badge-status ${section.isActive ?'active' :'inactive'}`}>
                            {section.isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                            {section.isActive ?'Active' :'Inactive'}
                          </span>
                          <span className="fm-badge-count">
                            <LinkOutlined /> {section.links?.length || 0} links
                          </span>
                        </div>
                      </div>

                      <div className="fm-section-actions">
                        <Tooltip title="Add Link">
                          <button
                            className="fm-action-btn add"
                            onClick={() => { openLinkModal(section._id); if (!expanded.has(section._id)) toggleExpand(section._id); }}
                          >
                            <PlusOutlined /> Add Link
                          </button>
                        </Tooltip>
                        <Tooltip title="Edit Section">
                          <button className="fm-action-btn edit" onClick={() => openSectionModal(section)}>
                            <EditOutlined />
                          </button>
                        </Tooltip>
                        <Popconfirm
                          title="Delete this section and all its links?"
                          onConfirm={() => deleteSection(section._id)}
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                        >
                          <button className="fm-action-btn delete">
                            <DeleteOutlined />
                          </button>
                        </Popconfirm>
                      </div>
                    </div>

                    {/* Links list */}
                    {expanded.has(section._id) && (
                      <div className="fm-links-area">
                        {(!section.links || section.links.length === 0) ? (
                          <div className="fm-no-links">
                            <LinkOutlined /> No links yet {""}
                            <button className="fm-inline-add" onClick={() => openLinkModal(section._id)}>
                              add the first link
                            </button>
                          </div>
                        ) : (
                          <div className="fm-links-grid">
                            {[...section.links].sort((a, b) => a.order - b.order).map((link: any) => {
                              const meta = LINK_TYPE_META[link.linkType] || LINK_TYPE_META.internal;
                              return (
                                <div key={link._id} className={`fm-link-chip ${!link.isActive ?'dim' :''}`}>
                                  <span className="fm-link-type-dot" style={{ background: meta.color }}>
                                    {meta.icon}
                                  </span>
                                  <div className="fm-link-info">
                                    <span className="fm-link-label">{link.label}</span>
                                    <span className="fm-link-url">{link.url}</span>
                                  </div>
                                  <div className="fm-link-right">
                                    <span
                                      className="fm-link-type-tag"
                                      style={{ color: meta.color, background: `${meta.color}18` }}
                                    >
                                      {meta.label}
                                    </span>
                                    {!link.isActive && (
                                      <span className="fm-link-off-tag">Off</span>
                                    )}
                                    <Tooltip title="Edit link">
                                      <button
                                        className="fm-link-action edit"
                                        onClick={() => openLinkModal(section._id, link)}
                                      >
                                        <EditOutlined />
                                      </button>
                                    </Tooltip>
                                    <Popconfirm
                                      title="Remove this link?"
                                      onConfirm={() => deleteLink(section._id, link._id)}
                                      okText="Remove"
                                      okButtonProps={{ danger: true }}
                                    >
                                      <button className="fm-link-action delete">
                                        <DeleteOutlined />
                                      </button>
                                    </Popconfirm>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </Content>
        </Layout>
      </Layout>

      {/*  SECTION MODAL  */}
      <Modal
        title={
          <div className="fm-modal-title">
            <span className="fm-modal-icon" style={{ background:"#eef0ff", color:"#5E6BFF" }}>
              <AppstoreOutlined />
            </span>
            {editSection ?"Edit Section" :"Create New Section"}
          </div>
        }
        open={sectionModal}
        onCancel={() => setSectionModal(false)}
        footer={null}
        width={460}
        centered
      >
        <Form form={sectionForm} layout="vertical" onFinish={submitSection} style={{ marginTop: 8 }}>
          <Form.Item name="title" label="Section Title" rules={[{ required: true, message:"Title is required" }]}>
            <Input size="large" placeholder="e.g., UPSC / PCS" prefix={<AppstoreOutlined style={{ color:"#c0c0c0" }} />} />
          </Form.Item>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
            <Form.Item name="order" label="Display Order">
              <InputNumber min={0} size="large" style={{ width:"100%" }} prefix={<ArrowUpOutlined />} />
            </Form.Item>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                style={{ marginTop: 4 }}
              />
            </Form.Item>
          </div>
          <div className="fm-modal-footer">
            <button type="button" className="fm-btn-ghost" onClick={() => setSectionModal(false)}>
              Cancel
            </button>
            <button type="submit" className="fm-btn-primary">
              {editSection ?"Save Changes" :"Create Section"}
            </button>
          </div>
        </Form>
      </Modal>

      {/*  LINK MODAL  */}
      <Modal
        title={
          <div className="fm-modal-title">
            <span className="fm-modal-icon" style={{ background:"#fef3c7", color:"#d97706" }}>
              <LinkOutlined />
            </span>
            {editLink ?"Edit Link" :"Add Link to Section"}
          </div>
        }
        open={linkModal}
        onCancel={() => setLinkModal(false)}
        footer={null}
        width={500}
        centered
      >
        <Form form={linkForm} layout="vertical" onFinish={submitLink} style={{ marginTop: 8 }}>
          <Form.Item name="label" label="Link Label" rules={[{ required: true, message:"Label is required" }]}>
            <Input size="large" placeholder="e.g., Bihar PCS" />
          </Form.Item>

          <Form.Item name="linkType" label="Link Type" rules={[{ required: true }]}>
            <Select size="large" placeholder="Choose type">
              <Option value="topic">
                <span style={{ display:"flex", alignItems:"center", gap: 8 }}>
                  <NodeIndexOutlined style={{ color:"#5E6BFF" }} />
                  Topic  deep links to all resources
                </span>
              </Option>
              <Option value="internal">
                <span style={{ display:"flex", alignItems:"center", gap: 8 }}>
                  <AppstoreOutlined style={{ color:"#16a34a" }} />
                  Internal  page within the site
                </span>
              </Option>
              <Option value="external">
                <span style={{ display:"flex", alignItems:"center", gap: 8 }}>
                  <GlobalOutlined style={{ color:"#d97706" }} />
                  External  opens in new tab
                </span>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="url"
            label="Destination / Topic Tag"
            rules={[{ required: true, message:"Destination is required" }]}
            tooltip="For'Topic': enter the tag e.g.'Bihar PCS'. For Internal:'/about'. For External:'https://'"
          >
            <Input
              size="large"
              placeholder="e.g., Bihar PCS  or  /contact  or  https://..."
              prefix={<LinkOutlined style={{ color:"#c0c0c0" }} />}
            />
          </Form.Item>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16 }}>
            <Form.Item name="order" label="Display Order">
              <InputNumber min={0} size="large" style={{ width:"100%" }} />
            </Form.Item>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" style={{ marginTop: 4 }} />
            </Form.Item>
          </div>

          <div className="fm-modal-footer">
            <button type="button" className="fm-btn-ghost" onClick={() => setLinkModal(false)}>
              Cancel
            </button>
            <button type="submit" className="fm-btn-primary">
              {editLink ?"Save Changes" :"Add Link"}
            </button>
          </div>
        </Form>
      </Modal>

      {/*  LIVE PREVIEW DRAWER  */}
      {preview && (
        <div className="fm-preview-overlay" onClick={() => setPreview(false)}>
          <div className="fm-preview-panel" onClick={e => e.stopPropagation()}>
            <div className="fm-preview-header">
              <span>Live Footer Preview</span>
              <button className="fm-preview-close" onClick={() => setPreview(false)}>
                <CloseOutlined />
              </button>
            </div>
            <div className="fm-preview-body">
              <div className="fm-preview-footer">
                <div className="fm-preview-grid">
                  {[...sections]
                    .filter(s => s.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map(section => (
                      <div key={section._id} className="fm-preview-col">
                        <h4 className="fm-preview-col-title">{section.title}</h4>
                        <ul className="fm-preview-links">
                          {(section.links || [])
                            .filter((l: any) => l.isActive)
                            .sort((a: any, b: any) => a.order - b.order)
                            .map((link: any) => (
                              <li key={link._id}>
                                <span className="fm-preview-dot" />
                                {link.label}
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                </div>
                <div className="fm-preview-bar">
                  <span>© {new Date().getFullYear()} Draa. All rights reserved.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FooterManager;
