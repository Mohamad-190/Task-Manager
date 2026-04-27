import { Navigate, Route, Routes } from 'react-router-dom';
import { Center, Text } from '@mantine/core';

import LoginPage from './pages/LoginPage';

function Placeholder({ name }: { name: string }) {
  return (
    <Center h="100vh">
      <Text>TODO: {name}</Text>
    </Center>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tasks" element={<Placeholder name="Tasks" />} />
      <Route path="/users" element={<Placeholder name="Users" />} />
      <Route path="/profile" element={<Placeholder name="Profile" />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
