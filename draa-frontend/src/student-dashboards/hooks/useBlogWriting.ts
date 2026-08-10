import { useState, useEffect, useCallback, useMemo } from'react';
import toast from '../../utils/toast';
import axios from'axios';
import url from'../../url';

export interface Blog {
  _id: string;
  id?: string;
  content_subject: string;
  content_category: string;
  content: string;
  author: string;
  status: string;
  approved: boolean;
  createdAt: string;
  tags?: string;
  seo_title?: string;
  slug?: string;
  meta_description?: string;
  youtube_url?: string;
  instagram_url?: string;
  schema_image?: string;
  featured_images?: string[];
  [key: string]: any;
}

/**
 * Pick the correct blog API base URL based on the logged-in user's role.
 * Returns '/student/blogs' | '/teacher/blogs' | '/admin/blogs'.
 */
const resolveBlogBase = (): string => {
  try {
    const edudocs = JSON.parse(localStorage.getItem('edudocs') || 'null');
    const user = edudocs?.user || edudocs;
    if (user?.role === 'admin' || user?.aname || user?.A_name) return '/admin/blogs';
    if (user?.role === 'teacher' || user?.tname || user?.T_name) return '/teacher/blogs';
    return '/student/blogs';
  } catch {
    return '/student/blogs';
  }
};

export const useBlogWriting = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pick the correct base URL based on logged-in role. Recomputes when the
  // user logs in/out (the hook runs once per mount, but role doesn't change
  // mid-session in practice).
  const blogBase = useMemo(resolveBlogBase, []);

  const getToken = () => {
    try {
      const edudocsData = localStorage.getItem("edudocs");
      return edudocsData ? JSON.parse(edudocsData)?.token : null;
    } catch { return null; }
  };

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(`${url}${blogBase}/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data?.blogs || res.data || []);
    } catch (err: any) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, [blogBase]);

  const deleteBlog = async (blogId: string) => {
    try {
      const token = getToken();
      await axios.delete(`${url}${blogBase}/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(prev => prev.filter(b => (b._id || b.id) !== blogId));
      toast.success("Blog deleted successfully");
      return { success: true };
    } catch (err: any) {
      toast.error(err.response?.data?.error ||"Failed to delete blog");
      return { success: false };
    }
  };

  const submitBlog = async (formData: FormData, editingBlogId?: string) => {
    setSubmitting(true);
    try {
      const token = getToken();
      const headers = {
"Content-Type":"multipart/form-data",
        Authorization: `Bearer ${token}`,
      };

      if (editingBlogId) {
        await axios.put(`${url}${blogBase}/${editingBlogId}`, formData, { headers });
        toast.success("Blog updated successfully!");
      } else {
        await axios.post(`${url}${blogBase}/create`, formData, { headers });
        // Different toast depending on whether the role auto-approves.
        const isAdmin = blogBase.startsWith('/admin');
        toast.success(isAdmin ? "Blog published!" : "Blog submitted for approval!");
      }
      fetchBlogs();
      return { success: true };
    } catch (err: any) {
      toast.error(err.response?.data?.error ||"Error publishing blog");
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { blogs, loading, submitting, deleteBlog, submitBlog, refresh: fetchBlogs };
};
