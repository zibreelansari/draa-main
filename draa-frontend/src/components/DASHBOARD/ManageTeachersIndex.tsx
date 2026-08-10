import ManageTeachers from './ManageTeachers';
import usePageTitle from '../../hooks/usePageTitle';
import './dashboard.css';

const ManageTeacherIndex = () => {
  usePageTitle('Manage Teachers | Admin');
  return (
    <div>
      <ManageTeachers />
    </div>
  );
};

export default ManageTeacherIndex;
