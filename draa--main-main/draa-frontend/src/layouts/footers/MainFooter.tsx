
import UpperFooter from'./UpperFooter';
import LowerFooter from'./LowerFooter';
import NeedHelp from'../../components/homes/home/NeedHelp';
import DynamicFooter from'./DynamicFooter';

interface MainFooterProps {
    brand?: 'default' | 'draa';
}

const MainFooter = ({ brand = 'draa' }: MainFooterProps) => {
    return (
        <div>
            <NeedHelp />
            <UpperFooter />
            <LowerFooter brand={brand} />
            <DynamicFooter />
        </div>
    );
}

export default MainFooter;
