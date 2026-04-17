import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Contents from './pages/Contents';
import ContentDetail from './pages/ContentDetail';
import Quiz from './pages/Quiz';
import Ranking from './pages/Ranking';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="conteudos" element={<Contents />} />
            <Route path="conteudos/:slug" element={<ContentDetail />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="quiz/:slug" element={<Quiz />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="auth" element={<Auth />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
