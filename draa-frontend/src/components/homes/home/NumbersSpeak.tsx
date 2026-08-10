import React from"react";
import"./numbersSpeak.css";

const StatsSection = () => {
  const statItems = [
    { label:"Prepare Faster",      value:"50%"   },
    { label:"Selection",           value:"1K+"   },
    { label:"Success Rate",        value:"95%"   },
    { label:"Questions Attempted", value:"1.5L+" },
    { label:"Exams Covered",       value:"150"   },
    { label:"Views",               value:"1L+"   },
  ];

  return (
    <section className="aspirants-section">
      <div className="container">

        {/*  TOP HEADER  */}
        <div className="aspirants-header">
          <h4 className="aspirants-eyebrow">Aspirants Learning</h4>

          {/*
            Layout:"10,"  overlapping avatars"+"
            The comma is part of count-big so it visually
            merges with the first avatar in the stack.
          */}
          <div className="main-count-row">
            <span className="count-big">10,</span>

            <div className="avatar-stack">
              <picture>
                <source srcSet="/stats1.webp" type="image/webp" />
                <img src="/stats1.png" alt="student" className="stack-img" width="96" height="96" />
              </picture>
              <picture>
                <source srcSet="/stats2.webp" type="image/webp" />
                <img src="/stats2.png" alt="student" className="stack-img" width="96" height="96" />
              </picture>
              <picture>
                <source srcSet="/stats3.webp" type="image/webp" />
                <img src="/stats3.png" alt="student" className="stack-img" width="96" height="96" />
              </picture>
            </div>

            <span className="plus-symbol">+</span>
          </div>
        </div>

        {/*  STATS GRID  */}
        <div className="aspirants-grid">
          {statItems.map((item, index) => (
            <div key={index} className="stat-item-box">
              <span className="stat-label">{item.label}</span>
              <h2 className="stat-value-number-speak">{item.value}</h2>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StatsSection;