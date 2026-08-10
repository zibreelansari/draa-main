import React from'react';
import toast from '../../utils/toast';
import { Dropdown, MenuProps } from'antd';
import { Share2, Link2, MessageCircle, Send, Facebook, Twitter } from'lucide-react';
import'./ShareButton.css';

interface ShareButtonProps {
    url: string;
    title: string;
    text?: string;
    className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ url, title, text, className }) => {
    const fullUrl = `${window.location.origin}${url}`;
    const shareText = text || `Check out ${title} on Draa!`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied to clipboard!');
    };

    const shareOptions = [
        {
            key:'whatsapp',
            label:'WhatsApp',
            icon: <MessageCircle size={16} color="#25D366" />,
            onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText +'' + fullUrl)}`,'_blank')
        },
        {
            key:'telegram',
            label:'Telegram',
            icon: <Send size={16} color="#0088cc" />,
            onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`,'_blank')
        },
        {
            key:'facebook',
            label:'Facebook',
            icon: <Facebook size={16} color="#1877F2" />,
            onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,'_blank')
        },
        {
            key:'twitter',
            label:'Twitter / X',
            icon: <Twitter size={16} color="#000000" />,
            onClick: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`,'_blank')
        },
        {
            type:'divider',
        },
        {
            key:'join-whatsapp',
            label:'Join WhatsApp Channel',
            icon: <MessageCircle size={16} color="#25D366" />,
            onClick: () => window.open(`https://whatsapp.com/channel/0029Vb68EnMGufJ5M3KRM72A`,'_blank')
        },
        {
            key:'join-telegram',
            label:'Join Telegram Group',
            icon: <Send size={16} color="#0088cc" />,
            onClick: () => window.open(`https://t.me/draatelegram`,'_blank')
        },
        {
            type:'divider',
        },
        {
            key:'copy',
            label:'Copy Link',
            icon: <Link2 size={16} />,
            onClick: handleCopyLink
        }
    ];

    const menu: MenuProps = {
        items: shareOptions as any,
        className:'sx-share-dropdown'
    };

    return (
        <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
            <button className={`sx-share-btn-circular ${className ||''}`} onClick={(e) => e.stopPropagation()}>
                <Share2 size={18} />
            </button>
        </Dropdown>
    );
};

export default ShareButton;
