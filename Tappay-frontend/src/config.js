const config = {
  API_BASE_URL: 
    process.env.NODE_ENV === 'production' 
      ? 'http://localhost:4000' 
      : 'http://localhost:3001',
  IMAGE_BASE_URL: 
    process.env.NODE_ENV === 'production' 
      ? 'http://localhost:4000/uploads' 
      : 'http://localhost:3001/uploads',
};

export default config;
