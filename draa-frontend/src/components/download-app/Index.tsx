import HeaderOne from'../../layouts/headers/HeaderOne';
import MainFooter from'../../layouts/footers/MainFooter';
import Breadcrumb from'../common/Breadcrumb';
import DownloadAppArea from'./DownloadAppArea';
import ScrollToTop from'../common/ScrollToTop';
import usePageTitle from '../../hooks/usePageTitle';

const DownloadApp = () => {
    return (
        <>
            <HeaderOne />
            <main>
                <Breadcrumb 
                  title="Download Our App" 
                  subtitle="Experience learning on the go with our dedicated mobile application." 
                  category="App"
                  paths={[{ pathName:"Download App" }]}
                />
                <DownloadAppArea />
            </main>
            <MainFooter />
            <ScrollToTop />
        </>
    );
};

export default DownloadApp;
