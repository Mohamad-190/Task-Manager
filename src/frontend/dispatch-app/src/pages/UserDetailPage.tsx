import { useNavigate, useParams } from 'react-router-dom';
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { getUser, getUserTasks } from '../api/users';
import { getRole } from '../api/client';
import type { Role, TaskResponse } from '../types/api';

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin',
  TECHNIKER: 'Techniker',
  HAUSMEISTER: 'Hausmeister',
  ITSUPPORT: 'IT-Support',
};

const ROLE_COLOR: Record<Role, string> = {
  ADMIN: 'gray',
  TECHNIKER: 'blue',
  HAUSMEISTER: 'orange',
  ITSUPPORT: 'cyan',
};

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('de-DE');
}

function statusColor(task: TaskResponse): string {
  if (task.completed) return 'green';
  if (task.claimedAt) return 'yellow';
  return 'red';
}

function statusLabel(task: TaskResponse): string {
  if (task.completed) return 'Fertig';
  if (task.claimedAt) return 'In Bearbeitung';
  return 'Zu tun';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Box>{children}</Box>
    </Stack>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);
  const isAdmin = getRole() === 'ADMIN';

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    enabled: isAdmin && Number.isFinite(userId),
  });

  const tasksQuery = useQuery({
    queryKey: ['user-tasks', userId],
    queryFn: () => getUserTasks(userId),
    enabled: isAdmin && Number.isFinite(userId),
  });

  if (!isAdmin) {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="md">
          <Text c="red">Nur Admins können Benutzerdetails sehen.</Text>
          <Button onClick={() => navigate('/tasks')}>Zu den Tasks</Button>
        </Stack>
      </Center>
    );
  }

  if (userQuery.isLoading || tasksQuery.isLoading) {
    return (
      <Center mih="60vh">
        <Loader />
      </Center>
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="md">
          <Text c="red">Benutzer konnte nicht geladen werden.</Text>
          <Button onClick={() => navigate('/users')}>Zurück zur Liste</Button>
        </Stack>
      </Center>
    );
  }

  const user = userQuery.data;
  const allTasks = tasksQuery.data ?? [];
  const currentTasks = allTasks.filter((t) => !t.completed);
  const completedTasks = allTasks.filter((t) => t.completed);

  function renderTaskTable(tasks: TaskResponse[], emptyText: string) {
    if (tasks.length === 0) {
      return (
        <Text c="dimmed" size="sm" px="md" py="sm">
          {emptyText}
        </Text>
      );
    }
    return (
      <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Titel</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Priorität</Table.Th>
            <Table.Th>Fällig</Table.Th>
            <Table.Th>Übernommen</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tasks.map((task) => (
            <Table.Tr
              key={task.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <Table.Td>
                <Text fw={500}>{task.title}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={statusColor(task)} variant="light">
                  {statusLabel(task)}
                </Badge>
              </Table.Td>
              <Table.Td>{task.priority ?? '-'}</Table.Td>
              <Table.Td>{formatDate(task.dueDate)}</Table.Td>
              <Table.Td>{formatDate(task.claimedAt)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Anchor onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>
          &larr; Zurück zur Benutzerliste
        </Anchor>

        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Title order={2}>{user.username}</Title>
            <Text size="sm" c="dimmed">
              Benutzer #{user.id}
            </Text>
          </Stack>
          <Badge color={ROLE_COLOR[user.role]} size="lg" variant="light">
            {ROLE_LABEL[user.role]}
          </Badge>
        </Group>

        <Card withBorder padding="lg" radius="md">
          <Stack gap="md">
            <Group grow align="flex-start">
              <Field label="Email">
                <Text>{user.email}</Text>
              </Field>
              <Field label="Telefon">
                <Text>{user.phoneNumber ?? '-'}</Text>
              </Field>
            </Group>
          </Stack>
        </Card>

        <Stack gap="sm">
          <Title order={4}>Aktuelle Tasks ({currentTasks.length})</Title>
          <Card withBorder padding={0} radius="md">
            {tasksQuery.isError ? (
              <Text c="red" px="md" py="sm">
                Tasks konnten nicht geladen werden.
              </Text>
            ) : (
              renderTaskTable(currentTasks, 'Aktuell keine offenen Tasks zugewiesen.')
            )}
          </Card>
        </Stack>

        {completedTasks.length > 0 && (
          <>
            <Divider />
            <Stack gap="sm">
              <Title order={4}>Erledigte Tasks ({completedTasks.length})</Title>
              <Card withBorder padding={0} radius="md">
                {renderTaskTable(completedTasks, '')}
              </Card>
            </Stack>
          </>
        )}
      </Stack>
    </Container>
  );
}
