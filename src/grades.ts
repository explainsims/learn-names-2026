export interface Grade {
  id: string;
  label: string;
  color: string;
  folderId: string;
}

export const GRADES: Grade[] = [
  { id: 'g9',  label: 'Grade 9',  color: '#FFE66D', folderId: '1NM_FbQ-pKvmxsmAv159aG8-nUwj1t0MQ' },
  { id: 'g10', label: 'Grade 10', color: '#4ECDC4', folderId: '1Lrudwmj_GK5-EIHKm6E6QUMFtG2o5hj_' },
  { id: 'g11', label: 'Grade 11', color: '#FF6B6B', folderId: '1ODCJ7b2gbRq23oNxNNpH_ESjUy3vUUD1' },
  { id: 'g12', label: 'Grade 12', color: '#A8E6CF', folderId: '1Xa7yM7aKS3ql9oUt6RVAFypO-q9LmhAn' },
];

export const GRADES_BY_ID: Record<string, Grade> =
  Object.fromEntries(GRADES.map((g) => [g.id, g]));
