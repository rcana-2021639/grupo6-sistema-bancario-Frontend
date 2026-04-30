import { Outlet } from 'react-router-dom';
import Layout from '../../shared/components/Layout/Layout';

export const DashboardLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
