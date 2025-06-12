import { useEffect, useState } from 'react';
import api from '../services/axios';
import questionData from '../Json/question_options.json';
import spectrumData from '../Json/spectrum.json';
import rangeData from '../Json/range.json';
import '../Styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalQuestions: 0,
    avgOptionsPerQuestion: '0.00',
    totalSpectrums: 0,
    totalRanges: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [{ data: apiStats }, questions] = await Promise.all([
          api.get('/home'),
          Promise.resolve(questionData.assessment_data || [])
        ]);

        const totalQuestions = questions.length;

        const totalOptions = questions.reduce((sum, q) => {
          return sum + (q.options ? Object.keys(q.options).length : 0);
        }, 0);

        const avgOptions = totalQuestions > 0
          ? (totalOptions / totalQuestions).toFixed(2)
          : '0.00';

        // Access lengths inside the JSON objects
        const totalSpectrums = spectrumData.spectrums?.length || 0;
        const totalRanges = rangeData.ranges?.length || 0;

        setDashboardData({
          totalUsers: apiStats.totalUsers || 0,
          totalRoles: apiStats.totalRoles || 0,
          totalQuestions,
          avgOptionsPerQuestion: avgOptions,
          totalSpectrums,
          totalRanges
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-container"><h2>Loading dashboard...</h2></div>;
  }

  if (error) {
    return <div className="dashboard-container"><h2>{error}</h2></div>;
  }

  const renderCard = (title, value, className = '') => (
    <div className={`dashboard-card ${className}`}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>
      <div className="cards-wrapper">
        {renderCard('Total Users', dashboardData.totalUsers, 'users-card')}
        {renderCard('Total Roles', dashboardData.totalRoles, 'roles-card')}
        {renderCard('Total Questions', dashboardData.totalQuestions, 'questions-card')}
        {renderCard('Total Surveys', 1, 'survey-card')}
        {renderCard('Total Spectrums', dashboardData.totalSpectrums, 'spectrum-card')}
        {renderCard('Total Ranges', dashboardData.totalRanges, 'range-card')}
      </div>
    </div>
  );
};

export default Dashboard;
