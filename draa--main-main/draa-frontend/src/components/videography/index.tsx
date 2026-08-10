import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Search, Play, Share2, Youtube, X, ExternalLink, Film, Award, Flame, Video
} from "lucide-react";
import MainFooter from "../../layouts/footers/MainFooter";
import HeaderOne from "../../layouts/headers/HeaderOne";
import Breadcrumb from "../common/Breadcrumb";
import ScrollToTop from "../common/ScrollToTop";
import ScrollTop from "../common/ScrollTop";
import SEO from "../common/SEO";
import url from "../../url";
import "./Videography.css";
import "../courses/CoursesArea.css";
import "../common/SkeletonLoader.css";
import usePageTitle from '../../hooks/usePageTitle';


interface VideoItem {
  _id: string;
  title: string;
  url: string;
  category: "YouTube" | "Shorts";
  description?: string;
  priority: number;
}

const Videography: React.FC = () => {
  usePageTitle('Recorded Videos | Draa');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"All" | "YouTube" | "Shorts">("All");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const fetchPublicVideos = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${url}/videography/public`);
        if (res.data?.success) {
          setVideos(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load videos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicVideos();
  }, []);

  // Helper: Extract YouTube ID and return Thumbnail URL
  const getYoutubeThumbnail = (videoUrl: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    // Fallback if URL is shorts or other format
    if (videoUrl.includes("/shorts/")) {
      const parts = videoUrl.split("/shorts/");
      const id = parts[1]?.split(/[?#]/)[0];
      if (id) {
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
    }
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60";
  };

  // Helper: Get embeddable URL for iframe
  const getEmbedUrl = (videoUrl: string, category: "YouTube" | "Shorts"): string | null => {
    if (!videoUrl) return null;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    if (videoUrl.includes("/shorts/")) {
      const parts = videoUrl.split("/shorts/");
      const id = parts[1]?.split(/[?#]/)[0];
      if (id) {
        return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      }
    }
    return null;
  };

  // Filtered and sorted videos
  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) => {
        const matchesSearch = 
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (video.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTab = 
          activeTab === "All" || video.category === activeTab;

        return matchesSearch && matchesTab;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [videos, searchQuery, activeTab]);

  const handleShare = (video: VideoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description || `Check out this ${video.category} video on Draa!`,
        url: video.url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(video.url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <>
      <SEO 
        title="Recorded Videos - Video Lectures" 
        description="Access premium recorded classes and lectures curated for competitive exam preparations." 
      />
      <HeaderOne />
      
      <Breadcrumb 
        title="Recorded Videos Gallery" 
        subtitle="Curated subject masterclasses and learning sessions to accelerate your preparation" 
        category="Recorded Videos"
      />

      <div className="videography-gallery-wrapper">
        <div className="container">
          
          {/* HEADER */}
          <div className="courses-header-wrapper">
            <div className="courses-header-new">
              <div className="title-area-new">
                <h1 className="section-main-title-new">Explore Recorded Lectures</h1>
                <p className="section-sub-text-new">Boost your preparation with our premium recorded classes.</p>
              </div>
              <div className="showing-courses-text">
                Showing <strong>{filteredVideos.length}</strong> videos
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="gallery-controls-card">
            <div className="gallery-filters">
              <button 
                className={`filter-btn ${activeTab === "All" ? "active" : ""}`}
                onClick={() => setActiveTab("All")}
              >
                <Video size={16} />
                All Videos
              </button>
              <button 
                className={`filter-btn ${activeTab === "YouTube" ? "active" : ""}`}
                onClick={() => setActiveTab("YouTube")}
              >
                <Youtube size={16} />
                YouTube
              </button>
              <button 
                className={`filter-btn ${activeTab === "Shorts" ? "active" : ""}`}
                onClick={() => setActiveTab("Shorts")}
              >
                <Flame size={16} />
                Shorts
              </button>
            </div>

            <div className="gallery-search">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search lectures, topics, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="sk-videos-grid">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="sk-video-card">
                  <div className="sk-video-thumb sk-shimmer" />
                  <div className="sk-video-body">
                    <div className="sk-video-badge sk-shimmer" />
                    <div className="sk-video-title sk-shimmer" />
                    <div className="sk-video-title2 sk-shimmer" />
                    <div className="sk-video-desc sk-shimmer" />
                    <div className="sk-video-desc2 sk-shimmer" />
                    <div className="sk-video-footer">
                      <div className="sk-video-action sk-shimmer" />
                      <div className="sk-video-btns">
                        <div className="sk-video-btn sk-shimmer" />
                        <div className="sk-video-btn sk-shimmer" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="gallery-empty-state">
              <Film size={64} className="empty-icon" />
              <h3>No Videos Found</h3>
              <p>We couldn't find any videos matching your search or selected filters.</p>
              <button className="reset-filters-btn" onClick={() => { setSearchQuery(""); setActiveTab("All"); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="videography-grid">
              {filteredVideos.map((video) => {
                const isYT = video.category === "YouTube";
                return (
                  <div 
                    key={video._id} 
                    className={`video-gallery-card ${isYT ? "yt-card" : "shorts-card"}`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    {/* Media Section */}
                    <div className="card-media-wrapper">
                      <img 
                        src={getYoutubeThumbnail(video.url)} 
                        alt={video.title} 
                        loading="lazy"
                        className="video-card-thumbnail"
                      />
                      <div className="video-card-play-overlay">
                        <div className="play-button-circle yt-play">
                          <Play size={24} fill="currentColor" />
                        </div>
                      </div>
                      
                      {/* Platform Tag */}
                      <span className="platform-badge yt-badge">
                        <Video size={14} />
                        Recorded Video
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="video-card-content">
                      <h4 className="video-card-title">{video.title}</h4>
                      <p className="video-card-desc">
                        {video.description || "Interactive educational content provided by Draa mentors to boost your concept understanding."}
                      </p>
                      
                      {/* Card Actions Footer */}
                      <div className="video-card-actions">
                        <span className="watch-action-label">
                          Watch Video <Award size={14} style={{ marginLeft: 4 }} />
                        </span>
                        <div className="action-buttons-group">
                          <button 
                            className="card-action-btn share-btn"
                            title="Share Video"
                            onClick={(e) => handleShare(video, e)}
                          >
                            <Share2 size={14} />
                          </button>
                          <a 
                            href={video.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="card-action-btn external-btn"
                            title={`Open on ${video.category}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Theater Mode Modal */}
      {selectedVideo && (
        <div className="theater-modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="theater-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="theater-modal-close" onClick={() => setSelectedVideo(null)}>
              <X size={20} />
            </button>
            
            <div className="theater-player-container">
              {getEmbedUrl(selectedVideo.url, selectedVideo.category) ? (
                <iframe
                  src={getEmbedUrl(selectedVideo.url, selectedVideo.category) || ""}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="theater-iframe"
                ></iframe>
              ) : (
                <div className="unembeddable-fallback">
                  <Film size={48} />
                  <h4>Oops! Direct Embed Unavailable</h4>
                  <p>This video format cannot be previewed directly. Open it directly on the native platform to watch.</p>
                  <a 
                    href={selectedVideo.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="fallback-action-btn"
                  >
                    Open on {selectedVideo.category} <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>

            <div className="theater-modal-details">
              <span className="theater-badge yt-badge">
                <Video size={14} />
                Recorded Video
              </span>
              <h3 className="theater-title">{selectedVideo.title}</h3>
              <p className="theater-desc">
                {selectedVideo.description || "No description provided for this video lecture. Click the button above to view more details on the native platform."}
              </p>
              <div className="theater-actions">
                <a 
                  href={selectedVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="theater-native-link"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  );
};

export default Videography;
