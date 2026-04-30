import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AppShell, Button, Group, Text, Title } from '@mantine/core';

import { getEmail, getRole, setEmail, setRole, setToken } from '../api/client';

interface NavItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/tasks', label: 'Tasks' },
  { to: '/users', label: 'Benutzer', adminOnly: true },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const role = getRole();
  const email = getEmail();
  const isAdmin = role === 'ADMIN';

  function handleLogout() {
    setToken(null);
    setRole(null);
    setEmail(null);
    navigate('/login', { replace: true });
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="xl" wrap="nowrap">
            <Title order={4}>Dispatch</Title>
            <Group gap="xs" wrap="nowrap">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{ textDecoration: 'none' }}
                >
                  {({ isActive }) => (
                    <Button variant={isActive ? 'light' : 'subtle'} size="sm">
                      {item.label}
                    </Button>
                  )}
                </NavLink>
              ))}
            </Group>
          </Group>
          <Group gap="md" wrap="nowrap">
            {email && (
              <Text size="sm" c="dimmed">
                {email}
              </Text>
            )}
            <Button variant="subtle" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
