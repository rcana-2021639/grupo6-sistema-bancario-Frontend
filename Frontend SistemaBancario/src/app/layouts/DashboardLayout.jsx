import { Outlet } from 'react-router-dom';
import Layout from '../../shared/components/layout/Layout';

export const DashboardLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
