import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// Portfolio components
import Header from "./components/Header";
import Hero from "./components/Hero";
import News from "./components/News";
import Teaching from "./components/Teaching";
import Research from "./components/Research";
import Publications from "./components/Publications";
import Lab from "./components/Lab";
import Service from "./components/Service";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

// Coursework components
import CourseworkHome from "./components/coursework/CourseworkHome";
import CoursePage from "./components/coursework/CoursePage";
import TopicPage from "./components/coursework/TopicPage";
import TopicEditor from "./components/coursework/TopicEditor";
import InstructorLogin from "./components/coursework/InstructorLogin";
import RegisterPage from "./components/coursework/RegisterPage";
import ForgotPasswordPage from "./components/coursework/ForgotPasswordPage";
import AdminDashboard from "./components/coursework/AdminDashboard";
import QuizList from "./components/coursework/QuizList";
import QuizTaker from "./components/coursework/QuizTaker";
import QuizManager from "./components/coursework/QuizManager";
import QuestionEditor from "./components/coursework/QuestionEditor";
import ForumList from "./components/coursework/ForumList";
import ForumView from "./components/coursework/ForumView";
import ThreadView from "./components/coursework/ThreadView";

// Context
import { AuthProvider } from "./context/AuthContext";

// Portfolio Page
const PortfolioPage = () => {
  return (
    <div className="min-h-screen bg-[#fafbfc] relative">
      <Header />
      <main className="relative z-10">
        <Hero />
        <News />
        <Teaching />
        <Research />
        <Publications />
        <Lab />
        <Service />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

// App Layout wrapper that conditionally shows header/footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isCoursework = location.pathname.startsWith('/coursework');
  
  if (isCoursework) {
    return <>{children}</>;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Portfolio routes */}
            <Route path="/" element={<PortfolioPage />} />
            
            {/* Coursework routes */}
            <Route path="/coursework" element={<CourseworkHome />} />
            <Route path="/coursework/login" element={<InstructorLogin />} />
            <Route path="/coursework/register" element={<RegisterPage />} />
            <Route path="/coursework/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/coursework/reset-password" element={<ForgotPasswordPage />} />
            <Route path="/coursework/admin" element={<AdminDashboard />} />
            <Route path="/coursework/admin/users" element={<AdminDashboard />} />
            
            {/* Course routes */}
            <Route path="/coursework/:courseSlug" element={<CoursePage />} />
            <Route path="/coursework/:courseSlug/:topicSlug" element={<TopicPage />} />
            <Route path="/coursework/:courseSlug/:topicSlug/edit" element={<TopicEditor />} />
            
            {/* Quiz routes */}
            <Route path="/coursework/:courseSlug/quizzes" element={<QuizList />} />
            <Route path="/coursework/:courseSlug/quiz/:quizId" element={<QuizTaker />} />
            <Route path="/coursework/:courseSlug/quiz-manager" element={<QuizManager />} />
            <Route path="/coursework/:courseSlug/quiz/:quizId/edit" element={<QuestionEditor />} />
            
            {/* Forum routes */}
            <Route path="/coursework/:courseSlug/forums" element={<ForumList />} />
            <Route path="/coursework/:courseSlug/forum/:forumId" element={<ForumView />} />
            <Route path="/coursework/:courseSlug/forum/:forumId/post/:postId" element={<ThreadView />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
