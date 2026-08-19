import API from './axios';

export const getHeatmap = async () => {
  const response = await API.get('/api/victim/heatmap');
  return response.data;
};

export const getMyReports = async () => {
  const response = await API.get('/api/victim/my-reports');
  return response.data;
};

export const createFloodReport = async (reportData, file) => {
  const formData = new FormData();
  
  // Spring Boot @RequestPart CreateFloodReport report expects a JSON blob named "report"
  const reportBlob = new Blob([JSON.stringify(reportData)], { type: 'application/json' });
  formData.append('report', reportBlob);

  // Spring Boot @RequestPart MultipartFile file expects a file named "file"
  if (file) {
    formData.append('file', file);
  } else {
    // If no file uploaded, create a empty dummy file blob so @RequestPart MultipartFile file doesn't fail
    formData.append('file', new Blob([], { type: 'image/jpeg' }), 'empty.jpg');
  }

  const response = await API.post('/api/victim/create', formData);
  return response.data;
};
