import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/auth/auth-guard';
import Layout from './routes/_layout';
import Login from './routes/auth/login';
import Dashboard from './routes/dashboard/index';
import ContactsIndex from './routes/contacts/index';
import ContactDetail from './routes/contacts/$id';
import CompaniesIndex from './routes/companies/index';
import CompanyDetail from './routes/companies/$id';
import PipelineIndex from './routes/pipeline/index';
import ActivitiesIndex from './routes/activities/index';
import TasksIndex from './routes/tasks/index';
import SettingsIndex from './routes/settings/index';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contacts" element={<ContactsIndex />} />
            <Route path="contacts/:id" element={<ContactDetail />} />
            <Route path="companies" element={<CompaniesIndex />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="pipeline" element={<PipelineIndex />} />
            <Route path="activities" element={<ActivitiesIndex />} />
            <Route path="tasks" element={<TasksIndex />} />
            <Route path="settings" element={<SettingsIndex />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
