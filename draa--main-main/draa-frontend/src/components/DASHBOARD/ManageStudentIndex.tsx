import './dashboard.css';
import ManageStudents from './ManageStudent';
import usePageTitle from '../../hooks/usePageTitle';

const ManageStudentIndex = () => {
  usePageTitle('Manage Students | Admin');
  return (
    <div>
      <ManageStudents />
    </div>
  );
};

export default ManageStudentIndex;
