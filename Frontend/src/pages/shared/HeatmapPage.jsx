import { useState, useEffect } from 'react';
import HeatmapView from '../../components/HeatmapView';
import * as victimApi from '../../api/victimApi';
import * as donorApi from '../../api/donorApi';
import * as ngoApi from '../../api/ngoApi';
import * as adminApi from '../../api/adminApi';

const apiMap = {
  VICTIM: victimApi.getHeatmap,
  DONOR: donorApi.getHeatmap,
  NGO: ngoApi.getHeatmap,
  ADMIN: adminApi.getHeatmap,
};

export default function HeatmapPage({ role }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fn = apiMap[role];
        if (fn) {
          const result = await fn();
          setData(result || []);
        }
      } catch (err) {
        console.error('Failed to fetch heatmap data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Disaster Hazard Heatmap</h1>
          <p className="page-subtitle">
            Real-time geospatial visualization of flood severity, monitored sectors, and rescue priority zones.
          </p>
        </div>
      </div>
      <HeatmapView data={data} />
    </div>
  );
}
