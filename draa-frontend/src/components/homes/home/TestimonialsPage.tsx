import React, { useEffect, useMemo, useState } from'react';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    examTag: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name:"Rohit Sharma",
        role:"SSC Aspirant",
        examTag:"SSC CGL",
        content:"I prepared for SSC CGL using Draa books and test series, and the experience was amazing. The questions were exactly at the level of the real exam. The detailed solutions helped me understand my mistakes clearly. I cleared Tier 1 in my first attempt!"
    },
    {
        id: 2,
        name:"Priya Verma",
        role:"IBPS PO Qualified",
        examTag:"Banking",
        content:"The Banking test series of Draa is very close to the actual exam pattern. The mock tests improved my speed and accuracy. The reasoning and quantitative aptitude books are especially helpful. Highly recommended for serious aspirants!"
    },
    {
        id: 3,
        name:"Amit Singh",
        role:"RRB",
        examTag:"Railway",
        content:"    Draa       -         ,"
    },
    {
        id: 4,
        name:"Amit Kumar",
        role:"RRB Candidate",
        examTag:"Railway",
        content:"I was struggling with previous year questions until I started using Draa Railway exam books. The content is concise, updated, and exam-oriented. The practice sets gave me real confidence before the exam."
    },
    {
        id: 5,
        name:"Anjali Mishra",
        role:"UGC-NET",
        examTag:"UGC-NET",
        content:"UGC-NET     Draa     -"
    },
    {
        id: 6,
        name:"Manish Kumar",
        role:"BPSC Aspirant",
        examTag:"BPSC",
        content:"The BPSC study material from Draa is well-structured and covers both prelims and mains effectively. The practice tests helped me stay consistent and confident throughout my preparation journey."
    }
];

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(() => {
        if (typeof window ==='undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        if (mql.addEventListener) mql.addEventListener('change', onChange);
        else mql.addListener(onChange);
        return () => {
            if (mql.removeEventListener) mql.removeEventListener('change', onChange);
            else mql.removeListener(onChange);
        };
    }, [query]);

    return matches;
}

const TestimonialsPage: React.FC = () => {
    // 375px small mobile layout tuning
    const is375 = useMediaQuery('(max-width: 390px)');
    //"L mobile" (425px) should stay close to default, but we use a safe intermediate tweak.
    const is425ish = useMediaQuery('(min-width: 391px) and (max-width: 450px)');

    const styles = useMemo(() => {
        const wrapperPaddingX = is375 ? 14 : is425ish ? 18 : 20;
        const gridGap = is375 ? 16 : 24;
        const cardPadding = is375 ? 22 : is425ish ? 26 : 30;

        return {
            pageWrapper: {
                backgroundColor:'#f9fafb',
                minHeight:'100vh',
                padding: `60px ${wrapperPaddingX}px`,
                fontFamily:'var(--font)',
                overflowX:'hidden' as const,
            },
            container: {
                maxWidth:'var(--container)',
                margin:'0 auto',
            },
            header: {
                textAlign:'center' as const,
                marginBottom: is375 ? 40 : 50,
            },
            title: {
                fontSize: is375 ?'1.95rem' :'2.5rem',
                color:'var(--text-main)',
                marginBottom:'10px',
                fontWeight: 800,
                lineHeight: 1.15,
            },
            subtitle: {
                color:'var(--text-muted)',
                fontSize: is375 ?'0.98rem' :'1.1rem',
                lineHeight: 1.5,
                margin: 0,
                padding: is375 ?'0 4px' : 0,
            },
            grid: {
                display:'grid',
                // At 375px, force 1 column so cards don't overflow / misalign.
                gridTemplateColumns: is375 ?'1fr' :'repeat(auto-fill, minmax(350px, 1fr))',
                gap: gridGap,
            },
            card: {
                backgroundColor:'var(--bg-white)',
                padding: `${cardPadding}px`,
                borderRadius:'var(--radius)',
                boxShadow:'var(--shadow-sm)',
                border:'1px solid var(--border)',
                display:'flex',
                flexDirection:'column' as const,
                position:'relative' as const,
                transition:'transform 0.2s ease-in-out',
                minWidth: 0,
            },
            badge: {
                display:'inline-block',
                padding:'4px 12px',
                backgroundColor:'rgba(94, 107, 255, 0.1)',
                color:'var(--primary)',
                borderRadius:'20px',
                fontSize: is375 ?'0.72rem' :'0.75rem',
                fontWeight: 600,
                marginBottom:'15px',
                alignSelf:'flex-start',
                lineHeight: 1.2,
            },
            content: {
                color:'var(--text-main)',
                lineHeight: 1.6,
                fontSize: is375 ?'0.95rem' :'1rem',
                fontStyle:'italic',
                marginBottom: is375 ? 18 : 20,
                flexGrow: 1,
                wordBreak:'break-word' as const,
            },
            footer: {
                display:'flex',
                alignItems:'center',
                gap: 12,
                borderTop:'1px solid var(--border)',
                paddingTop: 15,
            },
            avatar: {
                width: is375 ? 38 : 40,
                height: is375 ? 38 : 40,
                borderRadius:'50%',
                backgroundColor:'var(--primary)',
                color:'#fff',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontWeight:'bold',
                fontSize: is375 ?'1.05rem' :'1.1rem',
                flexShrink: 0,
            },
            name: {
                margin: 0,
                fontSize: is375 ?'0.98rem' :'1rem',
                color:'var(--text-main)',
                fontWeight: 600,
            },
            role: {
                margin: 0,
                fontSize: is375 ?'0.82rem' :'0.85rem',
                color:'var(--text-muted)',
            }
        };
    }, [is375, is425ish]);

    return (
        <div style={styles.pageWrapper}>
            <section style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Success Stories</h1>
                    <p style={styles.subtitle}>
                        Join thousands of students who cleared their dream exams with Draa
                    </p>
                </header>

                <div style={styles.grid}>
                    {testimonials.map((item) => (
                        <div key={item.id} style={styles.card}>
                            <div style={styles.badge}>{item.examTag}</div>
                            <p style={styles.content}>"{item.content}"</p>
                            <div style={styles.footer}>
                                <div style={styles.avatar}>{item.name.charAt(0)}</div>
                                <div>
                                    <h4 style={styles.name}>{item.name}</h4>
                                    <p style={styles.role}>{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TestimonialsPage;