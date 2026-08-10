import React from'react';
import { MapPin, Phone, Navigation } from'lucide-react';
import'./GoogleMap.css';

export default function GoogleMap() {
  //  Precise Google Maps Embed URL for East of Kailash
  const mapEmbedUrl ="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.664426577317!2d77.24278437533306!3d28.549806875709425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3c4fe86036b%3A0xe54d24a0d9225704!2sSapna%20Cinema!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

  return (
    <section className="map-marketplace-section">
      <div className="container">
        <div className="map-container-wrapper">
          {/*  THE INTERACTIVE MAP */}
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="500"
            className="figma-iframe"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Draa New Delhi Office"
          ></iframe>

          {/*  DYNAMIC LOCATION CARD */}
          <div className="map-floating-card">
            <div className="card-header-icon">
              <MapPin size={24} />
            </div>

            <div className="card-details">
              <h3>Our Head Office</h3>
              <p>
                Building No. 1, 3rd Floor, Opp. Sapna Cinema,
                Above Bikanervala Community Centre, D Block,
                East of Kailash, New Delhi - 110065
              </p>

              <div className="card-actions">
                <a href="tel:+918076003728" className="action-link">
                  <Phone size={16} /> 080760 03728
                </a>
                <a
                  href="https://maps.app.goo.gl/9yGv4XzKjYnN8X"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-directions"
                >
                  <Navigation size={16} /> Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}