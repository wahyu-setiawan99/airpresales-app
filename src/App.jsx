import { Routes, Route } from 'react-router-dom'
import TabBar from './components/TabBar.jsx'
import AchievementToast from './components/AchievementToast.jsx'
import Today from './pages/Today.jsx'
import Consultants from './pages/Consultants.jsx'
import ConsultantDetail from './pages/ConsultantDetail.jsx'
import ConsultantForm from './pages/ConsultantForm.jsx'
import LogInteraction from './pages/LogInteraction.jsx'
import Projects from './pages/Projects.jsx'
import ProjectForm from './pages/ProjectForm.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Profile from './pages/Profile.jsx'
import Account from './pages/Account.jsx'

export default function App() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-slate-100 shadow-sm">
      <main className="flex-1 pb-28">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/consultants" element={<Consultants />} />
          <Route path="/consultants/new" element={<ConsultantForm />} />
          <Route path="/consultants/:id" element={<ConsultantDetail />} />
          <Route path="/consultants/:id/edit" element={<ConsultantForm />} />
          <Route path="/log" element={<LogInteraction />} />
          <Route path="/log/:id" element={<LogInteraction />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:id/edit" element={<ProjectForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>
      <AchievementToast />
      <TabBar />
    </div>
  )
}
