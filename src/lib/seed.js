import { subDays, formatISO } from 'date-fns'

const ago = (days) => formatISO(subDays(new Date(), days))

// Sample data so the app is usable immediately on first open.
// You can wipe this any time from the Profile screen.
export function seedState() {
  const consultants = [
    {
      id: 'c1', name: 'Budi Santoso', firm: 'PT Meinhardt Indonesia', discipline: 'mechanical',
      title: 'Senior Mechanical Engineer', phone: '+6281200000001', whatsapp: '6281200000001',
      email: 'budi@meinhardt.co.id', tier: 'A', cadence_days: null, birthday: '1980-08-05',
      notes: 'Decision-maker on HVAC spec for several mixed-use towers.',
      last_contacted_at: ago(21), is_active: true, created_at: ago(120),
    },
    {
      id: 'c2', name: 'Siti Rahmawati', firm: 'PT Arkonin', discipline: 'architect',
      title: 'Associate Architect', phone: '+6281200000002', whatsapp: '6281200000002',
      email: 'siti@arkonin.co.id', tier: 'B', cadence_days: null, birthday: '1986-03-19',
      notes: 'Good relationship, influences MEP coordination.',
      last_contacted_at: ago(12), is_active: true, created_at: ago(90),
    },
    {
      id: 'c3', name: 'Agus Wijaya', firm: 'PT Beca Indonesia', discipline: 'electrical',
      title: 'Electrical Lead', phone: '+6281200000003', whatsapp: '6281200000003',
      email: 'agus@beca.com', tier: 'A', cadence_days: null, birthday: '1978-11-02',
      notes: 'Key on lift & pump electrical loads.',
      last_contacted_at: ago(30), is_active: true, created_at: ago(150),
    },
    {
      id: 'c4', name: 'Dewi Lestari', firm: 'PT Aecom', discipline: 'qs',
      title: 'Quantity Surveyor', phone: '+6281200000004', whatsapp: '6281200000004',
      email: 'dewi@aecom.com', tier: 'C', cadence_days: null, birthday: '1990-06-25',
      notes: 'Cost side — useful for value engineering rounds.',
      last_contacted_at: ago(5), is_active: true, created_at: ago(60),
    },
    {
      id: 'c5', name: 'Rudi Hartono', firm: 'PT Atelier Enam', discipline: 'project_mgr',
      title: 'Project Manager', phone: '+6281200000005', whatsapp: '6281200000005',
      email: 'rudi@atelier6.co.id', tier: 'B', cadence_days: null, birthday: '1983-01-14',
      notes: 'Coordinates consultant team on the Bekasi hospital project.',
      last_contacted_at: ago(45), is_active: true, created_at: ago(200),
    },
  ]

  const projects = [
    {
      id: 'p1', name: 'Sudirman Mixed-Use Tower', owner_client: 'PT Sinar Mas Land',
      product_scope: 'multi', stage: 'tender', spec_status: 'unknown',
      est_value: 8500000000, close_date: null, notes: 'Chiller + lift package in tender.',
    },
    {
      id: 'p2', name: 'Bekasi General Hospital', owner_client: 'Pemkot Bekasi',
      product_scope: 'hvac', stage: 'design', spec_status: 'competitor_specified',
      est_value: 4200000000, close_date: null, notes: 'Competitor named in draft spec — need to influence.',
    },
  ]

  const project_consultants = [
    { project_id: 'p1', consultant_id: 'c1', role_in_project: 'MEP consultant', influence: 'high' },
    { project_id: 'p1', consultant_id: 'c3', role_in_project: 'Electrical', influence: 'med' },
    { project_id: 'p2', consultant_id: 'c1', role_in_project: 'Mechanical', influence: 'high' },
    { project_id: 'p2', consultant_id: 'c5', role_in_project: 'Project manager', influence: 'high' },
  ]

  return {
    consultants,
    interactions: [],
    projects,
    project_consultants,
    stats: { total_points: 0, current_streak: 0, longest_streak: 0, last_activity_date: null },
    achievements: [],
  }
}
